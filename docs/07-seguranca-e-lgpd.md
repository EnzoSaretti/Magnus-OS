# 07 — Segurança, privacidade e LGPD

> Status: diretrizes da V1. Itens marcados ✅ já estão implementados e testados.
> Este documento não substitui parecer jurídico: os pontos de LGPD devem ser validados por advogado
> antes do primeiro cliente.

## 1. Principais ameaças

| Ameaça | Controle |
|---|---|
| Usuário de uma empresa acessa dados de outra | RLS em toda tabela ✅ · FKs compostas · testes de isolamento por tabela ✅ · chave secreta fora do app web · worker restrito por organização |
| Escalada de privilégio dentro da organização | Regras de papéis no banco ✅ (owner/admin/member/viewer, último owner protegido) · auditoria de toda mudança de vínculo ✅ |
| Injeção de prompt (e-mail/documento malicioso manipula o agente) | Política de ações em código ✅ · aprovação humana para efeitos externos ✅ · conteúdo externo delimitado e marcado como não confiável · ferramentas com menor privilégio |
| Vazamento de segredos (chaves de API, tokens OAuth de clientes) | Variáveis de ambiente · `.env*` no `.gitignore` ✅ · varredura de segredos no CI · credenciais de integrações cifradas em nível de aplicação · segredos nunca enviados ao modelo nem gravados em logs |
| Saída do modelo usada sem validação | Entradas de ferramentas validadas por schema · markdown sanitizado na renderização · modelo nunca gera SQL executado |
| Abuso de custo (loops, prompts gigantes) | Limites por execução ✅ (passos, profundidade, custo) · orçamento por organização · rate limiting por usuário/organização |
| Sequestro de sessão / conta | Cookies `HttpOnly`/`Secure`/`SameSite` via `@supabase/ssr` · MFA obrigatório para owner/admin · revogação de sessões |

## 2. Autenticação

- Supabase Auth: e-mail + senha (política de senha forte, proteção contra senhas vazadas quando
  disponível no plano), link mágico e Google.
- **MFA (TOTP) obrigatório** para owners e admins; verificação do nível de garantia (`aal2`) no
  servidor antes de ações administrativas.
- SSO/SAML corporativo após validação comercial.

Implementado na F1.4a ✅:

- Sessão em cookies gerenciados por `@supabase/ssr`; o proxy renova a sessão a cada requisição e as
  páginas do console verificam a sessão de novo no servidor (`getClaims()` valida a assinatura do JWT),
  sem confiar só no redirecionamento.
- Fluxo PKCE para links de e-mail e OAuth (código de uso único trocado por sessão em `/auth/callback`).
- Redirecionamento pós-login aceita apenas caminhos relativos do próprio site (proteção contra *open
  redirect*, com testes).
- Login sem senha não cria contas e responde igual exista ou não a conta (não revela e-mails
  cadastrados); erros de login são genéricos ("e-mail ou senha incorretos").
- Senha entre 10 e 72 caracteres, validada no servidor; a chave secreta do Supabase não existe no app.

## 3. Autorização (três camadas)

1. **Banco (autoridade final):** RLS + privilégios explícitos ✅.
2. **Servidor:** `assertCan(role, permission)` de `@magnus/core` antes de qualquer trabalho ✅.
3. **Interface:** esconde o que o usuário não pode fazer (conveniência, não segurança).

A matriz de permissões (`packages/core/src/permissions.ts`) nunca pode ser mais permissiva que as
políticas do banco.

## 4. Isolamento entre empresas

- `org_id` + RLS em toda tabela de domínio; regras em [04-banco-de-dados.md](04-banco-de-dados.md).
- **Storage:** arquivos sob o prefixo `{org_id}/...` com políticas em `storage.objects`.
- **Busca vetorial:** sempre dentro da mesma consulta com filtro de organização sujeito a RLS; nunca
  um índice externo sem escopo.
- **Caches** (prompt cache dos provedores, caches de aplicação) chaveados por organização; nenhum
  conteúdo de uma organização em prompts de outra.
