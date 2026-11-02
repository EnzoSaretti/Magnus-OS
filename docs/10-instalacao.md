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
| `npm run dev` | Interface em modo de desenvolvimento em http://localhost:3000. |
| `npm run build` | Build de produção do app web (também roda no CI). |

## Variáveis de ambiente

Copie [`.env.example`](../.env.example) para `apps/web/.env.local` quando precisar mudar algo. Hoje só
`NEXT_PUBLIC_MAGNUS_ENV` é lida (rótulo do ambiente na barra superior; padrão "Desenvolvimento").
Nunca faça commit de arquivos `.env*` com valores reais.

## Integração contínua

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) roda em todo push e pull request para `main`:
`npm ci`, `npm run check` e varredura de segredos (gitleaks) em todo o histórico.

## Próximas etapas de setup

1. ✅ Projeto fora do OneDrive (D-01) e Git inicializado.
2. ✅ Repositório privado no GitHub (`EnzoSaretti/Magnus-OS`) e primeiro push (D-02).
3. Proteger `main` no GitHub (exigir PR e CI verde) — requer GitHub Pro em repositório privado de
   conta pessoal; até lá, o fluxo de branch + PR é seguido por disciplina.
4. ✅ Projeto Supabase de staging `magnus-staging` em sa-east-1 com as migrações aplicadas
   ([detalhes](04-banco-de-dados.md#8-ambientes)).
5. Instalar a Supabase CLI, versionar `supabase/config.toml`, alinhar o histórico de migrações do
   staging e gerar tipos — junto com `packages/db` (F1.4).
6. Criar `apps/web` (Next.js 16) — Fase 1.3.
