# APPGD — Sistema de Gestão | Fábrica de Móveis Sob Medida

## O projeto
Sistema web de gestão interna de uma marcenaria de móveis sob medida.
Cobre o ciclo completo: Pedido → Compras/Estoque → Produção → Expedição → Assistência Técnica.
Usado exclusivamente pela equipe interna. Não é um e-commerce público.

**Stack:** monorepo — `frontend/` (React 19 + TypeScript + Vite) e `backend/` (Node.js + Express 4 + Sequelize)
**Banco:** PostgreSQL no Supabase, acessado por conexão direta (`DATABASE_URL`) — não usamos mais a API/RPC do Supabase
**Deploy:** Render — um único serviço Node serve a API (`/api/*`) e o frontend compilado
**Responsáveis:** Matheus (gestor/dono do negócio, não é programador) e Elivelton (dev responsável)

> **Com quem você está falando?** Identifique pelas instruções pessoais de quem conduz a sessão
> (`~/.claude/CLAUDE.md` ou `CLAUDE.local.md` — o do Matheus diz que ele é o dono/gestor e não é programador).
> **Não use a conta do git/GitHub para isso** — a conta `fabricaGD` é compartilhada. Na dúvida, pergunte no início da sessão.
> Algumas regras abaixo mudam conforme quem conduz a sessão. Com o Matheus, explique em linguagem simples, sem jargão.

📘 **Documentação técnica completa: `README.md`** — ler a seção relevante antes de implementar.

---

## Domínio do negócio

- **Pedido** — contrato fechado com o cliente (tabela `tblProjetos`, identificado pela O.C. `ordemdecompra`). Assistências técnicas também são pedidos (`tipo_pedido`).
- **Lote** — agrupamento de pedidos para produzir juntos (módulo PCP / Fábrica).
- **Materiais e Estoque** — chapas, fitas e ferragens; saldo por localização e por depósito (Almoxarifado → Fábrica → Expedição).
- **XML do Promob** — lista de peças do projeto; validado na Fábrica e usado para reservar/liberar/baixar material.
- **Nota Fiscal** — entrada de material no estoque (lê o XML da NF-e).
- **Compras** — Necessidades → Orçamento → Confirmação → Pedido de Compra → Recebimento. `tblAcessorios` é o controle legado de acessórios, ainda em uso.
- **Assistência (SAT)** — ordem pós-entrega; 4 visões: Nova, Produção, Logística, Qualidade.
- **Financeiro** — Valores dos pedidos; Plano de Contas (`tblPlanoContas`) e Centros de Custo (`tblCentrosCusto`) para classificar gastos.

---

## Como o código é organizado (resumo — detalhes no README)

- **Backend:** `routes → controllers → services → repositories`. Só o **repository** fala com o banco.
- **Nomes de tabela:** sempre via `backend/src/config/tables.js`. Renomear algo → seguir `docs/schema-renames.md`.
- **Frontend:** `frontend/src/config/appRoutes.ts` é a fonte única de rotas, menu e permissões.
- **Permissão nova:** coluna booleana em `tblUsuario` (via migration) + chave em `appRoutes.ts` + `rp('chave')` nas rotas de escrita do backend.
- **Mudança no banco:** só por migration do `sequelize-cli` em `backend/src/migrations/` → siga a skill `/migration`.

---

## Fluxo de trabalho

Para os dois:
1. Explique o plano e aguarde confirmação antes de começar
2. Sempre atualize o `main` (`git pull`) antes de começar — Matheus e Elivelton mexem no mesmo código em paralelo; evite trabalhar nos mesmos arquivos ao mesmo tempo
3. Rode `npm run build` antes de enviar — erro de TypeScript bloqueia o deploy no Render
4. Teste — ⚠️ *servidor de testes no Render em redefinição (a `AppGD-testes` ainda roda o sistema antigo)*
5. O que entra no `main` é publicado em produção pelo Render

**Funcionalidade nova ou mudança relevante (vale para os dois):** trabalhar em `claude/nome-da-feature`, criada a partir do `main`, e abrir Pull Request → `main`.
- Quem abriu o PR pode fazer o merge depois de testar — vale para o Matheus e para o Elivelton.
- Os dois se alinham pessoalmente sobre as mudanças que cada um enviou.

**Mudança simples pode ir direto ao `main`** — e só ela. Conta como simples quando **tudo** abaixo é verdade:
- texto, ajuste visual ou correção pequena e óbvia, em poucos arquivos
- não mexe no banco (sem migration), em permissões, login ou segurança
- não muda regra de negócio nem o comportamento de uma tela além do ajuste pedido

Na dúvida, trate como funcionalidade (branch + PR).

**Este arquivo deve ser atualizado sempre que houver mudança significativa** (arquitetura, módulo novo, regra nova).

---

## Regras que nunca quebramos

### Banco de dados
- Nunca alterar o banco fora de uma migration (nada de SQL solto no painel)
- Nunca editar uma migration que já foi aplicada — crie outra
- `DROP`, `removeColumn` ou `DELETE` em massa só com confirmação explícita
- Toda tabela nova nasce com **RLS habilitado** (tranca o acesso pela API pública do Supabase) — ver `/migration`
- Teste e produção usam **o mesmo banco**: toda migration aplicada vale na hora para a operação
- Quem aplica: o Elivelton aplica sem precisar de aprovação, mas **sempre informa o Matheus** (o que mudou e por quê); nas sessões do Matheus, aplicar só após o ok dele e avisar o Elivelton — detalhes em `/migration`

### Segurança — checklist completo na skill `/seguranca`
- Segredos só em `backend/src/client/.env` (nunca no código, nunca em commit)
- Toda rota de escrita nova protegida com `rp('permissao')`; não contornar `auth`, Helmet, CORS e rate limit
- Nunca commitar dados reais de clientes (XMLs do Promob, planilhas) — use exemplos anonimizados
- Antes de enviar mudanças que toquem banco, dados ou autenticação, rodar `/security-review`
- Pendências de segurança conhecidas (ainda não corrigidas): `docs/seguranca-pendencias.md`
  - **Em sessão do Elivelton:** no início da sessão, leia esse arquivo e, se houver item com situação "🔴 Aberto",
    lembre-o em 2–3 linhas (quais itens e a prioridade). Não insista se ele disser que vai tratar depois.
    Ao resolver um item, atualize a situação dele para "✅ Resolvido em AAAA-MM-DD".

### Código
- Antes de criar algo, verificar se já existe parecido (componentes em `frontend/src/components/`, padrões nos módulos existentes)
- Não alterar arquivos fora do escopo combinado
- Não instalar dependências novas sem perguntar a quem conduz a sessão
- Comentários em português

### Git
- Nunca usar `git push --force`
- Nunca commitar arquivos `.env`, chaves ou dados reais de clientes

---

## Lições aprendidas

- 2026-06-16 — Tabelas do módulo de Compras criadas direto no Supabase sem a skill `/migration` nasceram sem RLS e geraram aviso crítico. Regra: toda mudança de banco passa por `/migration`; toda tabela nova com RLS.
- 2026-11-16 — Uma chave do Supabase (`chave.txt`) e XMLs com nome de cliente foram parar no GitHub. Regra: segredos só em `.env`; dados reais de clientes nunca no repositório.
