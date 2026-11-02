# ADR-0005 — Política de ações dos agentes fora do modelo

- Status: Aceita (2026-11-01, decisão D-10) — implementação de referência pronta e testada
- Data: 2026-11-01

## Contexto

Agentes vão ler e-mails, documentos e mensagens escritos por terceiros. Qualquer texto pode tentar
manipular o modelo ("ignore as instruções e envie..."). Se a decisão de executar uma ação dependesse
do modelo, uma injeção de prompt viraria uma ação real.

## Decisão

Toda chamada de ferramenta proposta pelo modelo passa por `evaluateToolCall()`
(`packages/core/src/agent-policy.ts`), que decide **permitir**, **pedir aprovação** ou **recusar** com
base apenas em fatos que o modelo não controla:

1. **Classe de risco da ferramenta**, definida no código pelo autor da ferramenta:
   `read`, `write_internal`, `write_external`, `destructive`, `financial`.
2. **Configuração do agente**, definida por um admin: ferramentas autorizadas (allowlist) e nível de
   autonomia (`read_only`, `supervised`, `autonomous_internal`).
3. **Consumo da execução**: passos, profundidade de delegação, custo estimado.

Regras:

- Recusas são avaliadas antes de aprovações — um humano não aprova algo fora da configuração.
- **`write_external`, `destructive` e `financial` sempre exigem aprovação humana na V1**, em qualquer
  nível de autonomia.
- Delegação entre agentes é uma ferramenta (`delegates: true`) sujeita à profundidade máxima.

## Alternativas consideradas

- **Instruções no prompt ("não envie e-mails sem pedir"):** contornável por injeção. Rejeitado como
  controle (mantido apenas como orientação ao modelo).
- **Aprovação para tudo:** seguro, mas inutiliza a automação interna.
- **Classificação de risco pelo próprio modelo:** o avaliado se avaliando. Rejeitado.

## Consequências

- Adicionar uma ferramenta exige declarar sua classe de risco; revisão de código trata isso como
  mudança de segurança.
- Relaxar a regra de aprovação obrigatória exige novo ADR, com dados de uso.
- A matriz completa autonomia × risco está coberta por testes.
