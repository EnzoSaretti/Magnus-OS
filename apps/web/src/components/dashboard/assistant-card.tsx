import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { LogoMark } from '@magnus/ui';
import { ptBR } from '@/content/pt-BR';

/**
 * Preview of the assistant (phase 2). Suggestions open the real module pages;
 * the input is disabled and says when it arrives, instead of pretending to answer.
 */
export function AssistantCard({ className = '' }: { className?: string }) {
  const t = ptBR.dashboard.assistant;

  return (
    <section
      aria-labelledby="assistente-title"
      className={`relative flex flex-col overflow-hidden rounded-panel border border-brand-violet/40 bg-linear-to-br from-brand-indigo via-[#25106b] to-brand-navy p-5 sm:p-6 ${className}`}
    >
      <span aria-hidden="true" className="absolute -top-16 -right-10 size-48 rounded-full bg-brand-violet/40 blur-3xl" />
      <span aria-hidden="true" className="absolute -bottom-20 -left-10 size-44 rounded-full bg-ember-500/15 blur-3xl" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <h2 id="assistente-title" className="text-base font-medium text-mist-50">
            {t.title}
          </h2>
        </div>
        <span className="rounded-full border border-mist-50/25 px-2.5 py-0.5 text-xs text-mist-100">
          {ptBR.shell.phaseLong('2')}
        </span>
      </div>

      <p className="relative mt-6 font-wide text-2xl font-semibold text-mist-50">{t.prompt}</p>
      <p className="relative mt-2 max-w-[44ch] text-sm leading-6 text-mist-100/80">{t.body}</p>

      <ul className="relative mt-5 grid gap-2 sm:grid-cols-2">
        {t.suggestions.map((suggestion) => (
          <li key={suggestion.href}>
            <Link
              href={suggestion.href}
              className="flex h-full items-center rounded-control border border-mist-50/15 bg-onyx/30 px-3.5 py-2.5 text-sm text-mist-50 backdrop-blur transition-colors hover:border-mist-50/35 hover:bg-onyx/45"
            >
              {suggestion.label}
            </Link>
          </li>
        ))}
      </ul>

      <label className="relative mt-5 flex items-center gap-3 rounded-full border border-mist-50/15 bg-onyx/40 py-2.5 pr-4 pl-4">
        <span className="sr-only">{t.inputLabel}</span>
        <input
          type="text"
          disabled
          placeholder={t.inputPlaceholder}
          className="min-w-0 flex-1 cursor-not-allowed bg-transparent text-sm text-mist-50 placeholder:text-mist-100/60 focus:outline-none"
        />
        <Sparkles aria-hidden="true" className="size-4 shrink-0 text-mist-100/70" />
      </label>
    </section>
  );
}
