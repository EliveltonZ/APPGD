# Especificação funcional — Controle de Estoque, Almoxarifado e Compras

Este documento descreve o **comportamento** do sistema: regras de negócio, dados e fluxos.
Não faz referência a telas, páginas, botões ou qualquer elemento de interface — descreve
o que o sistema faz e por quê, não como isso é apresentado visualmente.

---

## 1. Conceitos fundamentais

### 1.1 Material

Todo item controlado em estoque pertence a um cadastro de material, com os seguintes atributos:

- **Código interno**: identificador único do material dentro do sistema.
- **Descrição**.
- **Unidade base**: define como o consumo desse material é calculado dentro de um projeto.
  Três valores possíveis:
  - `M2` (metro quadrado) — usado por chapas.
  - `M` (metro) — usado por fitas de borda.
  - `UN` (unidade) — usado por ferragens e qualquer item contado em peças inteiras.
- **Fator de conversão fixo (m² por unidade)**: aplicável só a materiais `M2` — quantos m²
  tem uma chapa inteira. É um valor fixo do cadastro, não varia por fornecedor.
- **Estoque mínimo**: quantidade (em unidade de estoque) abaixo da qual o material é
  considerado em necessidade de reposição. Campo opcional — material sem mínimo configurado
  nunca entra nessa regra.
- **Preço/fornecedor vigente**: o preço unitário de um material pode variar com o tempo e,
  no caso de fita, também varia por fornecedor (ver 1.3).

**Regra central — unidade de cálculo de projeto ≠ unidade de controle de estoque.**
A `unidade base` descreve apenas como o consumo é calculado dentro de um projeto (quantos
m² uma peça usa, quantos metros de fita uma borda precisa). A unidade em que o saldo físico
é efetivamente controlado no estoque é outra:

| Tipo de material | Unidade de cálculo de projeto | Unidade de controle de estoque |
|---|---|---|
| Chapa | m² | Chapa inteira (unidade) |
| Fita de borda | metro | **Metro** (contínuo — não rolo inteiro) |
| Ferragem | unidade | Unidade |

Esse ponto é deliberado e corrigiu um defeito real do sistema: fita de borda é comprada em
rolo (ex.: rolo de 20 m ou 300 m), mas é consumida e armazenada em metros contínuos — um
rolo é usado aos poucos, ao longo de vários projetos, e nunca é correto tratá-lo como uma
"unidade inteira" indivisível. Chapa, ao contrário, genuinamente é controlada em unidades
inteiras (não se compra nem se estoca "0,3 de uma chapa").

### 1.2 Localização física

Todo lugar físico onde material pode estar armazenado é identificado por um endereçamento
estruturado de quatro partes: **rua, prateleira, nível e divisão**. O código textual de uma
localização (ex. "01-01-03-D") nunca é armazenado — é sempre recalculado a partir dessas
quatro partes no momento da consulta, garantindo que não existam dois jeitos diferentes de
representar o mesmo endereço.

Existe sempre **no máximo uma** localização marcada como **padrão de recebimento** (nunca
duas simultaneamente — marcar uma nova desmarca automaticamente a anterior). É para essa
localização que toda nota fiscal lançada entra automaticamente, antes de ser fisicamente
guardada em seu lugar definitivo.

**Localização de recebimento não pode ser usada como origem de uma baixa de estoque.**
Fisicamente, um material "no recebimento" ainda está em trânsito/triagem — não foi guardado
de verdade. Separar/dar baixa de um pedido exige que o material já esteja numa localização
diferente da padrão de recebimento; se o material só existe no recebimento, o sistema orienta
que ele seja transferido antes.

### 1.3 Fornecedor e vínculo de código

Cada fornecedor pode usar seu próprio código de produto (código do fornecedor / referência),
diferente do código interno do material. O sistema mantém uma associação persistente entre
(material, fornecedor, código do fornecedor), de forma que, uma vez vinculado, uma próxima
nota fiscal ou leitura automática desse mesmo fornecedor com o mesmo código já reconhece o
material automaticamente — sem precisar vincular de novo.

