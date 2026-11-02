function initialsOf(name: string): string {
  const parts = name.trim().split(/[\s@._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase() || '·';
}

/** Initials on the brand gradient; photos arrive with profile editing. */
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden="true"
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-indigo to-brand-violet font-semibold text-mist-50',
        size === 'sm' ? 'size-7 text-[0.65rem]' : 'size-8 text-xs',
      ].join(' ')}
    >
      {initialsOf(name)}
    </span>
  );
}
