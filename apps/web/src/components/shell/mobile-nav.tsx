'use client';

import { useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { Wordmark } from '@magnus/ui';
import { signOut } from '@/lib/auth/actions';
import { ptBR } from '@/content/pt-BR';
import { NavList } from './nav-list';

/** Phone navigation: a native modal dialog, so focus trapping and Escape come for free. */
export function MobileNav({ userEmail }: { userEmail: string | null }) {
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
        className="mobile-drawer m-0 h-dvh max-h-none w-[min(20rem,86vw)] max-w-none flex-col border-r border-graphite-800 bg-onyx p-0 text-mist-100 open:flex"
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
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavList onNavigate={close} />
        </nav>
        {userEmail && (
          <div className="border-t border-graphite-800 px-5 py-4">
            <p className="truncate text-sm text-mist-300">
              <span className="sr-only">{ptBR.shell.signedInAs} </span>
              {userEmail}
            </p>
            <form action={signOut} className="mt-3">
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center rounded-control border border-graphite-700 text-sm font-medium text-mist-100 hover:bg-graphite-900"
              >
                {ptBR.auth.signOut}
              </button>
            </form>
          </div>
        )}
      </dialog>
    </>
  );
}
