/**
 * MarkdownPreview 元件
 * ============================================
 * 使用 marked.js 渲染 Markdown 的預覽元件
 * 支援嵌入式 Mermaid 圖表
 */

'use client';

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { marked } from 'marked';
import { Theme, PreviewConfig } from '@/types/types';

interface MarkdownPreviewProps {
  code: string;
  theme: Theme;
  previewConfig?: PreviewConfig;
}

let mermaidRenderCounter = 0;

const MarkdownPreview: React.FC<MarkdownPreviewProps> = memo(({ code, theme, previewConfig }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<typeof import('mermaid').default | null>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  // Dynamic import mermaid (avoid SSR crash)
  useEffect(() => {
    let cancelled = false;
    import('mermaid').then((mod) => {
      if (!cancelled) {
        mermaidRef.current = mod.default;
        setMermaidLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Initialize Mermaid config when theme changes
  useEffect(() => {
    if (!mermaidRef.current) return;
    mermaidRef.current.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
    });
  }, [theme, mermaidLoaded]);

  // Handle Markdown Parsing + Mermaid Block Detection
  useEffect(() => {
    const parseMarkdown = async () => {
      if (!code) {
        setHtmlContent('');
        return;
      }

      const renderer = new marked.Renderer();

      renderer.code = ({ text, lang }) => {
        if (lang === 'mermaid') {
          const id = `md-mermaid-${++mermaidRenderCounter}`;
          // Encode text to preserve it for mermaid rendering
          const encoded = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          return `<div class="mermaid-block" data-mermaid-id="${id}" data-mermaid-code="${encodeURIComponent(text)}">${encoded}</div>`;
        }
        const escapedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre><code class="language-${lang || ''}">${escapedText}</code></pre>`;
      };

      try {
        const html = await marked.parse(code, { renderer });
        setHtmlContent(html);
      } catch (e) {
        console.error('Markdown parsing error', e);
        setHtmlContent('<p style="color: #ef4444;">Error parsing markdown</p>');
      }
    };
    parseMarkdown();
  }, [code]);

  // Render Mermaid blocks after HTML is set
  const renderMermaidBlocks = useCallback(async () => {
    if (!containerRef.current || !mermaidRef.current) return;

    const blocks = containerRef.current.querySelectorAll('.mermaid-block');
    if (blocks.length === 0) return;

    for (const block of Array.from(blocks)) {
      const mermaidCode = decodeURIComponent(block.getAttribute('data-mermaid-code') || '');
      const id = block.getAttribute('data-mermaid-id') || `md-mermaid-${++mermaidRenderCounter}`;

      if (!mermaidCode) continue;

      try {
        const { svg } = await mermaidRef.current.render(id, mermaidCode.trim());
        block.innerHTML = svg;
        block.classList.add('mermaid-rendered');
      } catch (err) {
        console.error('Mermaid render error in Markdown:', err);
        block.innerHTML = `<div style="color: #ef4444; padding: 0.5rem; border: 1px solid #fecaca; border-radius: 0.375rem; font-size: 0.875rem;">⚠ Mermaid syntax error</div>`;
      }
    }
  }, []);

  useEffect(() => {
    if (htmlContent && mermaidLoaded) {
      // Wait a tick for DOM update
      requestAnimationFrame(() => {
        renderMermaidBlocks();
      });
    }
  }, [htmlContent, theme, mermaidLoaded, renderMermaidBlocks]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white transition-colors duration-200 dark:bg-gray-950">
      {/* Inject Custom CSS */}
      {previewConfig?.customCss && <style>{previewConfig.customCss}</style>}

      {/* Empty State */}
      {!code && (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-600">
            <div className="rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
                <path d="M14 2v6h6"/>
                <path d="M16 13H8M16 17H8M10 9H8"/>
              </svg>
            </div>
            <p className="text-sm font-medium">在左側輸入 Markdown 內容開始撰寫</p>
          </div>
        </div>
      )}

      {code && (
        <div
          ref={containerRef}
          className="markdown-preview flex-1 overflow-auto p-8"
        >
          {/* Scoped Markdown Styles */}
          <style>{`
            .markdown-preview { color: ${theme === 'dark' ? '#e5e7eb' : '#1f2937'}; max-width: 48rem; margin: 0 auto; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
            .markdown-preview h1 { color: ${theme === 'dark' ? '#f1f5f9' : '#0f172a'}; font-weight: 800; font-size: 2.25em; margin-top: 0; margin-bottom: 0.8em; line-height: 1.15; letter-spacing: -0.025em; }
            .markdown-preview h2 { color: ${theme === 'dark' ? '#e2e8f0' : '#1e293b'}; margin-top: 2em; margin-bottom: 0.8em; font-weight: 700; font-size: 1.5em; line-height: 1.33; letter-spacing: -0.02em; padding-bottom: 0.3em; border-bottom: 1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}; }
            .markdown-preview h3 { color: ${theme === 'dark' ? '#cbd5e1' : '#334155'}; font-weight: 600; font-size: 1.25em; margin-top: 1.6em; margin-bottom: 0.6em; line-height: 1.6; }
            .markdown-preview h4 { color: ${theme === 'dark' ? '#94a3b8' : '#475569'}; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; line-height: 1.5; }
            .markdown-preview p { color: ${theme === 'dark' ? '#cbd5e1' : '#374151'}; line-height: 1.8; margin-top: 1.25em; margin-bottom: 1.25em; }
            .markdown-preview strong { color: ${theme === 'dark' ? '#f1f5f9' : '#0f172a'}; font-weight: 600; }
            .markdown-preview em { font-style: italic; }
            .markdown-preview del { text-decoration: line-through; opacity: 0.7; }
            .markdown-preview code { color: ${theme === 'dark' ? '#fbbf24' : '#c2410c'}; background-color: ${theme === 'dark' ? '#1e293b' : '#f1f5f9'}; padding: 0.2em 0.4em; border-radius: 0.375rem; font-size: 0.875em; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
            .markdown-preview a { color: ${theme === 'dark' ? '#60a5fa' : '#2563eb'}; text-decoration: underline; text-underline-offset: 2px; font-weight: 500; transition: color 0.15s; }
            .markdown-preview a:hover { color: ${theme === 'dark' ? '#93c5fd' : '#1d4ed8'}; }
            .markdown-preview blockquote { border-left: 3px solid ${theme === 'dark' ? '#0ea5e9' : '#0ea5e9'}; color: ${theme === 'dark' ? '#94a3b8' : '#64748b'}; font-style: italic; padding: 0.5em 1em; margin: 1.6em 0; background: ${theme === 'dark' ? '#0f172a' : '#f8fafc'}; border-radius: 0 0.5rem 0.5rem 0; }

            /* Lists */
            .markdown-preview ul, .markdown-preview ol { color: ${theme === 'dark' ? '#cbd5e1' : '#374151'}; margin-top: 1em; margin-bottom: 1em; padding-left: 1.625em; }
            .markdown-preview ul { list-style-type: disc; }
            .markdown-preview ol { list-style-type: decimal; }
            .markdown-preview li { margin-top: 0.4em; margin-bottom: 0.4em; line-height: 1.75; }
            .markdown-preview ul > li::marker { color: ${theme === 'dark' ? '#64748b' : '#94a3b8'}; }
            .markdown-preview ol > li::marker { color: ${theme === 'dark' ? '#64748b' : '#94a3b8'}; font-weight: 500; }

            /* Task lists */
            .markdown-preview input[type="checkbox"] { margin-right: 0.5em; accent-color: #0ea5e9; }

            /* Code blocks */
            .markdown-preview pre { background-color: ${theme === 'dark' ? '#0f172a' : '#f8fafc'}; border: 1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}; border-radius: 0.75rem; padding: 1.25rem; overflow-x: auto; margin: 1.5em 0; }
            .markdown-preview pre code { background-color: transparent; padding: 0; color: ${theme === 'dark' ? '#e2e8f0' : '#334155'}; font-size: 0.875em; line-height: 1.7; border-radius: 0; }

            /* Tables */
            .markdown-preview table { color: ${theme === 'dark' ? '#e2e8f0' : '#374151'}; width: 100%; border-collapse: collapse; margin: 2em 0; font-size: 0.875em; }
            .markdown-preview th { color: ${theme === 'dark' ? '#f1f5f9' : '#0f172a'}; font-weight: 600; border-bottom: 2px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}; padding: 0.75em 1em; text-align: left; }
            .markdown-preview td { padding: 0.75em 1em; border-bottom: 1px solid ${theme === 'dark' ? '#1e293b' : '#f1f5f9'}; }
            .markdown-preview tr:hover td { background: ${theme === 'dark' ? '#1e293b' : '#f8fafc'}; }
            .markdown-preview hr { border: none; border-top: 1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}; margin: 2.5em 0; }
            .markdown-preview img { margin: 1.5em 0; border-radius: 0.75rem; max-width: 100%; }

            /* Mermaid blocks */
            .mermaid-block { display: flex; justify-content: center; margin: 2rem 0; padding: 1rem; background: ${theme === 'dark' ? '#0f172a' : '#f8fafc'}; border-radius: 0.75rem; border: 1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}; }
            .mermaid-rendered { border: none; background: transparent; }
          `}</style>

          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      )}
    </div>
  );
});

MarkdownPreview.displayName = 'MarkdownPreview';

export default MarkdownPreview;
