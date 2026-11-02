/**
 * Test database for migration and RLS tests.
 *
 * Boots an in-memory Postgres (PGlite), loads the Supabase shim and every
 * migration in order, creates the given auth users, and lets tests act as
 * anon, as a signed-in user (JWT subject) or as service_role — the same way
 * PostgREST sets up each request.
 */
import { readdir, readFile } from 'node:fs/promises';
import { PGlite, type Transaction } from '@electric-sql/pglite';

const SUPABASE_DIR = new URL('../../', import.meta.url);

export interface TestUserOptions {
  /** Users whose e-mail is NOT confirmed (Supabase leaves email_confirmed_at null). */
  unconfirmed?: readonly string[];
}

export interface TestDb<U extends string> {
  readonly pg: PGlite;
  readonly users: Readonly<Record<U, string>>;
  as<T>(actor: Actor<U>, fn: (tx: Transaction) => Promise<T>): Promise<T>;
  rows<T>(actor: Actor<U>, sql: string, params?: unknown[]): Promise<T[]>;
  affected(actor: Actor<U>, sql: string, params?: unknown[]): Promise<number>;
  close(): Promise<void>;
}

export type Actor<U extends string> = U | 'anon' | 'service';

export async function createTestDb<U extends string>(
  users: Record<U, string>,
  options: TestUserOptions = {},
): Promise<TestDb<U>> {
  const pg = await PGlite.create();
  await pg.exec(await readFile(new URL('tests/support/supabase-shim.sql', SUPABASE_DIR), 'utf8'));

  const migrationsDir = new URL('migrations/', SUPABASE_DIR);
  const migrations = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();
  for (const file of migrations) {
    await pg.exec(await readFile(new URL(file, migrationsDir), 'utf8'));
  }

  for (const [name, id] of Object.entries<string>(users)) {
    const confirmed = !options.unconfirmed?.includes(name);
    await pg.query(
      `insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data)
       values ($1, $2, case when $3 then now() end, $4::jsonb)`,
      [id, emailOf(name), confirmed, JSON.stringify({ full_name: name })],
    );
  }

  const as = async <T>(actor: Actor<U>, fn: (tx: Transaction) => Promise<T>): Promise<T> =>
    pg.transaction(async (tx) => {
      if (actor === 'anon') {
        await tx.exec('set local role anon');
      } else if (actor === 'service') {
        await tx.exec('set local role service_role');
      } else {
        await tx.exec('set local role authenticated');
        await tx.query("select set_config('request.jwt.claims', $1, true)", [
          JSON.stringify({ sub: users[actor], role: 'authenticated' }),
        ]);
      }
      return fn(tx);
    });

  return {
    pg,
    users,
    as,
    rows: (actor, sql, params = []) => as(actor, async (tx) => (await tx.query(sql, params)).rows as never),
    affected: (actor, sql, params = []) => as(actor, async (tx) => (await tx.query(sql, params)).affectedRows ?? 0),
    close: () => pg.close(),
  };
}

/** E-mail given to each test user: `<name>@example.test`. */
export function emailOf(name: string): string {
  return `${name}@example.test`;
}

/** assert.rejects validator matching a Postgres SQLSTATE. */
export function sqlState(code: string): (error: unknown) => boolean {
  return (error) => typeof error === 'object' && error !== null && (error as { code?: unknown }).code === code;
}
