-- =============================================================================
-- MAGNUS OS · 20261101000000_core_tenancy
--
-- Multi-tenant foundation: organizations, profiles, memberships, audit_log,
-- authorization helpers and row-level security.
--
-- Rules enforced here (mirrored in packages/core/src/tenancy.ts):
--   * A user only sees organizations they belong to, and only that data.
--   * Organizations are created through create_organization(); the creator
--     becomes the first owner.
--   * Owners manage every membership; admins manage only members and viewers
--     and can never grant admin or owner.
--   * An organization always keeps at least one owner.
--   * audit_log is append-only for application roles and readable by admins.
--
-- Status: draft, not applied to any hosted database yet.
-- Tests:  supabase/tests/rls-tenancy.test.ts
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Types
-- -----------------------------------------------------------------------------

-- Declaration order IS the privilege order (viewer < member < admin < owner);
-- policies compare roles with < and >=. Add new roles with
-- ALTER TYPE ... ADD VALUE ... BEFORE/AFTER to keep the order meaningful.
create type public.org_role as enum ('viewer', 'member', 'admin', 'owner');

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 120),
  slug        text not null unique
              check (slug ~ '^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$'),
  settings    jsonb not null default '{}'::jsonb
              check (jsonb_typeof(settings) = 'object'),
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.organizations is
  'Tenant root. Every domain table carries org_id referencing this table.';

-- One row per auth user, created by trigger. Holds only what the product shows.
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text check (char_length(full_name) <= 120),
  avatar_url  text check (char_length(avatar_url) <= 2048),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.memberships (
  org_id      uuid not null references public.organizations (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  role        public.org_role not null default 'member',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index memberships_user_id_idx on public.memberships (user_id);

create table public.audit_log (
  id           bigint generated always as identity primary key,
  org_id       uuid not null references public.organizations (id) on delete cascade,
  actor_type   text not null check (actor_type in ('user', 'agent', 'system')),
  actor_id     uuid,
  action       text not null check (action ~ '^[a-z_]+(\.[a-z_]+)+$'),
  target_type  text,
  target_id    text,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index audit_log_org_created_idx on public.audit_log (org_id, created_at desc);

comment on table public.audit_log is
  'Append-only trail of security-relevant events. Written by triggers and server-side jobs only.';

-- -----------------------------------------------------------------------------
-- Authorization helpers
--
-- SECURITY DEFINER so policies can consult memberships without recursing into
-- memberships' own RLS. search_path is pinned to '' and every name is
-- schema-qualified to rule out search_path hijacking.
-- -----------------------------------------------------------------------------

create function public.current_org_role(p_org_id uuid)
returns public.org_role
language sql
stable
security definer
set search_path = ''
as $$
  select m.role
  from public.memberships m
  where m.org_id = p_org_id
    and m.user_id = (select auth.uid())
$$;

create function public.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_org_role(p_org_id) is not null
$$;

create function public.has_org_role(p_org_id uuid, p_min_role public.org_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_org_role(p_org_id) >= p_min_role, false)
$$;

-- Owners may act on any membership; admins only on members and viewers.
-- Used for both the current and the proposed role of a membership row.
create function public.can_manage_role(p_org_id uuid, p_target_role public.org_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_org_role(p_org_id, 'owner')
      or (public.has_org_role(p_org_id, 'admin') and p_target_role < 'admin')
$$;

-- True when the caller and p_user_id share at least one organization.
create function public.shares_org_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships mine
    join public.memberships theirs on theirs.org_id = mine.org_id
    where mine.user_id = (select auth.uid())
      and theirs.user_id = p_user_id
  )
$$;

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function public.set_updated_at();

-- Every auth user gets a profile.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 120));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- An organization can never be left without an owner. Skipped while the
-- organization itself is being deleted (cascade), which is a controlled
-- server-side operation.
create function public.ensure_org_keeps_an_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role <> 'owner' then
    return coalesce(new, old);
  end if;
  if tg_op = 'UPDATE' and new.role = 'owner' then
    return new;
  end if;
  if not exists (select 1 from public.organizations o where o.id = old.org_id) then
    return coalesce(new, old);
  end if;
  if not exists (
    select 1
    from public.memberships m
    where m.org_id = old.org_id
      and m.role = 'owner'
      and m.user_id <> old.user_id
  ) then
    raise exception 'organization % must keep at least one owner', old.org_id
      using errcode = 'P0001', hint = 'Promote another member to owner first.';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger memberships_keep_owner
  before update of role or delete on public.memberships
  for each row execute function public.ensure_org_keeps_an_owner();

-- Membership changes are always audited, whoever makes them.
create function public.audit_membership_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor  uuid := (select auth.uid());
  v_row    public.memberships := coalesce(new, old);
begin
  -- The organization is being deleted; its audit trail goes with it.
  if not exists (select 1 from public.organizations o where o.id = v_row.org_id) then
    return null;
  end if;

  insert into public.audit_log (org_id, actor_type, actor_id, action, target_type, target_id, metadata)
  values (
    v_row.org_id,
    case when v_actor is null then 'system' else 'user' end,
    v_actor,
    'membership.' || case tg_op when 'INSERT' then 'created'
                                when 'UPDATE' then 'role_changed'
                                else 'removed' end,
    'user',
    v_row.user_id::text,
    jsonb_strip_nulls(jsonb_build_object(
      'old_role', case when tg_op <> 'INSERT' then old.role end,
      'new_role', case when tg_op <> 'DELETE' then new.role end
    ))
  );
  return null;
end;
$$;

create trigger memberships_audit
  after insert or update of role or delete on public.memberships
  for each row execute function public.audit_membership_change();

create function public.audit_organization_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_log (org_id, actor_type, actor_id, action, target_type, target_id, metadata)
  values (
    new.id,
    case when (select auth.uid()) is null then 'system' else 'user' end,
    (select auth.uid()),
    'organization.updated',
    'organization',
    new.id::text,
    jsonb_build_object(
      'changed', array_remove(array[
        case when new.name     is distinct from old.name     then 'name' end,
        case when new.slug     is distinct from old.slug     then 'slug' end,
        case when new.settings is distinct from old.settings then 'settings' end
      ], null)
    )
  );
  return null;
end;
$$;

create trigger organizations_audit_update
  after update on public.organizations
  for each row execute function public.audit_organization_update();

-- -----------------------------------------------------------------------------
-- Commands
-- -----------------------------------------------------------------------------

-- Creates an organization and makes the caller its first owner, atomically.
create function public.create_organization(p_name text, p_slug text)
returns public.organizations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_org  public.organizations;
begin
  if v_user is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  insert into public.organizations (name, slug, created_by)
  values (trim(p_name), lower(trim(p_slug)), v_user)
  returning * into v_org;

  insert into public.audit_log (org_id, actor_type, actor_id, action, target_type, target_id)
  values (v_org.id, 'user', v_user, 'organization.created', 'organization', v_org.id::text);

  insert into public.memberships (org_id, user_id, role)
  values (v_org.id, v_user, 'owner');

  return v_org;
end;
$$;

-- -----------------------------------------------------------------------------
-- Row-level security
-- -----------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.profiles      enable row level security;
alter table public.memberships   enable row level security;
alter table public.audit_log     enable row level security;

-- organizations: members read; admins update; creation via create_organization();
-- deletion is a server-side process (soft delete + purge job, later phase).
create policy organizations_select on public.organizations
  for select to authenticated
  using (public.is_org_member(id));

create policy organizations_update on public.organizations
  for update to authenticated
  using (public.has_org_role(id, 'admin'))
  with check (public.has_org_role(id, 'admin'));

-- profiles: your own, plus people you share an organization with.
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.shares_org_with(id));

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- memberships: members see the roster. Rows are created by create_organization()
-- and, from phase 1, by invitation acceptance; there is no direct insert.
create policy memberships_select on public.memberships
  for select to authenticated
  using (public.is_org_member(org_id));

