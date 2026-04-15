# Comando: Migration (Alteração no banco de dados)

Use este comando sempre que precisar criar ou alterar tabelas no Supabase.

## Processo obrigatório

1. **Pergunte** qual é a alteração necessária (se ainda não foi informada)

2. **Verifique** o estado atual:
   - Leia os arquivos em `supabase/migrations/` para entender o esquema existente
   - Identifique o nome do arquivo mais recente para saber a sequência

3. **Valide a necessidade de RLS:**
   - Se for uma tabela nova, RLS é obrigatório
   - Prepare a policy correspondente junto com a migration

4. **Gere o arquivo SQL** seguindo o padrão:
   - Nome: `YYYYMMDD_descricao_curta.sql` (ex: `20260401_adiciona_prazo_pedido.sql`)
   - Inclua sempre o comando de rollback comentado no final

5. **Apresente o SQL completo** para revisão antes de salvar:
   ```
   -- MIGRATION: [descrição]
   -- Data: [data]
   -- Autor: Claude Code
   
   -- APLICAR:
   ALTER TABLE pedidos ADD COLUMN prazo_entrega DATE;
   
   -- ROLLBACK (para desfazer):
   -- ALTER TABLE pedidos DROP COLUMN prazo_entrega;
   ```

6. **Aguarde aprovação** — só salve o arquivo após confirmação

7. **Nunca aplique** a migration diretamente — apenas crie o arquivo.
   A aplicação é feita manualmente via Supabase CLI ou Dashboard.

## Regras desta migration

- Jamais modifique arquivos de migration já existentes
- Nunca use `DROP TABLE` ou `DROP COLUMN` sem confirmação explícita
- Sempre que adicionar uma tabela, inclua `ENABLE ROW LEVEL SECURITY`
- Prefira `ADD COLUMN` a reestruturações completas de tabela
- Adicione comentários em português explicando o propósito das mudanças
