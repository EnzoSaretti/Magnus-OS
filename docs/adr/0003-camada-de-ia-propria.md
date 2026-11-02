# ADR-0003 — Camada de IA própria e loop de agente sob nosso controle

- Status: Proposta
- Data: 2026-11-01

## Contexto

O briefing exige trocar de provedor de IA sem reconstruir a aplicação. Além disso, o loop do agente é
onde ficam as regras mais sensíveis do produto: permissões, aprovação humana, limites, medição de custo
e auditoria.

## Decisão

- `packages/ai` define um contrato próprio (`ModelProvider`, `EmbeddingProvider`, `ProviderError`,
  `Usage`) e um catálogo de modelos com preços para estimativa de custo.
- Cada provedor é um **adaptador** que usa o SDK oficial do fornecedor (`@anthropic-ai/sdk` primeiro).
  Nenhum outro pacote importa SDKs de fornecedores.
- O **loop do agente** (chamar modelo → avaliar chamadas de ferramenta → executar/pausar/recusar →
  repetir) é implementado por nós em `packages/agents`, não delegado a frameworks de agentes de
  terceiros nem a agentes hospedados pelo provedor.
- Uma execução fica **fixada em um provedor e modelo**; o histórico guarda blocos nativos opacos (ex.:
  blocos de raciocínio do Claude) que precisam ser reenviados sem alteração. O histórico é
  append-only.
- O contrato não expõe o que nem todos os modelos atuais aceitam: sem `temperature`/`top_p`, sem
  escolha forçada de ferramenta, sem prefill de resposta.
- Modelo padrão inicial: `claude-opus-5-5`. Rotas com modelos mais baratos dependem da decisão D-08.

## Alternativas consideradas

- **Frameworks de agentes (LangChain, etc.):** aceleram protótipos, mas escondem exatamente o controle
  de permissões/aprovações que precisamos auditar e mudam de API com frequência.
- **Agentes hospedados pelo provedor (ex.: Managed Agents da Anthropic):** removem o loop do nosso
  código, mas acoplam o produto a um fornecedor e tiram de nós a decisão de cada ação. Podem ser
  reavaliados para tarefas específicas.
- **SDK unificado de terceiros (ex.: Vercel AI SDK):** abstração pronta, mas mais uma dependência entre
  nós e o provedor, com mudanças de API frequentes; adaptadores próprios finos são suficientes.

## Consequências

- Adicionar um provedor = escrever um adaptador e incluir seus modelos no catálogo.
- Recursos específicos de um provedor (cache de prompt, raciocínio adaptativo, esforço) entram pelo
  adaptador, sem vazar para o domínio.
- Somos responsáveis pela qualidade do loop: retries, timeouts, streaming e validação de entradas de
  ferramentas são código nosso e testado.
