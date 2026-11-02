import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { LogoMark } from '@magnus/ui';
import { ptBR } from '@/content/pt-BR';
import { MobileNav } from './mobile-nav';
import { UserMenu } from './user-menu';

type Environment = keyof typeof ptBR.shell.environment;

function currentEnvironment(): Environment {
  const value = process.env.NEXT_PUBLIC_MAGNUS_ENV;
  return value === 'staging' || value === 'production' ? value : 'development';
}

export interface TopbarProps {
  userName: string | null;
  userEmail: string | null;
}

export function Topbar({ userName, userEmail }: TopbarProps) {
  const environment = currentEnvironment();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-graphite-800 bg-graphite-950/85 px-4 backdrop-blur sm:px-6 md:h-18 lg:px-10">
      <div className="flex items-center gap-3 md:hidden">
        <Link href="/painel" className="rounded-md">
          <LogoMark size={30} title="MAGNUS OS" />
        </Link>
      </div>

      <p
        title={ptBR.account.organizationHint}
        className="hidden items-center gap-2 rounded-full border border-graphite-800 bg-graphite-900 px-3.5 py-1.5 text-sm text-mist-300 md:flex"
      >
        <Building2 aria-hidden="true" className="size-4 text-graphite-500" />
        {ptBR.shell.noOrganization}
      </p>

      <div className="flex min-w-0 items-center gap-3">
        {environment !== 'production' && (
          <span className="shrink-0 rounded-full border border-graphite-700 px-2.5 py-0.5 text-xs text-mist-300">
            {ptBR.shell.environment[environment]}
          </span>
        )}
        <div className="hidden md:block">
          <UserMenu name={userName} email={userEmail} />
        </div>
        <div className="md:hidden">
          <MobileNav userName={userName} userEmail={userEmail} />
        </div>
      </div>
    </header>
  );
}
