import Link from 'next/link';
import { Wordmark } from '@magnus/ui';
import { ptBR } from '@/content/pt-BR';
import { BuildProgress } from './build-progress';
import { NavList } from './nav-list';

/** Persistent navigation: icon rail on tablets, full sidebar on desktop. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r border-graphite-800 bg-onyx md:flex">
      <div className="flex h-18 items-center justify-center px-5 lg:justify-start lg:px-6">
        <Link href="/painel" className="rounded-md">
          <span className="lg:hidden">
            <Wordmark compact size={34} />
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

      <div className="hidden p-4 lg:block">
        <BuildProgress />
      </div>
    </aside>
  );
}
