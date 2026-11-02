/**
 * Invitations: who may invite whom, single-use expiring tokens, e-mail binding,
 * and isolation between organizations.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createTestDb, emailOf, sqlState, type Actor as DbActor, type TestDb } from './support/db.ts';

const USERS = {
  olga: '00000000-0000-4000-8000-0000000000a1', // owner of Acme
  adam: '00000000-0000-4000-8000-0000000000a2', // admin of Acme
  mia: '00000000-0000-4000-8000-0000000000a3', // member of Acme
  ivan: '00000000-0000-4000-8000-0000000000a4', // invitee
  uma: '00000000-0000-4000-8000-0000000000a5', // invitee with an unconfirmed e-mail
  otto: '00000000-0000-4000-8000-0000000000a6', // owner of another organization
} as const;

type UserName = keyof typeof USERS;
type Actor = DbActor<UserName>;

const INVALID = sqlState('MG001');
const WRONG_EMAIL = sqlState('MG002');
const ALREADY_MEMBER = sqlState('MG003');
const FORBIDDEN = sqlState('42501');

let db: TestDb<UserName>;
let acme: string;
let globex: string;

const rows = <T>(actor: Actor, sql: string, params?: unknown[]) => db.rows<T>(actor, sql, params);

async function invite(actor: Actor, email: string, role = 'member', orgId = acme) {
  const [created] = await rows<{ invitation_id: string; token: string; expires_at: Date }>(
    actor,
    'select * from public.create_invitation($1, $2, $3::public.org_role)',
    [orgId, email, role],
  );
  assert.ok(created, 'create_invitation returned no row');
  return created;
}

async function accept(actor: Actor, token: string): Promise<string> {
  const [row] = await rows<{ org_id: string }>(actor, 'select public.accept_invitation($1) as org_id', [token]);
  assert.ok(row);
  return row.org_id;
}

async function roleOf(orgId: string, user: UserName): Promise<string | undefined> {
  const [row] = await rows<{ role: string }>(
    'service',
    'select role from public.memberships where org_id = $1 and user_id = $2',
    [orgId, USERS[user]],
  );
  return row?.role;
}

describe('invitations', () => {
  before(async () => {
    db = await createTestDb(USERS, { unconfirmed: ['uma'] });
    const createOrg = async (owner: Actor, name: string, slug: string) => {
      const [org] = await rows<{ id: string }>(owner, 'select id from public.create_organization($1, $2)', [name, slug]);
      assert.ok(org);
      return org.id;
    };
    acme = await createOrg('olga', 'Acme', 'acme');
    globex = await createOrg('otto', 'Globex', 'globex');
    await db.affected(
      'service',
      "insert into public.memberships (org_id, user_id, role) values ($1, $2, 'admin'), ($1, $3, 'member')",
      [acme, USERS.adam, USERS.mia],
    );
  });

  after(async () => {
    await db.close();
  });

  test('stores only a hash of the single-use token', async () => {
    const created = await invite('adam', emailOf('ivan'));
    assert.match(created.token, /^[0-9a-f]{64}$/);

    const days = (created.expires_at.getTime() - Date.now()) / 86_400_000;
    assert.ok(days > 6.9 && days <= 7, `expires in ${days} days`);

    const [stored] = await rows<{ hash_matches: boolean; raw_stored: boolean }>(
      'service',
      `select token_hash = $2 as hash_matches,
              position(convert_to($3, 'UTF8') in token_hash) > 0 as raw_stored
       from public.invitations where id = $1`,
      [created.invitation_id, createHash('sha256').update(created.token).digest(), created.token],
    );
    assert.deepEqual(stored, { hash_matches: true, raw_stored: false });
  });

  test('admins invite members and viewers; only owners invite admins; nobody invites owners', async () => {
    await assert.rejects(invite('mia', 'friend@example.test'), FORBIDDEN);
    await assert.rejects(invite('adam', 'boss@example.test', 'admin'), FORBIDDEN);
    await assert.rejects(invite('olga', 'heir@example.test', 'owner'), FORBIDDEN);
    await assert.rejects(invite('otto', 'spy@example.test'), FORBIDDEN);
    await assert.rejects(invite('anon', 'anon@example.test'), FORBIDDEN);

    assert.ok(await invite('adam', 'viewer@example.test', 'viewer'));
    assert.ok(await invite('olga', 'new-admin@example.test', 'admin'));
  });

  test('only admins of the organization can list its invitations, never the token hash', async () => {
    const listed = await rows<{ email: string }>('adam', 'select email from public.invitations where org_id = $1', [acme]);
    assert.ok(listed.length >= 3);
    assert.equal((await rows('mia', 'select id from public.invitations')).length, 0);
    assert.equal((await rows('otto', 'select id from public.invitations')).length, 0);
    await assert.rejects(rows('adam', 'select token_hash from public.invitations'), FORBIDDEN);
    await assert.rejects(rows('adam', "update public.invitations set role = 'admin'"), FORBIDDEN);
    await assert.rejects(rows('adam', 'delete from public.invitations'), FORBIDDEN);
  });

  test('the invitation page can preview a valid token without signing in', async () => {
    const created = await invite('adam', 'preview@example.test', 'viewer');
    const [preview] = await rows('anon', 'select * from public.invitation_preview($1)', [created.token]);
    assert.deepEqual(
      { ...(preview as Record<string, unknown>), expires_at: undefined },
      { organization_name: 'Acme', role: 'viewer', email: 'preview@example.test', expires_at: undefined },
    );
    assert.equal((await rows('anon', 'select * from public.invitation_preview($1)', ['0'.repeat(64)])).length, 0);
  });

  test('accepting joins the organization with the invited role, once', async () => {
    const created = await invite('olga', emailOf('ivan').toUpperCase(), 'viewer');

    assert.equal(await accept('ivan', created.token), acme);
    assert.equal(await roleOf(acme, 'ivan'), 'viewer');
    await assert.rejects(accept('ivan', created.token), INVALID);

    const trail = await rows<{ action: string }>(
      'service',
      "select action from public.audit_log where org_id = $1 and action like 'invitation.%' order by id",
      [acme],
    );
    assert.ok(trail.some((e) => e.action === 'invitation.accepted'));
  });

  test('re-inviting someone who already belongs is refused', async () => {
    await assert.rejects(invite('adam', emailOf('ivan')), ALREADY_MEMBER);
  });

  test("a token only works for the invited, confirmed e-mail", async () => {
    const forSomeoneElse = await invite('adam', 'someone-else@example.test');
    await assert.rejects(accept('otto', forSomeoneElse.token), WRONG_EMAIL);

    const forUma = await invite('adam', emailOf('uma'));
    await assert.rejects(accept('uma', forUma.token), WRONG_EMAIL);
    assert.equal(await roleOf(acme, 'uma'), undefined);
    await assert.rejects(accept('anon', forUma.token), FORBIDDEN);
  });

  test('expired, superseded and revoked tokens are rejected', async () => {
    const expired = await invite('adam', emailOf('otto'));
    await db.affected('service', "update public.invitations set expires_at = now() - interval '1 minute' where id = $1", [
      expired.invitation_id,
    ]);
    await assert.rejects(accept('otto', expired.token), INVALID);

    const first = await invite('adam', emailOf('otto'));
    const second = await invite('adam', emailOf('otto'));
    await assert.rejects(accept('otto', first.token), INVALID);

    const [open] = await rows<{ n: number }>(
      'service',
      'select count(*)::int as n from public.invitations where org_id = $1 and email = $2 and accepted_at is null and revoked_at is null',
      [acme, emailOf('otto')],
    );
    assert.equal(open?.n, 1);

    await rows('adam', 'select public.revoke_invitation($1)', [second.invitation_id]);
    await assert.rejects(accept('otto', second.token), INVALID);
    assert.equal(await roleOf(acme, 'otto'), undefined);
  });

  test('revoking follows the same role rules as inviting', async () => {
    const memberInvite = await invite('adam', 'temp@example.test');
    const adminInvite = await invite('olga', 'second-admin@example.test', 'admin');

    await assert.rejects(rows('mia', 'select public.revoke_invitation($1)', [memberInvite.invitation_id]), INVALID);
    await assert.rejects(rows('adam', 'select public.revoke_invitation($1)', [adminInvite.invitation_id]), INVALID);
    await assert.rejects(rows('otto', 'select public.revoke_invitation($1)', [memberInvite.invitation_id]), INVALID);

    await rows('olga', 'select public.revoke_invitation($1)', [adminInvite.invitation_id]);
    const [revoked] = await rows<{ revoked: boolean }>(
      'service',
      'select revoked_at is not null as revoked from public.invitations where id = $1',
      [adminInvite.invitation_id],
    );
    assert.deepEqual(revoked, { revoked: true });
  });

  test("an organization's invitations cannot be used to join another one", async () => {
    const globexInvite = await invite('otto', emailOf('mia'), 'member', globex);
    assert.equal(await accept('mia', globexInvite.token), globex);
    assert.equal(await roleOf(globex, 'mia'), 'member');
    assert.equal(await roleOf(acme, 'mia'), 'member');
    assert.equal((await rows('adam', 'select id from public.invitations where org_id = $1', [globex])).length, 0);
  });
});
