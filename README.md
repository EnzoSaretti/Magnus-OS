# MAGNUS OS

**AI Business Operating System** — camada de inteligência operacional para empresas: agentes de IA
especializados, memória empresarial, tarefas com aprovação humana e um centro de controle da operação,
com isolamento total entre empresas.

> **Status: Fase 0 concluída, Fase 1 em andamento.** Arquitetura aprovada (bloco A), schema multiempresa com
> RLS testado e regras de domínio dos agentes. Ainda não há interface. Veja o que precisa de decisão em
> [docs/09-decisoes-pendentes.md](docs/09-decisoes-pendentes.md).

## Estrutura

```text
packages/core     Regras de domínio puras: papéis, permissões, política de ações dos agentes
packages/ai       Contrato agnóstico de provedores de IA, catálogo de modelos, estimativa de custo
supabase/         Migrações SQL (fonte da verdade do schema) e testes de isolamento/RLS
docs/             Visão, arquitetura, banco, segurança/LGPD, integrações, roadmap, ADRs
```

Planejados: `apps/web` (Next.js), `apps/worker`, `packages/{db,agents,memory,workflows,integrations,ui}` —
ver [docs/03-arquitetura.md](docs/03-arquitetura.md).

## Validar

Requer Node 24. Fora do OneDrive (ver [docs/10-instalacao.md](docs/10-instalacao.md)):

```bash
npm install
```

```bash
npm run check
```

## Documentação

Comece por [docs/README.md](docs/README.md).

## Licença

Proprietário — todos os direitos reservados.
