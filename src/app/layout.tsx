import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'iTrend Technology',
  description:
    'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, and Prettier.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
