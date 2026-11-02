'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth/actions';
import { ptBR } from '@/content/pt-BR';
import { Avatar } from './avatar';

export interface UserMenuProps {
  name: string | null;
  email: string | null;
}

/** Account button with a small menu; closes on outside click and Escape. */
export function UserMenu({ name, email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const display = name ?? email ?? '';

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2.5 rounded-full border border-graphite-800 bg-graphite-900 py-1 pr-3 pl-1 text-sm text-mist-100 transition-colors hover:border-graphite-700"
      >
        <Avatar name={display} />
        <span className="max-w-40 truncate">{display}</span>
        <ChevronDown aria-hidden="true" className="size-4 text-graphite-500" />
        <span className="sr-only">{ptBR.account.menu}</span>
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute right-0 z-20 mt-2 w-64 rounded-panel border border-graphite-700 bg-graphite-850 p-2 shadow-2xl"
        >
          <div className="px-3 py-2">
            {name && <p className="truncate text-sm font-medium text-mist-50">{name}</p>}
            {email && <p className="truncate text-xs text-mist-300">{email}</p>}
          </div>
          <div className="my-1 h-px bg-graphite-700" />
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-sm text-mist-100 hover:bg-graphite-800"
            >
              <LogOut aria-hidden="true" className="size-4" />
              {ptBR.auth.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
