# 10 — Instalação e execução

## Estado atual

Ainda não há aplicação para abrir no navegador. O que existe hoje roda como testes: regras de domínio
(`packages/core`, `packages/ai`) e o schema multiempresa com RLS (`supabase/`).

## Requisitos

| Ferramenta | Versão | Observação |
|---|---|---|
| Node.js | 24 LTS (`.nvmrc`) | Executa TypeScript diretamente nos testes. |
| npm | 11+ | Vem com o Node. |
| Git | 2.4x+ | |

> ⚠️ **Não instale dependências dentro do OneDrive** (decisão [D-01](09-decisoes-pendentes.md)).
> O repositório fica em `C:\dev\magnus-os`; o backup é o GitHub.

## Validar o projeto

```bash
npm ci
```

```bash
npm run check
```

`check` executa a verificação de tipos e todos os testes. Comandos individuais:

| Comando | O que faz |
|---|---|
| `npm run typecheck` | Verificação de tipos (TypeScript 7, sem gerar arquivos). |
| `npm run test:unit` | Testes de `packages/*` (papéis, permissões, política de agentes, catálogo de modelos). |
| `npm run test:db` | Sobe Postgres em memória (PGlite), aplica as migrações e testa isolamento e RLS. |
| `npm test` | Todos os testes. |

## Variáveis de ambiente

Copie [`.env.example`](../.env.example) para `.env.local` quando o app web existir (Fase 1). Nunca faça
commit de arquivos `.env*` com valores reais.

## Integração contínua

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) roda em todo push e pull request para `main`:
`npm ci`, `npm run check` e varredura de segredos (gitleaks) em todo o histórico.

## Próximas etapas de setup

1. ✅ Projeto fora do OneDrive (D-01) e Git inicializado.
2. Repositório privado no GitHub + `git push` (D-02 — aguarda você criar o repositório).
3. Proteger `main` no GitHub (exigir PR e CI verde).
4. Criar projeto Supabase de staging em sa-east-1 (D-04) e instalar a Supabase CLI para aplicar
   migrações (`supabase db push`) e gerar tipos.
5. Criar `apps/web` (Next.js 16) — Fase 1.3.
