import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import mermaid from 'mermaid';
import { Theme, PreviewConfig } from '@/types/types';

interface MarkdownPreviewProps {
  code: string;
  theme: Theme;
  previewConfig?: PreviewConfig;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ code, theme, previewConfig }) => {
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
      const originalCodeRenderer = renderer.code.bind(renderer);

      renderer.code = (codeBlock, language, isEscaped) => {
        if (language === 'mermaid') {
          // Return a container with a class we can target later
          return `<div class="mermaid">${codeBlock}</div>`;
        }
        // Fallback to default behavior for other code blocks
        return originalCodeRenderer(codeBlock, language, isEscaped);
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
            .prose { color: ${theme === 'dark' ? '#e5e7eb' : '#1f2937'}; }
            .prose h1 { color: ${theme === 'dark' ? '#10b981' : '#059669'}; font-weight: 700; }
            .prose h2 { color: ${theme === 'dark' ? '#34d399' : '#047857'}; margin-top: 1.5em; font-weight: 600; }
            .prose h3 { color: ${theme === 'dark' ? '#6ee7b7' : '#065f46'}; font-weight: 600; }
            .prose h4 { color: ${theme === 'dark' ? '#a7f3d0' : '#065f46'}; font-weight: 600; }
            .prose p { color: ${theme === 'dark' ? '#e5e7eb' : '#374151'}; line-height: 1.75; }
            .prose strong { color: ${theme === 'dark' ? '#f3f4f6' : '#111827'}; font-weight: 600; }
            .prose code { color: ${theme === 'dark' ? '#fbbf24' : '#d97706'}; background-color: ${theme === 'dark' ? '#374151' : '#f3f4f6'}; padding: 0.2em 0.4em; border-radius: 0.25rem; font-size: 0.875em; }
            .prose a { color: ${theme === 'dark' ? '#60a5fa' : '#2563eb'}; text-decoration: underline; }
            .prose a:hover { color: ${theme === 'dark' ? '#93c5fd' : '#1d4ed8'}; }
            .prose blockquote { border-left-color: ${theme === 'dark' ? '#10b981' : '#d1fae5'}; color: ${theme === 'dark' ? '#d1d5db' : '#6b7280'}; font-style: italic; }
            .prose ul, .prose ol { color: ${theme === 'dark' ? '#e5e7eb' : '#374151'}; }
            .prose pre { background-color: ${theme === 'dark' ? '#1f2937' : '#f1f5f9'}; border-radius: 0.5rem; padding: 1rem; overflow-x: auto; }
            .prose pre code { background-color: transparent; padding: 0; color: ${theme === 'dark' ? '#e5e7eb' : '#1f2937'}; }
            .prose table { color: ${theme === 'dark' ? '#e5e7eb' : '#374151'}; }
            .prose th { color: ${theme === 'dark' ? '#f3f4f6' : '#111827'}; font-weight: 600; }
            .prose hr { border-color: ${theme === 'dark' ? '#374151' : '#e5e7eb'}; }
            .mermaid { display: flex; justify-content: center; margin: 2rem 0; background: transparent; }
        `}</style>

        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
};

export default MarkdownPreview;
