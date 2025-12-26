import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import { Theme } from '@/types/types';

interface MermaidPreviewProps {
  code: string;
  theme: Theme;
}

const MermaidPreview: React.FC<MermaidPreviewProps> = memo(({ code, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Zoom & Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Re-initialize mermaid when theme changes
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      logLevel: 'error',
    });
  }, [theme]);

  useEffect(() => {
    const renderDiagram = async () => {
      // Skip rendering if code is empty
      if (!code || !code.trim()) {
        setSvgContent('');
        setError(null);
        return;
      }

      try {
        setError(null);
        // We need a unique ID for each render to avoid caching issues in mermaid
        const id = `mermaid-${Date.now()}`;

        // Debug: log the code being rendered
        console.log('Rendering Mermaid code:', code);

        // Parse and render the diagram
        const { svg } = await mermaid.render(id, code.trim());
        setSvgContent(svg);

        // Auto-fit diagram to container after rendering
        setTimeout(() => {
          if (containerRef.current) {
            const container = containerRef.current;
            const svgElement = container.querySelector('svg');
            if (svgElement) {
              const containerWidth = container.clientWidth;
              const containerHeight = container.clientHeight;
              const svgWidth = svgElement.getBBox().width;
              const svgHeight = svgElement.getBBox().height;

              // Calculate scale to fit with padding
              const scaleX = (containerWidth * 0.9) / svgWidth;
              const scaleY = (containerHeight * 0.9) / svgHeight;
              const autoScale = Math.min(scaleX, scaleY, 1.5); // Max scale 1.5

              setScale(autoScale);
              setPosition({ x: 0, y: 0 });
            }
          }
        }, 100);
      } catch (err) {
        console.error('Mermaid Render Error:', err);
        console.error('Failed code:', code);
        const errorMessage = err instanceof Error ? err.message : 'Syntax Error: Invalid Mermaid Code';
        setError(errorMessage);
      }
    };

    const timeoutId = setTimeout(() => {
      renderDiagram();
    }, 300); // Debounce rendering

    return () => clearTimeout(timeoutId);
  }, [code, theme]); // Re-render on code or theme change

  // Zoom handlers
  const handleZoomIn = useCallback(() => setScale((prev) => Math.min(prev + 0.2, 3)), []);
  const handleZoomOut = useCallback(() => setScale((prev) => Math.max(prev - 0.2, 0.2)), []);
  const handleResetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // 滾輪縮放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // 按住 Ctrl (Windows/Linux) 或 Cmd (Mac) 時啟用滾輪縮放
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
        className="pointer-events-none absolute inset-0 opacity-[0.3] dark:opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(${theme === 'dark' ? '#6b7280' : '#94a3b8'} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Top Floating Toolbar */}
      <div className="absolute right-4 top-4 z-10 flex space-x-2">
        <button
          onClick={handleExportSvg}
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition-colors hover:text-primary-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-primary-400"
          title="Download SVG"
        >
          <Download size={18} />
        </button>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className={`flex flex-1 items-center justify-center overflow-hidden cursor-${isDragging ? 'grabbing' : 'grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="origin-center"
        >
          {!error && svgContent && (
            <div dangerouslySetInnerHTML={{ __html: svgContent }} className="select-none" />
          )}
        </div>

        {error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600 shadow-lg dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p className="font-mono text-sm font-semibold">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Right Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end space-y-2">
        {/* 提示文字 */}
        <div className="rounded-md bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
          <kbd className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">Ctrl</kbd> + 滾輪縮放
        </div>

        {/* 縮放控制 */}
        <div className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-white p-1 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={handleResetZoom}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title="重置檢視"
            aria-label="重置縮放"
          >
            <RotateCcw size={16} />
          </button>
          <div className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
          <button
            onClick={handleZoomOut}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title="縮小"
            aria-label="縮小"
          >
            <ZoomOut size={16} />
          </button>
          <span className="w-12 text-center font-mono text-xs text-gray-500 dark:text-gray-400">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title="放大"
            aria-label="放大"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

MermaidPreview.displayName = 'MermaidPreview';

export default MermaidPreview;
