/**
 * CodeEditor 元件
 * ============================================
 * 統一的程式碼編輯器元件，支援行號顯示
 * 用於 Mermaid 和 Markdown 編輯
 */

'use client';

import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import type { EditorConfig } from '@/types/types';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  config: EditorConfig;
  ariaLabel?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = memo(
  ({ value, onChange, placeholder, config, ariaLabel }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const [lineCount, setLineCount] = useState(1);

    // 計算行數
    useEffect(() => {
      setLineCount(value.split('\n').length);
    }, [value]);

    // 同步滾動
    const handleScroll = useCallback(() => {
      if (textareaRef.current && lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    }, []);

    // 鍵盤快捷鍵：Tab 插入空格
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const { selectionStart, selectionEnd } = e.currentTarget;
        const newValue =
          value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd);
        onChange(newValue);
        // 設定游標位置
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
              selectionStart + 2;
          }
        });
      }
    }, [value, onChange]);

    return (
      <div className="relative flex h-full w-full overflow-hidden bg-white dark:bg-gray-900">
        {/* 行號顯示 */}
        <div
          ref={lineNumbersRef}
          className="w-12 shrink-0 select-none overflow-hidden border-r border-gray-100 bg-gray-50/80 py-4 pr-3 text-right font-mono text-gray-300 transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-600 scrollbar-hide"
          style={{
            lineHeight: config.lineHeight,
            fontSize: `${config.fontSize}px`,
          }}
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="px-1">{i + 1}</div>
          ))}
        </div>

        {/* 文字編輯區 */}
        <textarea
          ref={textareaRef}
          className="h-full flex-1 resize-none bg-transparent p-4 text-gray-800 outline-none transition-colors duration-200 dark:text-gray-100 overflow-y-auto scrollbar-hide"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          placeholder={placeholder}
          style={{
            fontFamily: config.fontFamily,
            fontSize: `${config.fontSize}px`,
            lineHeight: config.lineHeight,
            tabSize: 2,
          }}
          aria-label={ariaLabel || '程式碼編輯器'}
          aria-multiline="true"
        />
      </div>
    );
  }
);

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
