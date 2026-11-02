import Link from 'next/link';
import { Wordmark } from '@magnus/ui';
import { signOut } from '@/lib/auth/actions';
import { ptBR } from '@/content/pt-BR';
import { MobileNav } from './mobile-nav';

type Environment = keyof typeof ptBR.shell.environment;

function currentEnvironment(): Environment {
  const value = process.env.NEXT_PUBLIC_MAGNUS_ENV;
  return value === 'staging' || value === 'production' ? value : 'development';
}

export function Topbar({ userEmail }: { userEmail: string | null }) {
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

      <div className="flex min-w-0 items-center gap-3">
        {environment !== 'production' && (
          <span className="shrink-0 rounded-full border border-graphite-700 px-2.5 py-0.5 text-xs text-mist-300">
            {ptBR.shell.environment[environment]}
          </span>
        )}
        {userEmail && (
          <div className="hidden min-w-0 items-center gap-3 md:flex">
            <span className="truncate text-sm text-mist-300" title={userEmail}>
              <span className="sr-only">{ptBR.shell.signedInAs} </span>
              {userEmail}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-control px-2.5 py-1.5 text-sm font-medium text-mist-100 transition-colors hover:bg-graphite-850"
              >
                {ptBR.auth.signOut}
              </button>
            </form>
          </div>
        )}
        <div className="md:hidden">
          <MobileNav userEmail={userEmail} />
        </div>
      </div>
    </header>
  );
}
