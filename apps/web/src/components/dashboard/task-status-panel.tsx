'use client';

import { useState } from 'react';
import { DonutChart, type DonutSlice } from '@/components/charts/donut-chart';
import { demoTaskStatus } from '@/content/demo/dashboard';
import { ptBR } from '@/content/pt-BR';
import { Panel } from './panel';

export function TaskStatusPanel({ className }: { className?: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const t = ptBR.dashboard.taskStatus;

  const slices: DonutSlice[] = [
    { id: 'done', label: t.done, value: demoTaskStatus.done, color: 'var(--color-chart-1)' },
    { id: 'inProgress', label: t.inProgress, value: demoTaskStatus.inProgress, color: 'var(--color-chart-2)' },
    { id: 'awaiting', label: t.awaitingApproval, value: demoTaskStatus.awaitingApproval, color: 'var(--color-chart-3)' },
  ];
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <Panel id="tarefas-do-mes" title={t.title} demo className={className}>
      <div className="flex flex-1 flex-col items-center gap-6 sm:flex-row xl:flex-col">
        <DonutChart
          slices={slices}
          ariaLabel={t.aria}
          centerCaption={t.caption}
          activeId={activeId}
          onActiveChange={setActiveId}
        />
        <ul className="flex w-full flex-col gap-3.5">
          {slices.map((slice) => {
            const share = total > 0 ? slice.value / total : 0;
            return (
              <li
                key={slice.id}
                onPointerEnter={() => setActiveId(slice.id)}
                onPointerLeave={() => setActiveId(null)}
                className={['transition-opacity', activeId && activeId !== slice.id ? 'opacity-50' : ''].join(' ')}
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-mist-100">
                    <span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                    {slice.label}
                  </span>
                  <span className="tabular-nums text-mist-300">
                    {slice.value.toLocaleString('pt-BR')}
                    <span className="text-graphite-500">/{total.toLocaleString('pt-BR')}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-graphite-800">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${Math.max(1.5, share * 100)}%`, backgroundColor: slice.color }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}
