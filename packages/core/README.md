# @magnus/core

Regras de domínio puras, sem dependências de runtime. Tudo aqui é determinístico e testável.

| Módulo | Conteúdo |
|---|---|
| `tenancy.ts` | Papéis `viewer < member < admin < owner`, regras de gestão de vínculos (espelham a RLS do banco). |
| `permissions.ts` | Matriz ação → papel mínimo; `can()` e `assertCan()` com `ForbiddenError`. |
| `agent-policy.ts` | `evaluateToolCall()`: permitir, pedir aprovação ou recusar uma chamada de ferramenta (ADR-0005). |

Regra: este pacote não importa nenhum outro pacote nem dependência externa.

```bash
npm run test:unit
```
