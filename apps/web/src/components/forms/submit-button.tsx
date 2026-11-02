'use client';

import { useFormStatus } from 'react-dom';

export interface SubmitButtonProps {
  label: string;
  pendingLabel: string;
  variant?: 'primary' | 'secondary';
}

export function SubmitButton({ label, pendingLabel, variant = 'primary' }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={[
        'inline-flex h-11 w-full items-center justify-center rounded-control px-4 text-[0.95rem] font-medium transition-colors disabled:cursor-wait',
        variant === 'primary'
          ? 'bg-magnus-600 text-mist-50 hover:bg-magnus-500 disabled:bg-magnus-700'
          : 'border border-graphite-700 text-mist-100 hover:border-graphite-600 hover:bg-graphite-900',
      ].join(' ')}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
