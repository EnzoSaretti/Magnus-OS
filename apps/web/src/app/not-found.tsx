import Link from 'next/link';
import { Wordmark } from '@magnus/ui';
import { ptBR } from '@/content/pt-BR';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center gap-6 px-6 sm:px-16">
      <Wordmark />
      <div>
        <h1 className="font-wide text-3xl font-semibold text-mist-50">{ptBR.notFound.title}</h1>
        <p className="mt-2 text-mist-300">{ptBR.notFound.body}</p>
      </div>
      <Link
        href="/painel"
        className="rounded-control bg-magnus-600 px-4 py-2.5 text-sm font-medium text-mist-50 transition-colors hover:bg-magnus-500"
      >
        {ptBR.notFound.action}
      </Link>
    </main>
  );
}
