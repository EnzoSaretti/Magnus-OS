# Registro de entregas

Formato: data · fase · o que foi entregue · como foi verificado. Decisões arquiteturais ficam em
[`docs/adr/`](docs/adr/README.md).

## 2026-11-02 · Fase 1.1 — Supabase de staging

**Entregue**

- Projeto Supabase `magnus-staging` (`rxfuwrkfjvfxjidzxdyc`) em sa-east-1, organização Saretti Corp,
  plano gratuito (custo US$ 0/mês confirmado pelo fundador).
- Migrações aplicadas: núcleo multiempresa, convites e a nova
  `20261102000000_private_auth_helpers.sql`, que move os auxiliares de autorização para o schema
  `private` (fora da API) e indexa chaves estrangeiras apontadas pelo Supabase.
- Roteiro `supabase/tests/smoke/isolation-smoke.sql` para verificar isolamento em bancos hospedados.
- Documentação de ambientes, mapeamento de versões das migrações e avisos aceitos por design
  ([04-banco-de-dados.md](docs/04-banco-de-dados.md#8-ambientes)).
- Removida a linha "Status: draft, not applied…" (apenas comentário) das duas primeiras migrações.

**Verificado**

- CI do GitHub verde nas execuções #1 (`30f3c08`) e #2 (`95d2e56`): typecheck, testes e gitleaks.
- `npm run check`: 63 testes passando (novo teste: auxiliares fora do schema `public` e fechados para
  `anon`); mutações nas funções movidas detectadas.
- Avisos de segurança do Supabase: de 11 para 6; os 6 restantes são os comandos RPC intencionais.
  Avisos de desempenho: apenas "índice não usado" (banco vazio).
- Roteiro de isolamento no banco real: 12/12 cenários ok; nenhum dado de teste permaneceu
  (contagem de usuários, organizações, vínculos, convites e auditoria = 0).

## 2026-11-01 · Fase 1.2 — Convites no banco

**Entregue**

- `supabase/migrations/20261101120000_invitations.sql`: tabela `invitations` (somente hash SHA-256 do
  token, expiração de 7 dias, uso único, um convite aberto por e-mail), funções `create_invitation`,
  `accept_invitation`, `revoke_invitation`, `invitation_preview`, RLS (somente admins listam; coluna do
  hash inacessível) e auditoria (`invitation.created/accepted/revoked`).
- Aceite exige usuário autenticado com o **mesmo e-mail, confirmado**.
- `canInvite()` em `@magnus/core` espelhando as regras.
- Helpers de teste de banco extraídos para `supabase/tests/support/db.ts`.

**Verificado**

- `npm run check`: typecheck limpo, 62 testes passando (11 novos de convites + 1 de domínio).
- 7 mutações na migração (ignorar e-mail, confirmação, expiração, regras de papel na criação e na
  revogação, manter token antigo, expor o hash): todas detectadas pelos testes.

## 2026-11-01 · Fase 0 — Decisões do bloco A aprovadas

**Entregue**

- D-03, D-04, D-10, D-11 aprovados: ADRs 0001, 0002, 0005 e 0006 marcados como **Aceita**.
- D-01: projeto copiado para `C:\dev\magnus-os` (a cópia no OneDrive permanece até confirmação).
- D-02: repositório Git (`main`) enviado para o GitHub privado `EnzoSaretti/Magnus-OS`; `.gitattributes` normalizando finais de linha em LF.
- CI no GitHub Actions: `npm ci`, `npm run check` e varredura de segredos (gitleaks v8.30.1) em todo o
  histórico.
- Fase 1 dividida em incrementos F1.1–F1.6 no [roadmap](docs/08-roadmap.md); nova decisão D-16
  (e-mail transacional).

**Verificado**

- Cópia byte a byte idêntica à origem (`diff -r`); `npm ci && npm run check` no novo local: 51 testes
  passando, typecheck limpo.
- Push para o GitHub concluído; resultado do primeiro CI a confirmar na aba Actions.

## 2026-11-01 · Fase 0 — Fundação

**Entregue**

- Documentação: visão do produto, análise e riscos, arquitetura, banco de dados, funcionalidades,
  integrações, segurança e LGPD, roadmap, decisões pendentes, instalação; 8 ADRs.
- `supabase/migrations/20261101000000_core_tenancy.sql`: organizações, perfis, vínculos com papéis
  (`viewer < member < admin < owner`), auditoria append-only, funções de autorização, RLS e
  privilégios explícitos.
- `packages/core`: papéis e regras de gestão de vínculos, matriz de permissões, política de ações de
  agentes (risco × autonomia × limites).
- `packages/ai`: contrato `ModelProvider`/`EmbeddingProvider`, erro normalizado, catálogo de modelos
  Anthropic com preços de 2026-10-06 e estimativa de custo.
- Configuração do monorepo (npm workspaces, TypeScript 7 estrito, `node --test`).

**Verificado**

- `npm run typecheck`: sem erros.
- `npm test`: 51 testes passando (39 de domínio, 12 de banco/RLS em Postgres via PGlite).
- Testes de mutação manuais na migração (política de leitura aberta, admin gerenciando admins, sem
  gatilho de último owner, sem gatilho de auditoria, `insert` liberado em vínculos): todos detectados.

**Não feito (aguarda aprovação)**

- Repositório Git/GitHub, CI, projeto Supabase, aplicação web — ver
  [decisões pendentes](docs/09-decisoes-pendentes.md).
