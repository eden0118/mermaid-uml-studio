/**
 * CodeEditor 元件
 * ============================================
 * 統一的程式碼編輯器元件，支援行號顯示
 * 用於 Mermaid 和 Markdown 編輯
 */

import React, { useRef, useEffect, useState, memo } from 'react';
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
    const [lineCount, setLineCount] = useState(1);

    // 計算行數
    useEffect(() => {
      setLineCount(value.split('\n').length);
    }, [value]);

    // 同步滾動
    const handleScroll = () => {
      if (textareaRef.current) {
        const lineNumbers = document.getElementById('line-numbers');
        if (lineNumbers) {
          lineNumbers.scrollTop = textareaRef.current.scrollTop;
        }
      }
    };

    // 鍵盤快捷鍵：Tab 插入空格
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const { selectionStart, selectionEnd } = e.currentTarget;
        const newValue =
          value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd);
        onChange(newValue);
        // 設定游標位置
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
              selectionStart + 2;
          }
        }, 0);
      }
    };

    return (
      <div className="relative flex flex-1 overflow-hidden">
        {/* 行號顯示 */}
        <div
          id="line-numbers"
          className="w-10 select-none overflow-y-auto overflow-x-hidden border-r border-gray-200 bg-gray-50 pb-4 pr-2 pt-4 text-right font-mono text-xs text-gray-400 transition-colors duration-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500 scrollbar-hide"
          style={{
            lineHeight: config.lineHeight,
            fontSize: `${config.fontSize}px`,
          }}
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>

        {/* 文字編輯區 */}
        <textarea
          ref={textareaRef}
          className="h-full flex-1 resize-none bg-white p-4 text-gray-800 outline-none transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100 overflow-y-auto"
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
