'use client';

import dynamic from 'next/dynamic';
import { DEFAULT_MARKDOWN_CODE } from '@/lib/constants';

const EditorPage = dynamic(() => import('@/components/EditorPage'), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-[#0d1117]" />,
});

export default function MarkdownPage() {
  return (
    <EditorPage
      viewMode="markdown"
      defaultCode={DEFAULT_MARKDOWN_CODE}
      defaultFileName="document.md"
    />
  );
}
