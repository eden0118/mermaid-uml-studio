import React from 'react';
import { FileText, Workflow, ArrowRight } from 'lucide-react';
import { ViewMode } from '@/types/types';

interface LandingPageProps {
  onSelectMode: (mode: ViewMode) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-950">
      <div className="mb-12 text-center">
        <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-primary-600 p-4 shadow-lg">
          <span className="text-4xl font-bold text-white">M</span>
        </div>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-5xl">
          Mermaid <span className="text-primary-500">Studio</span>
        </h1>
        <p className="mx-auto max-w-lg text-lg text-gray-600 dark:text-gray-400">
          整合圖表與文件的全方位編輯器，支援 Google Drive 同步
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2" role="navigation" aria-label="編輯器選擇">
        {/* Markdown Option */}
        <button
          onClick={() => onSelectMode('markdown')}
          className="group relative flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-500"
          aria-label="開啟 Markdown 編輯器"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 transition-transform duration-300 group-hover:scale-110 dark:bg-primary-900/30" aria-hidden="true">
            <FileText size={32} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Markdown Docs</h2>
          <p className="mb-6 text-center text-gray-500 dark:text-gray-400">
            撰寫文件並即時預覽，適合筆記、規格文件和 README
          </p>
          <div className="flex items-center text-sm font-semibold text-primary-600 group-hover:underline dark:text-primary-400">
            開啟編輯器 <ArrowRight size={16} className="ml-2" aria-hidden="true" />
          </div>
        </button>

        {/* Mermaid Option */}
        <button
          onClick={() => onSelectMode('mermaid')}
          className="group relative flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-500"
          aria-label="開啟 Mermaid 圖表編輯器"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 transition-transform duration-300 group-hover:scale-110 dark:bg-primary-900/30" aria-hidden="true">
            <Workflow size={32} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Mermaid Charts</h2>
          <p className="mb-6 text-center text-gray-500 dark:text-gray-400">
            使用簡潔的文字語法建立複雜的 UML 圖表、流程圖和關係圖
          </p>
          <div className="flex items-center text-sm font-semibold text-primary-600 group-hover:underline dark:text-primary-400">
            開啟工作室 <ArrowRight size={16} className="ml-2" aria-hidden="true" />
          </div>
        </button>
      </div>

      <footer className="mt-16 text-sm text-gray-400 dark:text-gray-600">
        &copy; {new Date().getFullYear()} Mermaid Studio. Secure & Local.
      </footer>安全且本地化
    </div>
  );
};

export default LandingPage;