Para materiais do tipo fita (`M`), essa associação também guarda um **fator de conversão
específico daquele fornecedor**: quantos metros tem um rolo daquele código. Esse fator é
necessário porque rolos do mesmo tipo de fita podem ter comprimentos diferentes dependendo
do fornecedor (ex.: 20 m ou 300 m) — e até do próprio código de produto dentro do mesmo
fornecedor (dois rolos de tamanhos diferentes do mesmo fornecedor são, na prática, dois
códigos de produto diferentes, cada um com seu próprio fator vinculado independentemente).
Uma vez vinculado, o fator fica salvo permanentemente para aquele (material, fornecedor,
código) — não precisa ser informado de novo nas próximas compras com o mesmo código.

---

## 2. Entrada de estoque (nota fiscal)

### 2.1 Lançamento

Uma nota fiscal pode ser lançada manualmente ou a partir da leitura de um XML (NF-e). Em
ambos os casos, todo item lançado entra automaticamente na localização padrão de recebimento
— nunca é pedido ao usuário que escolha uma localização de destino no momento da entrada; a
distribuição física para o lugar definitivo é um passo separado e posterior.

### 2.2 Prevenção de duplicidade

Uma mesma nota fiscal não pode ser lançada duas vezes. A verificação é feita em duas camadas:

1. **Chave de acesso da NF-e** (quando disponível, vindo do XML): se já existe uma nota
   lançada com a mesma chave, o lançamento é bloqueado.
2. **Combinação fornecedor + número da nota** (fallback para lançamento manual, sem XML,
   que não tem chave): mesma regra de bloqueio.

Quando uma tentativa de lançamento identifica que a nota já existe, o sistema ainda permite
**consultar** o conteúdo completo da nota (os itens, quantidades, fornecedor) a partir do
XML sendo re-importado — apenas o lançamento efetivo (a gravação) é bloqueado, não a
visualização. Essa distinção existe porque o XML consultado pode ser o único jeito prático
de revisar o que uma nota já lançada continha.

### 2.3 Itens vindos de XML não podem ser removidos do rascunho

Ao montar o lançamento de uma nota a partir de um XML, os itens que vieram da leitura do XML
não podem ser excluídos individualmente do rascunho antes de confirmar — apenas itens
adicionados manualmente ao rascunho podem. Essa regra existe para impedir que alguém "complete"
uma nota incompleta simplesmente apagando os itens problemáticos (ex.: itens sem material
correspondente no cadastro) em vez de resolvê-los de verdade.

### 2.4 Conversão de unidade de compra para unidade de estoque

Quando o material da linha é do tipo fita (`M`) e a unidade em que ele foi efetivamente
comprado não é já "metro" (ex.: comprado "em rolo"), o sistema precisa de um fator de
conversão (metros por rolo) antes de poder calcular a quantidade de estoque e o preço por
metro:

- Se já existe um fator vinculado para aquele (material, fornecedor, código do fornecedor),
  ele é aplicado automaticamente, sem exigir nenhuma ação manual.
- Se não existe, o lançamento fica bloqueado para aquela linha especificamente até que o
  fator seja informado manualmente; nesse momento, o vínculo é salvo para reuso automático
  futuro.

A fórmula de conversão é: quantidade de estoque (metros) = quantidade comprada (rolos) ×
fator (metros por rolo); preço por metro = preço por rolo ÷ fator. A quantidade comprada, o
preço por rolo e o valor total da nota, conforme emitidos pelo fornecedor, nunca são
alterados por essa conversão — ela afeta apenas como a entrada é refletida no saldo de
estoque (em metros).

---

## 3. Modelo de saldo e movimentação

### 3.1 Princípio

Todo saldo de estoque — tanto o saldo total de um material quanto o saldo numa localização
específica — é sempre derivado pela soma de **movimentos de estoque**, nunca armazenado como
um número fixo e atualizado diretamente. Um movimento é um registro imutável de quanto um
material teve sua quantidade alterada numa localização, em que data e por qual usuário e
motivo. O saldo de qualquer ponto no tempo é sempre a soma de todos os movimentos até ali.

Cada movimento tem um tipo, que indica sua origem: entrada por nota fiscal, baixa de consumo
de projeto, ajuste de contagem, saída por transferência, ou entrada por transferência. Toda
transferência entre duas localizações gera **dois** movimentos simultâneos e vinculados — um
de saída na origem, outro de entrada no destino — nunca um movimento só.

