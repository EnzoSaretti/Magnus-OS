import Link from 'next/link';
import { buildProgress } from '@/content/navigation';
import { ptBR } from '@/content/pt-BR';

/** Real delivery status of the platform (not demonstration data). */
export function BuildProgress() {
  const { live, total } = buildProgress();
  const percent = Math.round((live / total) * 100);

  return (
    <div className="relative overflow-hidden rounded-panel border border-graphite-800 bg-linear-to-br from-brand-navy/70 via-graphite-900 to-graphite-900 p-4">
      <span
        aria-hidden="true"
        className="absolute -top-10 -right-8 size-28 rounded-full bg-brand-violet/25 blur-2xl"
      />
      <p className="relative text-sm font-medium text-mist-50">{ptBR.buildProgress.title}</p>
      <p className="relative mt-1 text-xs text-mist-300">{ptBR.buildProgress.detail(live, total)}</p>
      <div
        className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-graphite-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={live}
        aria-label={ptBR.buildProgress.title}
      >
        <span
          className="block h-full rounded-full bg-linear-to-r from-magnus-500 to-brand-violet"
          style={{ width: `${percent}%` }}
        />
      </div>
      <Link
        href="/painel#plataforma"
        className="relative mt-3 inline-flex text-xs font-medium text-magnus-300 underline-offset-4 hover:underline"
      >
        {ptBR.buildProgress.link}
      </Link>
    </div>
  );
}
