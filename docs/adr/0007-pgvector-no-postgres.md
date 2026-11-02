# ADR-0007 — pgvector no mesmo Postgres para a memória empresarial

- Status: Proposta
- Data: 2026-11-01

## Contexto

A Memória Empresarial precisa de busca semântica sobre documentos de cada organização, sem nenhuma
possibilidade de recuperar trechos de outra organização.

## Decisão

- Vetores em `memory_chunks.embedding` com **pgvector**, no mesmo banco, protegidos pela mesma RLS.
- **Busca híbrida**: similaridade vetorial + busca textual (`tsvector` em português), combinadas.
- Cada chunk guarda `embedding_model`; troca de modelo de embeddings = reprocessamento controlado.
- Provedor de embeddings decidido na D-07 (a Anthropic não oferece embeddings).

## Alternativas consideradas

- **Banco vetorial dedicado (Pinecone, Qdrant, Weaviate):** escala maior, mas é outro sistema com
  outro modelo de isolamento — a separação entre empresas passaria a depender do nosso código.
- **Busca só textual:** mais barata, perde consultas por significado.

## Consequências

- Um único lugar para backup, isolamento e exclusão (LGPD: apagar o documento apaga os vetores).
- Índices HNSW ocupam memória do banco; monitorar e particionar por organização se necessário.
