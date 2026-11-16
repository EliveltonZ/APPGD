# Pendências de segurança e manutenção — APPGD

Levantamento feito em 2026-11-16, ao sincronizar o repositório com a reescrita (React + Sequelize).
Nada aqui foi alterado ainda — é uma lista para tratarmos juntos, na ordem de prioridade.

> Contexto: hoje só Matheus e Elivelton têm acesso ao código, então o risco imediato é baixo.
> Mesmo assim, os itens 1–3 devem ser resolvidos antes de o sistema ganhar mais usuários ou colaboradores.

---

## 1. API pública do Supabase (PostgREST) aberta com a chave `anon` — ALTA

**O que foi verificado (teste só de leitura, contagem de linhas, nenhum dado baixado):**
a chave `anon` do sistema antigo continua válida (expira em 2035) e lê **todas** as tabelas testadas
pela URL `https://<projeto>.supabase.co/rest/v1/...`:

| Tabela | Linhas visíveis |
|---|---|
| tblUsuario | 159 |
| tblClientes | 1.316 |
| tblProjetos | 9.258 |
| tblMateriais | 2.879 |
| tblFornecedores | 281 |
| tblPlanoContas / tblCentrosCusto | 217 / 15 |
| tblNotasFiscais, tblEstoqueMovimentos, tblSolicitacaoCompras | abertas |

**Causas:**
- Tabelas antigas: policy `all-select-policy` (`FOR ALL TO public USING (true)`) — libera leitura **e escrita** para a `anon`.
- Tabelas novas (13 migrations `create-*`): nenhuma faz `ENABLE ROW LEVEL SECURITY`. Sem RLS, a `anon` tem CRUD completo via PostgREST (grants padrão do Supabase no schema `public`).
- A mesma chave está commitada em `estrutra de dados APPGD/chave.txt` (commit `5b48111`, 2025-08-18). O arquivo não existe mais no `main`, mas continua no histórico e nas branches `AppGD-testes` / `claude/compras-ciclo`.

**O sistema novo não usa a API pública** (conecta direto via `DATABASE_URL`), então dá para fechar sem impacto nele.

**Antes de mexer, confirmar:** se algo ainda usa a chave `anon` — Power BI conectado direto no Supabase, `sync-copia.ps1`, planilhas, scripts antigos.

**Correção sugerida (em etapas):**
1. *Rápida e reversível:* Supabase → **Project Settings → Data API** → desligar o Data API ou tirar `public` dos *exposed schemas*.
2. *Definitiva:* migration que faz `ENABLE ROW LEVEL SECURITY` em todas as tabelas de `public` e remove as policies `all-select-policy`.
   - Antes, confirmar que o usuário do `DATABASE_URL` é `postgres` (dono das tabelas / `BYPASSRLS`), senão o próprio backend é bloqueado.
3. *Higiene:* gerar chaves novas no Supabase (ou migrar para as *publishable/secret keys* e desativar as legadas), inutilizando a que vazou.

---

## 2. Senhas em texto puro em `tblUsuario` — ALTA

`usuariosService.verificarLogin` converte a senha para bcrypt **só no primeiro login** no sistema novo.
Hoje **134 de 159** usuários ainda têm senha em texto puro — e, pelo item 1, elas são legíveis pela chave `anon`.

**Correção sugerida:** migration única convertendo todas as senhas que não começam com `$2` para bcrypt.
Os usuários continuam com a mesma senha (o login já aceita os dois formatos). Ex.:
```sql
-- requer a extensão pgcrypto; gera hash $2a$, compatível com bcryptjs
UPDATE "tblUsuario"
   SET senha = crypt(senha, gen_salt('bf', 12))
 WHERE senha IS NOT NULL AND senha NOT LIKE '$2%';
```
Depois disso, dá para remover o ramo de comparação em texto puro do `verificarLogin`.

---

## 3. Padrão de RLS para tabelas novas — MÉDIA

Combinar a regra para as próximas migrations: toda `createTable` vem acompanhada de
`ALTER TABLE "tblX" ENABLE ROW LEVEL SECURITY;` **sem** policy para `anon`/`public`.
(Já está registrado na skill `/migration` e no `CLAUDE.md`.)

---

## 4. Dependências com vulnerabilidade conhecida — MÉDIA

`npm audit` (2026-11-16): 20 vulnerabilidades (1 crítica, 7 altas).

| Pacote | Gravidade | Correção |
|---|---|---|
| proxy-addr (via express) | crítica | disponível |
| body-parser, path-to-regexp (via express) | alta | disponível |
| lodash, brace-expansion, minimatch, picomatch | alta | disponível |
| **xlsx** (dependência direta do frontend) | alta | **sem correção no npm** — avaliar troca (ex.: versão do CDN oficial do SheetJS ou `exceljs`) |

Como o `package-lock.json` não é versionado, cada `npm install` (inclusive no Render) resolve versões novas — vale rodar `npm audit fix` e testar.

---

## 5. Arquivos que não deveriam estar no repositório — BAIXA

| Caminho | O que é | Ação |
|---|---|---|
| `XMLs/` (5 arquivos) | XMLs reais do Promob com nome completo de cliente (LGPD) | remover; se precisar de amostra de teste, usar versão anonimizada |
| `.vite/deps/` | cache gerado pelo Vite | remover e adicionar `.vite` ao `.gitignore` |
| `.claude/worktrees/agent-*` | gitlink de worktree temporário do Claude | remover e adicionar `.claude/worktrees` ao `.gitignore` |
| `tbl_Fornecedores.xlsx`, `tbl_Produtos.xlsx` | planilhas usadas na importação inicial | confirmar se ainda servem; se não, remover |

Nenhum desses arquivos é usado pelo código — remover não afeta o funcionamento.

---

## 6. Outros pontos — BAIXA / acompanhar

- **Rotas de estoque** (`routes/estoque.js`) liberadas para qualquer usuário logado — intencional na fase de testes/treinamento; reintroduzir `rp('estoque_reservar')` antes de operar com dados reais.
- **SSL do banco** com `rejectUnauthorized: false` — tráfego cifrado, mas sem validar o certificado. Dá para validar usando o certificado CA do Supabase (Project Settings → Database → SSL).
- **Servidor de testes no Render** (`AppGD-testes`) ainda roda o sistema antigo (abril). Precisa ser reconfigurado para o monorepo novo antes de voltar a ser usado nos testes.
- **Model `tblPlanoContas` desatualizado:** o banco já tem `codigo_dre` e `codigo_interno` (migração aplicada em 2026-06-16, fora do sequelize-cli); a coluna `codigo` não existe mais. O model ainda declara `codigo` — não quebra hoje porque nada usa o model, mas precisa ser corrigido (será feito junto com a tela Financeiro → Cadastros).
- **Banco único:** teste e produção usam o mesmo banco. Toda migration é aplicada direto em produção — vale considerar um banco de testes separado (ex.: branch do Supabase).
