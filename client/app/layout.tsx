import { routing } from '@/lib/i18n/routing';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={routing.defaultLocale}>
      <body>{children}</body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
