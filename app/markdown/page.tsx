'use client';

import EditorPage from '@/components/EditorPage';
import { DEFAULT_MARKDOWN_CODE } from '@/lib/constants';

export default function MarkdownPage() {
  return (
    <EditorPage
      viewMode="markdown"
      defaultCode={DEFAULT_MARKDOWN_CODE}
      defaultFileName="document.md"
    />
  );
}
