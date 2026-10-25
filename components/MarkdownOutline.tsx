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
  mode: 'floating' | 'sidebar';
}

const MarkdownOutline: React.FC<MarkdownOutlineProps> = memo(
  ({ headings, isOutlineSidebar, isOutlineOpen, setIsOutlineOpen, scrollToHeading, mode }) => {
    if (headings.length === 0) return null;

    if (mode === 'floating') {
      if (isOutlineSidebar) return null;
      return (
        <>
          {/* Outline Toggle Button — 右上角小 icon (僅在非側邊欄模式下顯示) */}
          <button
            data-outline-toggle
            onClick={() => setIsOutlineOpen((prev) => !prev)}
            className={`absolute top-3 right-3 z-30 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#30363d] text-[#8b949e] transition-all duration-200 active:scale-95 ${
              isOutlineOpen
                ? 'bg-[#30363d] text-[#c9d1d9]'
                : 'bg-[#21262d]/80 backdrop-blur-sm hover:bg-[#30363d] hover:text-[#c9d1d9]'
            }`}
            title={isOutlineOpen ? 'close' : 'display outline'}
            aria-label={isOutlineOpen ? 'close' : 'display outline'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>

          {/* Outline Panel — 浮動面板 (僅在非側邊欄模式下顯示) */}
          <div
            data-outline-panel
            className={`absolute top-12 right-3 z-20 max-h-[60vh] w-64 origin-top-right rounded-xl border border-[#30363d] bg-[#161b22]/95 shadow-2xl backdrop-blur-xl transition-all duration-200 ${
              isOutlineOpen
                ? 'pointer-events-auto scale-100 opacity-100'
                : 'pointer-events-none scale-95 opacity-0'
            }`}
          >
            <div className="border-b border-[#30363d] px-3 py-2.5">
              <h3 className="text-xs font-semibold tracking-wider text-[#8b949e] uppercase">
                Content
              </h3>
            </div>
            <nav className="scrollbar-hide max-h-[calc(60vh-40px)] overflow-auto p-1.5">
              {headings.map((h) => {
                const indent = (h.level - 1) * 12;
                return (
                  <button
                    key={h.id}
                    onClick={() => scrollToHeading(h.id)}
                    className="group flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-[#c9d1d9] transition-colors duration-150 hover:bg-[#21262d] hover:text-[#58a6ff]"
                    style={{ paddingLeft: `${12 + indent}px` }}
                  >
                    <span
                      className="h-1.5 w-1.5 flex-shrink-0 rounded-full transition-transform duration-150 group-hover:scale-125"
                      style={{
                        backgroundColor:
                          h.level === 1
                            ? '#58a6ff'
                            : h.level === 2
                              ? '#79c0ff'
                              : h.level === 3
                                ? '#a371f7'
                                : '#ffab70',
                      }}
                    />
                    <span className="truncate">{h.text}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </>
      );
    }

    if (mode === 'sidebar') {
      if (!isOutlineSidebar) return null;
      return (
        <div
          className="sticky top-8 hidden w-60 flex-shrink-0 select-none lg:block"
          data-outline-sidebar
        >
          <div className="mb-2 border-b border-[#30363d]/30 px-1 py-2">
            <h3 className="text-xs font-semibold tracking-wider text-[#8b949e] uppercase">
              Content
            </h3>
          </div>
          <nav className="scrollbar-hide max-h-[calc(100vh-160px)] space-y-1 overflow-auto">
            {headings.map((h) => {
              const indent = (h.level - 1) * 12;
              return (
                <button
                  key={h.id}
                  onClick={() => scrollToHeading(h.id)}
                  className="group flex w-full cursor-pointer items-start gap-2 rounded px-2 py-1 text-left text-xs text-[#8b949e] transition-colors duration-150 hover:text-[#58a6ff]"
                  style={{ paddingLeft: `${indent + 8}px` }}
                >
                  <span className="truncate">{h.text}</span>
                </button>
              );
            })}
          </nav>
        </div>
      );
    }

    return null;
  }
);

MarkdownOutline.displayName = 'MarkdownOutline';
export default MarkdownOutline;
