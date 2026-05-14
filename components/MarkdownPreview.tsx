import React, { useEffect, useRef, useState, memo } from 'react';
import { marked } from 'marked';
import mermaid from 'mermaid';
import { Theme, PreviewConfig } from '@/types/types';

interface MarkdownPreviewProps {
  code: string;
  theme: Theme;
  previewConfig?: PreviewConfig;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = memo(({ code, theme, previewConfig }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Mermaid config once or when theme changes
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
    });
  }, [theme]);

  // Handle Markdown Parsing + Mermaid Block Detection
  useEffect(() => {
    const parseMarkdown = async () => {
      // Custom renderer to intercept mermaid code blocks
      const renderer = new marked.Renderer();

      renderer.code = ({ text, lang }) => {
        if (lang === 'mermaid') {
          // Return a container with a class we can target later
          return `<div class="mermaid">${text}</div>`;
        }
        // Fallback to default behavior for other code blocks
        return `<pre><code class="language-${lang}">${text}</code></pre>`;
      };

      try {
        const html = await marked.parse(code, { renderer });
        setHtmlContent(html);
      } catch (e) {
        console.error('Markdown parsing error', e);
        setHtmlContent('<p class="text-red-500">Error parsing markdown</p>');
      }
    };
    parseMarkdown();
  }, [code]);

  // Run Mermaid after HTML is rendered
  useEffect(() => {
    if (containerRef.current) {
      const mermaidDivs = containerRef.current.querySelectorAll('.mermaid');

      // Clear any existing SVGs to force re-render with new theme
      mermaidDivs.forEach((div) => {
        if (div.getAttribute('data-processed')) {
          div.removeAttribute('data-processed');
          const svg = div.querySelector('svg');
          if (svg) {
            div.innerHTML = div.getAttribute('data-original-content') || '';
          }
        } else {
          // Store original content for future theme changes
          div.setAttribute('data-original-content', div.textContent || '');
        }
      });

      // Run mermaid rendering
      if (mermaidDivs.length > 0) {
        mermaid
          .run({
            nodes: Array.from(mermaidDivs) as HTMLElement[],
          })
          .catch((err) => console.error('Mermaid run error in Markdown:', err));
      }
    }
  }, [htmlContent, theme]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-gray-50 transition-colors duration-200 dark:bg-gray-950">
      {/* Inject Custom CSS */}
      {previewConfig?.customCss && <style>{previewConfig.customCss}</style>}

      <div
        ref={containerRef}
        className="prose preview-container max-w-none flex-1 overflow-auto p-8"
        style={{
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        {/* Default Theme Overrides (can be overridden by customCss) */}
        <style>{`
            .prose { color: ${theme === 'dark' ? '#e5e7eb' : '#1f2937'}; max-width: none; }
            .prose h1 { color: ${theme === 'dark' ? '#10b981' : '#059669'}; font-weight: 700; font-size: 2.25em; margin-top: 0; margin-bottom: 0.8888889em; line-height: 1.1111111; }
            .prose h2 { color: ${theme === 'dark' ? '#34d399' : '#047857'}; margin-top: 2em; margin-bottom: 1em; font-weight: 600; font-size: 1.5em; line-height: 1.3333333; }
            .prose h3 { color: ${theme === 'dark' ? '#6ee7b7' : '#065f46'}; font-weight: 600; font-size: 1.25em; margin-top: 1.6em; margin-bottom: 0.6em; line-height: 1.6; }
            .prose h4 { color: ${theme === 'dark' ? '#a7f3d0' : '#065f46'}; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; line-height: 1.5; }
            .prose p { color: ${theme === 'dark' ? '#e5e7eb' : '#374151'}; line-height: 1.75; margin-top: 1.25em; margin-bottom: 1.25em; }
            .prose strong { color: ${theme === 'dark' ? '#f3f4f6' : '#111827'}; font-weight: 600; }
            .prose code { color: ${theme === 'dark' ? '#fbbf24' : '#d97706'}; background-color: ${theme === 'dark' ? '#374151' : '#f3f4f6'}; padding: 0.2em 0.4em; border-radius: 0.25rem; font-size: 0.875em; font-weight: 400; }
            .prose a { color: ${theme === 'dark' ? '#60a5fa' : '#2563eb'}; text-decoration: underline; font-weight: 500; }
            .prose a:hover { color: ${theme === 'dark' ? '#93c5fd' : '#1d4ed8'}; }
            .prose blockquote { border-left: 4px solid ${theme === 'dark' ? '#10b981' : '#d1fae5'}; color: ${theme === 'dark' ? '#d1d5db' : '#6b7280'}; font-style: italic; padding-left: 1em; margin: 1.6em 0; }

            /* 列表樣式 */
            .prose ul, .prose ol { color: ${theme === 'dark' ? '#e5e7eb' : '#374151'}; margin-top: 1.25em; margin-bottom: 1.25em; padding-left: 1.625em; }
            .prose ul { list-style-type: disc; }
            .prose ol { list-style-type: decimal; }
            .prose li { margin-top: 0.5em; margin-bottom: 0.5em; line-height: 1.75; }
            .prose ul ul, .prose ul ol, .prose ol ul, .prose ol ol { margin-top: 0.75em; margin-bottom: 0.75em; }
            .prose ul > li { position: relative; padding-left: 0.375em; }
            .prose ol > li { position: relative; padding-left: 0.375em; }
            .prose ul > li::marker { color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'}; }
            .prose ol > li::marker { color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'}; font-weight: 400; }

            /* 任務列表 */
            .prose input[type="checkbox"] { margin-right: 0.5em; }

            .prose pre { background-color: ${theme === 'dark' ? '#1f2937' : '#f1f5f9'}; border-radius: 0.5rem; padding: 1rem; overflow-x: auto; margin: 1.7142857em 0; }
            .prose pre code { background-color: transparent; padding: 0; color: ${theme === 'dark' ? '#e5e7eb' : '#1f2937'}; font-size: 0.875em; line-height: 1.7142857; }
            .prose table { color: ${theme === 'dark' ? '#e5e7eb' : '#374151'}; width: 100%; border-collapse: collapse; margin-top: 2em; margin-bottom: 2em; }
            .prose th { color: ${theme === 'dark' ? '#f3f4f6' : '#111827'}; font-weight: 600; border-bottom: 1px solid ${theme === 'dark' ? '#374151' : '#d1d5db'}; padding: 0.5714286em; text-align: left; }
            .prose td { padding: 0.5714286em; border-bottom: 1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}; }
            .prose hr { border-color: ${theme === 'dark' ? '#374151' : '#e5e7eb'}; margin: 3em 0; }
            .prose img { margin-top: 2em; margin-bottom: 2em; border-radius: 0.375rem; }
            .mermaid { display: flex; justify-content: center; margin: 2rem 0; background: transparent; }
        `}</style>

        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
});

MarkdownPreview.displayName = 'MarkdownPreview';

export default MarkdownPreview;
