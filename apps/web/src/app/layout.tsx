import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Archivo } from 'next/font/google';
import { ptBR } from '@/content/pt-BR';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: ptBR.meta.title, template: `%s | ${ptBR.meta.title}` },
  description: ptBR.meta.description,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0b0a0f',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={archivo.variable}>
      <body className="bg-graphite-950 font-sans text-mist-100">{children}</body>
    </html>
  );
}
