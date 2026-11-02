import Link from 'next/link';
import { Wordmark } from '@magnus/ui';
import { ptBR } from '@/content/pt-BR';
import { MobileNav } from './mobile-nav';

type Environment = keyof typeof ptBR.shell.environment;

function currentEnvironment(): Environment {
  const value = process.env.NEXT_PUBLIC_MAGNUS_ENV;
  return value === 'staging' || value === 'production' ? value : 'development';
}

export function Topbar() {
  const environment = currentEnvironment();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-graphite-800 bg-graphite-950/90 px-4 backdrop-blur sm:px-6 md:static md:bg-transparent md:backdrop-blur-none lg:px-10">
      <div className="md:hidden">
        <Link href="/painel" className="rounded-sm">
          <Wordmark />
        </Link>
      </div>

      <p className="hidden text-sm text-graphite-500 md:block lg:hidden">{ptBR.shell.noOrganization}</p>
      <span className="hidden lg:block" />

      <div className="flex items-center gap-3">
        {environment !== 'production' && (
          <span className="rounded-full border border-graphite-700 px-2.5 py-0.5 text-xs text-mist-300">
            {ptBR.shell.environment[environment]}
          </span>
        )}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
