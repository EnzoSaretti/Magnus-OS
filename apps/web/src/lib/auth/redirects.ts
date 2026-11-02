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
