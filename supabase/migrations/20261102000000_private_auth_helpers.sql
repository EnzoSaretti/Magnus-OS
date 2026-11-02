-- =============================================================================
-- MAGNUS OS · 20261102000000_private_auth_helpers
--
-- Moves the authorization helpers used by RLS policies from the API-exposed
-- `public` schema to `private`, so PostgREST no longer publishes them as RPC
-- endpoints (Supabase security advisor, lint 0029). Policies and commands now
-- call private.*; the public copies are dropped.
--
-- Also indexes foreign keys flagged by the performance advisor (lint 0001).
--
-- Tests: supabase/tests/rls-tenancy.test.ts, supabase/tests/invitations.test.ts
-- =============================================================================

create schema if not exists private;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Helpers (same semantics as the public versions they replace)
-- -----------------------------------------------------------------------------

create function private.current_org_role(p_org_id uuid)
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

create function private.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_org_role(p_org_id) is not null
$$;

create function private.has_org_role(p_org_id uuid, p_min_role public.org_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_org_role(p_org_id) >= p_min_role, false)
$$;

-- Owners may act on any membership; admins only on members and viewers.
create function private.can_manage_role(p_org_id uuid, p_target_role public.org_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_org_role(p_org_id, 'owner')
      or (private.has_org_role(p_org_id, 'admin') and p_target_role < 'admin')
$$;

-- True when the caller and p_user_id share at least one organization.
create function private.shares_org_with(p_user_id uuid)
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

-- Policies run with the caller's privileges, so authenticated keeps EXECUTE;
-- the schema is simply not exposed through the Data API.
revoke execute on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Policies
-- -----------------------------------------------------------------------------

alter policy organizations_select on public.organizations
  using (private.is_org_member(id));

alter policy organizations_update on public.organizations
  using (private.has_org_role(id, 'admin'))
  with check (private.has_org_role(id, 'admin'));

alter policy profiles_select on public.profiles
  using (id = (select auth.uid()) or private.shares_org_with(id));

alter policy memberships_select on public.memberships
  using (private.is_org_member(org_id));

alter policy memberships_update on public.memberships
  using (private.can_manage_role(org_id, role))
  with check (private.can_manage_role(org_id, role));

alter policy memberships_delete on public.memberships
  using (user_id = (select auth.uid()) or private.can_manage_role(org_id, role));

alter policy audit_log_select on public.audit_log
  using (private.has_org_role(org_id, 'admin'));

alter policy invitations_select on public.invitations
  using (private.has_org_role(org_id, 'admin'));

-- -----------------------------------------------------------------------------
-- Commands that called the public helpers
-- -----------------------------------------------------------------------------

create or replace function public.create_invitation(
  p_org_id uuid,
  p_email  text,
  p_role   public.org_role default 'member'
)
returns table (invitation_id uuid, token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_actor uuid := (select auth.uid());
  v_email text := lower(trim(p_email));
  v_token text;
  v_inv   public.invitations;
begin
  if v_actor is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if p_role = 'owner' or not private.can_manage_role(p_org_id, p_role) then
    raise exception 'not allowed to invite with role %', p_role using errcode = '42501';
  end if;
  if exists (
    select 1
    from public.memberships m
    join auth.users u on u.id = m.user_id
    where m.org_id = p_org_id
      and lower(u.email) = v_email
  ) then
    raise exception 'already a member of this organization' using errcode = 'MG003';
  end if;

  update public.invitations i
     set revoked_at = now()
   where i.org_id = p_org_id
     and i.email = v_email
     and i.accepted_at is null
     and i.revoked_at is null;

  -- Two v4 UUIDs = 244 bits from the server's strong random source, hex-encoded.
  v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');

  insert into public.invitations (org_id, email, role, token_hash, invited_by, expires_at)
  values (p_org_id, v_email, p_role, sha256(convert_to(v_token, 'UTF8')), v_actor, now() + interval '7 days')
  returning * into v_inv;

  insert into public.audit_log (org_id, actor_type, actor_id, action, target_type, target_id, metadata)
  values (p_org_id, 'user', v_actor, 'invitation.created', 'invitation', v_inv.id::text,
          jsonb_build_object('email', v_email, 'role', p_role));

  return query select v_inv.id, v_token, v_inv.expires_at;
end;
$$;

create or replace function public.revoke_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.invitations;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  update public.invitations i
     set revoked_at = now()
   where i.id = p_invitation_id
     and i.accepted_at is null
     and i.revoked_at is null
     and private.can_manage_role(i.org_id, i.role)
  returning * into v_inv;

  if not found then
    raise exception 'invitation is invalid or has expired' using errcode = 'MG001';
  end if;

  insert into public.audit_log (org_id, actor_type, actor_id, action, target_type, target_id, metadata)
  values (v_inv.org_id, 'user', (select auth.uid()), 'invitation.revoked', 'invitation', v_inv.id::text,
          jsonb_build_object('email', v_inv.email, 'role', v_inv.role));
end;
$$;

-- -----------------------------------------------------------------------------
-- Remove the exposed copies
-- -----------------------------------------------------------------------------

drop function public.shares_org_with(uuid);
drop function public.can_manage_role(uuid, public.org_role);
drop function public.has_org_role(uuid, public.org_role);
drop function public.is_org_member(uuid);
drop function public.current_org_role(uuid);

-- -----------------------------------------------------------------------------
-- Indexes for foreign keys used by ON DELETE SET NULL
-- -----------------------------------------------------------------------------

create index organizations_created_by_idx on public.organizations (created_by);
create index invitations_invited_by_idx   on public.invitations (invited_by);
create index invitations_accepted_by_idx  on public.invitations (accepted_by);
