import type { ReactNode } from 'react';
import { Wordmark } from '@magnus/ui';
import { ptBR } from '@/content/pt-BR';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <aside className="hidden flex-col justify-between border-r border-graphite-800 bg-onyx p-12 lg:flex xl:p-16">
        <Wordmark />
        <div>
          <p className="max-w-[15ch] font-wide text-4xl leading-[1.15] font-semibold text-mist-50 xl:text-5xl">
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
