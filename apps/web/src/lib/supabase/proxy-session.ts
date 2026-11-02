import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@magnus/db';
import { getSupabaseEnv } from '@/lib/env';

export interface RefreshedSession {
  response: NextResponse;
  userId: string | null;
}

/**
 * Refreshes the auth session on every request and reports who is signed in.
 * Refreshed cookies are written to both the forwarded request and the response.
 */
export async function refreshSession(request: NextRequest): Promise<RefreshedSession> {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
      },
    },
  });

  // Validates the JWT (signature and expiry), not just its presence in a cookie.
  const { data } = await supabase.auth.getClaims();
  const subject = data?.claims?.sub;

  return { response, userId: typeof subject === 'string' ? subject : null };
}

/** Redirect that keeps any session cookies refreshed during this request. */
export function redirectWithSession(target: URL, session: RefreshedSession): NextResponse {
  const redirect = NextResponse.redirect(target);
  for (const cookie of session.response.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}
