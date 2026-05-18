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
  const [isRendering, setIsRendering] = useState(false);
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

  // Handle Markdown Parsing + Mermaid Block Detection
  useEffect(() => {
    const parseMarkdown = async () => {
      if (!code) {
        setHtmlContent('');
        return;
      }

      setIsRendering(true);
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
        setHtmlContent('<p style="color: #cf222e;">Error parsing markdown</p>');
      } finally {
        setIsRendering(false);
      }
    };
    parseMarkdown();
  }, [code]);

  // Render Mermaid blocks after HTML is set
  const renderMermaidBlocks = useCallback(async () => {
    if (!containerRef.current || !mermaidRef.current) return;

    const blocks = containerRef.current.querySelectorAll('.mermaid-block');
    if (blocks.length === 0) return;

    // 確保在渲染前初始化正確的主題
    mermaidRef.current.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      themeVariables: theme === 'dark' ? {
        background: '#0d1117',
        primaryColor: '#161b22',
        primaryTextColor: '#c9d1d9',
        primaryBorderColor: '#30363d',
        lineColor: '#8b949e',
        secondaryColor: '#0d1117',
        tertiaryColor: '#161b22',
      } : {
        background: '#ffffff',
        primaryColor: '#f6f8fa',
        primaryTextColor: '#24292f',
        primaryBorderColor: '#d0d7de',
        lineColor: '#24292f',
        secondaryColor: '#ffffff',
        tertiaryColor: '#f6f8fa',
      }
    });

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
        block.innerHTML = `<div style="color: #cf222e; padding: 0.5rem; border: 1px solid #d0d7de; border-radius: 6px; font-size: 0.875rem;">⚠ Mermaid syntax error</div>`;
      }
    }
  }, [theme]);

  useEffect(() => {
    if (htmlContent && mermaidLoaded) {
      // Wait a tick for DOM update
      requestAnimationFrame(() => {
        renderMermaidBlocks();
      });
    }
  }, [htmlContent, mermaidLoaded, renderMermaidBlocks]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0d1117] transition-colors duration-200">
      {/* Inject Custom CSS */}
      {previewConfig?.customCss && <style>{previewConfig.customCss}</style>}

      {/* Empty State */}
      {!code && (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <div className="rounded-2xl bg-[#161b22] p-4 border border-[#30363d]">
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

      {/* Rendering indicator */}
      {isRendering && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 dark:bg-primary-900/20">
          <div className="h-2 w-2 animate-pulse-soft rounded-full bg-primary-500" />
          <span className="text-xs font-medium text-primary-600 dark:text-primary-400">渲染中...</span>
        </div>
      )}

      {code && (
        <div
          ref={containerRef}
          className="markdown-preview flex-1 overflow-auto p-8"
        >
          {/* Scoped Markdown Styles */}
          <style>{`
            .markdown-preview { color: ${theme === 'dark' ? '#c9d1d9' : '#24292f'}; max-width: 48rem; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; line-height: 1.5; }
            .markdown-preview h1 { color: ${theme === 'dark' ? '#f0f6fc' : '#24292f'}; font-weight: 600; font-size: 2em; margin-top: 0; margin-bottom: 16px; padding-bottom: 0.3em; border-bottom: 1px solid ${theme === 'dark' ? '#30363d' : '#eaecef'}; }
            .markdown-preview h2 { color: ${theme === 'dark' ? '#f0f6fc' : '#24292f'}; margin-top: 24px; margin-bottom: 16px; font-weight: 600; font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid ${theme === 'dark' ? '#30363d' : '#eaecef'}; }
            .markdown-preview h3 { color: ${theme === 'dark' ? '#f0f6fc' : '#24292f'}; font-weight: 600; font-size: 1.25em; margin-top: 24px; margin-bottom: 16px; }
            .markdown-preview h4 { color: ${theme === 'dark' ? '#f0f6fc' : '#24292f'}; font-weight: 600; font-size: 1em; margin-top: 24px; margin-bottom: 16px; }
            .markdown-preview p { margin-top: 0; margin-bottom: 16px; }
            .markdown-preview strong { font-weight: 600; }
            .markdown-preview em { font-style: italic; }
            .markdown-preview del { text-decoration: line-through; }
            .markdown-preview code { color: ${theme === 'dark' ? '#c9d1d9' : '#24292f'}; background-color: ${theme === 'dark' ? '#6e768166' : '#afb8c133'}; padding: 0.2em 0.4em; border-radius: 6px; font-size: 85%; font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace; }
            .markdown-preview a { color: ${theme === 'dark' ? '#58a6ff' : '#0969da'}; text-decoration: none; }
            .markdown-preview a:hover { text-decoration: underline; }
            .markdown-preview blockquote { border-left: 0.25em solid ${theme === 'dark' ? '#30363d' : '#d0d7de'}; color: ${theme === 'dark' ? '#8b949e' : '#57606a'}; padding: 0 1em; margin: 0 0 16px 0; }

            /* Lists */
            .markdown-preview ul, .markdown-preview ol { margin-top: 0; margin-bottom: 16px; padding-left: 2em; }
            .markdown-preview ul { list-style-type: disc; }
            .markdown-preview ol { list-style-type: decimal; }
            .markdown-preview li { margin-top: 0.25em; }
            .markdown-preview li > p { margin-top: 16px; }

            /* Task lists */
            .markdown-preview input[type="checkbox"] { margin-right: 0.5em; vertical-align: middle; }

            /* Code blocks */
            .markdown-preview pre { background-color: ${theme === 'dark' ? '#161b22' : '#f6f8fa'}; border-radius: 6px; padding: 16px; overflow: auto; margin-top: 0; margin-bottom: 16px; line-height: 1.45; }
            .markdown-preview pre code { background-color: transparent; padding: 0; color: inherit; font-size: 100%; border-radius: 0; }

            /* Tables */
            .markdown-preview table { display: block; width: max-content; max-width: 100%; overflow: auto; border-spacing: 0; border-collapse: collapse; margin-top: 0; margin-bottom: 16px; }
            .markdown-preview th { font-weight: 600; border: 1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'}; padding: 6px 13px; }
            .markdown-preview td { border: 1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'}; padding: 6px 13px; }
            .markdown-preview tr { background-color: ${theme === 'dark' ? '#0d1117' : '#ffffff'}; border-top: 1px solid ${theme === 'dark' ? '#21262d' : '#c6cbd1'}; }
            .markdown-preview tr:nth-child(2n) { background-color: ${theme === 'dark' ? '#161b22' : '#f6f8fa'}; }
            
            .markdown-preview hr { height: 0.25em; padding: 0; margin: 24px 0; background-color: ${theme === 'dark' ? '#30363d' : '#d0d7de'}; border: 0; }
            .markdown-preview img { max-width: 100%; box-sizing: content-box; background-color: ${theme === 'dark' ? '#0d1117' : '#ffffff'}; }

            /* Mermaid blocks */
            .mermaid-block { display: flex; justify-content: center; margin: 16px 0; padding: 16px; background: ${theme === 'dark' ? '#161b22' : '#f6f8fa'}; border-radius: 6px; border: 1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'}; }
            .mermaid-rendered { border: none; background: transparent; padding: 0; }
          `}</style>

          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      )}
    </div>
  );
});

MarkdownPreview.displayName = 'MarkdownPreview';

export default MarkdownPreview;
