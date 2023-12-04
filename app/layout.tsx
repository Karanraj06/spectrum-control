import '@/styles/globals.css';

import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { GeistSans } from 'geist/font/sans';
import { Toaster } from 'sonner';

import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  metadataBase: new URL('https://spectrum-control.vercel.app'),
  title: { default: 'Spectrum Control', template: '%s | Spectrum Control' },
  description:
    'Automated Spectrum Management System - Spectrum Control allows you to effortlessly manage and allocate frequencies',
  openGraph: {
    title: 'Spectrum Control',
    description:
      'Automated Spectrum Management System - Spectrum Control allows you to effortlessly manage and allocate frequencies',
    images: ['/opengraph-image.png'],
  },
  twitter: {
    title: 'Spectrum Control',
    description:
      'Automated Spectrum Management System - Spectrum Control allows you to effortlessly manage and allocate frequencies',
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body
          className={cn(
            'min-h-screen bg-[url("/bg-paper.png")] font-sans antialiased',
            GeistSans.className
          )}
        >
          {children}
          <Toaster closeButton richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
