import React, { useState } from 'react';
import { Download, Upload, Save, FileText, Wand2, LogIn, Moon, Sun, FileCode, CheckCircle2, LayoutTemplate, ChevronDown, Home, Settings } from 'lucide-react';
import { AppStatus, Theme, ViewMode } from '../types';
import { UML_TEMPLATES } from '../constants';

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
  onOpenSettings
}) => {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shrink-0 transition-colors duration-200">
      <div className="flex items-center space-x-4">
        {/* Home Button */}
        <button 
          onClick={onGoHome}
          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          title="Back to Home"
        >
          <Home size={18} />
        </button>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
          <FileCode size={20} className="text-primary-600 dark:text-primary-400" />
          <span className="font-semibold text-sm capitalize">{viewMode}</span>
        </div>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Templates Dropdown (Only for Mermaid) */}
        {viewMode === 'mermaid' && (
          <div className="relative">
              <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-xs font-medium border border-gray-200 dark:border-gray-700"
              >
                  <LayoutTemplate size={14} />
                  <span>Templates</span>
                  <ChevronDown size={12} className={`transform transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
              </button>
              
              {showTemplates && (
                  <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowTemplates(false)}></div>
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          {UML_TEMPLATES.map((t) => (
                              <button
                                  key={t.name}
                                  onClick={() => {
                                      onSelectTemplate(t.code);
                                      setShowTemplates(false);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
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
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <div className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${autoUpdate ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ${autoUpdate ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">Auto-Update</span>
        </button>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
        
        {/* Filename Input */}
         <input 
            type="text" 
            value={fileName} 
            onChange={(e) => setFileName(e.target.value)}
            className="bg-transparent text-gray-600 dark:text-gray-300 text-xs hover:border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 outline-none w-48 py-1 transition-colors"
        />
      </div>

      <div className="flex items-center space-x-2">
        {status === AppStatus.SAVING && <span className="text-xs text-gray-500 animate-pulse mr-2">Saving...</span>}
        {status === AppStatus.SUCCESS && <CheckCircle2 size={16} className="text-green-500 mr-2" />}

        {/* Settings */}
        <button 
            onClick={onOpenSettings}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Settings"
        >
            <Settings size={18} />
        </button>

        {/* File Actions Group */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 space-x-1 border border-gray-200 dark:border-gray-700">
            <label className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-gray-700 rounded-md cursor-pointer transition-all" title="Open .md File">
                <Upload size={16} />
                <input type="file" accept=".md,.txt" onChange={onLoadLocal} className="hidden" />
            </label>
            <button 
                onClick={onSaveLocal}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all"
                title="Save as .md"
            >
                <Download size={16} />
            </button>
        </div>

        {/* Drive Actions Group */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 space-x-1 border border-gray-200 dark:border-gray-700">
          {!isDriveConnected ? (
            <button
              onClick={onGoogleLogin}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">Drive</span>
            </button>
          ) : (
            <>
              <button
                  onClick={onLoadFromDrive}
                  className="p-1.5 text-green-600 dark:text-green-400 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all"
                  title="Open from Google Drive"
              >
                  <FileText size={16} />
              </button>
              <button
                  onClick={onSaveToDrive}
                  className="p-1.5 text-green-600 dark:text-green-400 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all"
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
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
