'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, isActive } from '@/content/navigation';
import { ptBR } from '@/content/pt-BR';

export interface NavListProps {
  /** Icons only, labels kept for assistive technology (tablet rail). */
  compact?: boolean;
  onNavigate?: () => void;
}

export function NavList({ compact = false, onNavigate }: NavListProps) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ id, href, icon: Icon, phase }) => {
        const active = isActive(pathname, href);
        const label = ptBR.nav[id];
        return (
          <li key={id}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              title={compact ? label : undefined}
              className={[
                'group relative flex items-center gap-3 rounded-control py-2.5 text-[0.95rem] transition-colors duration-150',
                compact ? 'justify-center px-0' : 'px-3',
                active
                  ? 'bg-graphite-850 text-mist-50'
                  : 'text-mist-300 hover:bg-graphite-900 hover:text-mist-50',
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={[
                  'absolute top-2 bottom-2 left-0 w-0.5 rounded-full transition-colors',
                  active ? 'bg-magnus-500' : 'bg-transparent',
                ].join(' ')}
              />
              <Icon aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.75} />
              <span className={compact ? 'sr-only' : 'flex-1'}>{label}</span>
              {phase && !compact && (
                <span className="text-xs text-graphite-500 group-hover:text-mist-300">
                  {ptBR.shell.phaseShort(phase)}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
