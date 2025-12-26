import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="zh-TW" suppressHydrationWarning>
      <Head>
        <script src="https://accounts.google.com/gsi/client" async defer />
        <script src="https://apis.google.com/js/api.js" async defer />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