### 3.2 Saldo de um material (visão global)

O saldo "disponível" de um material para fins de reserva/planejamento é composto por quatro
grandezas:

- **Físico**: soma de todos os movimentos de estoque daquele material, em todas as
  localizações — o que realmente existe fisicamente, hoje.
- **Reservado**: soma das quantidades confirmadas de itens de pedido que estão no estado
  "reservado" (ver seção 4) para aquele material — quantidade já prometida a um projeto,
  ainda não retirada fisicamente.
- **Comprado**: soma de itens de solicitação de compra já confirmados como comprados junto
  ao fornecedor, mas ainda não recebidos fisicamente (ainda não viraram nota fiscal/estoque
  físico). Representa estoque "a caminho".
- **Solicitado**: soma de itens de solicitação de compra ainda não confirmados como
  comprados — uma intenção de compra, não uma compra confirmada.

A partir dessas quatro grandezas, dois saldos derivados são usados:

- **Saldo de bloqueio** = físico − reservado + comprado. É o saldo usado para decidir se uma
  nova reserva pode ser feita, e também o saldo comparado contra o mínimo configurado para
  decidir se um material está "abaixo do mínimo".
- **Saldo de visibilidade** = saldo de bloqueio + solicitado. Usado apenas como indicador
  informativo mais otimista (conta também intenções de compra ainda não confirmadas).

### 3.3 Saldo por localização

Independente do saldo global, o saldo de um material numa localização específica é a soma
apenas dos movimentos daquele material naquela localização. Esse saldo por localização é o
que efetivamente trava ou libera qualquer operação que precise retirar material de um lugar
físico específico (baixa de consumo, transferência de saída) — o saldo global nunca é
suficiente para autorizar uma retirada física: a localização específica escolhida precisa,
ela mesma, ter saldo suficiente, senão a operação é bloqueada, mesmo que o material exista
fisicamente em abundância em outro lugar. Isso evita que uma localização sem estoque nenhum
fique com saldo negativo enquanto outra, que realmente tem o material, nem é tocada.

---

## 4. Ciclo de vida de um item de pedido

Cada combinação (material, quantidade necessária) dentro de um pedido/projeto é tratada
como um item individual, com um dos seguintes estados:

1. **Pendente** — item lançado no pedido (manualmente ou via leitura de XML de projeto),
   ainda sem nenhuma ação de reserva ou consumo.
2. **Reservado** — o sistema confirmou que existe saldo de bloqueio suficiente para esse
   item no momento da reserva, e "travou" essa quantidade contra o saldo global do material
   (entra no cálculo de "reservado" da seção 3.2), impedindo que seja prometida duas vezes a
   pedidos diferentes.
3. **Executado** — o item foi efetivamente retirado do estoque físico (consumo real
   registrado); gera o(s) movimento(s) de baixa correspondente(s).
4. **Cancelado** — item anulado, não entra em nenhum cálculo de saldo nem precisa de ação.

### 4.1 Quantidade necessária: conversão automática vs. manual

A quantidade de um item de pedido chega do projeto numa unidade de cálculo (m², metro ou
unidade — ver 1.1), mas a reserva/baixa precisa dela na unidade real de controle de estoque.
A regra de quando essa conversão é automática ou exige confirmação manual segue exatamente a
mesma lógica da seção 1.1:

- **Ferragem** (unidade = unidade): a quantidade de cálculo já é a própria quantidade de
  estoque — nenhuma conversão necessária.
- **Fita** (unidade = metro): a quantidade em metros do cálculo do projeto **já é** a
  quantidade de estoque (estoque de fita é controlado em metro) — também nenhuma conversão
  manual necessária.
- **Chapa** (unidade = m²): precisa ser convertida para "quantas chapas inteiras" o projeto
  vai consumir — essa é a única situação em que se exige confirmação manual antes de poder
  reservar. Informar zero é uma resposta válida (ex.: a peça vai ser cortada de uma sobra já
  existente, sem precisar reservar nenhuma chapa inteira nova).

### 4.2 Reserva

