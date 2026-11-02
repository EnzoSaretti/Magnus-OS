'use client';

import { useEffect, useState } from 'react';
import { demoTodayEvents } from '@/content/demo/dashboard';
import { ptBR } from '@/content/pt-BR';
import { Panel } from './panel';

const HOURS = Array.from({ length: 25 }, (_, hour) => hour);
const MINUTES_PER_DAY = 24 * 60;
const timeFormat = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

/**
 * Today's operations on a 24-hour scale. The "now" cursor is the browser's real
 * clock; marks up to now come from demonstration data until phase 2. Rendered
 * after mount only, so server and client markup never disagree about the time.
 */
export function OperationsTimeline({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const t = ptBR.dashboard.timeline;
  const nowMinute = now ? now.getHours() * 60 + now.getMinutes() : 0;
  const elapsed = (nowMinute / MINUTES_PER_DAY) * 100;
  const events = now ? demoTodayEvents.filter((event) => event.minute <= nowMinute) : [];
  const runs = events.filter((event) => event.kind === 'run').length;
  const approvals = events.length - runs;

  return (
    <Panel
      id="linha-de-operacao"
      title={t.title}
      demo
      className={className}
      actions={
        <p className="text-sm tabular-nums text-magnus-300" aria-live="off">
          {now ? `${t.now} ${timeFormat.format(now)}` : ' '}
        </p>
      }
    >
      <div className="relative h-24 overflow-hidden rounded-control bg-onyx" aria-hidden="true">
        <div
          className="absolute inset-y-0 left-0 bg-linear-to-r from-magnus-950/70 via-magnus-950 to-magnus-700/35 transition-[width] duration-1000 ease-out-quint"
          style={{ width: `${elapsed}%` }}
        />
        {HOURS.map((hour) => (
          <span
            key={hour}
            className={[
              'absolute bottom-0 w-px',
              hour % 6 === 0 ? 'h-full bg-graphite-700' : hour % 3 === 0 ? 'h-1/2 bg-graphite-700' : 'h-1/4 bg-graphite-800',
            ].join(' ')}
            style={{ left: `${(hour / 24) * 100}%` }}
          />
        ))}
        {events.map((event) => (
          <span
            key={`${event.kind}-${event.minute}`}
            className={[
              'absolute size-2.5 -translate-x-1/2 rounded-full ring-2 ring-onyx',
              event.kind === 'run' ? 'top-[38%] bg-chart-1' : 'top-[18%] bg-chart-3',
            ].join(' ')}
            style={{ left: `${(event.minute / MINUTES_PER_DAY) * 100}%` }}
          />
        ))}
        {now && (
          <span className="absolute inset-y-0 w-0.5 bg-magnus-300" style={{ left: `calc(${elapsed}% - 1px)` }}>
            <span className="absolute -top-px left-1/2 size-2 -translate-x-1/2 rounded-full bg-magnus-300" />
          </span>
        )}
      </div>

      <div className="relative mt-2 h-4 text-xs tabular-nums text-graphite-500" aria-hidden="true">
        {HOURS.filter((hour) => hour % 3 === 0).map((hour) => (
          <span
            key={hour}
            className={[
              'absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full',
              hour % 6 === 0 ? '' : 'hidden sm:inline',
            ].join(' ')}
            style={{ left: `${(hour / 24) * 100}%` }}
          >
            {String(hour).padStart(2, '0')}h
          </span>
        ))}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-mist-300">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-chart-1" />
          {t.runs}
          <span className="tabular-nums text-mist-50">{runs}</span>
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-chart-3" />
          {t.approvals}
          <span className="tabular-nums text-mist-50">{approvals}</span>
        </li>
      </ul>
    </Panel>
  );
}
