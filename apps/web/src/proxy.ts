import type { NextRequest } from 'next/server';
import { decideRoute } from '@/lib/auth/redirects';
import { redirectWithSession, refreshSession } from '@/lib/supabase/proxy-session';

/**
 * Keeps the auth session fresh and does the optimistic routing (see decideRoute).
 * Pages still verify the session themselves (lib/auth/session.ts).
 */
export async function proxy(request: NextRequest) {
  const session = await refreshSession(request);
  const decision = decideRoute(request.nextUrl.pathname, request.nextUrl.searchParams, session.userId !== null);

  return decision.kind === 'redirect'
    ? redirectWithSession(new URL(decision.to, request.url), session)
    : session.response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)'],
};