create policy memberships_update on public.memberships
  for update to authenticated
  using (public.can_manage_role(org_id, role))
  with check (public.can_manage_role(org_id, role));

create policy memberships_delete on public.memberships
  for delete to authenticated
  using (user_id = (select auth.uid()) or public.can_manage_role(org_id, role));

-- audit_log: admins read their organization's trail. No write policy exists.
create policy audit_log_select on public.audit_log
  for select to authenticated
  using (public.has_org_role(org_id, 'admin'));

-- -----------------------------------------------------------------------------
-- Privileges
--
-- Explicit, so the result does not depend on platform default privileges.
-- anon gets nothing; authenticated gets only what the policies above govern;
-- service_role (server-side jobs only) bypasses RLS by design.
-- -----------------------------------------------------------------------------

revoke all on public.organizations, public.profiles, public.memberships, public.audit_log
  from public, anon, authenticated;

grant select                      on public.organizations to authenticated;
grant update (name, slug, settings) on public.organizations to authenticated;

grant select                        on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

grant select, delete on public.memberships to authenticated;
grant update (role)  on public.memberships to authenticated;

grant select on public.audit_log to authenticated;

grant all on public.organizations, public.profiles, public.memberships, public.audit_log
  to service_role;

revoke execute on function
  public.current_org_role(uuid),
  public.is_org_member(uuid),
  public.has_org_role(uuid, public.org_role),
  public.can_manage_role(uuid, public.org_role),
  public.shares_org_with(uuid),
  public.create_organization(text, text),
  public.set_updated_at(),
  public.handle_new_user(),
  public.ensure_org_keeps_an_owner(),
  public.audit_membership_change(),
  public.audit_organization_update()
from public, anon;

revoke execute on function
  public.set_updated_at(),
  public.handle_new_user(),
  public.ensure_org_keeps_an_owner(),
  public.audit_membership_change(),
  public.audit_organization_update()
from authenticated;

grant execute on function
  public.current_org_role(uuid),
  public.is_org_member(uuid),
  public.has_org_role(uuid, public.org_role),
  public.can_manage_role(uuid, public.org_role),
  public.shares_org_with(uuid),
  public.create_organization(text, text)
to authenticated, service_role;
