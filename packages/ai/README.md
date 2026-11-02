# @magnus/ai

Camada agnóstica de provedores de IA (ADR-0003).

| Módulo | Conteúdo | Status |
|---|---|---|
| `types.ts` | Contrato `ModelProvider`, `EmbeddingProvider`, mensagens, uso de tokens, `ProviderError`. | Pronto |
| `catalog.ts` | Modelos permitidos, preços de tabela (para **estimar** custo e aplicar orçamentos), modelo padrão. | Pronto |
| `adapters/anthropic.ts` | Adaptador usando o SDK oficial `@anthropic-ai/sdk`. | Fase 2 |

Regras:

- Somente `src/adapters/` importa SDKs de fornecedores.
- Uma execução de agente usa um único provedor/modelo; o histórico é append-only.
- O custo oficial é o do relatório do provedor; `estimateCostUsd()` serve para limites e dashboards e
  recusa modelos sem preço cadastrado.
