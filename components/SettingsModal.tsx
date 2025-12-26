import React, { useState, memo } from 'react';
import { EditorConfig, PreviewConfig, Theme } from '@/types/types';
import { X, Type, Palette } from 'lucide-react';
import { THEME_CONFIG } from '@/lib/theme.config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorConfig: EditorConfig;
  setEditorConfig: (config: EditorConfig) => void;
  previewConfig: PreviewConfig;
  setPreviewConfig: (config: PreviewConfig) => void;
  theme: Theme;
}

const SettingsModal: React.FC<SettingsModalProps> = memo(
  ({ isOpen, onClose, editorConfig, setEditorConfig, previewConfig, setPreviewConfig, theme }) => {
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 id="settings-title" className="text-lg font-bold text-gray-800 dark:text-gray-100">設定</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="關閉設定"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700" role="tablist" aria-label="設定分頁">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex flex-1 items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              activeTab === 'editor'
                ? 'border-b-2 border-primary-500 bg-white text-primary-600 dark:bg-gray-800'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
            role="tab"
            aria-selected={activeTab === 'editor'}
            aria-controls="editor-panel"
          >
            <Type size={16} aria-hidden="true" />
            <span>編輯器樣式</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex flex-1 items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              activeTab === 'preview'
                ? 'border-b-2 border-primary-500 bg-white text-primary-600 dark:bg-gray-800'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
            role="tab"
            aria-selected={activeTab === 'preview'}
            aria-controls="preview-panel"
          >
            <Palette size={16} aria-hidden="true" />
            <span>預覽樣式</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'editor' && (
            <div className="space-y-6" role="tabpanel" id="editor-panel" aria-labelledby="editor-tab">
              <div>
                <label htmlFor="font-size-slider" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  字體大小 ({editorConfig.fontSize}px)
                </label>
                <input
                  id="font-size-slider"
                  type="range"
                  min={THEME_CONFIG.editor.fontSize.min}
                  max={THEME_CONFIG.editor.fontSize.max}
                  value={editorConfig.fontSize}
                  onChange={(e) =>
                    setEditorConfig({ ...editorConfig, fontSize: parseInt(e.target.value) })
                  }
                  className="w-full accent-primary-600"
                  aria-valuemin={THEME_CONFIG.editor.fontSize.min}
                  aria-valuemax={THEME_CONFIG.editor.fontSize.max}
                  aria-valuenow={editorConfig.fontSize}
                />
              </div>

              <div>
                <label htmlFor="line-height-slider" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  行高 ({editorConfig.lineHeight})
                </label>
                <input
                  id="line-height-slider"
                  type="range"
                  min={THEME_CONFIG.editor.lineHeight.min}
                  max={THEME_CONFIG.editor.lineHeight.max}
                  step={THEME_CONFIG.editor.lineHeight.step}
                  value={editorConfig.lineHeight}
                  onChange={(e) =>
                    setEditorConfig({ ...editorConfig, lineHeight: parseFloat(e.target.value) })
                  }
                  className="w-full accent-primary-600"
                  aria-valuemin={THEME_CONFIG.editor.lineHeight.min}
                  aria-valuemax={THEME_CONFIG.editor.lineHeight.max}
                  aria-valuenow={editorConfig.lineHeight}
                />
              </div>

              <div>
                <label htmlFor="font-family-select" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  字型系列
                </label>
                <select
                  id="font-family-select"
                  value={editorConfig.fontFamily}
                  onChange={(e) => setEditorConfig({ ...editorConfig, fontFamily: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-700 outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value={THEME_CONFIG.editor.fontFamilies.mono}>
                    Monospace（預設）
                  </option>
                  <option value={THEME_CONFIG.editor.fontFamilies.sans}>Sans Serif</option>
                  <option value={THEME_CONFIG.editor.fontFamilies.serif}>Serif</option>
                  <option value={THEME_CONFIG.editor.fontFamilies.firaCode}>Fira Code（需安裝）</option>
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
                  編輯器文字樣式預覽
                  <br />
                  function test() {'{ return true; }'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4" role="tabpanel" id="preview-panel" aria-labelledby="preview-tab">
              <div>
                <label htmlFor="custom-css-textarea" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  自訂 CSS 樣式
                  <span className="mt-1 block text-xs font-normal text-gray-500">
                    覆寫預覽面板的預設樣式。可針對 <code>.prose</code>、<code>h1</code>、<code>p</code> 等類別進行自訂
                  </span>
                </label>
                <textarea
                  id="custom-css-textarea"
                  value={previewConfig.customCss}
                  onChange={(e) =>
                    setPreviewConfig({ ...previewConfig, customCss: e.target.value })
                  }
                  placeholder={`.prose h1 { color: #10b981; }\n.prose p { font-size: 1.1rem; }`}
                  className="h-48 w-full resize-none rounded-md border border-gray-300 bg-white p-3 font-mono text-sm text-gray-800 outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-200"
                  aria-label="自訂 CSS 樣式"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="rounded-md bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
});

SettingsModal.displayName = 'SettingsModal';

export default SettingsModal;
