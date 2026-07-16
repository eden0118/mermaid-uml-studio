import React, { memo } from 'react';

export interface HeadingInfo {
  id: string;
  text: string;
  level: number;
}

interface MarkdownOutlineProps {
  headings: HeadingInfo[];
  isOutlineSidebar: boolean;
  isOutlineOpen: boolean;
  setIsOutlineOpen: React.Dispatch<React.SetStateAction<boolean>>;
  scrollToHeading: (id: string) => void;
}

const MarkdownOutline: React.FC<MarkdownOutlineProps> = memo(({
  headings,
  isOutlineSidebar,
  isOutlineOpen,
  setIsOutlineOpen,
  scrollToHeading,
}) => {
  if (headings.length === 0) return null;

  return (
    <>
      {/* Outline Toggle Button — 右上角小 icon (僅在非側邊欄模式下顯示) */}
      {!isOutlineSidebar && (
        <button
          data-outline-toggle
          onClick={() => setIsOutlineOpen((prev) => !prev)}
          className={`absolute top-3 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-lg border border-[#30363d] text-[#8b949e] transition-all duration-200 cursor-pointer active:scale-95 ${
            isOutlineOpen
              ? 'bg-[#30363d] text-[#c9d1d9]'
              : 'bg-[#21262d]/80 backdrop-blur-sm hover:bg-[#30363d] hover:text-[#c9d1d9]'
          }`}
          title={isOutlineOpen ? 'close' : 'display outline'}
          aria-label={isOutlineOpen ? 'close' : 'display outline'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
      )}

      {/* Outline Panel — 浮動面板 (僅在非側邊欄模式下顯示) */}
      {!isOutlineSidebar && (
        <div
          data-outline-panel
          className={`absolute top-12 right-3 z-20 w-64 max-h-[60vh] rounded-xl bg-[#161b22]/95 backdrop-blur-xl border border-[#30363d] shadow-2xl transition-all duration-200 origin-top-right ${
            isOutlineOpen
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="px-3 py-2.5 border-b border-[#30363d]">
            <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Content</h3>
          </div>
          <nav className="p-1.5 overflow-auto max-h-[calc(60vh-40px)] scrollbar-hide">
            {headings.map((h) => {
              const indent = (h.level - 1) * 12;
              return (
                <button
                  key={h.id}
                  onClick={() => scrollToHeading(h.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-[#c9d1d9] hover:bg-[#21262d] hover:text-[#58a6ff] transition-colors duration-150 cursor-pointer group"
                  style={{ paddingLeft: `${12 + indent}px` }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full flex-shrink-0 transition-transform duration-150 group-hover:scale-125"
                    style={{
                      backgroundColor:
                        h.level === 1 ? '#58a6ff' :
                        h.level === 2 ? '#79c0ff' :
                        h.level === 3 ? '#a371f7' :
                        '#ffab70',
                    }}
                  />
                  <span className="truncate">{h.text}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Docusaurus-style Sticky Outline (僅在側邊欄模式下顯示) */}
      {isOutlineSidebar && (
        <div className="w-60 sticky top-8 flex-shrink-0 hidden lg:block select-none">
          <div className="px-1 py-2 border-b border-[#30363d]/30 mb-2">
            <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Content</h3>
          </div>
          <nav className="space-y-1 overflow-auto max-h-[calc(100vh-160px)] scrollbar-hide">
            {headings.map((h) => {
              const indent = (h.level - 1) * 12;
              return (
                <button
                  key={h.id}
                  onClick={() => scrollToHeading(h.id)}
                  className="flex w-full items-start gap-2 rounded px-2 py-1 text-left text-xs text-[#8b949e] hover:text-[#58a6ff] transition-colors duration-150 cursor-pointer group"
                  style={{ paddingLeft: `${indent + 8}px` }}
                >
                  <span className="truncate">{h.text}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
});

MarkdownOutline.displayName = 'MarkdownOutline';
export default MarkdownOutline;
