# MAGNUS OS

**AI Business Operating System** — camada de inteligência operacional para empresas: agentes de IA
especializados, memória empresarial, tarefas com aprovação humana e um centro de controle da operação,
com isolamento total entre empresas.

> **Status: Fase 1 em andamento.** Schema multiempresa com RLS no staging (Supabase, São Paulo),
> convites, regras de domínio dos agentes, interface do centro de controle e login (cadastro, senha,
> link por e-mail). Organizações na interface e agentes ainda não. Veja o que precisa de decisão em
> [docs/09-decisoes-pendentes.md](docs/09-decisoes-pendentes.md).

## Estrutura

```text
apps/web          Centro de controle (Next.js 16, Tailwind 4) — prévia sem dados
packages/core     Regras de domínio puras: papéis, permissões, política de ações dos agentes
packages/ai       Contrato agnóstico de provedores de IA, catálogo de modelos, estimativa de custo
packages/ui       Design system: tokens e componentes compartilhados
supabase/         Migrações SQL (fonte da verdade do schema) e testes de isolamento/RLS
docs/             Visão, arquitetura, banco, segurança/LGPD, integrações, roadmap, design, ADRs
```

Planejados: `apps/worker`, `packages/{db,agents,memory,workflows,integrations}` —
ver [docs/03-arquitetura.md](docs/03-arquitetura.md).

## Validar

Requer Node 24. Fora do OneDrive (ver [docs/10-instalacao.md](docs/10-instalacao.md)):

```bash
npm ci
```

```bash
npm run check
```

Abrir a interface em http://localhost:3000:

```bash
npm run dev
```

## Documentação

Comece por [docs/README.md](docs/README.md).

## Licença

Proprietário — todos os direitos reservados.
