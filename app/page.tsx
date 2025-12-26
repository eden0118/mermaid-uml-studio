'use client';

import React, { useState, useEffect, useRef } from 'react';
import MermaidPreview from '@/components/MermaidPreview';
import MarkdownPreview from '@/components/MarkdownPreview';
import Toolbar from '@/components/Toolbar';
import LandingPage from '@/components/LandingPage';
import SettingsModal from '@/components/SettingsModal';
import { DEFAULT_MERMAID_CODE, DEFAULT_MARKDOWN_CODE } from '@/constants';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { AppStatus, Theme, ViewMode, EditorConfig, PreviewConfig } from '@/types';

export default function Home() {
  // State - Default to Markdown mode with cheat sheet loaded
  const [viewMode, setViewMode] = useState<ViewMode>('markdown');
  const [code, setCode] = useState<string>(DEFAULT_MARKDOWN_CODE);
  const [fileName, setFileName] = useState<string>('document.md');

  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [theme, setTheme] = useState<Theme>('dark');
  const [autoUpdate, setAutoUpdate] = useState(true);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editorConfig, setEditorConfig] = useState<EditorConfig>({
    fontSize: 14,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    lineHeight: 1.5,
  });
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>({
    customCss: '',
  });

  const { isDriveConnected, login, saveFileToDrive, pickFile } = useGoogleDrive();

  // Initialize Theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Switch View Handlers
  const handleSelectMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'mermaid') {
      if (!code.trim() || code === DEFAULT_MARKDOWN_CODE) {
        setCode(DEFAULT_MERMAID_CODE);
      }
      setFileName('diagram.md');
    } else if (mode === 'markdown') {
      if (!code.trim() || code === DEFAULT_MERMAID_CODE) {
        setCode(DEFAULT_MARKDOWN_CODE);
      }
      setFileName('document.md');
    }
  };

  // Local File System Handlers
  const handleLoadLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleSaveLocal = () => {
    const blob = new Blob([code], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Google Drive Handlers
  const handleSaveToDrive = async () => {
    try {
      setStatus(AppStatus.SAVING);
      await saveFileToDrive(fileName, code);
      setStatus(AppStatus.SUCCESS);
    } catch (e) {
      console.error(e);
      setStatus(AppStatus.ERROR);
      alert('Failed to save to Drive.');
    } finally {
      setTimeout(() => setStatus(AppStatus.IDLE), 2000);
    }
  };

  const handleLoadFromDrive = async () => {
    try {
      setStatus(AppStatus.LOADING);
      const fileData = await pickFile();
      if (fileData) {
        setCode(fileData.content);
        setFileName(fileData.name);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to load from Drive.');
    } finally {
      setStatus(AppStatus.IDLE);
    }
  };

  // Template Handler
  const handleSelectTemplate = (templateCode: string) => {
    setCode(templateCode);
  };

  // Editor Line Numbers Logic
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    setLineCount(code.split('\n').length);
  }, [code]);

  const handleScroll = () => {
    if (textareaRef.current) {
      const lineNumbers = document.getElementById('line-numbers');
      if (lineNumbers) {
        lineNumbers.scrollTop = textareaRef.current.scrollTop;
      }
    }
  };

  if (viewMode === 'landing') {
    return <LandingPage onSelectMode={handleSelectMode} />;
  }

  return (
    <div className="flex h-screen flex-col bg-white transition-colors duration-200 dark:bg-gray-900">
      {/* Editor Layout: Left Panel (Code) & Right Panel (Preview) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Editor */}
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
            onGoHome={() => setViewMode('landing')}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <div className="relative flex flex-1">
            {/* Line Numbers */}
            <div
              id="line-numbers"
              className="w-10 overflow-hidden border-r border-gray-100 bg-gray-50 pt-4 pr-2 pb-4 text-right font-mono text-xs text-gray-400 transition-colors duration-200 select-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600"
              style={{
                lineHeight: editorConfig.lineHeight,
                fontSize: `${editorConfig.fontSize}px`,
                // We need to match the padding of the textarea to align correctly
              }}
            >
              {Array.from({ length: lineCount }, (_, i) => i + 1).map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>

            {/* Text Area */}
            <textarea
              ref={textareaRef}
              className="h-full flex-1 resize-none bg-white p-4 text-gray-800 transition-colors duration-200 outline-none dark:bg-[#0d1117] dark:text-gray-300"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleScroll}
              spellCheck={false}
              placeholder={
                viewMode === 'mermaid' ? 'Enter Mermaid syntax here...' : 'Enter Markdown here...'
              }
              style={{
                fontFamily: editorConfig.fontFamily,
                fontSize: `${editorConfig.fontSize}px`,
                lineHeight: editorConfig.lineHeight,
              }}
            />
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="h-full w-1/2 bg-gray-50 transition-colors duration-200 dark:bg-gray-950">
          {viewMode === 'mermaid' ? (
            <MermaidPreview code={autoUpdate ? code : ''} theme={theme} />
          ) : (
            <MarkdownPreview code={code} theme={theme} previewConfig={previewConfig} />
          )}
        </div>
      </div>

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
}