- **Worker:** papel `magnus_agent` restrito à organização da execução (Fase 2).

## 5. Criptografia

- Em trânsito: TLS em todas as conexões.
- Em repouso: criptografia de disco do provedor (Supabase/AWS).
- **Credenciais de integrações:** criptografia em envelope AES-256-GCM em nível de aplicação, chave
  mestra fora do banco (variável de ambiente na V1; KMS depois), `key_id` por registro para rotação.

## 6. Auditoria

`audit_log` append-only ✅: aplicação não insere, altera nem apaga; escrita apenas por gatilhos e jobs
do servidor. Registra: criação de organização ✅, mudanças de vínculo ✅, alterações da organização ✅;
a partir da Fase 2, decisões de aprovação, execuções de ferramentas sensíveis, mudanças em agentes e
integrações, exportações e exclusões.

## 7. Segurança específica de IA

- O modelo **propõe**; o código **decide** (`evaluateToolCall`) ✅. Recusas precedem aprovações: um
  humano não consegue aprovar uma ação fora da configuração do agente ✅.
- Conteúdo vindo de e-mails, documentos e mensagens entra no contexto delimitado e identificado como
  dado não confiável; instruções contidas nele não alteram permissões.
- Cada agente recebe apenas as ferramentas da sua função (allowlist) ✅.
- Rastro completo de cada execução para investigação.
- Avaliações (evals) por tipo de agente antes de liberar para clientes, incluindo casos de injeção.

## 8. LGPD

### Papéis

- **Cliente (empresa usuária): controlador** dos dados pessoais que coloca na MAGNUS (clientes,
  funcionários, fornecedores dele).
- **MAGNUS: operadora** desses dados, agindo conforme as instruções do cliente; **controladora** apenas
  dos dados de cadastro e uso da própria plataforma.
- **Provedores** (Supabase, Vercel, Anthropic, provedor de embeddings): suboperadores, listados no
  contrato com o cliente.

### Obrigações a preparar antes do primeiro cliente

| Item | Ação |
|---|---|
| Contrato | Termos de uso + **Acordo de Processamento de Dados (DPA)** com o cliente, incluindo lista de suboperadores. |
| Transferência internacional | Provedores de IA processam dados fora do Brasil. Adotar as **cláusulas-padrão contratuais** do regulamento da ANPD sobre transferência internacional e firmar DPAs com os provedores; avaliar opções de retenção zero e região de inferência. |
| Minimização | Enviar ao modelo apenas o necessário para a tarefa; não enviar segredos; mascarar dados sensíveis quando a tarefa não precisar deles. |
| Direitos dos titulares | Funções de exportação e exclusão por organização e por pessoa (acesso, correção, eliminação, portabilidade), com prazos operacionais definidos. |
| Incidentes | Plano de resposta com comunicação à ANPD e aos titulares no prazo regulamentar (3 dias úteis pelo regulamento de comunicação de incidentes da ANPD) e aviso imediato ao cliente controlador. |
| Encarregado (DPO) | Indicar encarregado e canal de contato publicado. |
| RIPD | Relatório de impacto para o tratamento com IA (agentes que leem dados pessoais). |
| Residência | Banco e arquivos em São Paulo (sa-east-1). |
| Retenção | Política documentada por tipo de dado; registros de acesso por no mínimo 6 meses (Marco Civil, art. 15). |

## 9. Checklist antes de dados reais de clientes

- [ ] Testes de isolamento cobrindo todas as tabelas, Storage e busca vetorial
- [ ] MFA obrigatório para owner/admin
- [ ] Varredura de segredos e de dependências vulneráveis no CI
- [ ] Credenciais de integrações cifradas e rotacionáveis
- [ ] Rate limiting e orçamento por organização ativos
- [ ] Backups com restauração testada
- [ ] DPA, termos, política de privacidade e lista de suboperadores revisados por advogado
- [ ] Plano de resposta a incidentes escrito e ensaiado
- [ ] Teste de intrusão externo (antes de clientes de maior porte)
