import Link from 'next/link';
import { Banknote, Send, Trash2, type LucideIcon } from 'lucide-react';
import { demoPendingApprovals, type DemoRisk } from '@/content/demo/dashboard';
import { ptBR } from '@/content/pt-BR';
import { Panel } from './panel';

const RISK_ICONS: Record<DemoRisk, LucideIcon> = {
  write_external: Send,
  financial: Banknote,
  destructive: Trash2,
};

/** The core promise in one card: sensitive agent actions wait for a person. */
export function ApprovalsPanel({ className }: { className?: string }) {
  const t = ptBR.dashboard.approvals;

  return (
    <Panel
      id="aguardando-voce"
      title={t.title}
      demo
      className={`relative overflow-hidden ${className ?? ''}`}
      actions={
        <Link href="/aprovacoes" className="text-xs font-medium text-ember-300 underline-offset-4 hover:underline">
          {t.viewAll}
        </Link>
      }
    >
      <span aria-hidden="true" className="absolute inset-y-6 left-0 w-0.5 rounded-full bg-ember-500" />
      <p className="text-sm text-mist-300">{t.subtitle}</p>
      <ul className="mt-4 flex flex-col divide-y divide-graphite-800">
        {demoPendingApprovals.map((item) => {
          const Icon = RISK_ICONS[item.risk];
          return (
            <li key={item.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ember-950 text-ember-300 ring-1 ring-ember-500/40">
                <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.95rem] text-mist-50" title={item.title}>
                  {item.title}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-mist-300">
                  <span>{item.agent}</span>
                  <span aria-hidden="true" className="size-1 rounded-full bg-graphite-600" />
                  <span>{item.requestedAgo}</span>
                  <span className="rounded-full border border-ember-500/50 px-2 py-px text-[0.7rem] text-ember-300">
                    {t.risks[item.risk]}
                  </span>
                </p>
              </div>
              <Link
                href="/aprovacoes"
                className="shrink-0 rounded-full bg-ember-500 px-3.5 py-1.5 text-xs font-semibold text-onyx transition-colors hover:bg-ember-400"
              >
                {t.review}
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
