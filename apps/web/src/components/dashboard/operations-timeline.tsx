'use client';

import { useEffect, useState } from 'react';
import { demoTodayEvents } from '@/content/demo/dashboard';
import { ptBR } from '@/content/pt-BR';
import { Panel } from './panel';

const HOUR = 3_600_000;
const WINDOW = 24 * HOUR;
const timeFormat = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

function position(time: number, start: number): number {
  return ((time - start) / WINDOW) * 100;
}

/**
 * The last 24 hours of operation on a rolling scale, "now" at the right edge.
 * The clock is the browser's; marks come from demonstration data until phase 2.
 * Rendered after mount only, so server and client markup never disagree about the time.
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
  const end = now?.getTime() ?? 0;
  const start = end - WINDOW;

  const hours: { time: number; hour: number }[] = [];
  if (now) {
    const first = new Date(start);
    first.setMinutes(0, 0, 0);
    for (let time = first.getTime() + HOUR; time <= end; time += HOUR) {
      hours.push({ time, hour: new Date(time).getHours() });
    }
  }

  // Each demo event at its most recent occurrence within the window.
  const midnight = now ? new Date(now).setHours(0, 0, 0, 0) : 0;
  const nowMinute = now ? now.getHours() * 60 + now.getMinutes() : 0;
  const events = now
    ? demoTodayEvents.map((event) => ({
        ...event,
        time: midnight + event.minute * 60_000 - (event.minute > nowMinute ? 24 * HOUR : 0),
      }))
    : [];
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
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-magnus-950/60 to-magnus-700/30" />
        {hours.map(({ time, hour }) => (
          <span
            key={time}
            className={[
              'absolute bottom-0 w-px',
              hour % 6 === 0 ? 'h-full bg-graphite-700' : hour % 3 === 0 ? 'h-1/2 bg-graphite-700' : 'h-1/4 bg-graphite-800',
            ].join(' ')}
            style={{ left: `${position(time, start)}%` }}
          />
        ))}
        {events.map((event) => (
          <span
            key={`${event.kind}-${event.minute}`}
            className={[
              'absolute size-2.5 -translate-x-1/2 rounded-full ring-2 ring-onyx',
              event.kind === 'run' ? 'top-[40%] bg-chart-1' : 'top-[16%] bg-chart-3',
            ].join(' ')}
            style={{ left: `${position(event.time, start)}%` }}
          />
        ))}
        {now && (
          <span className="absolute inset-y-0 right-0 w-0.5 bg-magnus-300">
            <span className="absolute -top-px left-1/2 size-2 -translate-x-1/2 rounded-full bg-magnus-300" />
          </span>
        )}
      </div>

      <div className="relative mt-2 h-4 text-xs tabular-nums text-graphite-500" aria-hidden="true">
        {hours
          .filter(({ hour }) => hour % 3 === 0)
          .map(({ time, hour }) => {
            const left = position(time, start);
            return (
              <span
                key={time}
                className={[
                  'absolute',
                  left < 4 ? '' : left > 96 ? '-translate-x-full' : '-translate-x-1/2',
                  hour % 6 === 0 ? '' : 'hidden sm:inline',
                ].join(' ')}
                style={{ left: `${left}%` }}
              >
                {String(hour).padStart(2, '0')}h
              </span>
            );
          })}
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
