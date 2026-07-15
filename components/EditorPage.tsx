/**
 * EditorPage 元件
 * ============================================
 * 統一的編輯器頁面，支援 Mermaid 和 Markdown 模式
 * 消除重複代碼，使用組合模式
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import CodeEditor from '@/components/CodeEditor';
import Toolbar from '@/components/Toolbar';
import SettingsModal from '@/components/SettingsModal';
import { getDefaultEditorConfig, getDefaultPreviewConfig } from '@/lib/theme.config';
import { AppStatus } from '@/types/types';
import type { Theme, EditorConfig, PreviewConfig, ViewMode } from '@/types/types';

// 延遲載入預覽元件，減少初始 Bundle 大小
const MermaidPreview = dynamic(() => import('@/components/MermaidPreview'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-gray-100 dark:bg-gray-800" />,
});

const MarkdownPreview = dynamic(() => import('@/components/MarkdownPreview'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-gray-100 dark:bg-gray-800" />,
});

interface EditorPageProps {
  viewMode: ViewMode;
  defaultCode: string;
  defaultFileName: string;
}

const EditorPage: React.FC<EditorPageProps> = ({ viewMode, defaultCode, defaultFileName }) => {
  const router = useRouter();
  const initializedRef = useRef(false);

  // 狀態管理
  const [code, setCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`draft_${viewMode}`);
      return saved || defaultCode;
    }
    return defaultCode;
  });
  const [previewCode, setPreviewCode] = useState<string>(code);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('');

  // 編輯器面板收合狀態
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);

  // 自動儲存草稿
  useEffect(() => {
    localStorage.setItem(`draft_${viewMode}`, code);
  }, [code, viewMode]);
  const [fileName, setFileName] = useState<string>(defaultFileName);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 防抖處理預覽更新
  useEffect(() => {
    if (!autoUpdate) return;
    
    const timer = setTimeout(() => {
      setPreviewCode(code);
    }, 300); // 300ms 延遲

    return () => clearTimeout(timer);
  }, [code, autoUpdate]);

  // 配置管理
  const [editorConfig, setEditorConfig] = useState<EditorConfig>(getDefaultEditorConfig());
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>(getDefaultPreviewConfig());

  // 包裝 setCode
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    // 如果手動修改內容，清除選中的模板名稱
    setSelectedTemplateName('');
  }, []);

  // 切換 autoUpdate
  const handleToggleAutoUpdate = useCallback(() => {
    setAutoUpdate((prev) => {
      const next = !prev;
      if (next) {
        setPreviewCode(code);
      }
      return next;
    });
  }, [code]);

  // 本地檔案載入
  const handleLoadLocal = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
      setPreviewCode(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  // 本地檔案儲存
  const handleSaveLocal = useCallback(() => {
    const blob = new Blob([code], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, fileName]);

  // 模板選擇
  const handleSelectTemplate = useCallback((name: string, templateCode: string) => {
    setCode(templateCode);
    setPreviewCode(templateCode);
    setSelectedTemplateName(name);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-[#0d1117] transition-colors duration-300">
      <div className="flex flex-1 overflow-hidden relative">
        {/* 左側：編輯器 */}
        <div
          className={`relative z-10 flex flex-col border-r border-[#30363d] bg-[#0d1117] transition-all duration-300 ease-in-out ${
            isEditorCollapsed ? 'w-0 min-w-0 overflow-hidden border-r-0' : 'w-1/2'
          }`}
        >
          <Toolbar
            fileName={fileName}
            setFileName={setFileName}
            onLoadLocal={handleLoadLocal}
            onSaveLocal={handleSaveLocal}
            status={AppStatus.IDLE}
            autoUpdate={autoUpdate}
            toggleAutoUpdate={handleToggleAutoUpdate}
            onSelectTemplate={handleSelectTemplate}
            selectedTemplateName={selectedTemplateName}
            viewMode={viewMode}
            onGoHome={() => router.push('/')}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <div className="flex-1 overflow-hidden p-3">
            <div className="h-full rounded-xl overflow-hidden border border-[#30363d]">
              <CodeEditor
                value={code}
                onChange={handleCodeChange}
                placeholder={`輸入 ${viewMode === 'mermaid' ? 'Mermaid 語法' : 'Markdown 內容'}...`}
                config={editorConfig}
                ariaLabel={`${viewMode === 'mermaid' ? 'Mermaid' : 'Markdown'} 編輯器`}
              />
            </div>
          </div>
        </div>

        {/* 收合/展開按鈕 */}
        <button
          onClick={() => setIsEditorCollapsed((prev) => !prev)}
          className="absolute top-1/2 z-20 flex h-16 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-r-md bg-[#21262d] border border-l-0 border-[#30363d] text-[#8b949e] hover:bg-[#30363d] hover:text-[#c9d1d9] transition-all duration-200 hover:w-6 active:scale-95"
          style={{ left: isEditorCollapsed ? 0 : 'calc(50% - 1px)' }}
          title={isEditorCollapsed ? '展開編輯器' : '收合編輯器'}
          aria-label={isEditorCollapsed ? '展開編輯器' : '收合編輯器'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 transition-transform duration-200 ${isEditorCollapsed ? 'rotate-180' : ''}`}
          >
            <path
              fillRule="evenodd"
              d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* 右側：預覽 */}
        <div
          className={`relative h-full bg-[#0d1117] transition-all duration-300 ease-in-out ${
            isEditorCollapsed ? 'w-full' : 'w-1/2'
          }`}
        >
          <div className="h-full w-full overflow-hidden">
            {viewMode === 'mermaid' ? (
              <MermaidPreview code={previewCode} theme="dark" />
            ) : (
              <MarkdownPreview
                code={previewCode}
                theme="dark"
                previewConfig={previewConfig}
                isEditorCollapsed={isEditorCollapsed}
              />
            )}
          </div>
        </div>
      </div>

      {/* 設定對話框 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        editorConfig={editorConfig}
        setEditorConfig={setEditorConfig}
        previewConfig={previewConfig}
        setPreviewConfig={setPreviewConfig}
      />
    </div>
  );
};

export default EditorPage;
