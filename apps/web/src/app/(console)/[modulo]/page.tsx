import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusChip } from '@magnus/ui';
import { MODULES, isModuleId } from '@/content/modules';
import { ptBR } from '@/content/pt-BR';

interface ModulePageProps {
  params: Promise<{ modulo: string }>;
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { modulo } = await params;
  return isModuleId(modulo) ? { title: ptBR.nav[modulo] } : {};
}

/** Screens whose functionality is not built yet say so, and say when it arrives. */
export default async function ModulePage({ params }: ModulePageProps) {
  const { modulo } = await params;
  if (!isModuleId(modulo)) notFound();

  const info = MODULES[modulo];
  const copy = ptBR.modules[modulo];

  return (
    <article className="max-w-3xl">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-wide text-3xl font-semibold tracking-tight text-mist-50 sm:text-4xl">
            {ptBR.nav[modulo]}
          </h1>
          <StatusChip tone={info.status}>{ptBR.status[info.status]}</StatusChip>
        </div>
        <p className="mt-3 max-w-[60ch] text-lg leading-8 text-mist-300">{copy.purpose}</p>
        <p className="mt-2 text-sm text-graphite-500">{ptBR.shell.phaseLong(info.phase)}</p>
      </header>

      <section aria-labelledby="upcoming-title" className="mt-10 rounded-panel border border-graphite-800 bg-graphite-900 p-5 sm:p-6">
        <h2 id="upcoming-title" className="text-base font-medium text-mist-50">
          {ptBR.modulePage.upcomingTitle}
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          {copy.upcoming.map((item) => (
            <li key={item} className="flex gap-3 text-[0.95rem] leading-6 text-mist-100">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-magnus-500" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <Link
        href="/painel"
        className="mt-8 inline-flex rounded-control px-1 text-sm font-medium text-magnus-300 underline-offset-4 hover:underline"
      >
        {ptBR.modulePage.backToDashboard}
      </Link>
    </article>
  );
}
