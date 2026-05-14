/**
 * SettingsModal 元件
 * ============================================
 * 編輯器設定對話框，支援字體、行高等配置
 */

'use client';

import React, { useState, useEffect, memo } from 'react';
import { EditorConfig, PreviewConfig } from '@/types/types';
import { X, Type, Palette } from 'lucide-react';
import { THEME_CONFIG } from '@/lib/theme.config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorConfig: EditorConfig;
  setEditorConfig: (config: EditorConfig) => void;
  previewConfig: PreviewConfig;
  setPreviewConfig: (config: PreviewConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = memo(
  ({ isOpen, onClose, editorConfig, setEditorConfig, previewConfig, setPreviewConfig }) => {
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

    // Handle ESC key
    useEffect(() => {
      if (!isOpen) return;
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="animate-scale-in flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
            <h2 id="settings-title" className="text-base font-bold text-gray-900 dark:text-gray-100">設定</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              aria-label="關閉設定"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-700" role="tablist" aria-label="設定分頁">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === 'editor'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              role="tab"
              aria-selected={activeTab === 'editor'}
              aria-controls="editor-panel"
            >
              <Type size={15} aria-hidden="true" />
              <span>編輯器</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              role="tab"
              aria-selected={activeTab === 'preview'}
              aria-controls="preview-panel"
            >
              <Palette size={15} aria-hidden="true" />
              <span>預覽</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'editor' && (
              <div className="space-y-5" role="tabpanel" id="editor-panel" aria-labelledby="editor-tab">
                {/* Font Size */}
                <div>
                  <label htmlFor="font-size-slider" className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span>字體大小</span>
                    <span className="font-mono text-xs text-gray-400">{editorConfig.fontSize}px</span>
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
                    className="w-full accent-primary-500"
                  />
                </div>

                {/* Line Height */}
                <div>
                  <label htmlFor="line-height-slider" className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span>行高</span>
                    <span className="font-mono text-xs text-gray-400">{editorConfig.lineHeight}</span>
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
                    className="w-full accent-primary-500"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label htmlFor="font-family-select" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    字型系列
                  </label>
                  <select
                    id="font-family-select"
                    value={editorConfig.fontFamily}
                    onChange={(e) => setEditorConfig({ ...editorConfig, fontFamily: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                  >
                    <option value={THEME_CONFIG.editor.fontFamilies.mono}>Monospace（預設）</option>
                    <option value={THEME_CONFIG.editor.fontFamilies.sans}>Sans Serif</option>
                    <option value={THEME_CONFIG.editor.fontFamilies.serif}>Serif</option>
                    <option value={THEME_CONFIG.editor.fontFamilies.firaCode}>Fira Code</option>
                  </select>
                </div>

                {/* Preview */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">預覽</p>
                  <p
                    className="text-gray-700 dark:text-gray-200"
                    style={{
                      fontSize: `${editorConfig.fontSize}px`,
                      fontFamily: editorConfig.fontFamily,
                      lineHeight: editorConfig.lineHeight,
                    }}
                  >
                    function hello() {'{'}<br />
                    {'  '}return &quot;Hello, World!&quot;;<br />
                    {'}'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-4" role="tabpanel" id="preview-panel" aria-labelledby="preview-tab">
                <div>
                  <label htmlFor="custom-css-textarea" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    自訂 CSS 樣式
                  </label>
                  <p className="mb-3 text-xs text-gray-400">
                    可針對 <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-700">.markdown-preview</code> 內的元素進行覆寫
                  </p>
                  <textarea
                    id="custom-css-textarea"
                    value={previewConfig.customCss}
                    onChange={(e) =>
                      setPreviewConfig({ ...previewConfig, customCss: e.target.value })
                    }
                    placeholder={`.markdown-preview h1 {\n  color: #0ea5e9;\n}\n.markdown-preview p {\n  font-size: 1.1rem;\n}`}
                    className="h-48 w-full resize-none rounded-lg border border-gray-200 bg-white p-3 font-mono text-sm text-gray-700 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                    aria-label="自訂 CSS 樣式"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-gray-100 px-5 py-3 dark:border-gray-700">
            <button
              onClick={onClose}
              className="btn btn-primary !py-2"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    );
  }
);

SettingsModal.displayName = 'SettingsModal';

export default SettingsModal;
