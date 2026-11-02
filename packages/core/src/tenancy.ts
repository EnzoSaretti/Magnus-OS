/**
 * Organization roles and membership-management rules.
 *
 * The database is the source of truth (supabase/migrations/*_core_tenancy.sql:
 * enum public.org_role and the memberships policies). These functions mirror
 * those rules so the app can hide actions a user cannot take and fail fast
 * with a clear message before reaching the database.
 */

/** Ordered from least to most privileged, matching the SQL enum declaration order. */
export const ORG_ROLES = ['viewer', 'member', 'admin', 'owner'] as const;

export type OrgRole = (typeof ORG_ROLES)[number];

export function isOrgRole(value: unknown): value is OrgRole {
  return typeof value === 'string' && (ORG_ROLES as readonly string[]).includes(value);
}

export function roleRank(role: OrgRole): number {
  return ORG_ROLES.indexOf(role);
}

/** True when `actual` is at least `required`. A missing role (not a member) never qualifies. */
export function hasRole(actual: OrgRole | null | undefined, required: OrgRole): boolean {
  return actual != null && roleRank(actual) >= roleRank(required);
}

/**
 * Whether `actor` may act on a membership whose role is `targetRole`.
 * Owners manage everyone; admins manage only members and viewers.
 * Mirrors public.can_manage_role().
 */
export function canManageRole(actor: OrgRole | null | undefined, targetRole: OrgRole): boolean {
  if (hasRole(actor, 'owner')) return true;
  return hasRole(actor, 'admin') && roleRank(targetRole) < roleRank('admin');
}

/** Whether `actor` may change a membership from `currentRole` to `nextRole`. */
export function canChangeRole(actor: OrgRole | null | undefined, currentRole: OrgRole, nextRole: OrgRole): boolean {
  return canManageRole(actor, currentRole) && canManageRole(actor, nextRole);
}

/**
 * Whether removing or demoting one owner would leave the organization ownerless.
 * Mirrors public.ensure_org_keeps_an_owner().
 */
export function wouldLeaveNoOwner(ownerCount: number, currentRole: OrgRole, nextRole: OrgRole | null): boolean {
  return currentRole === 'owner' && nextRole !== 'owner' && ownerCount <= 1;
}
