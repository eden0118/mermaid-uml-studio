/**
 * MarkdownPreview 元件
 * ============================================
 * 使用 marked.js 渲染 Markdown 的預覽元件
 * 支援嵌入式 Mermaid 圖表、可收合標題、Side Outline
 */

'use client';

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { marked } from 'marked';
import { Theme, PreviewConfig } from '@/types/types';
import MarkdownOutline, { HeadingInfo } from './MarkdownOutline';

interface MarkdownPreviewProps {
  code: string;
  theme: Theme;
  previewConfig?: PreviewConfig;
  isEditorCollapsed?: boolean;
}

let mermaidRenderCounter = 0;

/**
 * 取得 heading 下方所屬 section 的所有 DOM 元素
 * （直到遇到同層級或更高層級的 heading 為止）
 */
function getSectionElements(heading: Element, level: number): HTMLElement[] {
  const elements: HTMLElement[] = [];
  let sibling = heading.nextElementSibling;
  while (sibling) {
    const tagMatch = sibling.tagName.match(/^H([1-6])$/);
    if (tagMatch && parseInt(tagMatch[1]) <= level) break;
    elements.push(sibling as HTMLElement);
    sibling = sibling.nextElementSibling;
  }
  return elements;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = memo(({ code, previewConfig, isEditorCollapsed = false }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<typeof import('mermaid').default | null>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  // Outline & collapsible state
  const [headings, setHeadings] = useState<HeadingInfo[]>([]);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const collapsedRef = useRef<Set<string>>(new Set());

  const isOutlineSidebar = isEditorCollapsed && isLargeScreen;

  // 偵測視窗大小
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let prevLarge = window.innerWidth >= 1024;
    setIsLargeScreen(prevLarge);

    const handleResize = () => {
      const large = window.innerWidth >= 1024;
      setIsLargeScreen(large);
      prevLarge = large;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 當側邊欄模式啟用且有大綱時，自動展開大綱
  useEffect(() => {
    if (isEditorCollapsed && isLargeScreen && headings.length > 0) {
      setIsOutlineOpen(true);
    }
  }, [isEditorCollapsed, isLargeScreen, headings.length]);

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
        setHeadings([]);
        return;
      }

      setIsRendering(true);
      const renderer = new marked.Renderer();
      let headingIndex = 0;

      // Heading renderer: 加入 ID、data-level、toggle icon 以及無障礙屬性 (a11y)
      renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
        const stripped = text.replace(/<[^>]*>/g, '').trim();
        const slug = stripped
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fff]+/g, '-')
          .replace(/^-|-$/g, '');
        const id = `md-h-${slug || headingIndex}`;
        headingIndex++;
        // 加入 tabindex="0", role="button", aria-expanded="true" 讓純鍵盤使用者也能選取與操作
        return `<h${depth} id="${id}" class="collapsible-heading" data-level="${depth}" tabindex="0" role="button" aria-expanded="true"><span class="heading-toggle-icon" aria-hidden="true"></span>${text}</h${depth}>`;
      };

      renderer.code = ({ text, lang }) => {
        if (lang === 'mermaid') {
          const id = `md-mermaid-${++mermaidRenderCounter}`;
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

  // 設定可收合標題 + 提取 Outline 資訊
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl || !htmlContent) return;

    // 1. 同步提取 Outline 資訊並還原收合狀態
    const headingEls = contentEl.querySelectorAll('.collapsible-heading');
    const extracted: HeadingInfo[] = [];

    headingEls.forEach((el) => {
      const heading = el as HTMLElement;
      const id = heading.id;
      const level = parseInt(heading.dataset.level || '1');
      const text = heading.textContent?.trim() || '';

      extracted.push({ id, text, level });

      // 還原收合狀態
      if (collapsedRef.current.has(id)) {
        heading.classList.add('collapsed');
        const sectionEls = getSectionElements(heading, level);
        sectionEls.forEach((sel) => (sel.style.display = 'none'));
      } else {
        heading.classList.remove('collapsed');
      }
    });

    setHeadings(extracted);

    // 2. 使用事件代理（Event Delegation）在 contentEl 上監聽點擊與鍵盤操作，支援 a11y
    const handleHeadingToggle = (target: HTMLElement) => {
      const heading = target.closest('.collapsible-heading') as HTMLElement | null;
      if (!heading || !contentEl.contains(heading)) return;

      // 如果點擊的是標題內的超連結，則不進行收合
      if (target.closest('a')) return;

      const id = heading.id;
      const level = parseInt(heading.dataset.level || '1');

      const isNowCollapsed = heading.classList.toggle('collapsed');
      
      // 更新 aria-expanded 屬性以符合無障礙規範
      heading.setAttribute('aria-expanded', isNowCollapsed ? 'false' : 'true');

      if (isNowCollapsed) {
        collapsedRef.current.add(id);
        const sectionEls = getSectionElements(heading, level);
        sectionEls.forEach((el) => (el.style.display = 'none'));
      } else {
        collapsedRef.current.delete(id);
        const sectionEls = getSectionElements(heading, level);
        sectionEls.forEach((el) => (el.style.display = ''));

        // 重新套用子標題的收合狀態
        sectionEls.forEach((el) => {
          const subMatch = el.tagName.match(/^H([1-6])$/);
          if (subMatch && collapsedRef.current.has(el.id)) {
            const subLevel = parseInt(subMatch[1]);
            const subSection = getSectionElements(el, subLevel);
            subSection.forEach((s) => (s.style.display = 'none'));
          }
        });
      }
    };

    const handleContainerClick = (e: MouseEvent) => {
      handleHeadingToggle(e.target as HTMLElement);
    };

    const handleContainerKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const target = e.target as HTMLElement;
        if (target.closest('.collapsible-heading')) {
          e.preventDefault();
          handleHeadingToggle(target);
        }
      }
    };

    contentEl.addEventListener('click', handleContainerClick);
    contentEl.addEventListener('keydown', handleContainerKeyDown);
    return () => {
      contentEl.removeEventListener('click', handleContainerClick);
      contentEl.removeEventListener('keydown', handleContainerKeyDown);
    };
  }, [htmlContent]);

  // Render Mermaid blocks after HTML is set
  const renderMermaidBlocks = useCallback(async () => {
    if (!contentRef.current || !mermaidRef.current) return;

    const blocks = contentRef.current.querySelectorAll('.mermaid-block');
    if (blocks.length === 0) return;

    // 確保在渲染前初始化正確的主題
    mermaidRef.current.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      themeVariables: {
        background: '#0d1117',
        primaryColor: '#1f6feb',
        primaryTextColor: '#f0f6fc',
        primaryBorderColor: '#58a6ff',
        lineColor: '#58a6ff',
        secondaryColor: '#238636',
        tertiaryColor: '#d29922',
        noteBkgColor: '#d29922',
        noteTextColor: '#0d1117',
        errorBkgColor: '#f85149',
        errorTextColor: '#f0f6fc',
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
  }, []);

  useEffect(() => {
    if (htmlContent && mermaidLoaded) {
      requestAnimationFrame(() => {
        renderMermaidBlocks();
      });
    }
  }, [htmlContent, mermaidLoaded, renderMermaidBlocks]);

  // 點擊 Outline 項目 → 捲動到對應標題
  const scrollToHeading = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // 若父層標題已收合，先展開
      let parent = el.previousElementSibling;
      while (parent) {
        const parentMatch = parent.tagName.match(/^H([1-6])$/);
        if (parentMatch) {
          const parentLevel = parseInt(parentMatch[1]);
          const elLevel = parseInt(el.dataset.level || '1');
          if (parentLevel < elLevel && parent.classList.contains('collapsed')) {
            parent.classList.remove('collapsed');
            collapsedRef.current.delete(parent.id);
            const sectionEls = getSectionElements(parent, parentLevel);
            sectionEls.forEach((s) => ((s as HTMLElement).style.display = ''));
          }
        }
        parent = parent.previousElementSibling;
      }

      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOutlineOpen(false);
    }
  }, []);

  // 點擊 Outline 面板外部時關閉（僅在非側邊欄模式下生效）
  useEffect(() => {
    if (!isOutlineOpen || isOutlineSidebar) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-outline-panel]') && !target.closest('[data-outline-toggle]')) {
        setIsOutlineOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOutlineOpen, isOutlineSidebar]);

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
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <MarkdownOutline 
            headings={headings}
            isOutlineSidebar={isOutlineSidebar}
            isOutlineOpen={isOutlineOpen}
            setIsOutlineOpen={setIsOutlineOpen}
            scrollToHeading={scrollToHeading}
            mode="floating"
          />

          {/* Main Scroll Content Area */}
          <div
            ref={scrollContainerRef}
            className="markdown-preview flex-1 overflow-auto p-8"
          >
            {/* Scoped Markdown Styles */}
            <style>{`
              .markdown-preview { color: #c9d1d9; width: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; line-height: 1.6; }
              
              /* 繽紛標題 */
              .markdown-preview h1 { color: #58a6ff; font-weight: 800; font-size: 2.25em; margin-top: 0; margin-bottom: 16px; padding-bottom: 0.3em; border-bottom: 1px solid #30363d; }
              .markdown-preview h2 { color: #79c0ff; margin-top: 24px; margin-bottom: 16px; font-weight: 700; font-size: 1.75em; padding-bottom: 0.3em; border-bottom: 1px solid #30363d; }
              .markdown-preview h3 { color: #a371f7; font-weight: 700; font-size: 1.4em; margin-top: 24px; margin-bottom: 16px; }
              .markdown-preview h4 { color: #ffab70; font-weight: 700; font-size: 1.2em; margin-top: 24px; margin-bottom: 16px; }
              
              .markdown-preview p { margin-top: 0; margin-bottom: 16px; }
              
              /* Collapsible Headings */
              .collapsible-heading {
                cursor: pointer;
                user-select: none;
                position: relative;
                display: flex;
                align-items: center;
                gap: 6px;
                border-radius: 6px;
                transition: background-color 0.15s ease;
              }
              .collapsible-heading:hover { background-color: #ffffff08; }

              .heading-toggle-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 18px;
                height: 18px;
                flex-shrink: 0;
                border-radius: 4px;
                transition: background-color 0.15s ease;
              }
              .collapsible-heading:hover .heading-toggle-icon { background-color: #ffffff10; }

              .heading-toggle-icon::before {
                content: '';
                display: block;
                width: 0;
                height: 0;
                border-left: 5px solid currentColor;
                border-top: 4px solid transparent;
                border-bottom: 4px solid transparent;
                opacity: 0.4;
                transition: transform 0.2s ease, opacity 0.2s ease;
                transform: rotate(90deg);
              }
              .collapsible-heading:hover .heading-toggle-icon::before { opacity: 0.7; }
              .collapsible-heading.collapsed .heading-toggle-icon::before { transform: rotate(0deg); opacity: 0.6; }

              /* 強調與連結 */
              .markdown-preview strong { color: #ff7b72; font-weight: 800; }
              .markdown-preview em { color: #ffa657; font-style: italic; }
              .markdown-preview del { text-decoration: line-through; opacity: 0.6; }
              .markdown-preview a { color: #2f81f7; text-decoration: none; border-bottom: 1px dashed #2f81f7; pointer-events: auto; }
              .markdown-preview a:hover { color: #58a6ff; border-bottom-style: solid; }
              
              /* 區塊引用 */
              .markdown-preview blockquote { border-left: 0.3em solid #a371f7; color: #8b949e; padding: 0.5em 1em; margin: 0 0 16px 0; background: #161b22; border-radius: 0 8px 8px 0; }

              /* 代碼樣式 */
              .markdown-preview code { color: #7ee787; background-color: #6e76814d; padding: 0.2em 0.4em; border-radius: 6px; font-size: 90%; font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, monospace; }
              .markdown-preview pre { background-color: #0d1117; border: 1px solid #30363d; border-radius: 12px; padding: 16px; overflow: auto; margin-top: 0; margin-bottom: 16px; line-height: 1.45; }
              .markdown-preview pre code { background-color: transparent; padding: 0; color: #d1d5db; font-size: 100%; border-radius: 0; }

              /* 列表 */
              .markdown-preview ul, .markdown-preview ol { margin-top: 0; margin-bottom: 16px; padding-left: 2em; }
              .markdown-preview ul { list-style-type: disc; }
              .markdown-preview ol { list-style-type: decimal; }
              .markdown-preview li { margin-top: 0.25em; }
              .markdown-preview ul > li::marker { color: #58a6ff; }
              .markdown-preview ol > li::marker { color: #58a6ff; font-weight: bold; }

              /* 任務列表 */
              .markdown-preview input[type="checkbox"] { margin-right: 0.5em; vertical-align: middle; accent-color: #58a6ff; }

              /* 表格 */
              .markdown-preview table { display: block; width: max-content; max-width: 100%; overflow: auto; border-spacing: 0; border-collapse: collapse; margin-top: 0; margin-bottom: 16px; border-radius: 8px; }
              .markdown-preview th { font-weight: bold; border: 1px solid #30363d; padding: 10px 16px; background-color: #161b22; color: #79c0ff; }
              .markdown-preview td { border: 1px solid #30363d; padding: 8px 16px; }
              .markdown-preview tr { background-color: #0d1117; }
              .markdown-preview tr:nth-child(2n) { background-color: #161b22; }
              
              .markdown-preview hr { height: 2px; padding: 0; margin: 24px 0; background: linear-gradient(to dotted, #30363d, transparent); background-color: #30363d; border: 0; }
              .markdown-preview img { max-width: 100%; border-radius: 12px; border: 1px solid #30363d; }

              /* Mermaid 區塊修正 */
              .mermaid-block { display: flex; justify-content: center; margin: 24px 0; padding: 20px; background: #161b22; border-radius: 12px; border: 1px solid #30363d; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
              .mermaid-rendered { border: none; background: transparent; padding: 0; box-shadow: none; }
            `}</style>

            <div className="flex flex-row gap-8 items-start justify-center max-w-7xl mx-auto w-full">
              {/* Markdown Content Column */}
              <div className="flex-1 min-w-0 max-w-4xl">
                <div ref={contentRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />
              </div>
              
              <MarkdownOutline 
                headings={headings}
                isOutlineSidebar={isOutlineSidebar}
                isOutlineOpen={isOutlineOpen}
                setIsOutlineOpen={setIsOutlineOpen}
                scrollToHeading={scrollToHeading}
                mode="sidebar"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MarkdownPreview.displayName = 'MarkdownPreview';

export default MarkdownPreview;
