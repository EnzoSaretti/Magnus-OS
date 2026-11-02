import { useId } from 'react';

/**
 * MAGNUS symbol, redrawn as SVG from the official logo (docs/brand/magnus-logo-original.png):
 * a rounded square whose upper 56% is indigo/navy with a violet "V" cut (the M),
 * over a red-orange base.
 */
export interface LogoMarkProps {
  size?: number;
  className?: string;
  title?: string;
}

export function LogoMark({ size = 32, className, title }: LogoMarkProps) {
  const id = useId();
  const clip = `${id}-clip`;
  const violet = `${id}-violet`;
  const red = `${id}-red`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <clipPath id={clip}>
          <rect width="64" height="64" rx="18" />
        </clipPath>
        <linearGradient id={violet} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a1ad7" />
          <stop offset="1" stopColor="#6412c0" />
        </linearGradient>
        <linearGradient id={red} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f23b27" />
          <stop offset="1" stopColor="#de2618" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <path d="M0 0H13L32 36H0Z" fill="#2d1b8e" />
        <path d="M51 0H64V36H32Z" fill="#1a145c" />
        <path d="M13 0H51L32 36Z" fill={`url(#${violet})`} />
        <rect y="36" width="64" height="28" fill={`url(#${red})`} />
      </g>
    </svg>
  );
}
