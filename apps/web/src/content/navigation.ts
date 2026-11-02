import { Bot, Gauge, Library, ListChecks, Plug, ScrollText, Settings2, ShieldCheck, type LucideIcon } from 'lucide-react';
import { MODULES, PLATFORM_ITEMS, type ModuleId } from './modules';
import type { Messages } from './pt-BR';

export interface NavItem {
  id: 'painel' | ModuleId;
  href: string;
  icon: LucideIcon;
  /** Phase in which the screen becomes functional; absent when it already works. */
  phase?: string;
}

export interface NavGroup {
  id: keyof Messages['navGroups'];
  items: readonly NavItem[];
}

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    id: 'operation',
    items: [
      { id: 'painel', href: '/painel', icon: Gauge },
      { id: 'agentes', href: '/agentes', icon: Bot, phase: MODULES.agentes.phase },
      { id: 'tarefas', href: '/tarefas', icon: ListChecks, phase: MODULES.tarefas.phase },
      { id: 'aprovacoes', href: '/aprovacoes', icon: ShieldCheck, phase: MODULES.aprovacoes.phase },
    ],
  },
  {
    id: 'knowledge',
    items: [
      { id: 'memoria', href: '/memoria', icon: Library, phase: MODULES.memoria.phase },
      { id: 'relatorios', href: '/relatorios', icon: ScrollText, phase: MODULES.relatorios.phase },
    ],
  },
  {
    id: 'platform',
    items: [
      { id: 'integracoes', href: '/integracoes', icon: Plug, phase: MODULES.integracoes.phase },
      { id: 'configuracoes', href: '/configuracoes', icon: Settings2, phase: MODULES.configuracoes.phase },
    ],
  },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Real delivery progress of the platform, shown in the navigation. */
export function buildProgress() {
  const live = PLATFORM_ITEMS.filter((item) => item.status === 'live').length;
  return { live, total: PLATFORM_ITEMS.length };
}
