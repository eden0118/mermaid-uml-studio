'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/LandingPage';
import { ViewMode } from '@/types/types';

export default function Home() {
  const router = useRouter();

  // 預熱路由
  useEffect(() => {
    router.prefetch('/mermaid');
    router.prefetch('/markdown');
  }, [router]);

  const handleSelectMode = (mode: ViewMode) => {
    if (mode === 'mermaid') {
      router.push('/mermaid');
    } else if (mode === 'markdown') {
      router.push('/markdown');
    }
  };

  return <LandingPage onSelectMode={handleSelectMode} />;
}
