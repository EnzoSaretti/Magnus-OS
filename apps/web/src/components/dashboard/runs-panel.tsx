'use client';

import { useState } from 'react';
import { LineChart } from '@/components/charts/line-chart';
import { demoRuns, type DemoPeriod } from '@/content/demo/dashboard';
import { ptBR } from '@/content/pt-BR';
import { Panel } from './panel';

const PERIODS: readonly DemoPeriod[] = ['7d', '30d'];

export interface RunsPanelProps {
  /** Day labels per period, computed on the server so both renders agree. */
  labels: Record<DemoPeriod, readonly string[]>;
  className?: string;
}

export function RunsPanel({ labels, className }: RunsPanelProps) {
  const [period, setPeriod] = useState<DemoPeriod>('30d');
  const t = ptBR.dashboard.runs;
  const data = demoRuns[period];

  return (
    <Panel
      id="execucoes"
      title={t.title}
      demo
      className={className}
      actions={
        <div role="radiogroup" aria-label={t.periodLabel} className="flex rounded-full border border-graphite-800 bg-graphite-950 p-1">
          {PERIODS.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={period === value}
              onClick={() => setPeriod(value)}
              className={[
                'rounded-full px-3.5 py-1 text-xs font-medium transition-colors',
                period === value ? 'bg-graphite-800 text-mist-50' : 'text-mist-300 hover:text-mist-50',
              ].join(' ')}
            >
              {t.periods[value]}
            </button>
          ))}
        </div>
      }
    >
      <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-mist-300">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-chart-1" />
          {t.tasksLong}
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-chart-3" />
          {t.approvalsLong}
        </li>
      </ul>
      <LineChart
        ariaLabel={t.aria(t.periods[period])}
        labels={labels[period]}
        series={[
          { id: 'tasks', label: t.tasks, color: 'var(--color-chart-1)', values: data.tasks },
          { id: 'approvals', label: t.approvals, color: 'var(--color-chart-3)', values: data.approvals },
        ]}
      />
    </Panel>
  );
}
