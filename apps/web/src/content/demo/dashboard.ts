/**
 * DEMONSTRATION DATA — not from any organization.
 *
 * Shows how the dashboard reads once agents are running (phase 2). Every widget
 * fed from this file displays the "Demonstração" chip, and the dashboard opens
 * with a notice saying so. Replace each export with a real query as its module
 * ships (docs/05-funcionalidades.md); delete this file when none is left.
 */

export const DEMO_REFERENCE = 'Fase 2';

export const demoKpis = {
  agents: { value: 6, delta: '+2', trend: 'up' as const },
  tasksDone: { value: 284, delta: '18%', trend: 'up' as const },
  awaitingYou: { value: 3 },
  aiCost: { value: 214.3, delta: '6%', trend: 'down' as const },
};

/** Deterministic daily counts, identical on server and client. */
function daily(length: number, base: number, swing: number, phase: number): number[] {
  return Array.from({ length }, (_, i) =>
    Math.max(0, Math.round(base + swing * Math.sin((i + phase) * 0.85) + (swing / 2) * Math.cos((i + phase) * 1.9))),
  );
}

export const demoRuns = {
  '7d': { tasks: [8, 11, 9, 13, 10, 12, 9], approvals: [1, 2, 0, 3, 1, 2, 1] },
  '30d': { tasks: daily(30, 9.5, 3, 1), approvals: daily(30, 1.2, 1, 4) },
};

export type DemoPeriod = keyof typeof demoRuns;

export const demoTaskStatus = {
  done: 284,
  inProgress: 61,
  awaitingApproval: 3,
};

export type DemoRisk = 'write_external' | 'financial' | 'destructive';

export const demoPendingApprovals: readonly {
  id: string;
  title: string;
  agent: string;
  risk: DemoRisk;
  requestedAgo: string;
}[] = [
  {
    id: 'apr-1',
    title: 'Enviar proposta revisada para a Construtora Horizonte',
    agent: 'Agente Comercial',
    risk: 'write_external',
    requestedAgo: 'há 12 min',
  },
  {
    id: 'apr-2',
    title: 'Pagar fatura da Lumen Gráfica (R$ 4.870,00)',
    agent: 'Agente Financeiro',
    risk: 'financial',
    requestedAgo: 'há 1 h',
  },
  {
    id: 'apr-3',
    title: 'Excluir 214 contatos duplicados do CRM',
    agent: 'Agente de Operações',
    risk: 'destructive',
    requestedAgo: 'há 3 h',
  },
];

export type DemoActivityStatus = 'done' | 'running' | 'awaiting';

export const demoActivity: readonly {
  id: string;
  agent: string;
  initials: string;
  summary: string;
  status: DemoActivityStatus;
  when: string;
}[] = [
  {
    id: 'act-1',
    agent: 'Agente de Atendimento',
    initials: 'AT',
    summary: 'Classificando 18 mensagens recebidas pelo WhatsApp',
    status: 'running',
    when: 'agora',
  },
  {
    id: 'act-2',
    agent: 'Agente Financeiro',
    initials: 'FI',
    summary: 'Conciliou 42 lançamentos bancários de outubro',
    status: 'done',
    when: 'há 8 min',
  },
  {
    id: 'act-3',
    agent: 'Agente Comercial',
    initials: 'CO',
    summary: 'Preparou 5 follow-ups de propostas abertas',
    status: 'done',
    when: 'há 25 min',
  },
  {
    id: 'act-4',
    agent: 'Agente de Operações',
    initials: 'OP',
    summary: 'Pediu aprovação para excluir contatos duplicados',
    status: 'awaiting',
    when: 'há 3 h',
  },
];

export interface DemoTodayEvent {
  /** Minutes since midnight. */
  minute: number;
  kind: 'run' | 'approval';
}

const RUN_MINUTES = [
  365, 400, 432, 478, 500, 527, 543, 571, 615, 652, 690, 788, 824, 866, 902, 949, 993, 1030, 1121, 1215, 1297,
];
const APPROVAL_MINUTES = [585, 890, 1085];

/** Today's demo agent runs and approval requests. */
export const demoTodayEvents: readonly DemoTodayEvent[] = [
  ...RUN_MINUTES.map((minute): DemoTodayEvent => ({ minute, kind: 'run' })),
  ...APPROVAL_MINUTES.map((minute): DemoTodayEvent => ({ minute, kind: 'approval' })),
];
