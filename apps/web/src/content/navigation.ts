import { Bot, Gauge, Library, ListChecks, Plug, ScrollText, Settings2, ShieldCheck, type LucideIcon } from 'lucide-react';
import { MODULES, type ModuleId } from './modules';

export interface NavItem {
  id: 'painel' | ModuleId;
  href: string;
  icon: LucideIcon;
  /** Phase in which the screen becomes functional; absent when it already works. */
  phase?: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'painel', href: '/painel', icon: Gauge },
  { id: 'agentes', href: '/agentes', icon: Bot, phase: MODULES.agentes.phase },
  { id: 'tarefas', href: '/tarefas', icon: ListChecks, phase: MODULES.tarefas.phase },
  { id: 'aprovacoes', href: '/aprovacoes', icon: ShieldCheck, phase: MODULES.aprovacoes.phase },
  { id: 'memoria', href: '/memoria', icon: Library, phase: MODULES.memoria.phase },
  { id: 'relatorios', href: '/relatorios', icon: ScrollText, phase: MODULES.relatorios.phase },
  { id: 'integracoes', href: '/integracoes', icon: Plug, phase: MODULES.integracoes.phase },
  { id: 'configuracoes', href: '/configuracoes', icon: Settings2, phase: MODULES.configuracoes.phase },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
