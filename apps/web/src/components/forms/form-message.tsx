export interface FormMessageProps {
  tone: 'error' | 'info';
  children: string;
}

/** Form-level outcome, announced to screen readers when it appears. */
export function FormMessage({ tone, children }: FormMessageProps) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={[
        'rounded-control border px-3.5 py-3 text-sm leading-6',
        tone === 'error'
          ? 'border-ember-500/50 bg-ember-950 text-ember-300'
          : 'border-magnus-500/40 bg-magnus-950 text-magnus-300',
      ].join(' ')}
    >
      {children}
    </p>
  );
}
