# 02 — Análise da proposta e riscos

> Status: análise inicial (2026-11-01). Revisar a cada fase do roadmap.

## 1. Leitura crítica da proposta

### O que está certo desde o início

- **Agentes como funções operacionais, não como chatbots.** Identidade, objetivo, ferramentas autorizadas,
  memória e registro de atividades são exatamente os elementos que separam um produto de uma demo.
- **Humano no controle de ações sensíveis.** Isso é o que permite vender para empresas: o cliente
  precisa confiar antes de delegar.
- **Multiempresa desde a arquitetura inicial.** Adicionar isolamento depois é caro e perigoso;
  decidir agora custa pouco.
- **Entregas incrementais e honestidade sobre o que é demonstração.** Evita o erro mais comum de
  startups de IA: uma interface impressionante sem nada funcionando por trás.

### Tensões que precisam ser administradas

| Tensão | Por que importa | Como a arquitetura responde |
|---|---|---|
| **Amplitude vs. profundidade.** "Sistema operacional para qualquer empresa" é amplo; valor real vem de poucos fluxos resolvidos muito bem. | Plataforma horizontal sem caso de uso âncora vira "mais um painel com chat". | Núcleo genérico (agentes, memória, tarefas, aprovações), mas a primeira oferta comercial deve mirar um segmento/departamento concreto ([D-09](09-decisoes-pendentes.md)). |
| **Agentes precisam de dados.** Sem acesso às informações da empresa, um agente só conversa. | As integrações são ao mesmo tempo o diferencial e o gargalo (OAuth, verificações, APIs ruins de ERP). | V1 tem um caminho de dados **real e barato**: upload de documentos e planilhas para a Memória Empresarial. Integrações via OAuth vêm depois, uma por vez. |
| **Autonomia vs. confiança.** Quanto mais o agente faz sozinho, maior o valor — e o risco. | Um erro com e-mail a cliente ou dado financeiro destrói a confiança na plataforma. | Política de ações **fora do modelo**, por classe de risco, com aprovação humana obrigatória para efeitos externos ([ADR-0005](adr/0005-politica-de-acoes-dos-agentes.md)). |
| **Custo variável de IA.** Cada execução de agente custa tokens; loops descontrolados custam caro. | Margem bruta de um SaaS de IA depende disso. | Medição de uso por organização desde o primeiro dia, limites por execução (passos, profundidade, custo) e orçamento por organização. |
| **Velocidade vs. fundação.** Startup precisa provar valor rápido. | Atalhos em isolamento de dados e segurança são irreversíveis depois do primeiro vazamento. | Fundação de segurança rigorosa (RLS testado), funcionalidades enxutas por cima. |

### O que a MAGNUS **não** deve ser (pelo menos no início)

- **Não é um modelo de linguagem próprio** — usamos provedores (Anthropic primeiro) atrás de uma camada própria.
- **Não é um n8n/Zapier com IA** — o motor de workflows existe para coordenar agentes com aprovação e
  rastreabilidade, não para competir em número de conectores.
- **Não é RPA** — agentes agem por APIs e ferramentas declaradas, não clicando em telas.
- **Não é um "chat com seus documentos"** — a memória serve aos agentes e às decisões; o chat é uma
  das interfaces, não o produto.

## 2. Registro de riscos

Escala: **P** = probabilidade, **I** = impacto (B baixo, M médio, A alto, C crítico).

### Segurança e isolamento

| ID | Risco | P | I | Mitigação | Fase |
|---|---|---|---|---|---|
| R-01 | **Vazamento de dados entre empresas** (bug de query, cache compartilhado, busca vetorial sem filtro). | M | C | RLS no Postgres como fronteira primária; `org_id` em toda tabela de domínio; FKs compostas `(org_id, id)` impedem referências cruzadas; testes automatizados de isolamento por tabela; chave secreta do Supabase nunca no app web; worker com papel de banco restrito por organização. | 0 → sempre |
| R-02 | **Injeção de prompt** via e-mails, documentos ou mensagens lidos pelo agente, induzindo ações não autorizadas. | A | A | A decisão de executar ferramentas é tomada por código (política por classe de risco), nunca pelo modelo; aprovação humana para efeitos externos; conteúdo externo marcado como não confiável no contexto; menor privilégio por agente. | 2 |
| R-03 | **Vazamento de credenciais de integrações** (tokens OAuth de clientes). | M | C | Criptografia em envelope (AES-256-GCM) em nível de aplicação, chave fora do banco, rotação por `key_id`; tokens nunca enviados ao modelo; varredura de segredos no CI. | 6 |
| R-04 | **Escalada de privilégio dentro da organização** (membro se promovendo a admin). | M | A | Regras de papéis aplicadas no banco (RLS + gatilhos) e espelhadas no código; testes cobrindo cada transição. | 0 ✅ |
| R-05 | **Saída do modelo tratada como confiável** (XSS ao renderizar markdown, SQL gerado executado). | M | A | Renderização sanitizada; o modelo nunca gera SQL executado diretamente; entradas de ferramentas validadas por schema. | 2 |

