import type { Metadata } from 'next';
import Link from 'next/link';
import { FormMessage } from '@/components/forms/form-message';
import { signInWithGoogle } from '@/lib/auth/actions';
import { safeNextPath } from '@/lib/auth/redirects';
import { isGoogleSignInEnabled } from '@/lib/env';
import { ptBR } from '@/content/pt-BR';
import { MagicLinkForm } from './magic-link-form';
import { SignInForm } from './sign-in-form';

export const metadata: Metadata = { title: ptBR.auth.signIn.title };

interface SignInPageProps {
  searchParams: Promise<{ next?: string; erro?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next: rawNext, erro } = await searchParams;
  const next = safeNextPath(rawNext);
  const t = ptBR.auth.signIn;
  const notice = erro === 'link' ? t.linkError : erro === 'google' ? t.googleError : null;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-wide text-3xl font-semibold text-mist-50">{t.title}</h1>
        <p className="mt-2 text-sm text-mist-300">
          {t.noAccount}{' '}
          <Link href="/cadastro" className="font-medium text-magnus-300 underline-offset-4 hover:underline">
            {t.createAccount}
          </Link>
        </p>
      </header>

      {notice && <FormMessage tone="error">{notice}</FormMessage>}

      {isGoogleSignInEnabled() && (
        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center rounded-control border border-graphite-700 text-[0.95rem] font-medium text-mist-100 transition-colors hover:border-graphite-600 hover:bg-graphite-900"
          >
            {t.google}
          </button>
        </form>
      )}

      <SignInForm next={next} />

      <section aria-labelledby="magic-link-title" className="border-t border-graphite-800 pt-8">
        <h2 id="magic-link-title" className="text-base font-medium text-mist-50">
          {t.magicLinkTitle}
        </h2>
        <div className="mt-3">
          <MagicLinkForm next={next} />
        </div>
      </section>
    </div>
  );
}
