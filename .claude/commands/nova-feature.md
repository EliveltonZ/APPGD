# Comando: Nova Feature (Funcionalidade Completa)

Use este comando para iniciar o desenvolvimento de uma funcionalidade nova,
do zero ao deploy em produção. Ele guia o processo completo em etapas.

## Fluxo de branches

```
main (produção) ← claude/nome-da-feature (desenvolvimento)
```

Funcionalidade nova sempre em branch `claude/nome-da-feature` + Pull Request → `main` — vale para o Matheus e para o Elivelton.
(Só mudanças simples, conforme definido no `CLAUDE.md`, podem ir direto ao `main` — e essas não usam este comando.)

Matheus e Elivelton trabalham no mesmo código em paralelo — sempre puxe o `main` antes de começar.
Para saber quem conduz a sessão, veja a regra no topo do `CLAUDE.md` (não use a conta do git).

> ⚠️ O servidor de testes no Render (`AppGD-testes`) ainda roda o sistema antigo e está em redefinição.
> Até ser reconfigurado, a etapa de teste é feita localmente (ver Etapa 6).

---

## Etapa 1 — Entendimento

Antes de qualquer código, pergunte:

1. Qual é o nome desta funcionalidade?
2. Qual problema ela resolve para a fábrica?
3. Quem vai usar? (dono, vendedor, produção, todos?)
4. Como o usuário vai acessar? (novo menu, botão numa tela existente, etc.)
5. Existe alguma regra de negócio específica? (ex: "só o dono pode aprovar")
6. Tem alguma tela ou sistema externo como referência?

Após receber as respostas, confirme o entendimento em linguagem simples antes de continuar.

## Etapa 2 — Preparação do ambiente

Sincronize com o repositório e crie a branch de trabalho:

```bash
git checkout main
git pull origin main
git checkout -b claude/nome-da-feature
```

Confirme que está na branch correta antes de continuar.

## Etapa 3 — Pesquisa

Execute o processo de `/research`:
- Identifique arquivos afetados
- Mapeie padrões existentes no projeto
- Busque documentação relevante
- Gere o PRD.md

Informe quando o PRD.md estiver pronto e aguarde confirmação para continuar.

## Etapa 4 — Planejamento

Execute o processo de `/spec`:
- Gere o Spec.md com todos os arquivos a criar/modificar
- Inclua a migration de banco se necessário
- Liste os testes a criar

Apresente o plano em linguagem simples. Aguarde aprovação explícita.

## Etapa 5 — Implementação

Após aprovação:
- Confirme que está na branch `claude/nome-da-feature`
- Execute `/implement`
- Ao final, liste o que foi feito e sugira a mensagem de commit

## Etapa 6 — Testes e deploy em produção

### Passo 1 — Testar
- Confirmar que compila: `npm run build` (na raiz do projeto) — erros de TypeScript bloqueiam o deploy no Render
- Rodar localmente: `npm run dev` (frontend em `http://localhost:5173`, backend na porta 3001)
  - Requer `backend/src/client/.env` com `DATABASE_URL` e `JWT_SECRET` (quem não tiver, pede ao Elivelton; nunca commitar)
  - ⚠️ O banco local é o mesmo de produção — cuidado ao testar telas que gravam dados
- Quando o servidor de testes do Render for reconfigurado: Manual Deploy da branch `claude/nome-da-feature`
- Aguardar confirmação do responsável

### Passo 2 — Deploy em produção
Somente após confirmação, enviar ao `main`:
- Abrir Pull Request `claude/nome-da-feature → main`
  - Sessão do Matheus: aguardar a revisão do Elivelton antes do merge
  - Sessão do Elivelton: ele faz o merge depois de testar
- Se a feature incluiu migration de banco, enviar o aviso descrito em `/migration` (etapa 8)

Assim que entra no `main`, o Render publica automaticamente em produção.

### Passo 3 — Limpeza
```bash
git branch -d claude/nome-da-feature
git push origin --delete claude/nome-da-feature
```

**Nunca fazer merge direto para `AppGD-testes`.**
**Nunca usar `git push --force`.**
