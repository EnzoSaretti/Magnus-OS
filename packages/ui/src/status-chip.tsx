import type { ReactNode } from 'react';

/**
 * Status vocabulary shared by every screen. Each tone has one meaning:
 * - live: built and working
 * - building: being built now
 * - planned: on the roadmap, not started
 * - attention: waiting for a human decision
 * - demo: derived from demonstration data
 */
export type StatusTone = 'live' | 'building' | 'planned' | 'attention' | 'demo';

const TONE_CLASSES: Record<StatusTone, string> = {
  live: 'bg-magnus-600 text-mist-50',
  building: 'border border-magnus-500/70 text-magnus-300',
  planned: 'border border-graphite-600 text-mist-300',
  attention: 'bg-ember-500 text-onyx',
  demo: 'border border-dashed border-ember-300/70 text-ember-300',
};

export interface StatusChipProps {
  tone: StatusTone;
  children: ReactNode;
}

export function StatusChip({ tone, children }: StatusChipProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
