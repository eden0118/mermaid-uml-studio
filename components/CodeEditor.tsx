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
  errorLine?: number | null;
}

const CodeEditor: React.FC<CodeEditorProps> = memo(
  ({ value, onChange, placeholder, config, ariaLabel, errorLine }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const [lineCount, setLineCount] = useState(1);

    // 計算行數 (防抖處理)
    useEffect(() => {
      const timer = setTimeout(() => {
        setLineCount(value.split('\n').length);
      }, 100);
      return () => clearTimeout(timer);
    }, [value]);

    // 同步滾動
    const handleScroll = useCallback(() => {
      if (textareaRef.current && lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    }, []);

    // 鍵盤快捷鍵：Tab 插入空格 (優先使用 execCommand 保留瀏覽器 Undo 堆疊)
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const textarea = textareaRef.current;
          if (!textarea) return;

          let inserted = false;
          try {
            inserted = document.execCommand('insertText', false, '  ');
          } catch {
            inserted = false;
          }

          if (!inserted) {
            const { selectionStart, selectionEnd } = textarea;
            const newValue =
              value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd);
            onChange(newValue);
            requestAnimationFrame(() => {
              textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;
            });
          }
        }
      },
      [value, onChange]
    );

    return (
      <div className="relative flex h-full w-full overflow-hidden bg-white dark:bg-[#0d1117]">
        {/* 行號顯示 */}
        <div
          ref={lineNumbersRef}
          className="scrollbar-hide w-12 shrink-0 overflow-hidden border-r border-gray-200 bg-[#f6f8fa] py-4 pr-3 text-right font-mono text-gray-400 transition-colors duration-200 select-none dark:border-gray-800 dark:bg-[#161b22] dark:text-gray-500"
          style={{
            lineHeight: config.lineHeight,
            fontSize: `${config.fontSize}px`,
          }}
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => {
            const lineNum = i + 1;
            const isError = errorLine === lineNum;
            return (
              <div
                key={lineNum}
                className={`px-1 transition-colors ${
                  isError
                    ? 'rounded-sm bg-red-500/20 font-bold text-red-500 dark:bg-red-900/40 dark:text-red-400'
                    : ''
                }`}
                title={isError ? `第 ${lineNum} 行語法錯誤` : undefined}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* 文字編輯區 */}
        <textarea
          ref={textareaRef}
          className="scrollbar-hide h-full flex-1 resize-none overflow-y-auto bg-transparent p-4 text-[#24292f] transition-colors duration-200 outline-none dark:text-[#c9d1d9]"
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
