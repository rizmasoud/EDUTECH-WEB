import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'EduTech Web',
  description: 'EduTech Web technical foundation',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
