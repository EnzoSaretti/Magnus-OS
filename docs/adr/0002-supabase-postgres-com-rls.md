# ADR-0002 — Supabase/Postgres com RLS como fronteira de isolamento entre empresas

- Status: Aceita (2026-11-01, decisão D-04)
- Data: 2026-11-01

## Contexto

Isolamento entre organizações é requisito fundamental. Em um SaaS multiempresa, o vazamento mais comum
nasce de uma consulta que esqueceu o filtro de tenant. Precisamos que esse erro não vaze dados.

## Decisão

- **Postgres no Supabase** (Auth, banco e Storage), região **sa-east-1**, projetos separados para
  staging e produção.
- **Modelo de tenant compartilhado**: um banco, todas as organizações, `org_id` em toda tabela de
  domínio, **Row-Level Security** com políticas por operação.
- Papéis e vínculos em tabelas próprias (`memberships`), não em metadados do Auth.
- **Migrações SQL versionadas** como fonte da verdade; testes de RLS automatizados (PGlite) para cada
  tabela.
- App web acessa com o JWT do usuário (RLS sempre aplicada); chave secreta só no servidor/worker.

## Alternativas consideradas

- **Banco por empresa** ou **schema por empresa:** isolamento físico mais forte, mas migrações,
  conexões e custos multiplicam por cliente. Reservado para clientes enterprise que exigirem
  implantação dedicada (após validação comercial).
- **Filtro apenas no código (sem RLS):** um único esquecimento vaza dados. Rejeitado.
- **Postgres gerenciado + Auth próprio/terceiro (ex.: Neon + Clerk/Auth.js):** viável, mas exige
  integrar identidade com RLS manualmente. O Supabase entrega isso integrado e continua sendo Postgres
  padrão.

## Consequências

- Isolamento garantido pelo banco e verificado por testes de mutação (alterar uma política faz testes
  falharem).
- Toda tabela nova exige políticas + testes; isso entra no checklist de revisão.
- Acoplamento principal com o Supabase é o Auth; o resto é Postgres portátil.
