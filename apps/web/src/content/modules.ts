/**
 * Product modules and platform capabilities with their REAL delivery status.
 * Keep in sync with docs/05-funcionalidades.md and docs/08-roadmap.md.
 */
import type { StatusTone } from '@magnus/ui';
import type { Messages } from './pt-BR';

export const MODULE_IDS = [
  'agentes',
  'tarefas',
  'aprovacoes',
  'memoria',
  'relatorios',
  'integracoes',
  'configuracoes',
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export type DeliveryStatus = Extract<StatusTone, 'live' | 'building' | 'planned'>;

export interface ModuleInfo {
  id: ModuleId;
  phase: string;
  status: DeliveryStatus;
}

export const MODULES: Record<ModuleId, ModuleInfo> = {
  agentes: { id: 'agentes', phase: '2', status: 'planned' },
  tarefas: { id: 'tarefas', phase: '2', status: 'planned' },
  aprovacoes: { id: 'aprovacoes', phase: '2', status: 'planned' },
  memoria: { id: 'memoria', phase: '3', status: 'planned' },
  relatorios: { id: 'relatorios', phase: '4', status: 'planned' },
  integracoes: { id: 'integracoes', phase: '6', status: 'planned' },
  configuracoes: { id: 'configuracoes', phase: '1.5', status: 'planned' },
};

export function isModuleId(value: string): value is ModuleId {
  return (MODULE_IDS as readonly string[]).includes(value);
}

export interface PlatformItem {
  key: keyof Messages['platformItems'];
  phase: string;
  status: DeliveryStatus;
}

export const PLATFORM_ITEMS: readonly PlatformItem[] = [
  { key: 'isolation', phase: '0', status: 'live' },
  { key: 'roles', phase: '1.2', status: 'live' },
  { key: 'interface', phase: '1.3', status: 'live' },
  { key: 'auth', phase: '1.4', status: 'building' },
  { key: 'organizations', phase: '1.5', status: 'planned' },
  { key: 'agents', phase: '2', status: 'planned' },
  { key: 'memory', phase: '3', status: 'planned' },
  { key: 'reports', phase: '4', status: 'planned' },
  { key: 'workflows', phase: '5', status: 'planned' },
  { key: 'integrations', phase: '6', status: 'planned' },
];
