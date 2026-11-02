/** Routes reachable without a session. */
export const PUBLIC_PATHS = ['/entrar', '/cadastro', '/verifique-o-email', '/auth'] as const;

/** Signed-in users are sent away from these to the dashboard. */
export const GUEST_ONLY_PATHS = ['/entrar', '/cadastro'] as const;

export const DEFAULT_AFTER_SIGN_IN = '/painel';

export function matchesPath(pathname: string, paths: readonly string[]): boolean {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * Accepts only same-site relative paths for post-login redirects, so a crafted
 * `next` parameter cannot send users to another site (open redirect).
 */
export function safeNextPath(value: unknown, fallback: string = DEFAULT_AFTER_SIGN_IN): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 512) return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  if (/[\u0000-\u001f]/.test(value)) return fallback;
  if (matchesPath(value.split(/[?#]/)[0] ?? '', GUEST_ONLY_PATHS)) return fallback;
  return value;
}

export type RouteDecision = { kind: 'continue' } | { kind: 'redirect'; to: string };

/**
 * Optimistic routing done by the proxy for every request.
 * `to` is a same-site path (with query string) to redirect to.
 */
export function decideRoute(pathname: string, search: URLSearchParams, signedIn: boolean): RouteDecision {
  // Supabase falls back to the Site URL (/) when an e-mail link's redirect is not
  // allowed: forward the one-time code (or the error) to the auth routes.
  if (pathname === '/') {
    const code = search.get('code');
    if (code) {
      const params = new URLSearchParams({ code, next: DEFAULT_AFTER_SIGN_IN });
      return { kind: 'redirect', to: `/auth/callback?${params}` };
    }
    if (search.has('error_code') || search.has('error')) {
      return { kind: 'redirect', to: '/entrar?erro=link' };
    }
  }

  if (!signedIn && !matchesPath(pathname, PUBLIC_PATHS)) {
    if (pathname === '/') return { kind: 'redirect', to: '/entrar' };
    const query = search.toString();
    const params = new URLSearchParams({ next: safeNextPath(query ? `${pathname}?${query}` : pathname) });
    return { kind: 'redirect', to: `/entrar?${params}` };
  }

  if (signedIn && matchesPath(pathname, GUEST_ONLY_PATHS)) {
    return { kind: 'redirect', to: safeNextPath(search.get('next')) };
  }

  return { kind: 'continue' };
}
