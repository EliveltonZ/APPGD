# Renomear tabelas ou colunas do banco

Guia para quando for necessário renomear uma tabela ou coluna no PostgreSQL (Supabase) para melhorar a legibilidade do schema. Leia antes de criar a migration.

## O que já é centralizado

- [`backend/src/config/tables.js`](../backend/src/config/tables.js) é o registro único de nomes de tabela (`T.xxx.name`) e, para algumas tabelas, de colunas críticas (`T.xxx.cols`). Comentário no topo do arquivo: *"To rename: 1 SQL migration + 1 line here."*
- Todo model Sequelize declara `tableName: T.xxx.name`, então o nome da tabela é centralizado nesse arquivo.
- Cada coluna de um model tem `field: 'nome_da_coluna'`, mapeando para um atributo JS em camelCase (ex: `idCliente` → `field: 'id_cliente'`). **Repositories, services e controllers só usam o atributo JS — nunca o nome da coluna do banco.** Isso significa que renomear uma coluna normalmente exige apenas 1 linha alterada no model correspondente, desde que nada faça bypass do model (ver abaixo).

## Lacuna conhecida: SQL raw com nomes literais

Nem toda query passa pelo model. Alguns `sequelize.query()` já interpolam `${T.xxx.name}`, mas outros têm nomes de tabela/coluna **escritos literalmente na string SQL**, sem passar por `T`. Isso significa que essas queries **não são protegidas** por uma renomeação feita só em `tables.js` + model — elas quebram silenciosamente até alguém achar o erro na mão. Arquivos com esse padrão hoje:

- `backend/src/repositories/dashboardRepository.js`
- `backend/src/repositories/transferenciasRepository.js`
- `backend/src/repositories/utilsRepository.js` (parcialmente — algumas queries já usam `T`, outras não)

## Checklist antes de renomear uma tabela ou coluna

1. `grep -rn "sequelize.query"` em `backend/src/repositories/` e revisar manualmente se o nome alvo aparece como string literal em alguma query raw.
2. Se a tabela/coluna ainda não estiver em `tables.js`, adicione antes de prosseguir (e, se possível, troque as queries raw que a referenciam para interpolar `${T.xxx.name}` / `${T.xxx.cols.yyy}`).
3. Atualize `field:` (coluna) ou `tableName:` (tabela) no model Sequelize correspondente.
4. Crie uma migration (`ALTER TABLE ... RENAME COLUMN/TABLE ...`) — nunca edite uma migration já aplicada em produção para "corrigir" o nome; isso deixa o arquivo da migration divergente do histórico real (`SequelizeMeta`) sem re-executar nada.
5. Rode `npx sequelize-cli db:migrate:status` (dentro de `backend/`) contra o ambiente antes de assumir que o schema real bate com o model — já houve caso de migration alterada depois de já aplicada, gerando divergência entre o arquivo e o banco real.
6. Depois do rename, rode `npx tsc --noEmit` no frontend e confirme que os `services/*.ts` que leem o retorno da API continuam usando as mesmas chaves — a API JSON é um contrato separado do nome da coluna do banco (os repositories já fazem esse de-para manualmente), então normalmente não muda nada no frontend, mas vale conferir se algum lugar leu a coluna crua sem passar pelo de-para.

## Recomendação futura (ainda não implementada)

Expandir `T.xxx.cols` para cobrir todas as tabelas/colunas sensíveis a rename, e trocar todo SQL raw que hoje usa string literal para interpolar via `T`. Não compensa reescrever os relatórios de dashboard em Sequelize puro (perderia legibilidade nas agregações complexas) — só garantir que identificadores de tabela/coluna sempre passem pelo registro central.
