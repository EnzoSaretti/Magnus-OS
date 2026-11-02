# MAGNUS OS — instruções do projeto

Plataforma SaaS multiempresa de agentes de IA para operações empresariais. Leia `docs/README.md` antes
de mudanças grandes; o briefing do fundador está em `docs/briefing-original.md`.

## Regras do fundador (obrigatórias)

- Não tomar decisões irreversíveis sem autorização (contas, serviços pagos, deploys, exclusões).
- Não excluir arquivos ou configurações existentes sem autorização.
- Nunca expor chaves ou credenciais; usar variáveis de ambiente (`.env.example` documenta todas).
- Não substituir tecnologias sem justificar em um ADR (`docs/adr/`).
- Cada módulo é funcional **ou** claramente marcado como demonstração (`is_demo`, selo na UI).
  Integrações não implementadas aparecem como "Em breve", nunca como conectadas.
- Testes para funcionalidades críticas; documentação e `CHANGELOG.md` atualizados a cada entrega.

## Convenções

- Documentação em PT-BR. Código, identificadores e comentários em inglês.
- TypeScript estrito com sintaxe apagável (`erasableSyntaxOnly`): sem `enum`/`namespace`/parameter
  properties; imports relativos com extensão `.ts`; `import type` para tipos.
- Dependências com versão fixa (sem `^`), cada uma justificada em `docs/03-arquitetura.md`.
- `packages/core` não importa nada. SDKs de fornecedores só em `packages/ai/src/adapters/` e
  `packages/integrations/src/connectors/`.

## Multiempresa (crítico)

Toda tabela de domínio nova precisa de, no mesmo PR:
1. `org_id uuid not null` + FK para `organizations`;
2. RLS habilitada com políticas por operação e privilégios explícitos (`revoke`/`grant`);
3. FKs compostas `(org_id, x_id)` para referências entre tabelas de domínio;
4. testes em `supabase/tests/` provando que outra organização não lê, não altera e não referencia.

Funções `security definer`: sempre `set search_path = ''` e nomes qualificados. O app web nunca usa a
chave secreta do Supabase. Mudanças nas regras de papéis devem ser espelhadas em
`packages/core/src/tenancy.ts`.

## Agentes

Toda ferramenta declara sua classe de risco no código. A execução passa por `evaluateToolCall()`
(`packages/core/src/agent-policy.ts`). `write_external`, `destructive` e `financial` sempre exigem
aprovação humana — mudar isso exige novo ADR.

## Comandos

- `npm run check` — typecheck + todos os testes
- `npm run test:unit` / `npm run test:db`
