'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_GROUPS, isActive } from '@/content/navigation';
import { ptBR } from '@/content/pt-BR';

export interface NavListProps {
  /** Icons only, labels kept for assistive technology (tablet rail). */
  compact?: boolean;
  onNavigate?: () => void;
}

export function NavList({ compact = false, onNavigate }: NavListProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          {compact ? (
            <span aria-hidden="true" className="mx-auto mb-1 h-px w-6 bg-graphite-800 first:hidden" />
          ) : (
            <p className="mb-1 px-3 text-xs font-medium text-graphite-500">{ptBR.navGroups[group.id]}</p>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map(({ id, href, icon: Icon, phase }) => {
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
                        ? 'bg-linear-to-r from-magnus-950 to-graphite-850 text-mist-50'
                        : 'text-mist-300 hover:bg-graphite-850 hover:text-mist-50',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        'absolute top-2 bottom-2 left-0 w-0.5 rounded-full transition-colors',
                        active ? 'bg-magnus-400 shadow-[0_0_12px_var(--color-magnus-500)]' : 'bg-transparent',
                      ].join(' ')}
                    />
                    <Icon
                      aria-hidden="true"
                      className={['size-[18px] shrink-0', active ? 'text-magnus-300' : ''].join(' ')}
                      strokeWidth={1.75}
                    />
                    <span className={compact ? 'sr-only' : 'flex-1'}>{label}</span>
                    {phase && !compact && (
                      <span className="rounded-full border border-graphite-700 px-2 py-px text-[0.7rem] text-graphite-500 group-hover:text-mist-300">
                        {ptBR.shell.phaseShort(phase)}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
