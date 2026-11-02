# @magnus/db

Tipos TypeScript do schema do banco, gerados pelo Supabase a partir do projeto de staging.

- `src/database.types.ts` é **gerado**: não editar à mão. Depois de aplicar uma migração, gere de novo
  (Supabase MCP `generate_typescript_types` ou `supabase gen types typescript`) e faça commit.
- Os clientes Supabase ficam em cada app, porque dependem do runtime (cookies do Next.js no app web,
  conexão direta no worker).
