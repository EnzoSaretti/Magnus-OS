import type { ReactNode } from 'react';
import { ptBR } from '@/content/pt-BR';
import { PreviewNotice } from '@/components/shell/preview-notice';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[4.75rem_minmax(0,1fr)] lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-control focus:bg-magnus-600 focus:px-4 focus:py-2 focus:text-mist-50"
      >
        {ptBR.shell.skipToContent}
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <Topbar />
        <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-8">
          <PreviewNotice />
          {children}
        </main>
      </div>
    </div>
  );
}
