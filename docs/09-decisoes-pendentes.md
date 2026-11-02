# 09 — Decisões que precisam da sua aprovação

> Cada item traz minha recomendação. Nada aqui foi executado: nenhuma conta foi criada, nenhum serviço
> contratado, nenhum dado enviado a terceiros. Ao aprovar, registro a decisão no ADR correspondente
> (status **Aceita**) e no [CHANGELOG](../CHANGELOG.md).

## A. Aprovadas pelo fundador em 2026-11-01 ✅

Executado: D-01 (projeto em `C:\dev\magnus-os`; a cópia antiga no OneDrive não foi apagada), D-03,
D-04, D-10 e D-11 registrados como ADRs aceitos. D-02: repositório privado [EnzoSaretti/Magnus-OS](https://github.com/EnzoSaretti/Magnus-OS) criado
pelo fundador e `main` enviada; proteção da `main` pendente (configurar no GitHub).

| ID | Decisão | Recomendação | Por quê | Reversível? |
|---|---|---|---|---|
| **D-01** | **Local do repositório** | Mover de `C:\Users\Pichau\OneDrive\Magnus OS` para `C:\dev\magnus-os` (fora do OneDrive). | O OneDrive sincroniza `node_modules`, `.next` e `.git` (dezenas de milhares de arquivos), causando lentidão, travamento de arquivos (erros `EPERM`) e risco de corromper o Git. O backup passa a ser o GitHub. | Sim |
| **D-02** | **Repositório no GitHub** | Repositório **privado** `magnus-os` na sua conta ou em uma organização "magnus" no GitHub; `main` protegida; trabalho em branches com PR. | Histórico, revisão e CI desde o primeiro commit. Preciso que você indique a conta/organização — criar o repositório é uma ação externa. | Sim |
| **D-03** | **Arquitetura base** | Monolito modular: Next.js (web) + worker Node, monorepo com npm workspaces ([ADR-0001](adr/0001-monolito-modular-em-monorepo.md)). | Menor infraestrutura e maior velocidade para uma equipe pequena, com fronteiras de pacote que permitem separar serviços depois. | Sim, com custo crescente |
| **D-04** | **Supabase** como Postgres + Auth + Storage, região **São Paulo (sa-east-1)**, projetos separados para staging e produção ([ADR-0002](adr/0002-supabase-postgres-com-rls.md)). | Aprovar. Produção exige plano pago — confirmar preço vigente na contratação. | RLS integrado ao Auth é a base do isolamento multiempresa; dados no Brasil simplificam LGPD e latência. | Parcial (Auth é o ponto de maior acoplamento) |
| **D-10** | **Política de autonomia dos agentes na V1** | Nenhuma ação externa, destrutiva ou financeira sem aprovação humana, em qualquer configuração ([ADR-0005](adr/0005-politica-de-acoes-dos-agentes.md)). | É o que permite vender confiança. Relaxar exige novo ADR e evidência de uso. | Sim |
| **D-11** | **n8n fora do produto** | Não usar n8n como motor de workflows do produto; uso interno opcional ([ADR-0006](adr/0006-n8n-fora-do-nucleo.md)). | Licença (Sustainable Use License) não cobre oferecer o n8n como serviço a clientes; isolamento e aprovações precisam ser nativos. | Sim |

## B. Necessárias antes da fase indicada

| ID | Decisão | Quando | Opções | Recomendação |
|---|---|---|---|---|
| **D-05** | Hospedagem | Fase 1 (web) / Fase 2 (worker) | Web: Vercel. Worker: Fly.io (região `gru`), AWS sa-east-1 (ECS Fargate), Railway/Render (sem região no Brasil). | Vercel `gru1` para web; Fly.io `gru` para o worker; AWS quando houver exigência corporativa. |
| **D-06** | Fila e execução assíncrona | Fase 2 | pg-boss (Postgres) · Inngest / Trigger.dev (gerenciados) | pg-boss: sem infraestrutura nova, estado no nosso banco ([ADR-0004](adr/0004-worker-e-fila-no-postgres.md)). |
| **D-07** | Provedor de embeddings da memória | Fase 3 | OpenAI · Voyage AI | Decidir com um teste de recuperação em documentos reais em português. A dimensão do vetor entra no schema, por isso a decisão precede a Fase 3. |
| **D-08** | Modelo padrão dos agentes e política de custo | Fase 2 | `claude-opus-5-5` (US$ 4 / US$ 20 por milhão de tokens de entrada/saída) · `claude-sonnet-5-5` (US$ 2 / US$ 10) · `claude-haiku-5-5` (US$ 0,10 / US$ 0,50) | Começar com **Claude Opus 5.5** como padrão (o mais capaz da linha atual) e medir custo por tarefa concluída. Usar modelos mais baratos em rotas específicas é decisão sua, tomada com dados reais de qualidade e custo. Preços de 2026-10-06. |
| **D-09** | **Segmento e caso de uso inicial** (decisão comercial) | Antes da Fase 2 | Ex.: um departamento (financeiro, comercial, atendimento) ou um setor (indústria, serviços, varejo) | Escolher **um** caso âncora com 2–3 empresas parceiras para validar. Define dados de demonstração, primeiros agentes e primeiras integrações. |
| **D-12** | Idioma | Fase 1 | PT-BR apenas · PT-BR + EN | Interface em PT-BR na V1, com textos centralizados para internacionalizar depois sem retrabalho. Código e identificadores em inglês. |
| **D-13** | Identidade visual | Fase 1 | — | Aguardo o logotipo MAGNUS. Até lá, trabalho com tokens de cor da diretriz (preto/grafite/roxo, detalhes vermelho/laranja) e marca textual. |
| **D-14** | Licença do código | Agora (baixo impacto) | Proprietário · open source | **Proprietário** (`UNLICENSED`, todos os direitos reservados). Já aplicado aos `package.json` por ser o padrão mais restritivo; muda com uma linha se você decidir diferente. |
| **D-15** | Monitoramento de erros | Fase 1 | Sentry · alternativa | Sentry (plano gratuito no início), com remoção de dados pessoais antes do envio. |
| **D-16** | E-mail transacional (convites, notificações) | Fase 1.5 | Resend · Amazon SES · Postmark | Resend pela simplicidade na V1; exige domínio próprio verificado (SPF/DKIM). E-mails de login continuam pelo Supabase Auth, com SMTP próprio configurado antes de produção. |

## C. Decisões técnicas que tomei (contestáveis)

Reversíveis e de baixo impacto; registradas para transparência.

| Decisão | Motivo |
|---|---|
| npm workspaces em vez de pnpm/Turborepo | Já instalado; menos ferramentas. Turborepo só se o tempo de build justificar. |
| Testes com o runner nativo do Node (`node --test`) nos pacotes; Playwright para ponta a ponta na Fase 1 | Zero dependências para testes de domínio; Node 24 executa TypeScript diretamente ([ADR-0008](adr/0008-ferramental-minimo.md)). |
| Testes de banco com PGlite (Postgres em WASM) | Valida migrações e RLS sem Docker; roda em CI em segundos. |
| Migrações SQL como fonte da verdade do schema | RLS, gatilhos e funções são SQL de qualquer forma; ORMs escondem exatamente o que precisa ser revisado. |
| Papéis `viewer < member < admin < owner` | Simples o suficiente para a V1; permissões finas por agente/coleção entram como ACLs adicionais, sem mudar os papéis. |
| Documentação em PT-BR; código e comentários em inglês | Documentos para a equipe fundadora; código pronto para uma equipe internacional. |
