import Link from 'next/link';
import { StatusChip, type StatusTone } from '@magnus/ui';
import { demoActivity, type DemoActivityStatus } from '@/content/demo/dashboard';
import { ptBR } from '@/content/pt-BR';
import { Panel } from './panel';

const STATUS_TONE: Record<DemoActivityStatus, StatusTone> = {
  done: 'live',
  running: 'building',
  awaiting: 'attention',
};

export function ActivityPanel({ className }: { className?: string }) {
  const t = ptBR.dashboard.activity;

  return (
    <Panel
      id="atividade"
      title={t.title}
      demo
      className={className}
      actions={
        <Link href="/tarefas" className="text-xs font-medium text-magnus-300 underline-offset-4 hover:underline">
          {t.viewAll}
        </Link>
      }
    >
      <ul className="flex flex-col gap-3">
        {demoActivity.map((item) => (
          <li key={item.id} className="rounded-control border border-graphite-800 bg-graphite-950/60 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-graphite-800 text-[0.7rem] font-semibold text-mist-100"
                >
                  {item.initials}
                </span>
                <span className="truncate text-sm font-medium text-mist-50">{item.agent}</span>
              </div>
              <StatusChip tone={STATUS_TONE[item.status]}>{t.statuses[item.status]}</StatusChip>
            </div>
            <p className="mt-2 text-sm leading-6 text-mist-300">{item.summary}</p>
            <p className="mt-1 text-xs text-graphite-500">{item.when}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