Reservar um item exige que o saldo de bloqueio do material (seção 3.2, visão global — não
por localização) seja suficiente para cobrir a quantidade. Reservar quantidade zero é
permitido e não consulta nem altera saldo algum (não faz sentido reservar "nada"). Existem
operações de reserva em lote: reservar todos os itens pendentes de um pedido inteiro, ou de
todos os pedidos que compartilham o mesmo lote de produção — cada item é avaliado
individualmente dentro do lote (falta de saldo num item não trava os demais).

### 4.3 Baixa (consumo real)

Dar baixa é o ato de registrar que um item foi de fato retirado do estoque físico para uso
no projeto. Regras:

- Exige informar de qual(is) localização(ões) física(s) o material está saindo — nunca
  assume uma localização.
- **Pode ser dividida entre mais de uma localização numa única ação**: se o material
  necessário está fisicamente espalhado (parte numa prateleira, parte noutra), a baixa aceita
  uma lista de (localização, quantidade), soma tudo e grava um movimento de baixa individual
  por localização informada — ao invés de obrigar que tudo saia de um único lugar.
- Cada localização informada precisa ter, ela mesma, saldo físico suficiente para a
  quantidade que está sendo retirada dali (ver 3.3). Localização de recebimento nunca pode
  ser escolhida como origem (ver 1.2).
- A quantidade efetivamente baixada pode ser diferente da quantidade reservada — mais ou
  menos — refletindo que o consumo real de obra às vezes diverge do planejado. Se a
  quantidade baixada exceder o que foi reservado, o excedente ainda precisa caber no saldo de
  bloqueio global do material (mesma checagem da reserva, aplicada só à diferença).
- Materiais com estoque mínimo configurado **exigem** que o item já esteja no estado
  reservado antes de poder receber baixa — não é permitido pular a reserva para esses. Para
  materiais sem mínimo configurado, a baixa pode ser feita direto a partir do estado
  pendente, sem reserva prévia.
- Baixar um item muda seu estado para executado; não pode receber uma segunda baixa depois
  disso.
- Liberar uma reserva (sem ter dado baixa) devolve o item ao estado pendente, sem criar
  nenhum movimento de estoque.

### 4.4 Lançamento manual de item em pedido

Além dos itens vindos de leitura de XML, é possível lançar um item diretamente num pedido
sem depender de XML algum (ex.: um acessório comprado à parte, decidido já na fase de
liberação do pedido, antes mesmo do projeto técnico existir). Segue exatamente as mesmas
regras de conversão de unidade e de ciclo de vida descritas acima.

---

## 5. Ajuste de estoque por contagem física

Existe uma operação dedicada para corrigir o saldo de um material numa localização a partir
de uma contagem física real (inventário periódico), diferente de baixa ou transferência:

- O usuário informa quanto contou fisicamente de um material numa localização.
- O sistema compara contra o saldo que ele próprio acredita existir ali (soma dos
  movimentos) e calcula a diferença.
- Se a diferença for zero, nenhum movimento é criado (nada mudou, não há o que registrar).
- Se houver diferença (positiva ou negativa), um único movimento do tipo ajuste é criado com
  exatamente essa diferença — nunca a contagem bruta em si. Esse movimento registra
  obrigatoriamente a data/hora exata e o usuário responsável.
- Contagem informada não pode ser negativa (zero é o mínimo — "não achei nenhum").

Todo ajuste já lançado pode ser consultado depois, filtrando por material específico (para
ver o histórico de correções daquele item) ou por usuário específico (para ver tudo que uma
pessoa ajustou) — a mesma consulta serve aos dois casos.

---

## 6. Transferência entre localizações

Mover um material de uma localização para outra dentro do estoque é uma operação própria,
distinta de ajuste e de baixa:

- Exige localização de origem, localização de destino (diferentes entre si) e quantidade.
- A localização de origem precisa ter saldo físico suficiente para a quantidade movida —
  exatamente a mesma regra de saldo por localização da seção 3.3.
- Gera dois movimentos simultâneos (saída na origem, entrada no destino), numa mesma operação
  atômica — nunca fica um sem o outro.
- **A data/hora de uma transferência é sempre determinada pelo sistema no momento do
  processamento — nunca é um valor informado por quem está registrando.** Essa é uma decisão
  deliberada: um registro de movimentação de estoque é um registro de auditoria, e seu
  horário não pode ser manipulável por quem o cria (impede que alguém registre uma
  transferência com data retroativa ou futura para "ajustar" a ordem dos fatos).

