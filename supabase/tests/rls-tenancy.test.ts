/**
 * Tenancy and row-level security for the core tables.
 *
 * Boots an in-memory Postgres (PGlite), loads a minimal Supabase shim plus every
 * migration in order, then acts as real callers would through the API roles
 * (anon, authenticated with a JWT subject, service_role).
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { PGlite, type Transaction } from '@electric-sql/pglite';

const SUPABASE_DIR = new URL('../', import.meta.url);

const USERS = {
  alice: '00000000-0000-4000-8000-00000000000a',
  bob: '00000000-0000-4000-8000-00000000000b',
  carol: '00000000-0000-4000-8000-00000000000c',
  dave: '00000000-0000-4000-8000-00000000000d',
} as const;

type UserName = keyof typeof USERS;
type Actor = UserName | 'anon' | 'service';

let db: PGlite;

async function bootDatabase(): Promise<PGlite> {
  const instance = await PGlite.create();
  await instance.exec(await readFile(new URL('tests/support/supabase-shim.sql', SUPABASE_DIR), 'utf8'));

  const migrationsDir = new URL('migrations/', SUPABASE_DIR);
  const migrations = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();
  for (const file of migrations) {
    await instance.exec(await readFile(new URL(file, migrationsDir), 'utf8'));
  }
  return instance;
}

/** Runs fn in a transaction as the given caller, the way PostgREST sets up a request. */
async function as<T>(actor: Actor, fn: (tx: Transaction) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    if (actor === 'anon') {
      await tx.exec('set local role anon');
    } else if (actor === 'service') {
      await tx.exec('set local role service_role');
    } else {
      await tx.exec('set local role authenticated');
      await tx.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: USERS[actor], role: 'authenticated' }),
      ]);
    }
    return fn(tx);
  });
}

async function rows<T>(actor: Actor, sql: string, params: unknown[] = []): Promise<T[]> {
  return as(actor, async (tx) => (await tx.query<T>(sql, params)).rows);
}

async function affected(actor: Actor, sql: string, params: unknown[] = []): Promise<number> {
  return as(actor, async (tx) => (await tx.query(sql, params)).affectedRows ?? 0);
}

async function createOrg(actor: Actor, name: string, slug: string): Promise<string> {
  const [org] = await rows<{ id: string }>(actor, 'select id from public.create_organization($1, $2)', [name, slug]);
  assert.ok(org, 'create_organization returned no row');
  return org.id;
}

async function roleOf(orgId: string, user: UserName): Promise<string | undefined> {
  const [row] = await rows<{ role: string }>(
    'service',
    'select role from public.memberships where org_id = $1 and user_id = $2',
    [orgId, USERS[user]],
  );
  return row?.role;
}

const PERMISSION_DENIED = /permission denied/;
const RLS_VIOLATION = /row-level security/;
const LAST_OWNER = /must keep at least one owner/;

