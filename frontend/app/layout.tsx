import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Role-Based Dashboard',
  description: 'Frontend for the role-based dashboard assessment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
