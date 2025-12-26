import React, { useState } from 'react';
import { EditorConfig, PreviewConfig, Theme } from '../types';
import { X, Type, Palette } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorConfig: EditorConfig;
  setEditorConfig: (config: EditorConfig) => void;
  previewConfig: PreviewConfig;
  setPreviewConfig: (config: PreviewConfig) => void;
  theme: Theme;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  editorConfig,
  setEditorConfig,
  previewConfig,
  setPreviewConfig,
  theme
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'editor' 
                ? 'bg-white dark:bg-gray-800 text-primary-600 border-b-2 border-primary-500' 
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Type size={16} />
            <span>Editor Style</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'preview' 
                ? 'bg-white dark:bg-gray-800 text-primary-600 border-b-2 border-primary-500' 
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Palette size={16} />
            <span>Preview Style</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'editor' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Size ({editorConfig.fontSize}px)</label>
                <input 
                  type="range" 
                  min="10" 
                  max="24" 
                  value={editorConfig.fontSize}
                  onChange={(e) => setEditorConfig({...editorConfig, fontSize: parseInt(e.target.value)})}
                  className="w-full accent-primary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Line Height ({editorConfig.lineHeight})</label>
                <input 
                  type="range" 
                  min="1" 
                  max="2.5" 
                  step="0.1"
                  value={editorConfig.lineHeight}
                  onChange={(e) => setEditorConfig({...editorConfig, lineHeight: parseFloat(e.target.value)})}
                  className="w-full accent-primary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Family</label>
                <select 
                  value={editorConfig.fontFamily}
                  onChange={(e) => setEditorConfig({...editorConfig, fontFamily: e.target.value})}
                  className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">Monospace (Default)</option>
                  <option value="ui-sans-serif, system-ui, sans-serif">Sans Serif</option>
                  <option value="'Courier New', Courier, monospace">Courier</option>
                  <option value="'Fira Code', monospace">Fira Code (if installed)</option>
                </select>
              </div>

              <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-950">
                <p 
                    className="text-gray-800 dark:text-gray-200"
                    style={{ 
                        fontSize: `${editorConfig.fontSize}px`,
                        fontFamily: editorConfig.fontFamily,
                        lineHeight: editorConfig.lineHeight
                    }}
                >
                    Preview of editor text style.
                    <br/>
                    function test() {'{ return true; }'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom CSS for Preview
                    <span className="block text-xs text-gray-500 font-normal mt-1">
                        Override default styles for the Markdown/Mermaid preview pane. 
                        Target classes like <code>.prose</code>, <code>h1</code>, <code>p</code>.
                    </span>
                </label>
                <textarea
                    value={previewConfig.customCss}
                    onChange={(e) => setPreviewConfig({...previewConfig, customCss: e.target.value})}
                    placeholder={`.prose h1 { color: #10b981; }\n.prose p { font-size: 1.1rem; }`}
                    className="w-full h-48 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;