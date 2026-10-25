/**
 * MermaidPreview 元件
 * ============================================
 * 使用 Mermaid.js 渲染圖表的預覽元件
 * 支援縮放、拖曳、匯出 SVG
 */

'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  AlertTriangle,
  Moon,
  Sun,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { render as peleRender, PeleError } from 'pele';
import { Theme } from '@/types/types';

interface MermaidPreviewProps {
  code: string;
  theme: Theme;
}

const MermaidPreview: React.FC<MermaidPreviewProps> = memo(({ code, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [localTheme, setLocalTheme] = useState<Theme>(theme);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    transparent: false,
    padding: 32,
  });

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  // Zoom & Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Track whether the initial auto-fit has completed to prevent resetting zoom on code edits
  const hasFittedRef = useRef(false);

  // Pele CSS variables based on local theme
  const peleThemeStyles = useMemo<React.CSSProperties>(() => {
    const isDark = localTheme === 'dark';
    return isDark
      ? ({
          '--pele-bg': '#0d1117',
          '--pele-fg': '#f0f6fc',
          '--pele-muted': '#8b949e',
          '--pele-line': '#58a6ff',
          '--pele-surface': '#161b22',
          '--pele-surface-alt': '#21262d',
          '--pele-border': '#30363d',
          '--pele-accent': '#1f6feb',
          '--pele-font': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        } as React.CSSProperties)
      : ({
          '--pele-bg': '#ffffff',
          '--pele-fg': '#1f2328',
          '--pele-muted': '#656d76',
          '--pele-line': '#0969da',
          '--pele-surface': '#f6f8fa',
          '--pele-surface-alt': '#eaeef2',
          '--pele-border': '#d0d7de',
          '--pele-accent': '#0969da',
          '--pele-font': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        } as React.CSSProperties);
  }, [localTheme]);

  // Auto-fit helper function
  const fitToView = useCallback(() => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (!svgEl) return;

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
  }, []);

  // Render diagram with Pele
  useEffect(() => {
    const trimmed = code?.trim();
    if (!trimmed) {
      setSvgContent('');
      setError(null);
      hasFittedRef.current = false;
      return;
    }

    try {
      setError(null);
      setIsRendering(true);

      const result = peleRender(trimmed);
      setSvgContent(result.svg);

      // Only perform auto-fit on the very first successful render
      // Preserves zoom and position when editing code
      if (!hasFittedRef.current) {
        requestAnimationFrame(() => {
          fitToView();
          hasFittedRef.current = true;
        });
      }
    } catch (err: unknown) {
      let msg = '語法錯誤：無效的 Mermaid 代碼';
      if (err instanceof PeleError) {
        msg = err.line
          ? `第 ${err.line} 行${err.column ? ` 第 ${err.column} 欄` : ''}：${err.message}`
          : err.message;
        if (err.snippet) {
          msg += `\n${err.snippet}`;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setIsRendering(false);
    }
  }, [code, fitToView]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => setScale((prev) => prev + 0.2), []);
  const handleZoomOut = useCallback(() => setScale((prev) => Math.max(prev - 0.2, 0.1)), []);
  const handleResetZoom = useCallback(() => {
    fitToView();
  }, [fitToView]);

  // Pan handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // Wheel zoom (Ctrl/Cmd + scroll)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((prev) => Math.max(prev + delta, 0.1));
    }
  }, []);

  const getThemedSvgString = useCallback(
    (rawSvg: string) => {
      if (!rawSvg) return '';
      const styleEntries = Object.entries(peleThemeStyles)
        .map(([k, v]) => `${k}:${v}`)
        .join(';');
      if (rawSvg.includes('style="')) {
        return rawSvg.replace('style="', `style="${styleEntries};`);
      }
      return rawSvg.replace('<svg ', `<svg style="${styleEntries}" `);
    },
    [peleThemeStyles]
  );

  const handleExportSvg = useCallback(() => {
    if (!svgContent) return;
    const themedSvg = getThemedSvgString(svgContent);
    const blob = new Blob([themedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svgContent, getThemedSvgString]);

  const handleExportPngClick = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const confirmExportPng = useCallback(() => {
    if (!svgContent) return;
    const container = containerRef.current;
    if (!container) return;

    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Find the svg element to get its dimensions
    const svgEl = container.querySelector('svg');
    if (!svgEl) return;

    const bbox = svgEl.getBoundingClientRect();
    const width = bbox.width || 800;
    const height = bbox.height || 600;

    // Increase resolution for better quality
    const scale = 3;
    const pad = exportConfig.padding * scale;

    canvas.width = width * scale + pad * 2;
    canvas.height = height * scale + pad * 2;

    // Fill background if not transparent
    if (!exportConfig.transparent) {
      ctx.fillStyle = localTheme === 'dark' ? '#0d1117' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const img = new Image();

    // Inject CSS variables so that SVG elements render colors accurately inside canvas
    const themedSvg = getThemedSvgString(svgContent);
    const base64 = btoa(unescape(encodeURIComponent(themedSvg)));
    const url = `data:image/svg+xml;base64,${base64}`;

    img.onload = () => {
      ctx.drawImage(img, pad, pad, width * scale, height * scale);

      const a = document.createElement('a');
      a.download = 'diagram.png';
      a.href = canvas.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setShowExportModal(false);
    };
    img.src = url;
  }, [svgContent, localTheme, exportConfig, getThemedSvgString]);

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden transition-colors duration-200 ${localTheme === 'dark' ? 'bg-[#0d1117]' : 'bg-white'}`}
    >
      {/* Dot Pattern Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: `radial-gradient(#30363d 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Top Floating Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setLocalTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          className="hover:text-primary-600 hover:border-primary-300 dark:hover:text-primary-400 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          title={localTheme === 'dark' ? '切換亮色模式' : '切換暗色模式'}
        >
          {localTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          <span>{localTheme === 'dark' ? '暗色' : '亮色'}</span>
        </button>

        {svgContent && (
          <>
            <button
              onClick={handleExportSvg}
              className="hover:text-primary-600 hover:border-primary-300 dark:hover:text-primary-400 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              title="匯出 SVG"
            >
              <Download size={14} />
              <span>SVG</span>
            </button>
            <button
              onClick={handleExportPngClick}
              className="hover:text-primary-600 hover:border-primary-300 dark:hover:text-primary-400 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              title="匯出 PNG"
            >
              <ImageIcon size={14} />
              <span>PNG</span>
            </button>
          </>
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
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v18M3 12h18M7.5 7.5l9 9M16.5 7.5l-9 9" />
              </svg>
            </div>
            <p className="text-sm font-medium">在左側輸入 Mermaid 語法開始建立圖表</p>
          </div>
        )}

        {/* Rendering indicator */}
        {isRendering && (
          <div className="bg-primary-50 dark:bg-primary-900/20 absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full px-3 py-1">
            <div className="animate-pulse-soft bg-primary-500 h-2 w-2 rounded-full" />
            <span className="text-primary-600 dark:text-primary-400 text-xs font-medium">
              渲染中...
            </span>
          </div>
        )}

        {/* SVG Output */}
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            ...peleThemeStyles,
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
              <p className="font-mono text-xs leading-relaxed text-red-500 dark:text-red-400/80">
                {error}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Right Zoom Controls */}
      <div className="absolute right-5 bottom-5 z-10 flex flex-col items-end gap-2">
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

      {/* Export Settings Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">PNG 匯出設定</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#21262d]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  透明背景
                </span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={exportConfig.transparent}
                    onChange={(e) =>
                      setExportConfig((prev) => ({ ...prev, transparent: e.target.checked }))
                    }
                  />
                  <div className="peer-checked:bg-primary-500 h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-[#30363d] dark:bg-[#30363d]"></div>
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    邊距 (Padding)
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500 dark:bg-[#21262d] dark:text-gray-400">
                    {exportConfig.padding}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="128"
                  step="16"
                  value={exportConfig.padding}
                  onChange={(e) =>
                    setExportConfig((prev) => ({ ...prev, padding: Number(e.target.value) }))
                  }
                  className="accent-primary-500 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 outline-none dark:bg-[#30363d]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#21262d]"
              >
                取消
              </button>
              <button
                onClick={confirmExportPng}
                className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors"
              >
                <Download size={16} />
                <span>確認下載</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MermaidPreview.displayName = 'MermaidPreview';

export default MermaidPreview;