---

## 7. Identificação de necessidade de compra

O sistema identifica materiais que precisam ser comprados a partir de dois critérios
independentes, sem exigir nenhuma ação manual de triagem prévia:

### 7.1 Material pedido por um projeto mas sem estoque em nenhum lugar

Todo material que está referenciado por pelo menos um item de pedido ainda não executado
(pendente ou reservado) e cujo saldo físico — somado em **todas** as localizações, inclusive
recebimento — é zero ou negativo, é considerado bloqueando aquele pedido por falta de
compra. Para cada material nessa situação, o sistema sabe listar exatamente quais pedidos
(com seus respectivos projetos, ambientes e clientes) estão esperando por ele, e qual
quantidade cada um precisa.

### 7.2 Material abaixo do estoque mínimo configurado

Todo material com estoque mínimo configurado (seção 1.1) cujo saldo de bloqueio (seção 3.2)
está igual ou abaixo desse mínimo é sinalizado como precisando de reposição, independente de
estar ou não vinculado a algum pedido específico no momento — é uma regra de manutenção de
estoque de segurança, não de atendimento a uma demanda pontual.

### 7.3 Priorização por urgência

Pedidos/projetos podem ser marcados como urgentes. Quando um material identificado por
qualquer um dos dois critérios acima (7.1 ou 7.2) está relacionado a pelo menos um pedido
urgente com item ainda pendente ou reservado, essa relação é sinalizada explicitamente junto
com o material, e materiais nessa condição são priorizados (ordenados antes dos demais) nas
duas listas — permitindo decidir rapidamente qual compra resolver primeiro sem precisar
examinar cada material individualmente.

---

## 8. Consulta de separação física (picking)

A partir de um pedido específico, o sistema sabe gerar a lista completa de materiais ainda
não executados daquele pedido (pendentes ou reservados), já com a indicação de onde cada
material está fisicamente guardado no momento (uma ou mais localizações, cada uma com sua
própria quantidade disponível ali) — ou a ausência total de estoque, quando aplicável. Essa
consulta serve para orientar a retirada física do material do estoque antes da baixa
propriamente dita ser registrada.

---

## 9. Consulta de status de separação por projeto

Independente da fila de ação (separação pendente), é possível consultar, para qualquer
projeto, a lista completa de seus itens de material com o estado atual de cada um (pendente,
reservado, separado/executado ou cancelado) — uma visão de acompanhamento, não uma fila de
trabalho.

Quando essa consulta está associada ao fluxo de liberação para expedição/envio de um pedido,
existe uma regra adicional: **o pedido não pode ser liberado para expedição enquanto
qualquer um de seus itens de material ainda estiver pendente ou reservado (não separado)** —
a menos que o próprio pedido seja explicitamente marcado para seguir mesmo com pendência
(uma exceção deliberada e visível, não um jeito de burlar silenciosamente a regra).

---

## 10. Princípios transversais

Estes princípios não são regras de um fluxo específico, mas decisões que atravessam todo o
sistema:

- **Nenhum horário de evento de estoque é informado por quem registra a ação** — toda
  movimentação (transferência, baixa, ajuste) recebe seu timestamp do próprio sistema no
  momento do processamento, nunca de um campo de formulário. Isso vale especificamente para
  o *momento em que a ação aconteceu*; não impede que outros campos de um registro (como a
  data de emissão de uma nota fiscal, um documento histórico por natureza) sejam informados
  manualmente.
- **Toda operação que retira material fisicamente de algum lugar valida o saldo daquele
  lugar específico, nunca só o saldo global do material.** Essa regra aparece de forma
  idêntica em baixa de consumo e em transferência.
- **Um saldo nunca é um número armazenado — é sempre a soma de um histórico de movimentos.**
  Isso garante que todo saldo, a qualquer momento, seja auditável e reconstruível a partir do
  zero.
- **Itens de origem automática (lidos de um arquivo, não digitados manualmente) não podem
  ser silenciosamente descartados para contornar uma validação** — só podem ser resolvidos
  de verdade (corrigidos) ou, quando a regra permite, cancelados explicitamente.
