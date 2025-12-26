/**
 * EditorPage 元件
 * ============================================
 * 統一的編輯器頁面，支援 Mermaid 和 Markdown 模式
 * 消除重複代碼，使用組合模式
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CodeEditor from '@/components/CodeEditor';
import MermaidPreview from '@/components/MermaidPreview';
import MarkdownPreview from '@/components/MarkdownPreview';
import Toolbar from '@/components/Toolbar';
import SettingsModal from '@/components/SettingsModal';
import useGoogleDrive from '@/hooks/useGoogleDrive';
import { getDefaultEditorConfig, getDefaultPreviewConfig } from '@/lib/theme.config';
import type { AppStatus, Theme, EditorConfig, PreviewConfig, ViewMode } from '@/types/types';

interface EditorPageProps {
  viewMode: ViewMode;
  defaultCode: string;
  defaultFileName: string;
}

const EditorPage: React.FC<EditorPageProps> = ({ viewMode, defaultCode, defaultFileName }) => {
  const router = useRouter();

  // 狀態管理
  const [code, setCode] = useState<string>(defaultCode);
  const [fileName, setFileName] = useState<string>(defaultFileName);
  const [status, setStatus] = useState<AppStatus>('IDLE' as AppStatus);
  const [theme, setTheme] = useState<Theme>('dark');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 配置管理
  const [editorConfig, setEditorConfig] = useState<EditorConfig>(getDefaultEditorConfig());
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>(getDefaultPreviewConfig());

  const { isDriveConnected, login, saveFileToDrive, pickFile } = useGoogleDrive();

  // 初始化主題
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  // 套用主題到 DOM
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // 主題切換
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // 本地檔案載入
  const handleLoadLocal = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
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

  // Google Drive 儲存
  const handleSaveToDrive = useCallback(async () => {
    try {
      setStatus('SAVING' as AppStatus);
      await saveFileToDrive(fileName, code);
      setStatus('SUCCESS' as AppStatus);
    } catch (e) {
      console.error(e);
      setStatus('ERROR' as AppStatus);
      alert('儲存到 Drive 失敗');
    } finally {
      setTimeout(() => setStatus('IDLE' as AppStatus), 2000);
    }
  }, [code, fileName, saveFileToDrive]);

  // Google Drive 載入
  const handleLoadFromDrive = useCallback(async () => {
    try {
      setStatus('LOADING' as AppStatus);
      const fileData = await pickFile();
      if (fileData) {
        setCode(fileData.content);
        setFileName(fileData.name);
      }
    } catch (e) {
      console.error(e);
      alert('從 Drive 載入失敗');
    } finally {
      setStatus('IDLE' as AppStatus);
    }
  }, [pickFile]);

  // 模板選擇
  const handleSelectTemplate = useCallback((templateCode: string) => {
    setCode(templateCode);
  }, []);

  // 渲染預覽元件
  const renderPreview = () => {
    const previewCode = autoUpdate ? code : '';

    if (viewMode === 'mermaid') {
      return <MermaidPreview code={previewCode} theme={theme} />;
    }

    return <MarkdownPreview code={code} theme={theme} previewConfig={previewConfig} />;
  };

  return (
    <div className="flex h-screen flex-col bg-white transition-colors duration-200 dark:bg-gray-900">
      <div className="flex flex-1 overflow-hidden">
        {/* 左側：編輯器 */}
        <div className="relative z-10 flex w-1/2 flex-col border-r border-gray-200 bg-white shadow-xl transition-colors duration-200 dark:border-gray-700 dark:bg-gray-900">
          <Toolbar
            fileName={fileName}
            setFileName={setFileName}
            onLoadLocal={handleLoadLocal}
            onSaveLocal={handleSaveLocal}
            onGoogleLogin={login}
            onSaveToDrive={handleSaveToDrive}
            onLoadFromDrive={handleLoadFromDrive}
            isDriveConnected={isDriveConnected}
            status={status}
            theme={theme}
            toggleTheme={toggleTheme}
            autoUpdate={autoUpdate}
            toggleAutoUpdate={() => setAutoUpdate(!autoUpdate)}
            onSelectTemplate={handleSelectTemplate}
            viewMode={viewMode}
            onGoHome={() => router.push('/')}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <CodeEditor
            value={code}
            onChange={setCode}
            placeholder={`輸入 ${viewMode === 'mermaid' ? 'Mermaid 語法' : 'Markdown 內容'}...`}
            config={editorConfig}
            ariaLabel={`${viewMode === 'mermaid' ? 'Mermaid' : 'Markdown'} 編輯器`}
          />
        </div>

        {/* 右側：預覽 */}
        <div className="h-full w-1/2 bg-gray-50 transition-colors duration-200 dark:bg-gray-900">
          {renderPreview()}
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
        theme={theme}
      />
    </div>
  );
};

export default EditorPage;
