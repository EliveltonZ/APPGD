# Pendências de segurança e manutenção — APPGD

Levantamento feito em 2026-11-16, ao sincronizar o repositório com a reescrita (React + Sequelize).
Nada aqui foi alterado ainda — é uma lista para tratarmos juntos, na ordem de prioridade.

> Contexto: hoje só Matheus e Elivelton têm acesso ao código, então o risco imediato é baixo.
> Mesmo assim, os itens 1–3 devem ser resolvidos antes de o sistema ganhar mais usuários ou colaboradores.

## Situação

| # | Item | Prioridade | Situação |
|---|---|---|---|
| 1 | API pública do Supabase aberta pela chave `anon` | ALTA | 🔴 Aberto |
| 2 | Senhas em texto puro em `tblUsuario` | ALTA | 🔴 Aberto |
| 3 | RLS em tabelas novas | MÉDIA | 🔴 Aberto |
| 4 | Dependências com vulnerabilidade | MÉDIA | 🔴 Aberto |
| 5 | Arquivos indevidos no repositório | BAIXA | 🔴 Aberto |
| 6 | Outros pontos (estoque aberto, SSL, servidor de testes, model do plano de contas, banco único) | BAIXA | 🔴 Aberto |
| 7 | Tabela do PIN do terminal (`tblKioskPin`) sem RLS | ALTA (se o item 1 não for resolvido) | 🔴 Aberto |
| 8 | PIN do terminal sem limite de tentativas | MÉDIA | 🔴 Aberto |

Ao resolver um item, troque para `✅ Resolvido em AAAA-MM-DD` e anote o que foi feito na seção dele.

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

---

## 7. Tabela do PIN do terminal sem RLS — ALTA (se o item 1 não for resolvido)

Identificado em 2026-11-17, na revisão do terminal público de apontamento (commits de 17/11).

- A migration `20261117110500-create-tblKioskPin` cria a tabela `tblKioskPin` **sem** `ENABLE ROW LEVEL SECURITY`.
- A tabela guarda o PIN que libera o terminal. Como a chave `anon` antiga ainda funciona (item 1), **quem tem essa chave consegue ler o PIN direto pela API pública** e usar o terminal sem precisar do PIN verdadeiro.
- Também vale para as migrations novas de permissões em `tblUsuario`, que só adicionam colunas (sem RLS extra, pois a tabela já existia).

**Correção sugerida:** nova migration com `ALTER TABLE "tblKioskPin" ENABLE ROW LEVEL SECURITY;` (sem policy para `anon`/`public`). Tratar junto com o item 1.

---

## 8. PIN do terminal sem limite de tentativas — MÉDIA

Identificado em 2026-11-17, na mesma revisão.

- O PIN do terminal tem **6 dígitos** (1 milhão de combinações).
- O `server.js` aplica limite de tentativas **só** em `/api/auth/login`. As rotas `/api/apontamento-publico/*` não têm limite, então alguém poderia testar combinações até acertar.
- Quem acerta o PIN passa a ver a lista de operadores (`/operadores`) e pode registrar apontamentos.

**Correção sugerida:** aplicar um limitador de tentativas (como o do login) em `/api/apontamento-publico`, e avaliar um PIN mais longo ou bloqueio temporário após várias falhas.
