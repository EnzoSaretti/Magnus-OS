import { ptBR } from '@/content/pt-BR';

/** States plainly that the screens are not yet connected to real data. */
export function PreviewNotice() {
  return (
    <p className="mb-8 flex gap-3 rounded-control border border-graphite-800 bg-graphite-900/60 px-4 py-3 text-sm leading-6 text-mist-300">
      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-magnus-500" />
      {ptBR.shell.previewNotice}
    </p>
  );
}
