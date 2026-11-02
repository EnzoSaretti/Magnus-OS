import type { ReactNode } from 'react';
import { StatusChip } from '@magnus/ui';
import { ptBR } from '@/content/pt-BR';

export interface PanelProps {
  id?: string;
  title: string;
  /** Marks content fed by demonstration data (content/demo). */
  demo?: boolean;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Dashboard card: title row (with the demo chip when applicable) and body. */
export function Panel({ id, title, demo = false, actions, className = '', children }: PanelProps) {
  const titleId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={titleId} className={`surface-card flex flex-col p-5 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 id={titleId} className="text-base font-medium text-mist-50">
            {title}
          </h2>
          {demo && <StatusChip tone="demo">{ptBR.status.demo}</StatusChip>}
        </div>
        {actions}
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}
