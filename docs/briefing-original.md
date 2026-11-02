# Briefing original — MAGNUS OS

> Texto entregue pelo fundador em 2026-11-01, preservado sem edição como referência permanente.
> A interpretação técnica deste briefing está nos demais documentos de `docs/`.

---

MAGNUS OS
AI BUSINESS OPERATING SYSTEM

Você será o principal arquiteto de software e responsável técnico pelo desenvolvimento da MAGNUS OS, uma startup de tecnologia focada na criação de um sistema operacional empresarial baseado em inteligência artificial.

Seu objetivo é transformar essa ideia em um produto tecnológico real, funcional, seguro, escalável e comercializável.

Não quero apenas um protótipo visual ou uma demonstração de agentes conversacionais. Quero construir uma plataforma capaz de integrar inteligência artificial aos processos operacionais de empresas.

## 1. VISÃO DO PRODUTO

A MAGNUS OS será uma camada central de inteligência que conecta pessoas, departamentos, dados, ferramentas e processos empresariais.

A plataforma deverá permitir que empresas utilizem agentes de inteligência artificial especializados para acompanhar operações, analisar informações, executar tarefas autorizadas, identificar problemas, apresentar oportunidades e auxiliar na tomada de decisões.

A visão de longo prazo é transformar a MAGNUS em um sistema operacional de inteligência empresarial adaptável a diferentes segmentos.

## 2. PRINCIPAIS FUNCIONALIDADES

A plataforma deverá ser desenvolvida considerando os seguintes componentes:

**A. Central de controle (Dashboard)**

* Visão geral da empresa.
* Indicadores operacionais.
* Atividades dos agentes.
* Alertas importantes.
* Relatórios e métricas.
* Situação geral das operações.

**B. AI Agent Manager**

* Criação e gerenciamento de agentes.
* Configuração de especialidades.
* Definição de responsabilidades.
* Atribuição de tarefas.
* Comunicação entre agentes.
* Monitoramento de atividades.
* Controle de permissões.

**C. Company Memory**

* Memória compartilhada da empresa.
* Armazenamento de informações relevantes.
* Base de conhecimento.
* Histórico de decisões.
* Recuperação contextual de informações.
* Separação de dados entre empresas.

**D. Workflow Engine**

* Criação de fluxos automatizados.
* Integração entre agentes.
* Execução de tarefas.
* Gatilhos e eventos.
* Aprovação humana quando necessária.
* Histórico de execuções.

**E. Reports & Alerts**

* Relatórios automáticos.
* Identificação de problemas.
* Identificação de oportunidades.
* Alertas operacionais.
* Resumos periódicos.
* Indicadores de desempenho.

**F. Integrations**

Preparar a arquitetura para integrar:

* WhatsApp Business API.
* Gmail.
* Google Calendar.
* Google Drive.
* Sistemas ERP.
* CRM.
* Planilhas.
* Bancos de dados externos.
* Outras ferramentas empresariais.

## 3. ARQUITETURA TECNOLÓGICA

Avalie e proponha uma arquitetura moderna, modular e escalável.

Considere inicialmente:

* Frontend: Next.js e TypeScript.
* Interface: Tailwind CSS e componentes reutilizáveis.
* Backend: serviços e APIs em TypeScript.
* Banco de dados: PostgreSQL.
* Infraestrutura de dados: Supabase.
* Inteligência artificial: APIs da Anthropic e OpenAI.
* Automações: n8n, quando apropriado.
* Versionamento: Git e GitHub.
* Hospedagem: infraestrutura compatível com Next.js.

Não trate essas escolhas como obrigatórias. Avalie tecnicamente cada decisão e justifique alterações quando encontrar alternativas melhores.

A MAGNUS deverá possuir uma camada independente de integração com modelos de IA, permitindo utilizar diferentes provedores sem reconstruir toda a aplicação.

Não desenvolveremos modelos de linguagem próprios neste primeiro momento.

## 4. ARQUITETURA MULTIEMPRESA

Esse requisito é fundamental.

A MAGNUS deverá ser preparada para atender várias empresas simultaneamente.

Cada organização deverá possuir:

* Usuários próprios.
* Agentes próprios.
* Memória empresarial independente.
* Configurações próprias.
* Integrações próprias.
* Histórico de atividades.
* Permissões específicas.

A separação e proteção dos dados entre organizações deverá ser garantida desde a arquitetura inicial.

Considere autenticação, autorização, isolamento de dados, criptografia, auditoria e LGPD.

## 5. EXPERIÊNCIA VISUAL

A MAGNUS precisa transmitir tecnologia, inteligência, sofisticação e confiabilidade.

Quero uma interface profissional, moderna e premium.

