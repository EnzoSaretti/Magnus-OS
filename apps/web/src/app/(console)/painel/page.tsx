import type { Metadata } from 'next';
import { Bot, ListChecks, ShieldCheck, Wallet } from 'lucide-react';
import { StatusChip } from '@magnus/ui';
import { ActivityPanel } from '@/components/dashboard/activity-panel';
import { ApprovalsPanel } from '@/components/dashboard/approvals-panel';
import { AssistantCard } from '@/components/dashboard/assistant-card';
import { KpiTile } from '@/components/dashboard/kpi-tile';
import { OperationsTimeline } from '@/components/dashboard/operations-timeline';
import { PlatformStatus } from '@/components/dashboard/platform-status';
import { RunsPanel } from '@/components/dashboard/runs-panel';
import { TaskStatusPanel } from '@/components/dashboard/task-status-panel';
import { demoKpis } from '@/content/demo/dashboard';
import { ptBR } from '@/content/pt-BR';
import { getProfile, requireSessionUser } from '@/lib/auth/session';

export const metadata: Metadata = { title: ptBR.dashboard.title };

const TIME_ZONE = 'America/Sao_Paulo';
const longDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TIME_ZONE });
const shortDay = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: TIME_ZONE });
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' });

function lastDays(count: number, today: Date): string[] {
  return Array.from({ length: count }, (_, i) => shortDay.format(new Date(today.getTime() - (count - 1 - i) * 86_400_000)));
}

export default async function DashboardPage() {
  const user = await requireSessionUser();
  const profile = await getProfile(user.id);
  const today = new Date();
  const dateLine = longDate.format(today);
  const d = ptBR.dashboard;
  const k = d.kpis;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-5 pt-1 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-mist-300">{dateLine.charAt(0).toUpperCase() + dateLine.slice(1)}</p>
          <h1 className="mt-1 font-wide text-3xl font-semibold tracking-tight text-mist-50 sm:text-4xl">
            {d.greeting(profile.firstName)}
          </h1>
        </div>
        <p className="flex max-w-xl gap-3 rounded-panel border border-dashed border-ember-300/40 bg-ember-950/40 px-4 py-3 text-sm leading-6 text-mist-100">
          <span className="mt-0.5 shrink-0">
            <StatusChip tone="demo">{ptBR.status.demo}</StatusChip>
          </span>
          {d.demoNotice}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          icon={Bot}
          tone="magnus"
          label={k.agents.label}
          value={String(demoKpis.agents.value)}
          detail={k.agents.delta(demoKpis.agents.delta)}
          trend={demoKpis.agents.trend}
          href="/agentes"
          demo
        />
        <KpiTile
          icon={ListChecks}
          tone="teal"
          label={k.tasksDone.label}
          value={demoKpis.tasksDone.value.toLocaleString('pt-BR')}
          detail={k.tasksDone.delta(demoKpis.tasksDone.delta)}
          trend={demoKpis.tasksDone.trend}
          href="/tarefas"
          demo
        />
        <KpiTile
          icon={ShieldCheck}
          tone="ember"
          label={k.awaitingYou.label}
          value={String(demoKpis.awaitingYou.value)}
          detail={k.awaitingYou.detail}
          href="/aprovacoes"
          demo
        />
        <KpiTile
          icon={Wallet}
          tone="violet"
          label={k.aiCost.label}
          value={currency.format(demoKpis.aiCost.value)}
          detail={k.aiCost.delta(demoKpis.aiCost.delta)}
          trend={demoKpis.aiCost.trend}
          href="/relatorios"
          demo
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <RunsPanel className="xl:col-span-8" labels={{ '7d': lastDays(7, today), '30d': lastDays(30, today) }} />
        <TaskStatusPanel className="xl:col-span-4" />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <ApprovalsPanel className="xl:col-span-7" />
        <AssistantCard className="xl:col-span-5" />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <OperationsTimeline className="xl:col-span-7" />
        <ActivityPanel className="xl:col-span-5" />
      </div>

      <PlatformStatus />
    </div>
  );
}
