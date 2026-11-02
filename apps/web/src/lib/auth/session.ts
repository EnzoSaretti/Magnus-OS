import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface SessionUser {
  id: string;
  email: string | null;
}

/**
 * The signed-in user for this request, from a verified JWT. Cached per request.
 * This is the authoritative check; the proxy's redirect is only a fast path.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims || typeof claims.sub !== 'string') return null;
  return { id: claims.sub, email: typeof claims.email === 'string' ? claims.email : null };
});

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/entrar');
  return user;
}

export interface Profile {
  fullName: string | null;
  firstName: string | null;
}

/** The signed-in user's own profile row (readable under RLS). Cached per request. */
export const getProfile = cache(async (userId: string): Promise<Profile> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle();
  const fullName = data?.full_name?.trim() || null;
  return { fullName, firstName: fullName?.split(/\s+/)[0] ?? null };
});
