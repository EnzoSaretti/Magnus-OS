import Link from 'next/link';
import { Wordmark } from '@magnus/ui';
import { ptBR } from '@/content/pt-BR';
import { NavList } from './nav-list';

/** Persistent navigation rail: icons only on tablets, full labels on desktop. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r border-graphite-800 bg-onyx md:flex">
      <div className="flex h-16 items-center px-5 lg:px-6">
        <Link href="/painel" className="rounded-sm">
          <span className="lg:hidden">
            <Wordmark compact />
          </span>
          <span className="hidden lg:inline">
            <Wordmark />
          </span>
        </Link>
      </div>

      <nav aria-label={ptBR.shell.navLabel} className="flex-1 overflow-y-auto px-3 py-4">
        <div className="lg:hidden">
          <NavList compact />
        </div>
        <div className="hidden lg:block">
          <NavList />
        </div>
      </nav>

      <div className="hidden border-t border-graphite-800 px-6 py-4 text-sm text-graphite-500 lg:block">
        {ptBR.shell.noOrganization}
      </div>
    </aside>
  );
}
