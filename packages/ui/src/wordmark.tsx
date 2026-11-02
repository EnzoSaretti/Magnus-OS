import { LogoMark } from './logo.tsx';

/** Logo symbol plus the MAGNUS wordmark (wide, letter-spaced, as in the brand artwork). */
export interface WordmarkProps {
  /** Symbol only (collapsed navigation). */
  compact?: boolean;
  size?: number;
}

export function Wordmark({ compact = false, size = 30 }: WordmarkProps) {
  return (
    <span className="inline-flex items-center gap-3 text-mist-50">
      <LogoMark size={size} title={compact ? 'MAGNUS OS' : undefined} />
      {!compact && (
        <span className="inline-flex items-baseline gap-2" aria-label="MAGNUS OS">
          <span aria-hidden="true" className="font-wide text-[1.05rem] font-semibold tracking-[0.18em]">
            MAGNUS
          </span>
          <span aria-hidden="true" className="text-xs font-medium tracking-[0.12em] text-graphite-500">
            OS
          </span>
        </span>
      )}
    </span>
  );
}
