/**
 * Every user-facing string of the web app, in Brazilian Portuguese (decision D-12).
 * A future locale adds a sibling file with the same shape (`satisfies Messages`).
 */
export const ptBR = {
  meta: {
    title: 'MAGNUS OS',
    description: 'Centro de controle da operação da sua empresa com agentes de IA.',
  },
  shell: {
    skipToContent: 'Pular para o conteúdo',
    navLabel: 'Navegação principal',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    noOrganization: 'Nenhuma organização',
    previewNotice:
      'Prévia da interface. Login, organizações e agentes ainda não estão ligados a estas telas; os dados aparecem a partir da Fase 1.4.',
    environment: {
      development: 'Desenvolvimento',
      staging: 'Staging',
      production: 'Produção',
    },
    phaseShort: (phase: string) => `F${phase}`,
    phaseLong: (phase: string) => `Chega na Fase ${phase}`,
  },
  status: {
    live: 'Funcionando',
    building: 'Em construção',
    planned: 'Planejado',
    attention: 'Requer decisão',
    demo: 'Demonstração',
  },
  nav: {
    painel: 'Painel',
    agentes: 'Agentes',
    tarefas: 'Tarefas',
    aprovacoes: 'Aprovações',
    memoria: 'Memória',
    relatorios: 'Relatórios',
    integracoes: 'Integrações',
    configuracoes: 'Configurações',
  },
  dashboard: {
    title: 'Painel',
    summary: 'Nenhum agente em operação ainda.',
    timeline: {
      title: 'Linha de operação de hoje',
      now: 'agora',
      empty: 'Nenhuma atividade de agente registrada hoje.',
    },
    attention: {
      title: 'Aguardando você',
      empty: 'Nada aguardando aprovação.',
      explanation:
        'Quando um agente propõe enviar algo para fora da empresa, apagar dados ou mexer com dinheiro, a ação para aqui até alguém aprovar.',
    },
    agents: {
      title: 'Agentes',
      empty: 'Nenhum agente criado.',
      explanation: 'Na Fase 2 você cria agentes com especialidade, objetivo, ferramentas autorizadas e limites.',
    },
    platform: {
      title: 'Estado da plataforma',
      caption: 'O que já funciona e em que fase chega o restante.',
    },
  },
  platformItems: {
    isolation: 'Isolamento de dados entre empresas',
    roles: 'Papéis, convites e trilha de auditoria',
    interface: 'Interface do centro de controle',
    auth: 'Login e sessão',
    organizations: 'Organizações, membros e convites na interface',
    agents: 'Agentes, tarefas e aprovações',
    memory: 'Memória da empresa',
    reports: 'Relatórios, alertas e notificações',
    workflows: 'Fluxos automatizados',
    integrations: 'Integrações com Google, WhatsApp, ERP e CRM',
  },
  modules: {
    agentes: {
      purpose: 'Os agentes da sua organização: quem são, o que fazem e o que podem usar.',
      upcoming: [
        'Criar agentes com especialidade, objetivo e responsabilidades',
        'Escolher as ferramentas autorizadas e o nível de autonomia de cada um',
        'Acompanhar cada execução, passo a passo, com custo e autoria',
      ],
    },
    tarefas: {
      purpose: 'O trabalho atribuído aos agentes e o que eles entregaram.',
      upcoming: [
        'Atribuir tarefas a um agente e acompanhar o andamento',
        'Ver o resultado de cada tarefa e o rastro de como foi feita',
        'Agentes delegando partes do trabalho entre si, com limites',
      ],
    },
    aprovacoes: {
      purpose: 'Ações sensíveis propostas por agentes que esperam a decisão de uma pessoa.',
      upcoming: [
        'Ver exatamente o que o agente quer fazer e por quê',
        'Aprovar ou recusar com um comentário',
        'Retomada automática da tarefa depois da decisão',
      ],
    },
    memoria: {
      purpose: 'Documentos, planilhas e decisões da empresa que os agentes consultam.',
      upcoming: [
        'Enviar documentos e planilhas para a memória da empresa',
        'Respostas dos agentes com citação da fonte',
        'Histórico de decisões: o que foi decidido, por quem e com base em quê',
      ],
    },
    relatorios: {
      purpose: 'Resumos periódicos, alertas de problemas e oportunidades identificadas.',
      upcoming: [
        'Relatórios diários e semanais gerados pelos agentes',
        'Alertas com as evidências que os justificam',
        'Notificações no app e por e-mail',
      ],
    },
    integracoes: {
      purpose: 'As ferramentas da empresa que os agentes podem ler e usar.',
      upcoming: [
        'Conectar Google Agenda e Google Drive',
        'Conectar WhatsApp Business',
        'Conectores para ERP e CRM escolhidos com os primeiros clientes',
      ],
    },
    configuracoes: {
      purpose: 'Dados da organização, pessoas, papéis e convites.',
      upcoming: [
        'Convidar pessoas e definir o papel de cada uma',
        'Trocar entre organizações',
        'Consultar a trilha de auditoria',
      ],
    },
  },
  modulePage: {
    upcomingTitle: 'O que você vai poder fazer aqui',
    backToDashboard: 'Voltar ao painel',
  },
  notFound: {
    title: 'Página não encontrada',
    body: 'O endereço não corresponde a nenhuma tela do MAGNUS.',
    action: 'Ir para o painel',
  },
} as const;

export type Messages = typeof ptBR;
