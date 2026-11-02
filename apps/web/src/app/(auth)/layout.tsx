import type { ReactNode } from 'react';
import { LogoMark, Wordmark } from '@magnus/ui';
import { ptBR } from '@/content/pt-BR';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-graphite-800 bg-onyx p-12 lg:flex xl:p-16">
        <span aria-hidden="true" className="absolute -top-24 -left-24 size-96 rounded-full bg-brand-indigo/40 blur-3xl" />
        <span aria-hidden="true" className="absolute -right-24 -bottom-32 size-96 rounded-full bg-ember-600/20 blur-3xl" />

        <div className="relative">
          <Wordmark />
        </div>

        <div className="relative">
          <LogoMark size={88} />
          <p className="mt-10 max-w-[15ch] font-wide text-4xl leading-[1.15] font-semibold text-mist-50 xl:text-5xl">
            {ptBR.auth.tagline}
          </p>
          <p className="mt-6 max-w-[42ch] text-lg leading-8 text-mist-300">{ptBR.auth.taglineDetail}</p>
        </div>
      </aside>

      <main className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-12 lg:hidden">
            <Wordmark />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
