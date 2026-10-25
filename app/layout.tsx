import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mermaid UML Studio',
  description: 'The all-in-one editor for diagrams and documentation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning className="dark h-full">
      <body className="h-full overflow-hidden bg-[#0d1117] text-[#c9d1d9] antialiased">
        {children}
      </body>
    </html>
  );
}
