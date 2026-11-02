import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesPath, PUBLIC_PATHS, safeNextPath } from '../src/lib/auth/redirects.ts';
import { authErrorKey } from '../src/lib/auth/errors.ts';

describe('safeNextPath (post-login redirect target)', () => {
  test('keeps same-site relative paths, including query strings', () => {
    assert.equal(safeNextPath('/agentes'), '/agentes');
    assert.equal(safeNextPath('/tarefas?status=aberta'), '/tarefas?status=aberta');
  });

  test('rejects anything that could leave the site', () => {
    for (const hostile of [
      'https://evil.example',
      '//evil.example',
      '/\\evil.example',
      'javascript:alert(1)',
      'agentes',
      '/painel\nSet-Cookie: x=1',
    ]) {
      assert.equal(safeNextPath(hostile), '/painel', hostile);
    }
  });

  test('falls back for missing, oversized or non-string values', () => {
    assert.equal(safeNextPath(undefined), '/painel');
    assert.equal(safeNextPath(''), '/painel');
    assert.equal(safeNextPath(42), '/painel');
    assert.equal(safeNextPath(`/${'a'.repeat(600)}`), '/painel');
  });

  test('never loops back into the sign-in screens', () => {
    assert.equal(safeNextPath('/entrar'), '/painel');
    assert.equal(safeNextPath('/cadastro?x=1'), '/painel');
  });
});

describe('public routes', () => {
  test('match exact paths and their children only', () => {
    assert.ok(matchesPath('/entrar', PUBLIC_PATHS));
    assert.ok(matchesPath('/auth/callback', PUBLIC_PATHS));
    assert.ok(!matchesPath('/entrarx', PUBLIC_PATHS));
    assert.ok(!matchesPath('/painel', PUBLIC_PATHS));
    assert.ok(!matchesPath('/', PUBLIC_PATHS));
  });
});

describe('authErrorKey', () => {
  test('maps known Supabase codes and defaults to unexpected', () => {
    assert.equal(authErrorKey('invalid_credentials'), 'invalidCredentials');
    assert.equal(authErrorKey('over_email_send_rate_limit'), 'rateLimited');
    assert.equal(authErrorKey('otp_expired'), 'linkExpired');
    assert.equal(authErrorKey('provider_disabled'), 'providerDisabled');
    assert.equal(authErrorKey('something_new'), 'unexpected');
    assert.equal(authErrorKey(undefined), 'unexpected');
  });
});
