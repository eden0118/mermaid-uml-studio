/**
 * MermaidPreview 元件
 * ============================================
 * 使用 Mermaid.js 渲染圖表的預覽元件
 * 支援縮放、拖曳、匯出 SVG
 */

'use client';

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download, AlertTriangle, Moon, Sun, Image as ImageIcon, X } from 'lucide-react';
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

  // Render diagram
  useEffect(() => {
    if (!mermaidRef.current || !mermaidLoaded) return;

    const trimmed = code?.trim();
    if (!trimmed) {
      setSvgContent('');
      setError(null);
      return;
    }

    const renderDiagram = async () => {
      try {
        setError(null);
        setIsRendering(true);

        // 確保在渲染前初始化正確的主題
        const isDark = localTheme === 'dark';
        mermaidRef.current!.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          themeVariables: isDark ? {
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
          } : {
            background: '#ffffff',
          }
        });

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
    };

    renderDiagram();
  }, [code, localTheme, mermaidLoaded]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => setScale((prev) => prev + 0.2), []);
  const handleZoomOut = useCallback(() => setScale((prev) => Math.max(prev - 0.2, 0.1)), []);
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
      setScale((prev) => Math.max(prev + delta, 0.1));
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
    
    canvas.width = (width * scale) + (pad * 2);
    canvas.height = (height * scale) + (pad * 2);

    // Fill background if not transparent
    if (!exportConfig.transparent) {
      ctx.fillStyle = localTheme === 'dark' ? '#0d1117' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const img = new Image();
    
    // Serialize the actual SVG DOM node to string to capture all styles
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const base64 = btoa(unescape(encodeURIComponent(svgData)));
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
  }, [svgContent, localTheme, exportConfig]);

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden transition-colors duration-200 ${localTheme === 'dark' ? 'bg-[#0d1117]' : 'bg-white'}`}>
      {/* Dot Pattern Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: `radial-gradient(#30363d 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Top Floating Toolbar */}
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <button
          onClick={() => setLocalTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:text-primary-600 hover:border-primary-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-primary-400"
          title={localTheme === 'dark' ? '切換亮色模式' : '切換暗色模式'}
        >
          {localTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          <span>{localTheme === 'dark' ? '暗色' : '亮色'}</span>
        </button>

        {svgContent && (
          <>
            <button
              onClick={handleExportSvg}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:text-primary-600 hover:border-primary-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-primary-400"
              title="匯出 SVG"
            >
              <Download size={14} />
              <span>SVG</span>
            </button>
            <button
              onClick={handleExportPngClick}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:text-primary-600 hover:border-primary-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-primary-400"
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

      {/* Export Settings Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">PNG 匯出設定</h3>
              <button 
                onClick={() => setShowExportModal(false)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#21262d] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-5 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">透明背景</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={exportConfig.transparent}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, transparent: e.target.checked }))}
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-[#30363d] dark:border-[#30363d]"></div>
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">邊距 (Padding)</span>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#21262d] px-2 py-0.5 rounded">{exportConfig.padding}px</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="128" 
                  step="16"
                  value={exportConfig.padding}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, padding: Number(e.target.value) }))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-[#30363d] accent-primary-500 outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#21262d] transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmExportPng}
                className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors shadow-sm"
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
