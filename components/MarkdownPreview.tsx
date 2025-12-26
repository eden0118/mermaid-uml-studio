import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import mermaid from 'mermaid';
import { Theme, PreviewConfig } from '../types';

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
            console.error("Markdown parsing error", e);
            setHtmlContent('<p class="text-red-500">Error parsing markdown</p>');
        }
    };
    parseMarkdown();
  }, [code]);

  // Run Mermaid after HTML is rendered
  useEffect(() => {
    if (containerRef.current) {
        // Find all mermaid divs that haven't been processed yet
        // Note: mermaid.run handles finding elements automatically if passed selector
        mermaid.run({
            nodes: containerRef.current.querySelectorAll('.mermaid'),
        }).catch(err => console.error("Mermaid run error in Markdown:", err));
    }
  }, [htmlContent, theme]);

  return (
    <div className="flex flex-col h-full w-full relative bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-200">
       
       {/* Inject Custom CSS */}
       {previewConfig?.customCss && (
         <style>{previewConfig.customCss}</style>
       )}

       <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-8 prose dark:prose-invert max-w-none preview-container"
        style={{
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        {/* Default Theme Overrides (can be overridden by customCss) */}
        <style>{`
            .prose h1 { color: ${theme === 'dark' ? '#34d399' : '#059669'}; }
            .prose h2 { color: ${theme === 'dark' ? '#6ee7b7' : '#047857'}; margin-top: 1.5em; }
            .prose h3 { color: ${theme === 'dark' ? '#a7f3d0' : '#065f46'}; }
            .prose a { color: ${theme === 'dark' ? '#6ee7b7' : '#059669'}; }
            .prose blockquote { border-left-color: ${theme === 'dark' ? '#065f46' : '#d1fae5'}; }
            .prose pre { background-color: ${theme === 'dark' ? '#1f2937' : '#f1f5f9'}; border-radius: 0.5rem; }
            .mermaid { display: flex; justify-content: center; margin: 2rem 0; background: transparent; }
        `}</style>
        
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
};

export default MarkdownPreview;