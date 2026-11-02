# 06 — Integrações

> Status: arquitetura definida; **nenhuma integração implementada**. Nenhuma integração aparecerá como
> "conectada" na interface antes de funcionar de verdade.

## 1. Modelo de conector

Cada integração é um pacote em `packages/integrations/src/connectors/<nome>/` que declara um
**manifesto** e implementa uma interface comum:

| Elemento | Conteúdo |
|---|---|
| Manifesto | `id`, nome, tipo de autenticação (OAuth 2, chave de API, webhook), escopos mínimos, status (`real`, `beta`, `demonstração`, `planejado`). |
| Ferramentas | Ações expostas aos agentes, cada uma com **classe de risco** (`read`, `write_internal`, `write_external`, `destructive`, `financial`) e schema de entrada. A política de ações se aplica automaticamente. |
| Sincronização | Opcional: importação periódica para a Memória Empresarial (com escopo de organização). |
| Eventos de entrada | Webhooks com verificação de assinatura, idempotência e fila; nunca processados no request. |
| Credenciais | Por organização, cifradas em nível de aplicação, renovação de tokens no worker; nunca expostas ao modelo. |

Conexões são **por organização** (`integration_connections`), criadas por admins, auditadas e
revogáveis. Limites de taxa por organização e por provedor.

**Protocolo MCP:** o runtime de agentes poderá consumir servidores MCP (Model Context Protocol) como
fonte de ferramentas, desde que cada ferramenta receba classe de risco e passe pela mesma política.
Avaliar na Fase 6 para acelerar conectores sem abrir mão do controle.

## 2. Integrações do briefing

| Integração | Caminho técnico | Pré-requisitos e prazos externos | Riscos | Prioridade |
|---|---|---|---|---|
| **Planilhas** | V1: upload de XLSX/CSV para a Memória (real, sem OAuth). Depois: Google Sheets via API. | Nenhum para upload. | Arquivos maliciosos (parser isolado, limites de tamanho). | **Fase 3** |
| **Google Drive** | Escopo `drive.file` + Google Picker (usuário escolhe os arquivos) para evitar escopos restritos. | Verificação do app OAuth pelo Google. | Escopos amplos de leitura do Drive são restritos e exigem avaliação de segurança anual. | Fase 6 |
| **Google Calendar** | API do Calendar (ler agenda, propor/criar eventos com aprovação). | Verificação do app (escopos sensíveis). | Criar eventos com convidados externos = `write_external` → aprovação. | Fase 6 |
| **Gmail** | Leitura e rascunhos; envio sempre com aprovação. | Escopos de leitura do Gmail são **restritos**: exigem verificação + avaliação de segurança anual por laboratório credenciado (custo e semanas de prazo). | Principal vetor de injeção de prompt. | Fase 6+ (iniciar verificação cedo se for o caso âncora) |
| **WhatsApp Business** | WhatsApp Cloud API (Meta) diretamente, ou via provedor (BSP). | Verificação da empresa na Meta, número dedicado, templates aprovados para iniciar conversas, janela de 24 h para respostas livres, cobrança por mensagem/conversa. | Opt-in e LGPD do contato final; envio é `write_external` → aprovação (ou templates pré-aprovados por regra explícita). | Fase 6 |
| **ERP** | Conector por sistema, escolhido pelo caso âncora (ex.: Omie, Bling, Tiny, Conta Azul, TOTVS). Leitura primeiro. | Credenciais de API do cliente; qualidade de API varia muito. | Escrita em ERP é `financial`/`destructive` na maioria dos casos. | Após validação |
| **CRM** | Idem (ex.: RD Station CRM, Pipedrive, HubSpot). | Credenciais/OAuth do cliente. | Dados pessoais de clientes finais (LGPD). | Após validação |
| **Bancos de dados externos** | Conexão somente leitura, consultas pré-aprovadas (nunca SQL livre gerado pelo modelo), rede restrita. | Acesso de rede do cliente (IP fixo, túnel). | Alto: superfície de ataque e de vazamento. | Após validação |
| **Outras ferramentas** | Webhook genérico de entrada + chamadas HTTP de saída configuradas por admins. | — | Saída para URLs arbitrárias = `write_external` → aprovação; bloquear redes internas (SSRF). | Fase 5–6 |

## 3. n8n

O n8n **não** faz parte do produto (ver [ADR-0006](adr/0006-n8n-fora-do-nucleo.md)). Pode ser usado pela
equipe MAGNUS para automações internas (ex.: operações comerciais), fora do ambiente de clientes.

## 4. Regra de honestidade

Enquanto uma integração não estiver implementada e testada com conta real, ela aparece como
**"Em breve"** e nenhuma tela simula dados dela. Dados de demonstração vêm do seed (`is_demo = true`)
e são rotulados.
