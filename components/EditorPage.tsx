/**
 * EditorPage 元件
 * ============================================
 * 統一的編輯器頁面，支援 Mermaid 和 Markdown 模式
 * 消除重複代碼，使用組合模式
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CodeEditor from '@/components/CodeEditor';
import MermaidPreview from '@/components/MermaidPreview';
import MarkdownPreview from '@/components/MarkdownPreview';
import Toolbar from '@/components/Toolbar';
import SettingsModal from '@/components/SettingsModal';
import useGoogleDrive from '@/hooks/useGoogleDrive';
import { getDefaultEditorConfig, getDefaultPreviewConfig } from '@/lib/theme.config';
import { AppStatus } from '@/types/types';
import type { Theme, EditorConfig, PreviewConfig, ViewMode } from '@/types/types';

interface EditorPageProps {
  viewMode: ViewMode;
  defaultCode: string;
  defaultFileName: string;
}

const EditorPage: React.FC<EditorPageProps> = ({ viewMode, defaultCode, defaultFileName }) => {
  const router = useRouter();
  const initializedRef = useRef(false);

  // 狀態管理
  const [code, setCode] = useState<string>(defaultCode);
  const [previewCode, setPreviewCode] = useState<string>(defaultCode);
  const [fileName, setFileName] = useState<string>(defaultFileName);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [theme, setTheme] = useState<Theme>('dark');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 配置管理
  const [editorConfig, setEditorConfig] = useState<EditorConfig>(getDefaultEditorConfig());
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>(getDefaultPreviewConfig());

  const { isDriveConnected, login, saveFileToDrive, pickFile } = useGoogleDrive();

  // 初始化主題 — 只在 mount 時讀取系統偏好
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersDark = mql.matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  // 套用主題到 DOM
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // 包裝 setCode：同時更新 previewCode（如果 autoUpdate 開啟）
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    // autoUpdate 由 closure 中的 state 判斷，此處使用 functional update 避免 stale
    setAutoUpdate((currentAutoUpdate) => {
      if (currentAutoUpdate) {
        setPreviewCode(newCode);
      }
      return currentAutoUpdate; // 不改變 autoUpdate 本身
    });
  }, []);

  // 切換 autoUpdate
  const handleToggleAutoUpdate = useCallback(() => {
    setAutoUpdate((prev) => {
      const next = !prev;
      if (next) {
        // 當重新開啟 autoUpdate 時，同步 previewCode
        setCode((currentCode) => {
          setPreviewCode(currentCode);
          return currentCode;
        });
      }
      return next;
    });
  }, []);

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

  // Google Drive 儲存
  const handleSaveToDrive = useCallback(async () => {
    try {
      setStatus(AppStatus.SAVING);
      await saveFileToDrive(fileName, code);
      setStatus(AppStatus.SUCCESS);
    } catch (e) {
      console.error(e);
      setStatus(AppStatus.ERROR);
      alert('儲存到 Drive 失敗');
    } finally {
      setTimeout(() => setStatus(AppStatus.IDLE), 2000);
    }
  }, [code, fileName, saveFileToDrive]);

  // Google Drive 載入
  const handleLoadFromDrive = useCallback(async () => {
    try {
      setStatus(AppStatus.LOADING);
      const fileData = await pickFile();
      if (fileData) {
        setCode(fileData.content);
        setPreviewCode(fileData.content);
        setFileName(fileData.name);
      }
    } catch (e) {
      console.error(e);
      alert('從 Drive 載入失敗');
    } finally {
      setStatus(AppStatus.IDLE);
    }
  }, [pickFile]);

  // 模板選擇
  const handleSelectTemplate = useCallback((templateCode: string) => {
    setCode(templateCode);
    setPreviewCode(templateCode);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-white transition-colors duration-300 dark:bg-gray-950">
      <div className="flex flex-1 overflow-hidden relative">
        {/* 左側：編輯器 */}
        <div className="relative z-10 flex w-1/2 flex-col border-r border-gray-200/50 bg-white transition-all duration-300 dark:border-gray-800/50 dark:bg-gray-950">
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
            toggleAutoUpdate={handleToggleAutoUpdate}
            onSelectTemplate={handleSelectTemplate}
            viewMode={viewMode}
            onGoHome={() => router.push('/')}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <div className="flex-1 overflow-hidden p-3">
            <div className="h-full rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50">
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

        {/* 右側：預覽 */}
        <div className="relative h-full w-1/2 bg-gray-50 transition-all duration-300 dark:bg-gray-900">
          <div className="h-full w-full overflow-hidden">
            {viewMode === 'mermaid' ? (
              <MermaidPreview code={previewCode} theme={theme} />
            ) : (
              <MarkdownPreview code={previewCode} theme={theme} previewConfig={previewConfig} />
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
