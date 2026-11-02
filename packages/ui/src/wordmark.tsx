/**
 * Text wordmark used until the official MAGNUS logo is delivered (decision D-13).
 * The ember bar marks the one place where the brand's accent appears unconditionally.
 */
export interface WordmarkProps {
  compact?: boolean;
}

export function Wordmark({ compact = false }: WordmarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5 text-mist-50" aria-label="MAGNUS OS">
      <span aria-hidden="true" className="h-5 w-1.5 rounded-full bg-linear-to-b from-ember-500 to-magnus-500" />
      <span aria-hidden="true" className="font-wide text-[1.05rem] font-semibold tracking-[0.08em]">
        {compact ? 'M' : 'MAGNUS'}
      </span>
      {!compact && (
        <span aria-hidden="true" className="text-sm font-medium text-graphite-500">
          OS
        </span>
      )}
    </span>
  );
}
