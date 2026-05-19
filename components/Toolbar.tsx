/**
 * Toolbar 元件
 * ============================================
 * 編輯器頂部工具列，包含檔案操作、模板選擇、設定等功能
 */

import React, { useState } from 'react';
import {
  Download,
  Upload,
  Moon,
  Sun,
  FileCode,
  CheckCircle2,
  LayoutTemplate,
  ChevronDown,
  Home,
  Settings,
  Loader2,
} from 'lucide-react';
import { AppStatus, Theme, ViewMode } from '@/types/types';
import { UML_TEMPLATES } from '@/lib/constants';

interface ToolbarProps {
  fileName: string;
  setFileName: (name: string) => void;
  onLoadLocal: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveLocal: () => void;
  status: AppStatus;
  autoUpdate: boolean;
  toggleAutoUpdate: () => void;
  onSelectTemplate: (name: string, code: string) => void;
  selectedTemplateName?: string;
  viewMode: ViewMode;
  onGoHome: () => void;
  onOpenSettings: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  fileName,
  setFileName,
  onLoadLocal,
  onSaveLocal,
  status,
  autoUpdate,
  toggleAutoUpdate,
  onSelectTemplate,
  selectedTemplateName,
  viewMode,
  onGoHome,
  onOpenSettings,
}) => {
  const [showTemplates, setShowTemplates] = useState(false);

  const modeLabel = viewMode === 'mermaid' ? 'Mermaid' : 'Markdown';

  return (
    <div className="glass relative z-20 flex h-14 shrink-0 items-center justify-between px-4 transition-all duration-300" role="toolbar" aria-label="編輯器工具列">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Home Button */}
        <button
          onClick={onGoHome}
          className="group flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          title="返回首頁"
          aria-label="返回首頁"
        >
          <Home size={16} className="transition-transform group-hover:scale-110" aria-hidden="true" />
        </button>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-800" aria-hidden="true" />

        {/* Mode Label */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <FileCode size={14} aria-hidden="true" />
          </div>
          <span className="text-xs font-bold tracking-tight text-gray-900 dark:text-white">{modeLabel}</span>
        </div>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-800" aria-hidden="true" />

        {/* Templates Dropdown (Only for Mermaid) */}
        {viewMode === 'mermaid' && (
          <>
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="btn btn-secondary !px-2.5 !py-1.5 !text-xs !gap-1.5 min-w-[80px]"
                aria-label="選擇模板"
                aria-expanded={showTemplates}
                aria-haspopup="true"
              >
                <LayoutTemplate size={14} aria-hidden="true" />
                <span>{selectedTemplateName || '模板'}</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${showTemplates ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {showTemplates && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowTemplates(false)} aria-hidden="true" />
                  <div className="animate-slide-down absolute left-0 top-full z-20 mt-1.5 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-800" role="menu" aria-label="模板選單">
                    {UML_TEMPLATES.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => {
                          onSelectTemplate(t.name, t.code);
                          setShowTemplates(false);
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
                        role="menuitem"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="h-5 w-px bg-gray-200 dark:bg-gray-800" aria-hidden="true" />
          </>
        )}

        {/* Auto Update Toggle */}
        <button
          onClick={toggleAutoUpdate}
          className="group flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
          role="switch"
          aria-checked={autoUpdate}
          aria-label="自動更新預覽"
        >
          <div
            className={`relative h-4 w-7 rounded-full transition-all duration-200 ${autoUpdate ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            aria-hidden="true"
          >
            <div
              className={`absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${autoUpdate ? 'translate-x-3' : 'translate-x-0'}`}
            />
          </div>
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">即時</span>
        </button>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-800" aria-hidden="true" />

        {/* Filename Input */}
        <div className="relative flex items-center">
          <input
            id="filename-input"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-36 bg-transparent py-1 text-xs font-medium text-gray-600 outline-none transition-colors focus:text-primary-600 dark:text-gray-400 dark:focus:text-primary-400"
            aria-label="檔案名稱"
            placeholder="未命名檔案"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Status Indicators */}
        {status === AppStatus.SAVING && (
          <div className="flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 dark:bg-primary-900/20">
            <Loader2 size={12} className="animate-spin text-primary-500" />
            <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400" role="status" aria-live="polite">儲存中</span>
          </div>
        )}
        {status === AppStatus.SUCCESS && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
            <CheckCircle2 size={12} aria-label="儲存成功" />
            <span className="text-[10px] font-semibold">已儲存</span>
          </div>
        )}

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
          title="設定"
          aria-label="開啟設定"
        >
          <Settings size={16} aria-hidden="true" />
        </button>

        {/* File Actions Group */}
        <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800/50" role="group" aria-label="檔案操作">
          <label
            className="cursor-pointer rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white hover:text-primary-600 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-primary-400"
            title="開啟 .md 檔案"
          >
            <Upload size={15} aria-hidden="true" />
            <input type="file" accept=".md,.txt" onChange={onLoadLocal} className="hidden" aria-label="上傳檔案" />
          </label>
          <button
            onClick={onSaveLocal}
            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white hover:text-primary-600 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-primary-400"
            title="儲存為 .md"
            aria-label="下載檔案"
          >
            <Download size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
