'use client';

import { useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { Wordmark } from '@magnus/ui';
import { ptBR } from '@/content/pt-BR';
import { NavList } from './nav-list';

/** Phone navigation: a native modal dialog, so focus trapping and Escape come for free. */
export function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="-mr-2 inline-flex size-10 items-center justify-center rounded-control text-mist-100 hover:bg-graphite-850"
      >
        <Menu aria-hidden="true" className="size-5" />
        <span className="sr-only">{ptBR.shell.openMenu}</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={ptBR.shell.navLabel}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
        className="mobile-drawer m-0 h-dvh max-h-none w-[min(20rem,86vw)] max-w-none border-r border-graphite-800 bg-onyx p-0 text-mist-100"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Wordmark />
          <button
            type="button"
            onClick={close}
            className="-mr-2 inline-flex size-10 items-center justify-center rounded-control hover:bg-graphite-850"
          >
            <X aria-hidden="true" className="size-5" />
            <span className="sr-only">{ptBR.shell.closeMenu}</span>
          </button>
        </div>
        <nav className="px-3 py-4">
          <NavList onNavigate={close} />
        </nav>
      </dialog>
    </>
  );
}
