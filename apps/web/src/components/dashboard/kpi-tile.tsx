import Link from 'next/link';
import { ArrowUpRight, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { ptBR } from '@/content/pt-BR';

const TONES = {
  magnus: 'bg-magnus-950 text-magnus-300 ring-magnus-500/30',
  teal: 'bg-[#0b2a31] text-[#5fd0e0] ring-chart-2/30',
  ember: 'bg-ember-950 text-ember-300 ring-ember-500/40',
  violet: 'bg-[#210f3a] text-[#c79bff] ring-brand-violet/40',
} as const;

export interface KpiTileProps {
  icon: LucideIcon;
  tone: keyof typeof TONES;
  label: string;
  value: string;
  /** One-line context under the number: a delta or a short explanation. */
  detail: string;
  trend?: 'up' | 'down';
  href: string;
}

/**
 * Headline number with its context; the arrow opens the module behind it.
 * Demonstration status is labelled once for the whole row (see the dashboard page).
 */
export function KpiTile({ icon: Icon, tone, label, value, detail, trend, href }: KpiTileProps) {
  const TrendIcon = trend === 'down' ? TrendingDown : TrendingUp;

  return (
    <article className="surface-card flex flex-col gap-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`inline-flex size-11 items-center justify-center rounded-full ring-1 ${TONES[tone]}`}>
            <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
          </span>
          <h2 className="max-w-[12ch] text-sm leading-5 text-mist-100">{label}</h2>
        </div>
        <Link
          href={href}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-graphite-700 text-mist-300 transition-colors hover:border-graphite-600 hover:text-mist-50"
        >
          <ArrowUpRight aria-hidden="true" className="size-4" />
          <span className="sr-only">{ptBR.dashboard.kpis.open(label)}</span>
        </Link>
      </div>

      <p className="text-[2.6rem] leading-none font-semibold tracking-tight whitespace-nowrap text-mist-50 tabular-nums">
        {value}
      </p>

      <p className="flex items-center gap-1.5 text-xs text-mist-300">
        {trend && <TrendIcon aria-hidden="true" className="size-3.5 shrink-0" />}
        {detail}
      </p>
    </article>
  );
}
