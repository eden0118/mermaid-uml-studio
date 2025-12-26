import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mermaid UML Studio',
  description:
    'The all-in-one editor for diagrams and documentation with Google Drive integration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <script src="https://apis.google.com/js/api.js" async defer></script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
