import type { Metadata } from 'next';
import { Inter }         from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title:       { default: 'Nexus', template: '%s | Nexus' },
  description: 'Team dev dashboard — built to demonstrate Next.js 14 full-stack capabilities',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
