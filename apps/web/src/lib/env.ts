/**
 * Public configuration read at request time (never at import time, so builds
 * without credentials still succeed). NEXT_PUBLIC_* values are inlined by
 * Next.js, which is why each one is referenced literally.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Copy .env.example to apps/web/.env.local.`);
  }
  return value;
}

export function getSupabaseEnv() {
  return {
    url: required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKey: required(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };
}

/** Base URL used in links sent by e-mail; must be in Supabase Auth's redirect allow list. */
export function getSiteUrl(): string {
  return required('NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL).replace(/\/+$/, '');
}

export function isGoogleSignInEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === 'true';
}
