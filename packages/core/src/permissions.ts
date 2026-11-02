/**
 * Permission matrix: the minimum organization role required for each action.
 *
 * Checked in three layers: the UI (hide what is not allowed), the server
 * (assertCan before doing work) and the database (RLS). The database is the
 * final authority; this table must never be more permissive than its policies.
 */
import { hasRole, type OrgRole } from './tenancy.ts';

export const PERMISSIONS = {
  'org.read': 'viewer',
  'org.update': 'admin',
  'members.read': 'viewer',
  'members.manage': 'admin',
  'audit.read': 'admin',
  'agents.read': 'viewer',
  'agents.manage': 'admin',
  'agents.run': 'member',
  'tasks.read': 'viewer',
  'tasks.create': 'member',
  'approvals.decide': 'admin',
  'memory.read': 'viewer',
  'memory.write': 'member',
  'integrations.manage': 'admin',
  'reports.read': 'viewer',
  'reports.manage': 'admin',
  'billing.manage': 'owner',
} as const satisfies Record<string, OrgRole>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: OrgRole | null | undefined, permission: Permission): boolean {
  return hasRole(role, PERMISSIONS[permission]);
}

export class ForbiddenError extends Error {
  readonly code = 'forbidden';
  readonly permission: Permission;

  constructor(permission: Permission) {
    super(`Missing permission: ${permission}`);
    this.name = 'ForbiddenError';
    this.permission = permission;
  }
}

export function assertCan(role: OrgRole | null | undefined, permission: Permission): void {
  if (!can(role, permission)) {
    throw new ForbiddenError(permission);
  }
}
