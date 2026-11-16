# Comando: Migration (Alteração no banco de dados)

Use este comando sempre que precisar criar ou alterar tabelas, colunas ou dados estruturais do banco.
No APPGD, toda mudança de banco é um arquivo de migration do `sequelize-cli` em `backend/src/migrations/`.

## Processo obrigatório

1. **Entenda** qual é a alteração necessária (pergunte se não foi informada).

2. **Verifique o estado atual:**
   - Leia o model em `backend/src/models/` e a entrada em `backend/src/config/tables.js`
   - Veja migrations parecidas já existentes em `backend/src/migrations/` e siga o mesmo estilo
   - Se for renomear tabela/coluna, siga o checklist de `docs/schema-renames.md`
   - Confirme o que já foi aplicado: `npm run migrate:status -w backend`

3. **Gere o arquivo de migration:**
   - Nome: `AAAAMMDDHHMMSS-descricao-curta.js` (`npm run migration:create -w backend -- descricao-curta`)
   - Sempre com `up` (aplicar) **e** `down` (desfazer)
   - Mudanças com mais de um passo dentro de `queryInterface.sequelize.transaction(...)`
   - Comentários em português explicando o porquê da mudança

4. **Tabela nova → RLS habilitado (obrigatório):**
   - Inclua no `up`, logo após criar a tabela:
     `await queryInterface.sequelize.query('ALTER TABLE "tblNova" ENABLE ROW LEVEL SECURITY;', { transaction: t });`
   - **Não crie policy para `anon`/`public`.** O backend conecta direto e não depende de RLS; o RLS só serve
     para trancar a API pública do Supabase.

5. **Atualize o código que acompanha a mudança:**
   - Model em `backend/src/models/` (e `init-models.js` se for tabela nova)
   - `backend/src/config/tables.js`
   - Permissão nova → coluna booleana em `tblUsuario` (`defaultValue: false`) + chave em `frontend/src/config/appRoutes.ts`

6. **Apresente para revisão** a quem conduz a sessão: o que muda, o que acontece com os dados existentes,
   e como desfazer (com o Matheus, em linguagem simples). Aguarde o ok antes de salvar.

7. **Aplicação** — o banco é o mesmo de produção (não há banco de testes separado), então vale na hora:
   - **Sessão do Elivelton:** pode aplicar sem aprovação prévia.
   - **Sessão do Matheus:** aplicar só após o "pode aplicar" explícito dele.
   - Aplique: `npm run migrate -w backend`
   - Confira em seguida (`migrate:status` + uma consulta de amostra) e mostre o resultado
   - Confira o Advisor de segurança do Supabase
   - Se algo der errado: `npm run migrate:undo -w backend` (desfaz a última)

8. **Aviso obrigatório após aplicar:** escreva um resumo curto, em linguagem simples, para enviar à outra pessoa
   (ao Matheus, se quem aplicou foi o Elivelton; ao Elivelton, se foi o Matheus):
   ```
   Mudança no banco — [data]
   O que mudou: [ex.: nova coluna "prazo" na tabela de pedidos]
   Por quê: [motivo de negócio]
   Impacto: [ex.: nenhum dado existente foi alterado]
   Como desfazer: [migration X / migrate:undo]
   ```
   Entregue o texto pronto para copiar; quem conduz a sessão envia.

## Regras

- Jamais edite uma migration já aplicada — crie uma nova
- `dropTable`, `removeColumn`, `bulkDelete` ou `DELETE` só com confirmação explícita
- Prefira adicionar colunas a reestruturar tabelas
- Nunca coloque dados reais de clientes ou segredos dentro da migration
