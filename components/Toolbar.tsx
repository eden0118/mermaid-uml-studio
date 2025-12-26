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
import { AppStatus, Theme, ViewMode } from '@/types';
import { UML_TEMPLATES } from '@/constants';

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
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 transition-colors duration-200 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center space-x-4">
        {/* Home Button */}
        <button
          onClick={onGoHome}
          className="hover:text-primary-600 dark:hover:text-primary-400 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          title="Back to Home"
        >
          <Home size={18} />
        </button>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
          <FileCode size={20} className="text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-semibold capitalize">{viewMode}</span>
        </div>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Templates Dropdown (Only for Mermaid) */}
        {viewMode === 'mermaid' && (
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center space-x-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <LayoutTemplate size={14} />
              <span>Templates</span>
              <ChevronDown
                size={12}
                className={`transform transition-transform ${showTemplates ? 'rotate-180' : ''}`}
              />
            </button>

            {showTemplates && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowTemplates(false)}></div>
                <div className="animate-in fade-in zoom-in-95 absolute top-full left-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl duration-100 dark:border-gray-700 dark:bg-gray-800">
                  {UML_TEMPLATES.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => {
                        onSelectTemplate(t.code);
                        setShowTemplates(false);
                      }}
                      className="hover:bg-primary-50 hover:text-primary-600 dark:hover:text-primary-400 w-full px-4 py-2 text-left text-xs text-gray-700 transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {viewMode === 'mermaid' && <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />}

        {/* Auto Update Toggle */}
        <button
          onClick={toggleAutoUpdate}
          className="group flex cursor-pointer items-center space-x-2"
        >
          <div
            className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${autoUpdate ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div
              className={`absolute top-0.5 left-0.5 h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${autoUpdate ? 'translate-x-4' : 'translate-x-0'}`}
            />
          </div>
          <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200">
            Auto-Update
          </span>
        </button>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Filename Input */}
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="focus:border-primary-500 w-48 border-gray-300 bg-transparent py-1 text-xs text-gray-600 transition-colors outline-none hover:border-b dark:border-gray-600 dark:text-gray-300"
        />
      </div>

      <div className="flex items-center space-x-2">
        {status === AppStatus.SAVING && (
          <span className="mr-2 animate-pulse text-xs text-gray-500">Saving...</span>
        )}
        {status === AppStatus.SUCCESS && <CheckCircle2 size={16} className="mr-2 text-green-500" />}

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          title="Settings"
        >
          <Settings size={18} />
        </button>

        {/* File Actions Group */}
        <div className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800">
          <label
            className="hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer rounded-md p-1.5 text-gray-600 transition-all hover:bg-white dark:text-gray-400 dark:hover:bg-gray-700"
            title="Open .md File"
          >
            <Upload size={16} />
            <input type="file" accept=".md,.txt" onChange={onLoadLocal} className="hidden" />
          </label>
          <button
            onClick={onSaveLocal}
            className="hover:text-primary-600 dark:hover:text-primary-400 rounded-md p-1.5 text-gray-600 transition-all hover:bg-white dark:text-gray-400 dark:hover:bg-gray-700"
            title="Save as .md"
          >
            <Download size={16} />
          </button>
        </div>

        {/* Drive Actions Group */}
        <div className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800">
          {!isDriveConnected ? (
            <button
              onClick={onGoogleLogin}
              className="hover:text-primary-600 dark:hover:text-primary-400 flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 transition-colors dark:text-gray-400"
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">Drive</span>
            </button>
          ) : (
            <>
              <button
                onClick={onLoadFromDrive}
                className="rounded-md p-1.5 text-green-600 transition-all hover:bg-white dark:text-green-400 dark:hover:bg-gray-700"
                title="Open from Google Drive"
              >
                <FileText size={16} />
              </button>
              <button
                onClick={onSaveToDrive}
                className="rounded-md p-1.5 text-green-600 transition-all hover:bg-white dark:text-green-400 dark:hover:bg-gray-700"
                title="Save to Google Drive"
              >
                <Save size={16} />
              </button>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
