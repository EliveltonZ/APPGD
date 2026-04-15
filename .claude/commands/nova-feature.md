# Comando: Nova Feature (Funcionalidade Completa)

Use este comando para iniciar o desenvolvimento de uma funcionalidade nova,
do zero ao Pull Request. Ele guia o processo completo em etapas.

## Etapa 1 — Entendimento

Antes de qualquer código, pergunte:

1. Qual é o nome desta funcionalidade?
2. Qual problema ela resolve para a fábrica?
3. Quem vai usar? (dono, vendedor, produção, todos?)
4. Como o usuário vai acessar? (novo menu, botão numa tela existente, etc.)
5. Existe alguma regra de negócio específica? (ex: "só o dono pode aprovar")
6. Tem alguma tela ou sistema externo como referência?

Após receber as respostas, confirme o entendimento em linguagem simples antes de continuar.

## Etapa 2 — Pesquisa

Execute o processo de `/research`:
- Identifique arquivos afetados
- Mapeie padrões existentes no projeto
- Busque documentação relevante
- Gere o PRD.md

Informe quando o PRD.md estiver pronto e aguarde confirmação para continuar.

## Etapa 3 — Planejamento

Execute o processo de `/spec`:
- Gere o Spec.md com todos os arquivos a criar/modificar
- Inclua a migration de banco se necessário
- Liste os testes a criar

Apresente o plano em linguagem simples. Aguarde aprovação explícita.

## Etapa 4 — Implementação

Após aprovação:
- Confirme que está na branch correta (`claude/nome-da-feature`)
- Execute `/implement`
- Ao final, liste o que foi feito e sugira a mensagem de commit

## Etapa 5 — Finalização

Oriente sobre os próximos passos:
- Como testar a funcionalidade localmente
- Como abrir o Pull Request
- O que verificar antes de fazer merge
