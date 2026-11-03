'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { authErrorKey } from '@/lib/auth/errors';
import { safeNextPath } from '@/lib/auth/redirects';
import { getSiteUrl, isGoogleSignInEnabled } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ptBR } from '@/content/pt-BR';

type Field = 'fullName' | 'email' | 'password';

export interface AuthFormState {
  status: 'idle' | 'error' | 'sent';
  message?: string;
  fieldErrors?: Partial<Record<Field, string>>;
  /** Echoed back so the form keeps what the person typed (never the password). */
  email?: string;
  fullName?: string;
}

const v = ptBR.auth.validation;
const email = z.string().trim().toLowerCase().pipe(z.email(v.email));

const signInSchema = z.object({
  email,
  password: z.string().min(1, v.passwordRequired),
  next: z.string().optional(),
});

const magicLinkSchema = z.object({ email, next: z.string().optional() });

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, v.fullName).max(120, v.fullName),
  email,
  password: z.string().min(8, v.passwordLength).max(72, v.passwordLength),
});

function fieldErrorsOf(error: z.ZodError): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if ((field === 'fullName' || field === 'email' || field === 'password') && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function callbackUrl(next: string): string {
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function signInWithPassword(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', fieldErrors: fieldErrorsOf(parsed.error), email: text(formData, 'email') };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return { status: 'error', message: ptBR.auth.errors[authErrorKey(error.code)], email: parsed.data.email };
  }

  redirect(safeNextPath(parsed.data.next));
}

export async function sendMagicLink(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = magicLinkSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', fieldErrors: fieldErrorsOf(parsed.error), email: text(formData, 'email') };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: false, emailRedirectTo: callbackUrl(safeNextPath(parsed.data.next)) },
  });

  // Only rate limits are reported; anything else gets the same answer as success,
  // so the form never reveals whether an account exists for the address.
  if (error && authErrorKey(error.code) === 'rateLimited') {
    return { status: 'error', message: ptBR.auth.errors.rateLimited, email: parsed.data.email };
  }
  return { status: 'sent', email: parsed.data.email };
}

export async function signUp(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: fieldErrorsOf(parsed.error),
      email: text(formData, 'email'),
      fullName: text(formData, 'fullName'),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName }, emailRedirectTo: callbackUrl('/painel') },
  });
  if (error) {
    return {
      status: 'error',
      message: ptBR.auth.errors[authErrorKey(error.code)],
      email: parsed.data.email,
      fullName: parsed.data.fullName,
    };
  }

  // With e-mail confirmation turned off the user is already signed in.
  redirect(data.session ? '/painel' : '/verifique-o-email');
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  if (!isGoogleSignInEnabled()) redirect('/entrar');

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callbackUrl(safeNextPath(formData.get('next'))) },
  });
  if (error || !data.url) redirect('/entrar?erro=google');
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/entrar');
}
