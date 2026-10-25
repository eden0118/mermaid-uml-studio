'use client';

import dynamic from 'next/dynamic';
import { DEFAULT_MERMAID_CODE } from '@/lib/constants';

const EditorPage = dynamic(() => import('@/components/EditorPage'), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-[#0d1117]" />,
});

export default function MermaidPage() {
  return (
    <EditorPage
      viewMode="mermaid"
      defaultCode={DEFAULT_MERMAID_CODE}
      defaultFileName="diagram.md"
    />
  );
}
