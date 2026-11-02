-- =============================================================================
-- MAGNUS OS · isolation smoke test for a HOSTED Supabase database
--
-- Run after applying migrations to staging or production (SQL editor or the
-- Supabase MCP `execute_sql`). It creates throwaway users and organizations,
-- checks the tenancy rules through the real API roles, then ALWAYS aborts with
-- `QA_RESULT ...` so every row it wrote is rolled back. Read the result from
-- the error message: every item must end in "(ok)".
--
-- The PGlite suite (npm run test:db) is the exhaustive one; this script only
-- proves the hosted database behaves the same way.
-- =============================================================================

do $qa$
declare
  v_alice uuid := gen_random_uuid();
  v_bob   uuid := gen_random_uuid();
  v_carol uuid := gen_random_uuid();
  v_acme  uuid;
  v_n     int;
  v_tok   text;
  v_role  text;
  v_out   text := '';
begin
  insert into auth.users (id, aud, role, email, email_confirmed_at, raw_user_meta_data)
  values (v_alice, 'authenticated', 'authenticated', 'qa-alice@magnus.invalid', now(), '{"full_name":"QA Alice"}'),
         (v_bob,   'authenticated', 'authenticated', 'qa-bob@magnus.invalid',   now(), '{"full_name":"QA Bob"}'),
         (v_carol, 'authenticated', 'authenticated', 'qa-carol@magnus.invalid', now(), '{"full_name":"QA Carol"}');
  select count(*) into v_n from public.profiles where id in (v_alice, v_bob, v_carol);
  v_out := v_out || format('[1] perfis criados pelo gatilho: %s/3 ', v_n);

  -- Alice (owner of QA Acme)
  perform set_config('request.jwt.claims', json_build_object('sub', v_alice, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select id into v_acme from public.create_organization('QA Acme', 'qa-acme-isolation');
  select token into v_tok from public.create_invitation(v_acme, 'qa-carol@magnus.invalid', 'member');
  begin
    insert into public.memberships (org_id, user_id, role) values (v_acme, v_bob, 'owner');
    v_out := v_out || '[2] insert direto em memberships: PERMITIDO (FALHA) ';
  exception when insufficient_privilege then
    v_out := v_out || '[2] insert direto em memberships: negado (ok) ';
  end;
  execute 'reset role';

  -- Bob (owner of another organization)
  perform set_config('request.jwt.claims', json_build_object('sub', v_bob, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform public.create_organization('QA Globex', 'qa-globex-isolation');
  select count(*) into v_n from public.organizations where id = v_acme;
  v_out := v_out || format('[3] Bob ve a org da Alice: %s linha(s) %s ', v_n, case when v_n = 0 then '(ok)' else '(FALHA)' end);
  update public.organizations set name = 'Hacked' where id = v_acme;
  get diagnostics v_n = row_count;
  v_out := v_out || format('[4] Bob altera a org da Alice: %s linha(s) %s ', v_n, case when v_n = 0 then '(ok)' else '(FALHA)' end);
  select count(*) into v_n from public.memberships where org_id = v_acme;
  v_out := v_out || format('[5] Bob ve membros da Alice: %s %s ', v_n, case when v_n = 0 then '(ok)' else '(FALHA)' end);
  begin
    perform public.accept_invitation(v_tok);
    v_out := v_out || '[6] Bob usa convite da Carol: ACEITO (FALHA) ';
  exception when sqlstate 'MG002' then
    v_out := v_out || '[6] Bob usa convite da Carol: recusado MG002 (ok) ';
  end;
  execute 'reset role';

  -- Carol (invited member)
  perform set_config('request.jwt.claims', json_build_object('sub', v_carol, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform public.accept_invitation(v_tok);
  select role::text into v_role from public.memberships where org_id = v_acme and user_id = v_carol;
  v_out := v_out || format('[7] Carol aceita convite, papel: %s %s ', v_role, case when v_role = 'member' then '(ok)' else '(FALHA)' end);
  update public.memberships set role = 'owner' where org_id = v_acme and user_id = v_carol;
  get diagnostics v_n = row_count;
  v_out := v_out || format('[8] Carol se promove a owner: %s linha(s) %s ', v_n, case when v_n = 0 then '(ok)' else '(FALHA)' end);
  select count(*) into v_n from public.audit_log where org_id = v_acme;
  v_out := v_out || format('[9] membro le auditoria: %s %s ', v_n, case when v_n = 0 then '(ok)' else '(FALHA)' end);
  execute 'reset role';

  -- Anonymous caller
  perform set_config('request.jwt.claims', '', true);
  execute 'set local role anon';
  begin
    select count(*) into v_n from public.organizations;
    v_out := v_out || '[10] anon le organizations: PERMITIDO (FALHA) ';
  exception when insufficient_privilege then
    v_out := v_out || '[10] anon le organizations: negado (ok) ';
  end;
  begin
    perform private.is_org_member(v_acme);
    v_out := v_out || '[11] anon chama helper privado: PERMITIDO (FALHA) ';
  exception when insufficient_privilege then
    v_out := v_out || '[11] anon chama helper privado: negado (ok) ';
  end;
  execute 'reset role';

  -- Alice reads her audit trail
  perform set_config('request.jwt.claims', json_build_object('sub', v_alice, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into v_n from public.audit_log where org_id = v_acme;
  v_out := v_out || format('[12] owner le auditoria da propria org: %s eventos %s', v_n, case when v_n >= 4 then '(ok)' else '(FALHA)' end);
  execute 'reset role';

  -- Abort on purpose so every test row is rolled back.
  raise exception 'QA_RESULT %', v_out;
end
$qa$;
