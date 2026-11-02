# ADR-0006 — n8n fora do núcleo do produto

- Status: Aceita (2026-11-01, decisão D-11)
- Data: 2026-11-01

## Contexto

O briefing sugere n8n para automações "quando apropriado". O Workflow Engine da MAGNUS precisa
coordenar agentes com aprovação humana, rastreabilidade por organização e isolamento entre clientes.

## Decisão

- O n8n **não** será usado como motor de workflows do produto nem exposto a clientes.
- O Workflow Engine é nativo (`packages/workflows`, Fase 5), construído sobre a mesma fila, política de
  ações e auditoria dos agentes.
- A equipe pode usar n8n para automações **internas** da MAGNUS (ex.: operações comerciais), sem dados
  de clientes.

## Motivos

1. **Licença:** o n8n é distribuído sob a *Sustainable Use License*, que restringe o uso a fins internos
   e não comerciais; oferecê-lo como parte de um serviço a terceiros exige licença comercial específica
   (n8n Embed). Confirmar com a n8n caso se queira reconsiderar.
2. **Multiempresa:** credenciais, execuções e permissões do n8n não seguem o nosso modelo de
   organizações e RLS; isolar clientes exigiria uma instância por cliente.
3. **Controle:** aprovações humanas, classes de risco e trilha de auditoria precisam ser nativas, não
   um sistema paralelo.

## Consequências

- Mais código próprio no Workflow Engine, em troca de controle total e de um único modelo de segurança.
- Conectores exigem trabalho nosso (mitigado por priorizar poucas integrações e avaliar MCP).
