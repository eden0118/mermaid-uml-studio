import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LandingPage from '@/components/LandingPage';
import { ViewMode } from '@/types';

export default function Home() {
  const router = useRouter();

  const handleSelectMode = (mode: ViewMode) => {
    if (mode === 'mermaid') {
      router.push('/mermaid');
    } else if (mode === 'markdown') {
      router.push('/markdown');
    }
  };

  return (
    <>
      <Head>
        <title>Mermaid UML Studio</title>
        <meta
          name="description"
          content="The all-in-one editor for diagrams and documentation with Google Drive integration."
        />
      </Head>
      <LandingPage onSelectMode={handleSelectMode} />
    </>
  );
}
