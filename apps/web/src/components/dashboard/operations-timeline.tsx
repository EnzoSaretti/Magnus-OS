'use client';

import { useEffect, useState } from 'react';
import { ptBR } from '@/content/pt-BR';

const HOURS = Array.from({ length: 25 }, (_, hour) => hour);
const MINUTES_PER_DAY = 24 * 60;
const timeFormat = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

/**
 * Today's operations on a 24-hour scale. The "now" cursor is the browser's
 * real clock; agent activity marks will be plotted here from phase 2. Rendered
 * after mount only, so server and client markup never disagree about the time.
 */
export function OperationsTimeline() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const elapsed = now ? ((now.getHours() * 60 + now.getMinutes()) / MINUTES_PER_DAY) * 100 : 0;
  const t = ptBR.dashboard.timeline;

  return (
    <section aria-labelledby="timeline-title" className="rounded-panel border border-graphite-800 bg-graphite-900 p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="timeline-title" className="text-base font-medium text-mist-50">
          {t.title}
        </h2>
        <p className="text-sm tabular-nums text-magnus-300" aria-live="off">
          {now ? `${t.now} ${timeFormat.format(now)}` : ' '}
        </p>
      </div>

      <div className="relative mt-5 h-20 overflow-hidden rounded-control bg-onyx" aria-hidden="true">
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

      <p className="mt-5 text-sm text-mist-300">{t.empty}</p>
    </section>
  );
}
