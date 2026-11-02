# 05 — Funcionalidades e status dos módulos

> Legenda de status: **Planejado** · **Em desenvolvimento** · **Real** (funcional e testado) ·
> **Demonstração** (dados ou comportamento simulados, rotulados na interface).
> Nenhum módulo tem interface ainda; o que existe hoje é a fundação de domínio e banco.

## Fundação (Fase 0)

| Capacidade | Status | Onde |
|---|---|---|
| Organizações, perfis, vínculos e papéis com RLS | **Real** (testado contra Postgres; ainda não aplicado em ambiente hospedado) | `supabase/migrations/20261101000000_core_tenancy.sql` |
| Auditoria append-only de mudanças de vínculo e organização | **Real** (idem) | mesma migração |
| Matriz de permissões por papel | **Real** | `packages/core/src/permissions.ts` |
| Política de ações de agentes (risco × autonomia × limites) | **Real** (lógica pura, ainda sem runtime) | `packages/core/src/agent-policy.ts` |
| Contrato de provedores de IA + estimativa de custo | **Real** (contrato; adaptador na Fase 2) | `packages/ai/src/` |

## Módulos do produto

### Autenticação e multiempresa — Fase 1

Escopo V1: cadastro/login (e-mail, link mágico, Google), MFA para admins, criar organização, convites,
papéis, troca de organização, visualizador de auditoria.
Fora da V1: SSO/SAML, provisionamento SCIM.

Status: **Em construção.** Cadastro, login com senha, link de acesso por e-mail, sair e proteção do
console funcionando (F1.4a). Verificação em duas etapas (F1.4b) e Google (F1.4c) pendentes;
organizações e convites na interface na F1.5.

### Central de controle (Dashboard) — layout na Fase 1, indicadores na Fase 4

Escopo V1: visão da organização (execuções de agentes, tarefas por status, aprovações pendentes, custo
de IA no período, alertas abertos, últimas atividades), filtros por período e agente.
Regra: todo indicador tem consulta rastreável; números de demonstração aparecem rotulados.

Status (F1.3b): **Demonstração rotulada** — layout final do Painel (indicadores, execuções dos agentes,
tarefas do mês, "Aguardando você", assistente, linha de operação, atividade) alimentado por dados de
demonstração de um único arquivo, com o selo "Demonstração" em cada cartão e aviso no topo. Reais:
saudação com o nome do usuário, data, estado da plataforma e progresso de construção. Cada cartão passa
a dado real quando o módulo correspondente entrar (Fase 2+).

### AI Agent Manager — Fase 2

Escopo V1: criar/editar agentes (nome, avatar, especialidade, objetivo, responsabilidades, instruções),
selecionar ferramentas autorizadas, nível de autonomia e limites, modelo; atribuir tarefas;
delegação entre agentes com profundidade limitada; linha do tempo de cada execução; pausar/desativar.
Fora da V1: marketplace de agentes, agentes criados automaticamente, voz.

### Tarefas e aprovações — Fase 2

Escopo V1: caixa de tarefas (pessoa → agente, agente → agente), status, resultado; caixa de aprovações
com a ação proposta, entradas, justificativa do agente, aprovar/rejeitar com comentário; retomada
automática após decisão.

### Company Memory — Fase 3

Escopo V1: coleções, upload de documentos e planilhas, ingestão assíncrona com status, busca híbrida,
ferramenta de memória para agentes com citações, registro de decisões, exclusão completa de documentos.
Fora da V1: sincronização contínua com Drive/ERP (vem com as integrações), grafos de conhecimento.

### Reports & Alerts — Fase 4

Escopo V1: relatórios agendados por agente (diário/semanal), alertas de problema/oportunidade gerados
por agentes com evidências, notificações in-app e por e-mail, preferências por usuário.

### Workflow Engine — Fase 5 (após V1)

Escopo: gatilhos (agenda, manual, webhook, evento interno), passos (tarefa de agente, aprovação humana,
condição, espera), versões imutáveis, histórico de execuções, reexecução.

### Integrations — Fase 6 (após V1)

Ver [06-integracoes.md](06-integracoes.md).

## Política de demonstração

- Seeds de demonstração gravam `is_demo = true`; a interface mostra o selo **Demonstração** em qualquer
  elemento derivado deles.
- Organizações de demonstração são separadas das organizações reais de clientes.
- Integrações não implementadas aparecem como **Em breve**, nunca como conectadas.
