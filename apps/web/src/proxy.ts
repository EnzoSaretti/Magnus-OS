import type { NextRequest } from 'next/server';
import { GUEST_ONLY_PATHS, PUBLIC_PATHS, matchesPath, safeNextPath } from '@/lib/auth/redirects';
import { redirectWithSession, refreshSession } from '@/lib/supabase/proxy-session';

/**
 * Keeps the auth session fresh and does the optimistic routing:
 * visitors go to /entrar, signed-in users skip the auth screens.
 * Pages still verify the session themselves (lib/auth/session.ts).
 */
export async function proxy(request: NextRequest) {
  const session = await refreshSession(request);
  const { pathname, search } = request.nextUrl;

  if (!session.userId && !matchesPath(pathname, PUBLIC_PATHS)) {
    const target = new URL('/entrar', request.url);
    if (pathname !== '/') target.searchParams.set('next', safeNextPath(`${pathname}${search}`));
    return redirectWithSession(target, session);
  }

  if (session.userId && matchesPath(pathname, GUEST_ONLY_PATHS)) {
    const next = safeNextPath(request.nextUrl.searchParams.get('next'));
    return redirectWithSession(new URL(next, request.url), session);
  }

  return session.response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)'],
};
