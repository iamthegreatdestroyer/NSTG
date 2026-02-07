import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NSTG - Negative Space Test Generation',
  description: 'AI-powered test generation identifying untested code paths',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
