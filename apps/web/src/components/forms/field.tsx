import type { InputHTMLAttributes } from 'react';

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  error?: string | undefined;
  hint?: string;
}

/** Labelled input with its hint and error wired to aria-describedby. */
export function Field({ name, label, error, hint, id = name, ...input }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-mist-100">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          'h-11 rounded-control border bg-graphite-900 px-3.5 text-[0.95rem] text-mist-50 transition-colors',
          'placeholder:text-graphite-500 focus:outline-none focus-visible:outline-none focus:border-magnus-500 focus:ring-2 focus:ring-magnus-500/30',
          error ? 'border-ember-500' : 'border-graphite-700 hover:border-graphite-600',
        ].join(' ')}
        {...input}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-graphite-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-ember-300">
          {error}
        </p>
      )}
    </div>
  );
}
