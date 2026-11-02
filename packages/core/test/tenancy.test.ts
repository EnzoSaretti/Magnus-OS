import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ORG_ROLES,
  canChangeRole,
  canInvite,
  canManageRole,
  hasRole,
  isOrgRole,
  wouldLeaveNoOwner,
} from '../src/tenancy.ts';
import { ForbiddenError, PERMISSIONS, assertCan, can } from '../src/permissions.ts';

describe('roles', () => {
  test('are ordered viewer < member < admin < owner', () => {
    assert.deepEqual([...ORG_ROLES], ['viewer', 'member', 'admin', 'owner']);
    assert.ok(hasRole('owner', 'admin'));
    assert.ok(hasRole('admin', 'admin'));
    assert.ok(!hasRole('member', 'admin'));
  });

  test('a non-member never qualifies', () => {
    assert.ok(!hasRole(null, 'viewer'));
    assert.ok(!hasRole(undefined, 'viewer'));
  });

  test('isOrgRole accepts only known roles', () => {
    assert.ok(isOrgRole('admin'));
    assert.ok(!isOrgRole('superadmin'));
    assert.ok(!isOrgRole(3));
  });
});

describe('membership management (mirrors the memberships RLS policies)', () => {
  test('owners manage every role', () => {
    for (const role of ORG_ROLES) assert.ok(canManageRole('owner', role));
  });

  test('admins manage only members and viewers', () => {
    assert.ok(canManageRole('admin', 'member'));
    assert.ok(canManageRole('admin', 'viewer'));
    assert.ok(!canManageRole('admin', 'admin'));
    assert.ok(!canManageRole('admin', 'owner'));
  });

  test('members and viewers manage nobody', () => {
    for (const actor of ['member', 'viewer'] as const) {
      for (const role of ORG_ROLES) assert.ok(!canManageRole(actor, role));
    }
  });

  test('admins cannot promote anyone to admin or owner', () => {
    assert.ok(canChangeRole('admin', 'member', 'viewer'));
    assert.ok(!canChangeRole('admin', 'member', 'admin'));
    assert.ok(!canChangeRole('admin', 'admin', 'owner'));
  });

  test('invitations follow the same rules, and nobody is invited as owner', () => {
    assert.ok(canInvite('admin', 'member'));
    assert.ok(canInvite('admin', 'viewer'));
    assert.ok(!canInvite('admin', 'admin'));
    assert.ok(canInvite('owner', 'admin'));
    assert.ok(!canInvite('owner', 'owner'));
    assert.ok(!canInvite('member', 'viewer'));
    assert.ok(!canInvite(null, 'viewer'));
  });

  test('the last owner cannot step down or leave', () => {
    assert.ok(wouldLeaveNoOwner(1, 'owner', 'admin'));
    assert.ok(wouldLeaveNoOwner(1, 'owner', null));
    assert.ok(!wouldLeaveNoOwner(2, 'owner', 'admin'));
    assert.ok(!wouldLeaveNoOwner(1, 'admin', null));
  });
});

describe('permissions', () => {
  test('every permission requires a known role', () => {
    for (const role of Object.values(PERMISSIONS)) assert.ok(isOrgRole(role));
  });

  test('sensitive permissions are not granted to members', () => {
    for (const permission of ['approvals.decide', 'audit.read', 'members.manage', 'integrations.manage'] as const) {
      assert.ok(!can('member', permission), permission);
      assert.ok(can('admin', permission), permission);
    }
    assert.ok(!can('admin', 'billing.manage'));
  });

  test('assertCan throws a typed ForbiddenError', () => {
    assert.throws(
      () => assertCan('viewer', 'tasks.create'),
      (error: unknown) => error instanceof ForbiddenError && error.permission === 'tasks.create',
    );
    assert.doesNotThrow(() => assertCan('member', 'tasks.create'));
  });
});