Diretrizes:

* Design dark como identidade inicial.
* Tons de preto, grafite e roxo.
* Detalhes em vermelho e laranja, alinhados à identidade visual.
* Interface limpa e organizada.
* Animações discretas e fluidas.
* Tipografia moderna.
* Dashboard com excelente hierarquia visual.
* Navegação intuitiva.
* Responsividade para desktop, tablet e celular.

Evite interfaces genéricas de dashboards administrativos.

A experiência precisa parecer um verdadeiro centro de controle empresarial.

A identidade visual deverá utilizar o logotipo MAGNUS que será fornecido posteriormente.

## 6. FILOSOFIA DOS AGENTES

Os agentes não deverão ser apenas chatbots com nomes diferentes.

Cada agente deverá possuir:

* Identidade e especialidade.
* Objetivo definido.
* Responsabilidades.
* Ferramentas autorizadas.
* Contexto empresarial.
* Memória pertinente.
* Capacidade de receber tarefas.
* Capacidade de produzir resultados.
* Registro de atividades.

A comunicação entre agentes deverá ocorrer por meio de uma arquitetura controlada, com rastreabilidade e limites de execução.

Ações sensíveis deverão exigir aprovação humana.

## 7. ESTRATÉGIA DE DESENVOLVIMENTO

Não tente desenvolver toda a plataforma simultaneamente.

Trabalhe com uma arquitetura modular e entregas incrementais.

A primeira versão deverá priorizar:

1. Estrutura principal da aplicação.
2. Sistema de autenticação.
3. Estrutura multiempresa.
4. Dashboard central.
5. Gerenciamento de agentes.
6. Integração inicial com um modelo de IA.
7. Memória empresarial.
8. Sistema básico de tarefas.
9. Relatórios e notificações.

Comece com dados de demonstração quando integrações reais ainda não estiverem disponíveis.

Não implemente integrações fictícias como se fossem funcionais.

## 8. REGRAS DE DESENVOLVIMENTO

Estas instruções são obrigatórias:

* Escreva código organizado, modular e documentado.
* Priorize segurança e manutenibilidade.
* Evite dependências desnecessárias.
* Não implemente funcionalidades sem compreender sua finalidade.
* Não substitua tecnologias sem justificar.
* Não exclua arquivos ou configurações existentes sem autorização.
* Não exponha chaves de API ou credenciais.
* Utilize variáveis de ambiente.
* Implemente tratamento de erros.
* Crie testes para funcionalidades críticas.
* Registre decisões arquiteturais importantes.
* Mantenha documentação atualizada.
* Utilize Git de maneira organizada.

Não confunda aparência visual com funcionalidade real.

Cada módulo deverá possuir uma implementação funcional ou estar claramente identificado como demonstração.

## 9. ORGANIZAÇÃO DO TRABALHO

Quero que você atue como responsável técnico pelo projeto.

Utilize o Claude Cowork para organizar atividades, documentação e acompanhamento do desenvolvimento, quando apropriado.

Utilize o Claude Code para implementar, testar e corrigir o software.

Organize o trabalho em etapas com entregas verificáveis.

Crie documentação para:

* Visão geral do produto.
* Arquitetura do sistema.
* Estrutura do banco de dados.
* Funcionalidades.
* Integrações.
* Segurança.
* Instruções de instalação.
* Próximas etapas.

Mantenha um registro das decisões tomadas e das funcionalidades implementadas.

## 10. PRIMEIRA MISSÃO

Não comece criando agentes aleatórios ou desenvolvendo todas as funcionalidades imediatamente.

Sua primeira missão é:

1. Analisar profundamente a proposta da MAGNUS.
2. Identificar riscos técnicos e arquiteturais.
3. Propor a arquitetura ideal para a primeira versão.
4. Definir a estrutura de pastas e módulos.
5. Identificar as dependências necessárias.
6. Elaborar um roadmap técnico dividido em etapas.
7. Definir o que será desenvolvido primeiro e o que deverá aguardar validação comercial.
8. Identificar quais decisões precisam da minha aprovação.

Depois dessa análise, apresente um plano de execução objetivo e comece a preparar a estrutura inicial do projeto.

Não tome decisões irreversíveis sem minha autorização.

## OBJETIVO FINAL

Construir a MAGNUS OS como uma plataforma empresarial de inteligência artificial capaz de conectar departamentos, automatizar processos, coordenar agentes especializados e transformar informações em ações e decisões.

Pense como arquiteto de software, engenheiro de IA e CTO de uma startup que pretende construir um produto global.

Não busque apenas entregar código rapidamente.

Busque construir uma infraestrutura tecnológica sólida, com qualidade de engenharia e potencial comercial.
