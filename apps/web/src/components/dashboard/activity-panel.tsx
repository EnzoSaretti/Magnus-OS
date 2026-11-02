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

/** Latest agent work as a row of cards (one per run). */
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
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {demoActivity.map((item) => (
          <li key={item.id} className="flex flex-col rounded-control border border-graphite-800 bg-graphite-950/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <StatusChip tone={STATUS_TONE[item.status]}>{t.statuses[item.status]}</StatusChip>
              <span className="text-xs text-graphite-500">{item.when}</span>
            </div>
            <p className="mt-3 flex-1 text-sm leading-6 text-mist-100">{item.summary}</p>
            <div className="mt-4 flex items-center gap-2.5 border-t border-graphite-800 pt-3">
              <span
                aria-hidden="true"
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-graphite-800 text-[0.65rem] font-semibold text-mist-100"
              >
                {item.initials}
              </span>
              <span className="truncate text-sm text-mist-300">{item.agent}</span>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
