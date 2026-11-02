import type { Metadata } from 'next';
import Link from 'next/link';
import { ptBR } from '@/content/pt-BR';

export const metadata: Metadata = { title: ptBR.auth.checkEmail.title };

export default function CheckEmailPage() {
  const t = ptBR.auth.checkEmail;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-wide text-3xl font-semibold text-mist-50">{t.title}</h1>
      <p className="text-[0.95rem] leading-7 text-mist-300">{t.body}</p>
      <Link href="/entrar" className="text-sm font-medium text-magnus-300 underline-offset-4 hover:underline">
        {t.back}
      </Link>
    </div>
  );
}
