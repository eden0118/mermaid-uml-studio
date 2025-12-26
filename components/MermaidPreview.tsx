import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, Move, Maximize, RotateCcw, Download, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Theme } from '../types';

interface MermaidPreviewProps {
  code: string;
  theme: Theme;
  onGenerateAI: (prompt: string) => void;
  isProcessing: boolean;
}

const MermaidPreview: React.FC<MermaidPreviewProps> = ({ code, theme, onGenerateAI, isProcessing }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Zoom & Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    // Re-initialize mermaid when theme changes
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    });
    
    // Trigger re-render by clearing svg first
    setSvgContent(''); 
  }, [theme]);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        setError(null);
        // We need a unique ID for each render to avoid caching issues in mermaid
        const id = `mermaid-${Date.now()}`;
        
        // Ensure the element is clean before render attempt if possible, though mermaid.render handles new ID
        const { svg } = await mermaid.render(id, code);
        setSvgContent(svg);
      } catch (err) {
        console.error('Mermaid Render Error:', err);
        setError('Syntax Error: Invalid Mermaid Code');
      }
    };

    const timeoutId = setTimeout(() => {
      renderDiagram();
    }, 500); // Debounce rendering

    return () => clearTimeout(timeoutId);
  }, [code, theme]); // Re-render on code or theme change

  // Zoom handlers
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.2));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleExportSvg = () => {
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
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiPrompt.trim()) {
        onGenerateAI(aiPrompt);
        setAiPrompt('');
        setIsAiOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-200">
      
      {/* Dot Pattern Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.4] dark:opacity-[0.2]"
        style={{
            backgroundImage: `radial-gradient(${theme === 'dark' ? '#cbd5e1' : '#94a3b8'} 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
        }}
      />

      {/* Top Floating Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button 
            onClick={handleExportSvg}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" 
            title="Download SVG"
        >
            <Download size={18} />
        </button>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-hidden flex items-center justify-center cursor-${isDragging ? 'grabbing' : 'grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            className="origin-center"
        >
            {!error && svgContent && (
                <div 
                    dangerouslySetInnerHTML={{ __html: svgContent }} 
                    className="select-none" 
                />
            )}
        </div>

        {error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg shadow-lg">
                    <p className="font-mono text-sm font-semibold">{error}</p>
                </div>
            </div>
        )}
      </div>

      {/* Bottom Center AI Button */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="relative">
             {isAiOpen ? (
                <div className="w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 mb-2">
                    <form onSubmit={handleAiSubmit}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Fix or Generate with AI</span>
                            <button type="button" onClick={() => setIsAiOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
                        </div>
                        <textarea
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-2 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 outline-none resize-none h-24 mb-3"
                            placeholder="Describe changes or new diagram..."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full py-2 bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-500 hover:to-green-500 text-white rounded-lg text-sm font-medium transition-all shadow-md flex justify-center items-center space-x-2"
                        >
                            {isProcessing ? (
                                <span>Thinking...</span>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    <span>Execute</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
             ) : (
                <button
                    onClick={() => setIsAiOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary-50 dark:from-gray-800 to-white dark:to-gray-800 border border-primary-200 dark:border-gray-600 hover:border-primary-400 dark:hover:border-gray-500 text-primary-700 dark:text-primary-300 rounded-full shadow-lg hover:shadow-xl transition-all group"
                >
                    <Sparkles size={18} className="text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Fix connections with AI</span>
                </button>
             )}
        </div>
      </div>

      {/* Bottom Right Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-10 flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-1 space-x-1">
        <button onClick={handleResetZoom} className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Reset View">
            <RotateCcw size={16} />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button onClick={handleZoomOut} className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Zoom Out">
            <ZoomOut size={16} />
        </button>
        <span className="text-xs w-12 text-center text-gray-500 dark:text-gray-400 font-mono">
            {Math.round(scale * 100)}%
        </span>
        <button onClick={handleZoomIn} className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Zoom In">
            <ZoomIn size={16} />
        </button>
      </div>
    </div>
  );
};

export default MermaidPreview;