### Arquitetura e operação

| ID | Risco | P | I | Mitigação | Fase |
|---|---|---|---|---|---|
| R-06 | **Execuções longas em ambiente serverless** (timeouts do Next.js/Vercel matam execuções de agentes). | A | A | Worker dedicado e fila no Postgres; o app web só enfileira e consulta estado ([ADR-0004](adr/0004-worker-e-fila-no-postgres.md)). | 2 |
| R-07 | **Custos de IA descontrolados** (loops, contexto grande demais, retries). | A | A | Limites por execução (passos, profundidade de delegação, custo), orçamento mensal por organização, medição por chamada, cache de prompt. | 2 |
| R-08 | **Dependência de um único provedor de IA** (indisponibilidade, mudança de preço/API). | M | M | Camada própria `ModelProvider`; adaptadores isolados; nenhum SDK de fornecedor fora de `packages/ai` ([ADR-0003](adr/0003-camada-de-ia-propria.md)). | 2 |
| R-09 | **Diferenças semânticas entre provedores** (formato de ferramentas, blocos de raciocínio que precisam ser reenviados intactos). | A | M | Uma execução é fixada em um único provedor/modelo; histórico guarda blocos nativos opacos; troca de provedor só entre execuções. | 2 |
| R-10 | **Qualidade não determinística dos agentes** (respostas boas na demo, ruins em produção). | A | A | Rastreamento completo de cada execução; conjunto de avaliações (evals) por tipo de agente antes de liberar para clientes; saídas estruturadas validadas por schema. | 2–4 |
| R-11 | **Lock-in no Supabase.** | B | M | Usamos Postgres padrão + SQL versionado; o acoplamento real é o Auth, isolado em um módulo. Migração para Postgres gerenciado é viável. | 0 |
| R-12 | **Comunicação entre agentes em loop** (A delega para B que delega para A…). | M | M | Delegação é uma ferramenta como outra qualquer: cria subtarefa rastreável, com profundidade máxima e orçamento herdado; não existe canal livre entre agentes. | 2 |
| R-13 | ✅ *Mitigado em 2026-11-01.* **Pasta do projeto dentro do OneDrive.** Sincronização de `node_modules`/`.next`/`.git` causa lentidão, arquivos travados (EPERM) e risco de corromper o repositório. | A | M | Mover o repositório para fora do OneDrive (ex.: `C:\dev\magnus-os`) e usar Git + GitHub como backup ([D-01](09-decisoes-pendentes.md)). | agora |

### Produto, legal e negócio

| ID | Risco | P | I | Mitigação | Fase |
|---|---|---|---|---|---|
| R-14 | **Escopo amplo demais** antes de validar com clientes. | A | A | Roadmap por fases com critérios de pronto; itens "após validação comercial" explicitamente fora da V1. | sempre |
| R-15 | **LGPD — transferência internacional de dados** (provedores de IA nos EUA processam dados pessoais dos clientes). | A | A | Contratos com cláusulas-padrão da ANPD, DPA com provedores, opção de retenção zero quando disponível, minimização do que vai ao modelo, transparência no contrato com o cliente ([07](07-seguranca-e-lgpd.md)). | antes do 1º cliente |
| R-16 | **Prazos externos de integrações**: verificação de app do Google (escopos restritos do Gmail exigem avaliação de segurança anual por terceiro), verificação de empresa na Meta para WhatsApp, aprovação de templates. | A | M | Escolher as primeiras integrações cedo e iniciar as verificações em paralelo ao desenvolvimento; preferir escopos não restritos (ex.: `drive.file`) ([06](06-integracoes.md)). | 4–6 |
| R-17 | **Licença do n8n** (Sustainable Use License) não permite oferecê-lo como parte de um serviço comercial a terceiros sem licença específica. | A | A | n8n fora do núcleo do produto; uso apenas interno, se útil ([ADR-0006](adr/0006-n8n-fora-do-nucleo.md)). | 0 |
| R-18 | **Promessa visual maior que a funcionalidade** (dashboards bonitos com dados fictícios). | M | A | Dados de demonstração marcados no banco (`is_demo`) e na interface ("Demonstração"); nenhuma integração aparece como conectada sem estar. | sempre |

## 3. Riscos aceitos conscientemente

- **Equipe pequena + monorepo único**: aceitamos acoplamento de deploy entre web e worker em troca de velocidade.
  Fronteiras de pacote permitem separar depois.
- **Postgres para tudo** (dados, fila, vetores, auditoria): aceitamos limites de escala muito acima do que a
  V1 precisará, em troca de um único sistema para proteger, fazer backup e auditar.
