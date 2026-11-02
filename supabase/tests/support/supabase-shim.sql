-- =============================================================================
-- Test-only shim of the Supabase platform pieces our migrations depend on.
-- Loaded into a fresh PGlite instance BEFORE the migrations. Never applied to a
-- real Supabase project (which already provides all of this).
-- =============================================================================

-- API roles used by PostgREST. service_role bypasses RLS, as on the platform.
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

grant usage on schema public to anon, authenticated, service_role;

-- Minimal auth schema: users table and auth.uid() reading the JWT claims the
-- same way Supabase does.
create schema auth;
grant usage on schema auth to anon, authenticated, service_role;

create table auth.users (
  id                  uuid primary key,
  email               text unique,
  email_confirmed_at  timestamptz,
  raw_user_meta_data  jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);

create function auth.uid()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

grant execute on function auth.uid() to anon, authenticated, service_role;

-- Supabase grants broad default privileges on public to the API roles and relies
-- on RLS. Mirror that so tests exercise the same starting point as production
-- and prove our migrations' explicit revokes/grants do the real work.
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
