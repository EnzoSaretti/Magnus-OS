# ADR-0008 — Ferramental mínimo: npm workspaces, `node --test`, TypeScript apagável

- Status: Adotada provisoriamente (reversível, baixo impacto)
- Data: 2026-11-01

## Contexto

O briefing pede para evitar dependências desnecessárias. O ambiente tem Node 24 e npm 11.

## Decisão

- **npm workspaces** para o monorepo (sem pnpm/Turborepo por enquanto).
- **Runner nativo do Node** (`node --test`) para testes de pacotes e de banco; Node 24 executa
  TypeScript diretamente (remoção de tipos), sem etapa de build.
- Código TypeScript restrito a **sintaxe apagável** (`erasableSyntaxOnly`): sem `enum`, `namespace` ou
  parameter properties; imports relativos com extensão `.ts`.
- **TypeScript 7** (`tsc`) apenas para verificação de tipos (`noEmit`).
- **PGlite** para testar migrações e RLS sem Docker.
- Versões fixadas sem `^`.

## Consequências

- `npm install && npm run check` é tudo que um desenvolvedor precisa para validar o projeto.
- Next.js (Fase 1) terá sua própria configuração de build; a compatibilidade do Next.js 16 com o
  TypeScript 7 será verificada na criação do app (alternativa: TypeScript 6 no app web).
- Testes de interface usarão Playwright; adotar Vitest só se surgir necessidade concreta.
