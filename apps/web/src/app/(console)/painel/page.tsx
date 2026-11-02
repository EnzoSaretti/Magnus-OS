import type { Metadata } from 'next';
import { StatusChip } from '@magnus/ui';
import { OperationsTimeline } from '@/components/dashboard/operations-timeline';
import { PLATFORM_ITEMS } from '@/content/modules';
import { ptBR } from '@/content/pt-BR';

export const metadata: Metadata = { title: ptBR.dashboard.title };

export default function DashboardPage() {
  const d = ptBR.dashboard;

  return (
    <div className="flex flex-col gap-6">
      <header className="mb-2">
        <h1 className="font-wide text-3xl font-semibold tracking-tight text-mist-50 sm:text-4xl">{d.title}</h1>
        <p className="mt-2 text-lg text-mist-300">{d.summary}</p>
      </header>

      <OperationsTimeline />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section
          aria-labelledby="attention-title"
          className="rounded-panel border border-graphite-800 border-l-ember-500 border-l-2 bg-graphite-900 p-5 sm:p-6"
        >
          <h2 id="attention-title" className="text-base font-medium text-mist-50">
            {d.attention.title}
          </h2>
          <p className="mt-4 font-wide text-xl font-medium text-mist-100">{d.attention.empty}</p>
          <p className="mt-2 max-w-[60ch] text-sm leading-6 text-mist-300">{d.attention.explanation}</p>
        </section>

        <section aria-labelledby="agents-title" className="rounded-panel border border-graphite-800 bg-graphite-900 p-5 sm:p-6">
          <h2 id="agents-title" className="text-base font-medium text-mist-50">
            {d.agents.title}
          </h2>
          <p className="mt-4 font-wide text-xl font-medium text-mist-100">{d.agents.empty}</p>
          <p className="mt-2 text-sm leading-6 text-mist-300">{d.agents.explanation}</p>
        </section>
      </div>

      <section aria-labelledby="platform-title" className="pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="platform-title" className="text-base font-medium text-mist-50">
            {d.platform.title}
          </h2>
          <p className="text-sm text-graphite-500">{d.platform.caption}</p>
        </div>
        <ul className="mt-4 grid border-t border-graphite-800 xl:grid-cols-2 xl:gap-x-10">
          {PLATFORM_ITEMS.map((item) => (
            <li key={item.key} className="flex items-center gap-4 border-b border-graphite-800 py-3.5">
              <span className="w-10 shrink-0 text-sm tabular-nums text-graphite-500">
                {ptBR.shell.phaseShort(item.phase)}
              </span>
              <span className="flex-1 text-[0.95rem] text-mist-100">{ptBR.platformItems[item.key]}</span>
              <StatusChip tone={item.status}>{ptBR.status[item.status]}</StatusChip>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
