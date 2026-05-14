import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mermaid UML Studio',
  description:
    'The all-in-one editor for diagrams and documentation with Google Drive integration.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning className="h-full">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer />
        <script src="https://apis.google.com/js/api.js" async defer />
      </head>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