describe('core tenancy and row-level security', () => {
  let acme: string;
  let globex: string;

  before(async () => {
    db = await bootDatabase();
    for (const [name, id] of Object.entries(USERS)) {
      await db.query('insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3::jsonb)', [
        id,
        `${name}@example.test`,
        JSON.stringify({ full_name: name }),
      ]);
    }
  });

  after(async () => {
    await db.close();
  });

  test('every new auth user gets a profile', async () => {
    const profiles = await rows<{ full_name: string }>('service', 'select full_name from public.profiles order by full_name');
    assert.deepEqual(
      profiles.map((p) => p.full_name),
      ['alice', 'bob', 'carol', 'dave'],
    );
  });

  test('creating an organization makes the caller its only owner', async () => {
    acme = await createOrg('alice', 'Acme Indústria', 'acme');
    globex = await createOrg('bob', 'Globex Serviços', 'globex');

    assert.equal(await roleOf(acme, 'alice'), 'owner');
    assert.equal(await roleOf(globex, 'bob'), 'owner');
    assert.equal(await roleOf(acme, 'bob'), undefined);
  });

  test('anonymous callers can neither create nor read organizations', async () => {
    await assert.rejects(createOrg('anon', 'Intruder', 'intruder'), PERMISSION_DENIED);
    await assert.rejects(rows('anon', 'select * from public.organizations'), PERMISSION_DENIED);
  });

  test('users only see the organizations they belong to', async () => {
    const slugsFor = async (actor: Actor) =>
      (await rows<{ slug: string }>(actor, 'select slug from public.organizations order by slug')).map((o) => o.slug);

    assert.deepEqual(await slugsFor('alice'), ['acme']);
    assert.deepEqual(await slugsFor('bob'), ['globex']);
    assert.deepEqual(await slugsFor('carol'), []);
  });

  test("a user cannot read or change another organization's data", async () => {
    assert.equal((await rows('bob', 'select * from public.organizations where id = $1', [acme])).length, 0);
    assert.equal((await rows('bob', 'select * from public.memberships where org_id = $1', [acme])).length, 0);
    assert.equal((await rows('bob', 'select * from public.audit_log where org_id = $1', [acme])).length, 0);
    assert.equal(await affected('bob', "update public.organizations set name = 'Hacked' where id = $1", [acme]), 0);
    assert.equal(await affected('bob', 'delete from public.memberships where org_id = $1', [acme]), 0);

    const [org] = await rows<{ name: string }>('service', 'select name from public.organizations where id = $1', [acme]);
    assert.equal(org?.name, 'Acme Indústria');
    assert.equal(await roleOf(acme, 'alice'), 'owner');

    const [probe] = await rows<{ role: string | null; member: boolean }>(
      'bob',
      'select public.current_org_role($1) as role, public.is_org_member($1) as member',
      [acme],
    );
    assert.deepEqual(probe, { role: null, member: false });
  });

  test('application roles cannot write tenancy tables directly', async () => {
    await assert.rejects(
      affected('alice', "insert into public.organizations (name, slug) values ('Shadow', 'shadow')"),
      PERMISSION_DENIED,
    );
    await assert.rejects(
      affected('alice', "insert into public.memberships (org_id, user_id, role) values ($1, $2, 'owner')", [
        acme,
        USERS.bob,
      ]),
      PERMISSION_DENIED,
    );
    await assert.rejects(
      affected('alice', "insert into public.audit_log (org_id, actor_type, action) values ($1, 'user', 'fake.event')", [
        acme,
      ]),
      PERMISSION_DENIED,
    );
    await assert.rejects(affected('alice', "update public.audit_log set action = 'x.y'"), PERMISSION_DENIED);
    await assert.rejects(affected('alice', 'delete from public.audit_log'), PERMISSION_DENIED);
    await assert.rejects(
      affected('alice', 'update public.organizations set created_by = $1 where id = $2', [USERS.bob, acme]),
      PERMISSION_DENIED,
    );
  });

  test('members cannot manage the organization, escalate, or read the audit trail', async () => {
    // Server-side insert stands in for invitation acceptance (phase 1).
    await affected(
      'service',
      "insert into public.memberships (org_id, user_id, role) values ($1, $2, 'member'), ($1, $3, 'member')",
      [acme, USERS.carol, USERS.dave],
    );

    assert.equal((await rows('carol', 'select * from public.organizations where id = $1', [acme])).length, 1);
    assert.equal(await affected('carol', "update public.organizations set name = 'Mine' where id = $1", [acme]), 0);
    assert.equal(
      await affected('carol', "update public.memberships set role = 'owner' where org_id = $1 and user_id = $2", [
        acme,
        USERS.carol,
      ]),
      0,
    );
    assert.equal((await rows('carol', 'select * from public.audit_log where org_id = $1', [acme])).length, 0);
    assert.equal(await roleOf(acme, 'carol'), 'member');
  });

  test('owners manage every role; admins manage only members and viewers', async () => {
    const setRole = (actor: Actor, user: UserName, role: string) =>
      affected(actor, 'update public.memberships set role = $1 where org_id = $2 and user_id = $3', [
        role,
        acme,
        USERS[user],
      ]);

    assert.equal(await setRole('alice', 'carol', 'admin'), 1);
    assert.equal(await setRole('carol', 'dave', 'viewer'), 1);
    assert.equal(await roleOf(acme, 'dave'), 'viewer');

    await assert.rejects(setRole('carol', 'dave', 'admin'), RLS_VIOLATION);
    assert.equal(await setRole('carol', 'carol', 'owner'), 0);
    assert.equal(await setRole('carol', 'alice', 'member'), 0);

    assert.equal(await roleOf(acme, 'carol'), 'admin');
    assert.equal(await roleOf(acme, 'alice'), 'owner');

    const trail = await rows<{ action: string }>('carol', 'select action from public.audit_log where org_id = $1', [acme]);
    assert.ok(trail.some((e) => e.action === 'membership.role_changed'));
  });

  test('an organization always keeps at least one owner', async () => {
    await assert.rejects(
      affected('alice', "update public.memberships set role = 'admin' where org_id = $1 and user_id = $2", [
        acme,
        USERS.alice,
      ]),
      LAST_OWNER,
    );
    await assert.rejects(
      affected('alice', 'delete from public.memberships where org_id = $1 and user_id = $2', [acme, USERS.alice]),
      LAST_OWNER,
    );

    assert.equal(
      await affected('alice', "update public.memberships set role = 'owner' where org_id = $1 and user_id = $2", [
        acme,
        USERS.carol,
      ]),
      1,
    );
    assert.equal(
      await affected('alice', "update public.memberships set role = 'admin' where org_id = $1 and user_id = $2", [
        acme,
        USERS.alice,
      ]),
      1,
    );
    assert.equal(await roleOf(acme, 'carol'), 'owner');
    assert.equal(await roleOf(acme, 'alice'), 'admin');
  });

  test('profiles are visible only to people who share an organization', async () => {
    const namesFor = async (actor: Actor) =>
      (await rows<{ full_name: string }>(actor, 'select full_name from public.profiles order by full_name')).map(
        (p) => p.full_name,
      );

    assert.deepEqual(await namesFor('bob'), ['bob']);
    assert.deepEqual(await namesFor('alice'), ['alice', 'carol', 'dave']);

    assert.equal(
      await affected('alice', "update public.profiles set full_name = 'Renamed' where id = $1", [USERS.carol]),
      0,
    );
    assert.equal(
      await affected('alice', "update public.profiles set full_name = 'Alice A.' where id = $1", [USERS.alice]),
      1,
    );
  });

  test('members can leave, and every membership change is audited', async () => {
    assert.equal(
      await affected('dave', 'delete from public.memberships where org_id = $1 and user_id = $2', [acme, USERS.dave]),
      1,
    );

    const trail = await rows<{ action: string; actor_type: string; target_id: string }>(
      'service',
      'select action, actor_type, target_id from public.audit_log where org_id = $1 order by id',
      [acme],
    );
    const actions = trail.map((e) => e.action);
    assert.equal(actions[0], 'organization.created');
    assert.equal(actions.filter((a) => a === 'membership.created').length, 3);
    assert.ok(actions.includes('membership.role_changed'));
    assert.ok(trail.some((e) => e.action === 'membership.removed' && e.target_id === USERS.dave));
    assert.ok(trail.some((e) => e.action === 'membership.created' && e.actor_type === 'system'));
  });

  test('deleting an organization removes its data without tripping the owner guard', async () => {
    assert.equal(await affected('service', 'delete from public.organizations where id = $1', [globex]), 1);

    const [left] = await rows<{ memberships: number; events: number }>(
      'service',
      `select (select count(*)::int from public.memberships where org_id = $1) as memberships,
              (select count(*)::int from public.audit_log  where org_id = $1) as events`,
      [globex],
    );
    assert.deepEqual(left, { memberships: 0, events: 0 });
    assert.equal((await rows('bob', 'select * from public.organizations')).length, 0);
  });
});
