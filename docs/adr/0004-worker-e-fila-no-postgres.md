# ADR-0004 — Worker dedicado com fila no Postgres

- Status: Proposta
- Data: 2026-11-01

## Contexto

Execuções de agentes duram de segundos a vários minutos, chamam APIs externas, pausam para aprovação
humana e precisam ser retomadas. Relatórios e ingestão de documentos são agendados ou pesados. Funções
serverless do Next.js têm limite de duração e não são lugar para esse trabalho.

## Decisão

- `apps/worker`: processo Node de longa duração, hospedado em contêiner (região próxima ao banco —
  D-05).
- **pg-boss** como fila: jobs no próprio Postgres, com retries, backoff, agendamento (cron),
  deduplicação e concorrência controlada.
- O app web apenas **enfileira** e **consulta estado**; nunca executa agentes.
- O estado de negócio (execuções, passos, aprovações) fica em tabelas próprias; a fila guarda só o
  "próximo trabalho a fazer". Jobs são idempotentes.

## Alternativas consideradas

- **Inngest / Trigger.dev:** execução durável gerenciada, ótima experiência de desenvolvimento; custo
  por execução e dependência de fornecedor no caminho crítico. Boa alternativa se a operação do worker
  virar gargalo.
- **Supabase Queues (pgmq):** nativo da plataforma; menos recursos prontos (agendamento, retries com
  backoff) que o pg-boss.
- **Redis + BullMQ:** mais um sistema para operar e proteger, sem ganho na escala da V1.

## Consequências

- Nenhuma infraestrutura nova além do contêiner do worker.
- O worker precisa de conexão Postgres direta (pooler em modo sessão ou conexão direta).
- Escala horizontal: mais instâncias do worker consumindo a mesma fila.
