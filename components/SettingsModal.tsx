import React, { useState } from 'react';
import { EditorConfig, PreviewConfig, Theme } from '@/types/types';
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
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex flex-1 items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'editor'
                ? 'border-b-2 border-primary-500 bg-white text-primary-600 dark:bg-gray-800'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <Type size={16} />
            <span>Editor Style</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex flex-1 items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'border-b-2 border-primary-500 bg-white text-primary-600 dark:bg-gray-800'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <Palette size={16} />
            <span>Preview Style</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'editor' && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font Size ({editorConfig.fontSize}px)
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={editorConfig.fontSize}
                  onChange={(e) =>
                    setEditorConfig({ ...editorConfig, fontSize: parseInt(e.target.value) })
                  }
                  className="w-full accent-primary-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Line Height ({editorConfig.lineHeight})
                </label>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.1"
                  value={editorConfig.lineHeight}
                  onChange={(e) =>
                    setEditorConfig({ ...editorConfig, lineHeight: parseFloat(e.target.value) })
                  }
                  className="w-full accent-primary-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font Family
                </label>
                <select
                  value={editorConfig.fontFamily}
                  onChange={(e) => setEditorConfig({ ...editorConfig, fontFamily: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-700 outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">
                    Monospace (Default)
                  </option>
                  <option value="ui-sans-serif, system-ui, sans-serif">Sans Serif</option>
                  <option value="'Courier New', Courier, monospace">Courier</option>
                  <option value="'Fira Code', monospace">Fira Code (if installed)</option>
                </select>
              </div>

              <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
                <p
                  className="text-gray-800 dark:text-gray-200"
                  style={{
                    fontSize: `${editorConfig.fontSize}px`,
                    fontFamily: editorConfig.fontFamily,
                    lineHeight: editorConfig.lineHeight,
                  }}
                >
                  Preview of editor text style.
                  <br />
                  function test() {'{ return true; }'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Custom CSS for Preview
                  <span className="mt-1 block text-xs font-normal text-gray-500">
                    Override default styles for the Markdown/Mermaid preview pane. Target classes
                    like <code>.prose</code>, <code>h1</code>, <code>p</code>.
                  </span>
                </label>
                <textarea
                  value={previewConfig.customCss}
                  onChange={(e) =>
                    setPreviewConfig({ ...previewConfig, customCss: e.target.value })
                  }
                  placeholder={`.prose h1 { color: #10b981; }\n.prose p { font-size: 1.1rem; }`}
                  className="h-48 w-full resize-none rounded-md border border-gray-300 bg-white p-3 font-mono text-sm text-gray-800 outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-200"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="rounded-md bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
