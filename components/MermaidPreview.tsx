/**
 * MermaidPreview 元件
 * ============================================
 * 使用 Mermaid.js 渲染圖表的預覽元件
 * 支援縮放、拖曳、匯出 SVG
 */

'use client';

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download, AlertTriangle } from 'lucide-react';
import { Theme } from '@/types/types';

interface MermaidPreviewProps {
  code: string;
  theme: Theme;
}

let renderCounter = 0;

const MermaidPreview: React.FC<MermaidPreviewProps> = memo(({ code, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Zoom & Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Dynamic import mermaid (avoid SSR crash)
  const mermaidRef = useRef<typeof import('mermaid').default | null>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

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

  // Initialize mermaid when theme changes
  useEffect(() => {
    if (!mermaidRef.current) return;
    mermaidRef.current.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      logLevel: 'error',
    });
  }, [theme, mermaidLoaded]);

  // Render diagram
  useEffect(() => {
    if (!mermaidRef.current || !mermaidLoaded) return;

    const trimmed = code?.trim();
    if (!trimmed) {
      setSvgContent('');
      setError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setError(null);
        setIsRendering(true);
        const id = `mermaid-diagram-${++renderCounter}`;
        const { svg } = await mermaidRef.current!.render(id, trimmed);
        setSvgContent(svg);

        // Auto-fit after SVG is set
        requestAnimationFrame(() => {
          if (containerRef.current) {
            const svgEl = containerRef.current.querySelector('svg');
            if (svgEl) {
              const cw = containerRef.current.clientWidth;
              const ch = containerRef.current.clientHeight;
              const bbox = svgEl.getBBox();
              const sw = bbox.width || svgEl.clientWidth;
              const sh = bbox.height || svgEl.clientHeight;
              if (sw > 0 && sh > 0) {
                const autoScale = Math.min((cw * 0.85) / sw, (ch * 0.85) / sh, 1.5);
                setScale(autoScale);
                setPosition({ x: 0, y: 0 });
              }
            }
          }
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Syntax Error: Invalid Mermaid Code';
        setError(msg);
      } finally {
        setIsRendering(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [code, theme, mermaidLoaded]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => setScale((prev) => Math.min(prev + 0.2, 3)), []);
  const handleZoomOut = useCallback(() => setScale((prev) => Math.max(prev - 0.2, 0.2)), []);
  const handleResetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // Wheel zoom (Ctrl/Cmd + scroll)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((prev) => Math.min(Math.max(prev + delta, 0.2), 3));
    }
  }, []);

  const handleExportSvg = useCallback(() => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svgContent]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-gray-50 transition-colors duration-200 dark:bg-gray-900">
      {/* Dot Pattern Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25] dark:opacity-[0.1]"
        style={{
          backgroundImage: `radial-gradient(${theme === 'dark' ? '#6b7280' : '#94a3b8'} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Top Floating Toolbar */}
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        {svgContent && (
          <button
            onClick={handleExportSvg}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:text-primary-600 hover:border-primary-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-primary-400"
            title="匯出 SVG"
          >
            <Download size={14} />
            <span>SVG</span>
          </button>
        )}
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="flex flex-1 items-center justify-center overflow-hidden"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Empty State */}
        {!code?.trim() && !error && (
          <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-600">
            <div className="rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18M3 12h18M7.5 7.5l9 9M16.5 7.5l-9 9"/>
              </svg>
            </div>
            <p className="text-sm font-medium">在左側輸入 Mermaid 語法開始建立圖表</p>
          </div>
        )}

        {/* Rendering indicator */}
        {isRendering && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 dark:bg-primary-900/20">
            <div className="h-2 w-2 animate-pulse-soft rounded-full bg-primary-500" />
            <span className="text-xs font-medium text-primary-600 dark:text-primary-400">渲染中...</span>
          </div>
        )}

        {/* SVG Output */}
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="origin-center"
        >
          {!error && svgContent && (
            <div dangerouslySetInnerHTML={{ __html: svgContent }} className="select-none" />
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-4 shadow-lg dark:border-red-800/50 dark:bg-red-900/20">
              <div className="mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle size={16} />
                <span className="text-sm font-semibold">語法錯誤</span>
              </div>
              <p className="font-mono text-xs leading-relaxed text-red-500 dark:text-red-400/80">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Right Zoom Controls */}
      <div className="absolute bottom-5 right-5 z-10 flex flex-col items-end gap-2">
        <div className="rounded-md bg-black/60 px-2 py-1 text-[10px] text-white/80 backdrop-blur-sm">
          <kbd className="rounded bg-white/20 px-1 py-0.5 font-mono text-[9px]">⌘</kbd> + 滾輪縮放
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={handleResetZoom}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title="重置檢視"
            aria-label="重置縮放"
          >
            <RotateCcw size={14} />
          </button>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
          <button
            onClick={handleZoomOut}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title="縮小"
            aria-label="縮小"
          >
            <ZoomOut size={14} />
          </button>
          <span className="w-10 text-center font-mono text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title="放大"
            aria-label="放大"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>
    </div>
  );
});

MermaidPreview.displayName = 'MermaidPreview';

export default MermaidPreview;
