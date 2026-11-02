-- =============================================================================
-- MAGNUS OS · 20261101120000_invitations
--
-- Invitations to join an organization.
--   * create_invitation() returns the raw token once (to be e-mailed); only
--     its SHA-256 is stored.
--   * Admins invite members and viewers; owners may also invite admins.
--     Nobody is invited as owner: ownership is granted by promotion.
--   * accept_invitation() requires a signed-in user whose CONFIRMED e-mail
--     matches the invitation. Tokens are single use and expire in 7 days.
--   * At most one open invitation per e-mail and organization; inviting the
--     same address again revokes the previous invitation.
--
-- Error codes raised here (mapped to messages by the app):
--   MG001  invitation is invalid, expired, revoked or already used
--   MG002  invitation was sent to a different (or unconfirmed) e-mail
--   MG003  the person is already a member of the organization
--   42501  caller may not invite with / revoke that role
--
-- Status: draft, not applied to any hosted database yet.
-- Tests:  supabase/tests/invitations.test.ts
-- =============================================================================

create table public.invitations (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  email        text not null
               check (char_length(email) <= 320 and email = lower(email) and email ~ '^[^@\s]+@[^@\s]+$'),
  role         public.org_role not null default 'member' check (role <> 'owner'),
  token_hash   bytea not null unique,
  invited_by   uuid references public.profiles (id) on delete set null,
  expires_at   timestamptz not null,
  accepted_at  timestamptz,
  accepted_by  uuid references public.profiles (id) on delete set null,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now(),
  constraint invitations_single_outcome check (accepted_at is null or revoked_at is null)
);

create unique index invitations_one_open_per_email_idx
  on public.invitations (org_id, email)
  where accepted_at is null and revoked_at is null;

create index invitations_org_created_idx on public.invitations (org_id, created_at desc);

comment on column public.invitations.token_hash is
  'SHA-256 of the invitation token. The token itself is never stored.';

-- -----------------------------------------------------------------------------
-- Commands
-- -----------------------------------------------------------------------------

create function public.create_invitation(
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
  if p_role = 'owner' or not public.can_manage_role(p_org_id, p_role) then
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

create function public.accept_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user  uuid := (select auth.uid());
  v_email text;
  v_inv   public.invitations;
begin
  if v_user is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select * into v_inv
  from public.invitations i
  where i.token_hash = sha256(convert_to(coalesce(p_token, ''), 'UTF8'))
    and i.accepted_at is null
    and i.revoked_at is null
    and i.expires_at > now()
  for update;

  if not found then
    raise exception 'invitation is invalid or has expired' using errcode = 'MG001';
  end if;

  select lower(u.email) into v_email
  from auth.users u
  where u.id = v_user
    and u.email_confirmed_at is not null;

  if v_email is distinct from v_inv.email then
    raise exception 'invitation was sent to a different e-mail address' using errcode = 'MG002';
  end if;

  if exists (select 1 from public.memberships m where m.org_id = v_inv.org_id and m.user_id = v_user) then
    raise exception 'already a member of this organization' using errcode = 'MG003';
  end if;

  update public.invitations
     set accepted_at = now(), accepted_by = v_user
   where id = v_inv.id;

  insert into public.audit_log (org_id, actor_type, actor_id, action, target_type, target_id, metadata)
  values (v_inv.org_id, 'user', v_user, 'invitation.accepted', 'invitation', v_inv.id::text,
          jsonb_build_object('role', v_inv.role));

  insert into public.memberships (org_id, user_id, role)
  values (v_inv.org_id, v_user, v_inv.role);

  return v_inv.org_id;
end;
$$;

create function public.revoke_invitation(p_invitation_id uuid)
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
     and public.can_manage_role(i.org_id, i.role)
  returning * into v_inv;

  if not found then
    raise exception 'invitation is invalid or has expired' using errcode = 'MG001';
  end if;

  insert into public.audit_log (org_id, actor_type, actor_id, action, target_type, target_id, metadata)
  values (v_inv.org_id, 'user', (select auth.uid()), 'invitation.revoked', 'invitation', v_inv.id::text,
          jsonb_build_object('email', v_inv.email, 'role', v_inv.role));
end;
$$;

-- What the invitation page shows before sign-in. Only the token holder can
-- call it meaningfully; an unknown, used or expired token returns no row.
create function public.invitation_preview(p_token text)
returns table (organization_name text, role public.org_role, email text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select o.name, i.role, i.email, i.expires_at
  from public.invitations i
  join public.organizations o on o.id = i.org_id
  where i.token_hash = sha256(convert_to(coalesce(p_token, ''), 'UTF8'))
    and i.accepted_at is null
    and i.revoked_at is null
    and i.expires_at > now()
$$;

-- -----------------------------------------------------------------------------
-- Row-level security and privileges
-- -----------------------------------------------------------------------------

alter table public.invitations enable row level security;

-- Admins see their organization's invitations; writes only through the commands above.
create policy invitations_select on public.invitations
  for select to authenticated
  using (public.has_org_role(org_id, 'admin'));

revoke all on public.invitations from public, anon, authenticated;

grant select (id, org_id, email, role, invited_by, expires_at, accepted_at, accepted_by, revoked_at, created_at)
  on public.invitations to authenticated;

grant all on public.invitations to service_role;

revoke execute on function
  public.create_invitation(uuid, text, public.org_role),
  public.accept_invitation(text),
  public.revoke_invitation(uuid),
  public.invitation_preview(text)
from public, anon;

grant execute on function
  public.create_invitation(uuid, text, public.org_role),
  public.accept_invitation(text),
  public.revoke_invitation(uuid)
to authenticated, service_role;

grant execute on function public.invitation_preview(text) to anon, authenticated, service_role;
