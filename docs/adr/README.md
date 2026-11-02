# Registro de decisões arquiteturais (ADR)

Cada decisão importante vira um arquivo numerado, imutável depois de aceito. Mudou de ideia? Crie um
novo ADR que **substitui** o anterior e atualize o status do antigo.

**Status possíveis:** Proposta (aguarda aprovação) · Aceita · Substituída por ADR-XXXX · Rejeitada.

| ADR | Título | Status | Decisão pendente |
|---|---|---|---|
| [0001](0001-monolito-modular-em-monorepo.md) | Monolito modular em monorepo (Next.js + worker) | Aceita (2026-11-01) | D-03 ✅ |
| [0002](0002-supabase-postgres-com-rls.md) | Supabase/Postgres com RLS como fronteira de isolamento | Aceita (2026-11-01) | D-04 ✅ |
| [0003](0003-camada-de-ia-propria.md) | Camada de IA própria e loop de agente sob nosso controle | Proposta | D-08 |
| [0004](0004-worker-e-fila-no-postgres.md) | Worker dedicado com fila no Postgres | Proposta | D-05, D-06 |
| [0005](0005-politica-de-acoes-dos-agentes.md) | Política de ações dos agentes fora do modelo | Aceita (2026-11-01) | D-10 ✅ |
| [0006](0006-n8n-fora-do-nucleo.md) | n8n fora do núcleo do produto | Aceita (2026-11-01) | D-11 ✅ |
| [0007](0007-pgvector-no-postgres.md) | pgvector no mesmo Postgres para a memória | Proposta | D-07 |
| [0008](0008-ferramental-minimo.md) | Ferramental mínimo: npm workspaces, `node --test`, TypeScript apagável | Adotada provisoriamente | — |

## Modelo

```markdown
# ADR-XXXX — Título

- Status: Proposta | Aceita (AAAA-MM-DD) | Substituída por ADR-YYYY
- Data: AAAA-MM-DD

## Contexto
## Decisão
## Alternativas consideradas
## Consequências
```
