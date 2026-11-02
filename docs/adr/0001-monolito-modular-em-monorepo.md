# ADR-0001 — Monolito modular em monorepo (Next.js + worker)

- Status: Aceita (2026-11-01, decisão D-03)
- Data: 2026-11-01

## Contexto

A V1 precisa de interface web, API, execução assíncrona de agentes e vários módulos de domínio (agentes,
memória, workflows, integrações). A equipe é pequena e precisa entregar com velocidade sem perder a
capacidade de separar partes do sistema quando a escala exigir.

## Decisão

- Um **monorepo** com npm workspaces: `apps/web` (Next.js), `apps/worker` (Node) e `packages/*` com o
  domínio.
- **Monolito modular**: uma aplicação web e um worker, compartilhando pacotes. Sem microsserviços.
- Dependências entre pacotes em uma direção só (`core` não depende de nada; nenhum pacote depende de
  `apps/*`); SDKs de fornecedores confinados a adaptadores.

## Alternativas consideradas

- **Microsserviços desde o início:** isolamento de deploy e escala independente, ao custo de
  infraestrutura, observabilidade distribuída e contratos entre serviços que ainda não sabemos desenhar.
  Prematuro.
- **Uma única aplicação Next.js fazendo tudo:** mais simples, mas execuções longas de agentes não cabem
  em funções serverless (ver ADR-0004).
- **Repositórios separados:** duplicação de tipos e regras de domínio; mudanças atômicas ficam difíceis.

## Consequências

- Uma mudança de domínio é um único PR, testado de ponta a ponta.
- Web e worker compartilham versão; deploys precisam ser compatíveis com a fila (jobs versionados).
- Extrair um serviço no futuro = mover um pacote para trás de uma API, sem reescrever o domínio.
