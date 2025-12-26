import React, { useState } from 'react';
import {
  Download,
  Upload,
  Save,
  FileText,
  LogIn,
  Moon,
  Sun,
  FileCode,
  CheckCircle2,
  LayoutTemplate,
  ChevronDown,
  Home,
  Settings,
} from 'lucide-react';
import { AppStatus, Theme, ViewMode } from '@/types/types';
import { UML_TEMPLATES } from '@/lib/constants';

interface ToolbarProps {
  fileName: string;
  setFileName: (name: string) => void;
  onLoadLocal: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveLocal: () => void;
  onGoogleLogin: () => void;
  onSaveToDrive: () => void;
  onLoadFromDrive: () => void;
  isDriveConnected: boolean;
  status: AppStatus;
  theme: Theme;
  toggleTheme: () => void;
  autoUpdate: boolean;
  toggleAutoUpdate: () => void;
  onSelectTemplate: (code: string) => void;
  viewMode: ViewMode;
  onGoHome: () => void;
  onOpenSettings: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  fileName,
  setFileName,
  onLoadLocal,
  onSaveLocal,
  onGoogleLogin,
  onSaveToDrive,
  onLoadFromDrive,
  isDriveConnected,
  status,
  theme,
  toggleTheme,
  autoUpdate,
  toggleAutoUpdate,
  onSelectTemplate,
  viewMode,
  onGoHome,
  onOpenSettings,
}) => {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 transition-colors duration-200 dark:border-gray-700 dark:bg-gray-900" role="toolbar" aria-label="編輯器工具列">
      <div className="flex items-center space-x-4">
        {/* Home Button */}
        <button
          onClick={onGoHome}
          className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary-400"
          title="返回首頁"
          aria-label="返回首頁"
        >
          <Home size={18} aria-hidden="true" />
        </button>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true" />

        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
          <FileCode size={20} className="text-primary-600 dark:text-primary-400" aria-hidden="true" />
          <span className="text-sm font-semibold capitalize">{viewMode}</span>
        </div>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true" />

        {/* Templates Dropdown (Only for Mermaid) */}
        {viewMode === 'mermaid' && (
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center space-x-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="選擇模板"
              aria-expanded={showTemplates}
              aria-haspopup="true"
            >
              <LayoutTemplate size={14} aria-hidden="true" />
              <span>模板</span>
              <ChevronDown
                size={12}
                className={`transform transition-transform ${showTemplates ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {showTemplates && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowTemplates(false)} aria-hidden="true"></div>
                <div className="animate-in fade-in zoom-in-95 absolute left-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl duration-100 dark:border-gray-700 dark:bg-gray-800" role="menu" aria-label="模板選單">
                  {UML_TEMPLATES.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => {
                        onSelectTemplate(t.code);
                        setShowTemplates(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-600 focus:bg-primary-50 focus:text-primary-600 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-400"
                      role="menuitem"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {viewMode === 'mermaid' && <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true" />}

        {/* Auto Update Toggle */}
        <button
          onClick={toggleAutoUpdate}
          className="group flex cursor-pointer items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
          role="switch"
          aria-checked={autoUpdate}
          aria-label="自動更新預覽"
        >
          <div
            className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${autoUpdate ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            aria-hidden="true"
          >
            <div
              className={`absolute left-0.5 top-0.5 h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${autoUpdate ? 'translate-x-4' : 'translate-x-0'}`}
            />
          </div>
          <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200">
            自動更新
          </span>
        </button>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true" />

        {/* Filename Input */}
        <label htmlFor="filename-input" className="sr-only">檔案名稱</label>
        <input
          id="filename-input"
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="w-48 border-gray-300 bg-transparent py-1 text-xs text-gray-600 outline-none transition-colors hover:border-b focus:border-primary-500 dark:border-gray-600 dark:text-gray-300"
          aria-label="檔案名稱"
        />
      </div>

      <div className="flex items-center space-x-2">
        {status === AppStatus.SAVING && (
          <span className="mr-2 animate-pulse text-xs text-gray-500" role="status" aria-live="polite">儲存中...</span>
        )}
        {status === AppStatus.SUCCESS && <CheckCircle2 size={16} className="mr-2 text-green-500" aria-label="儲存成功" />}

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-800"
          title="設定"
          aria-label="開啟設定"
        >
          <Settings size={18} aria-hidden="true" />
        </button>

        {/* File Actions Group */}
        <div className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800" role="group" aria-label="檔案操作">
          <label
            className="cursor-pointer rounded-md p-1.5 text-gray-600 transition-all hover:bg-white hover:text-primary-600 focus-within:ring-2 focus-within:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-primary-400"
            title="開啟 .md 檔案"
          >
            <Upload size={16} aria-hidden="true" />
            <input type="file" accept=".md,.txt" onChange={onLoadLocal} className="hidden" aria-label="上傳檔案" />
          </label>
          <button
            onClick={onSaveLocal}
            className="rounded-md p-1.5 text-gray-600 transition-all hover:bg-white hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-primary-400"
            title="儲存為 .md"
            aria-label="下載檔案"
          >
            <Download size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Drive Actions Group */}
        <div className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800" role="group" aria-label="Google Drive 操作">
          {!isDriveConnected ? (
            <button
              onClick={onGoogleLogin}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 transition-colors hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
              aria-label="連接 Google Drive"
            >
              <LogIn size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Drive</span>
            </button>
          ) : (
            <>
              <button
                onClick={onLoadFromDrive}
                className="rounded-md p-1.5 text-green-600 transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-green-400 dark:hover:bg-gray-700"
                title="從 Google Drive 開啟"
                aria-label="從 Google Drive 開啟"
              >
                <FileText size={16} aria-hidden="true" />
              </button>
              <button
                onClick={onSaveToDrive}
                className="rounded-md p-1.5 text-green-600 transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-green-400 dark:hover:bg-gray-700"
                title="儲存到 Google Drive"
                aria-label="儲存到 Google Drive"
              >
                <Save size={16} aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-800"
          title={`切換至${theme === 'light' ? '深色' : '淺色'}模式`}
          aria-label={`切換至${theme === 'light' ? '深色' : '淺色'}模式`}
        >
          {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
