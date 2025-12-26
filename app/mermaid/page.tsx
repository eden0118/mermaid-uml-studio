'use client';

import EditorPage from '@/components/EditorPage';
import { DEFAULT_MERMAID_CODE } from '@/lib/constants';

export default function MermaidPage() {
  return (
    <EditorPage
      viewMode="mermaid"
      defaultCode={DEFAULT_MERMAID_CODE}
      defaultFileName="diagram.md"
    />
  );
}
