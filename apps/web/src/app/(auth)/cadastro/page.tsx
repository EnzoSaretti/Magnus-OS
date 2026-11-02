import type { Metadata } from 'next';
import Link from 'next/link';
import { ptBR } from '@/content/pt-BR';
import { SignUpForm } from './sign-up-form';

export const metadata: Metadata = { title: ptBR.auth.signUp.title };

export default function SignUpPage() {
  const t = ptBR.auth.signUp;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-wide text-3xl font-semibold text-mist-50">{t.title}</h1>
        <p className="mt-2 text-sm text-mist-300">
          {t.haveAccount}{' '}
          <Link href="/entrar" className="font-medium text-magnus-300 underline-offset-4 hover:underline">
            {t.signIn}
          </Link>
        </p>
      </header>
      <SignUpForm />
    </div>
  );
}
