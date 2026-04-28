# APPGD — Sistema de Gestão | Fábrica de Móveis Sob Medida

## O projeto
Sistema web de gestão interna para uma marcenaria de móveis sob medida.
Cobre o ciclo completo: Pedido → Produção → Expedição → Assistência Técnica.
Usado exclusivamente pela equipe interna. Não é um e-commerce público.

**Stack:** Node.js · Express 5 · Supabase (PostgreSQL) · HTML/JS puro
**Deploy:** Render
**Branch de testes:** AppGD-testes
**Branch de produção:** APPGD (main)

---

## Domínio do negócio

Entenda estes conceitos antes de qualquer implementação:

- **Pedido** — documento que inicia o ciclo quando o cliente fecha negócio.
  Possui número de contrato e passa pelas fases abaixo.

- **Projeto** — unidade de produção vinculada a um pedido.
  Percorre as fases: Previsão → Produção → Expedição.
  Acompanhado por status e acessórios associados.

- **Lote** — agrupamento de projetos para produção em conjunto (gerenciado pelo PCP).
  Criado e controlado pelo módulo PCP.

- **Acessórios** — componentes e ferragens associados a cada projeto.
  Gerenciados nos módulos de Compras e Pendências.

- **Assistência (SAT)** — ordem de assistência técnica pós-entrega.
  Gerada quando o cliente reporta problema após receber o móvel.

- **Expedição** — fase final de entrega física do projeto ao cliente.

- **PCP** — Planejamento e Controle da Produção.
  Responsável por organizar lotes e datas de produção.

- **Pendências** — acessórios ou itens em falta vinculados a um contrato.

---

## Stack e arquitetura

- **Backend:** Node.js + Express 5 (`server.js` → `routes.js` → `controllers/`)
- **Banco:** Supabase (PostgreSQL). O código NUNCA escreve SQL direto —
  toda comunicação com o banco é via **stored procedures** chamadas por `.rpc()`
- **Frontend:** HTML puro + JS em `/public/` — sem frameworks como React ou Vue
- **Conexão com banco:** `client/clientSupabase.js`

### Padrão obrigatório para novas rotas

Todo novo controller deve usar a factory `rpcHandlerFactory`:

```js
const { createRpcHandler } = require("./rpcHandlerFactory");
module.exports = {
  buscarDados: createRpcHandler("nome_da_funcao_no_banco", "query"),
};
```

Nunca criar um controller do zero sem usar essa factory.

---

## Módulos existentes

| Módulo | Controller | O que faz no negócio |
|---|---|---|
| Login | `indexController` | Autenticação de usuários |
| Capa | `capaController` | Tela inicial com resumo dos projetos |
| Projetos – Previsão | `projetosPrevController` | Lista projetos com data prevista |
| Projetos – Produção | `projetosPrdController` | Acompanha produção em andamento |
| Projetos – Expedição | `projetosExpController` | Controla entregas |
| Projetos – Status | `projetosSttsController` | Visão geral de status por projeto |
| Adicionar Projeto | `addProjetosController` | Cadastra novo projeto/pedido |
| Editar Projeto | `editProjetosController` | Edita dados de um projeto |
| Excluir Projeto | `deleteController` | Remove projetos |
| PCP | `pcpController` | Cria e gerencia lotes de produção |
| Compras | `comprasController` | Gestão de acessórios para compra |
| Pendências | `pendenciasController` | Acessórios pendentes por contrato |
| Valores | `valoresController` | Tabela de valores dos projetos |
| Assistências | `assistenciasController` | Ordens de assistência técnica (SAT) |
| Solicitação | `solicitacaoController` | Solicitações de peças/equipamentos |
| Peças | `pecasController` | Registro de peças usadas em SAT |
| Qualidade | `qualidadeController` | Análise de causa-raiz de problemas |
| Usuários | `usuariosController` | Permissões de acesso por página |
| Acessos | `acessosController` | Controle de acessos por usuário |
| Senha | `senhaController` | Alteração de senha |
| E-mail | `emailController` | Envio de notificações por e-mail |
| Utils | `ultilsController` | Funções auxiliares compartilhadas |

---

## Fluxo de trabalho obrigatório

1. Explique o plano e aguarde confirmação antes de começar
2. Implemente a mudança
3. Faça push para `AppGD-testes` (nunca direto para `APPGD`)
4. Pergunte antes de replicar para `APPGD` (produção no Render)

Para correções pequenas e óbvias (texto errado, ajuste visual), pode implementar direto.

---

## Regras que nunca quebramos

### Banco de dados
- Nunca escrever SQL direto no código — sempre usar `.rpc()` com stored procedures
- Nunca executar DELETE sem cláusula WHERE
- Nunca executar DROP sem confirmação explícita

### Segurança
- Variáveis sensíveis sempre via `process.env` — nunca escritas no código
- Nunca commitar arquivos `.env`
- Não contornar os middlewares existentes: Helmet, rate limit, express-validator

### Código
- Antes de criar qualquer função, verificar se já existe algo parecido no projeto
- Não alterar arquivos fora do escopo combinado para aquela tarefa
- Não instalar dependências novas sem perguntar

### Deploy
- Push sempre para `AppGD-testes` primeiro
- Perguntar antes de replicar para `APPGD` (produção)
- Nunca usar `git push --force`

---

## Lições aprendidas

[Adicione aqui sempre que um erro puder virar uma regra:]

- [data] — [o que aconteceu e qual regra isso gerou]
