'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/LandingPage';
import { ViewMode } from '@/types/types';

export default function Home() {
  const router = useRouter();

  const handleSelectMode = (mode: ViewMode) => {
    if (mode === 'mermaid') {
      router.push('/mermaid');
    } else if (mode === 'markdown') {
      router.push('/markdown');
    }
  };

  return <LandingPage onSelectMode={handleSelectMode} />;
}
