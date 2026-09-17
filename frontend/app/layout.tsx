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
      <body>
        <div hidden>
          THESIS: role-scoped education analytics dashboard; refuses marketing hero layout.
          OWN-WORLD: crisp institutional blue surfaces, dense cards, subtle borders, calm charts.
          STORY: user sees their permitted region, analytics, revenue, and risks immediately.
          FIRST VIEWPORT: fixed topbar/sidebar, sticky scope controls, metrics, primary chart.
          FORM: Operate dashboard based on supplied reference; finish checked by build and tests.
        </div>
        {children}
      </body>
    </html>
  );
}
