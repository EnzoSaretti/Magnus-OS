import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { decideRoute, matchesPath, PUBLIC_PATHS, safeNextPath } from '../src/lib/auth/redirects.ts';
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

describe('decideRoute (proxy routing)', () => {
  const route = (path: string, signedIn: boolean) => {
    const url = new URL(path, 'http://localhost:3000');
    return decideRoute(url.pathname, url.searchParams, signedIn);
  };

  test('visitors are sent to sign-in, keeping where they were going', () => {
    assert.deepEqual(route('/agentes?x=1', false), { kind: 'redirect', to: '/entrar?next=%2Fagentes%3Fx%3D1' });
    assert.deepEqual(route('/', false), { kind: 'redirect', to: '/entrar' });
    assert.deepEqual(route('/cadastro', false), { kind: 'continue' });
    assert.deepEqual(route('/auth/callback?code=abc', false), { kind: 'continue' });
  });

  test('signed-in users skip the sign-in screens, only to safe targets', () => {
    assert.deepEqual(route('/entrar?next=/tarefas', true), { kind: 'redirect', to: '/tarefas' });
    assert.deepEqual(route('/entrar?next=https://evil.example', true), { kind: 'redirect', to: '/painel' });
    assert.deepEqual(route('/painel', true), { kind: 'continue' });
  });

  test('e-mail links that fell back to the site root still complete sign-in', () => {
    assert.deepEqual(route('/?code=abc123', false), {
      kind: 'redirect',
      to: '/auth/callback?code=abc123&next=%2Fpainel',
    });
    assert.deepEqual(route('/?error=access_denied&error_code=otp_expired', false), {
      kind: 'redirect',
      to: '/entrar?erro=link',
    });
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
