import React from 'react';
import { FileText, Workflow, ArrowRight } from 'lucide-react';
import { ViewMode } from '@/types/types';

interface LandingPageProps {
  onSelectMode: (mode: ViewMode) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-white p-6 dark:bg-gray-950">
      {/* Background Orbs */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary-600/10 blur-3xl" />

      <div className="animate-fade-in relative z-10 mb-12 text-center">
        <div className="mb-8 inline-flex items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 p-5 shadow-2xl shadow-primary-500/20">
          <Workflow size={40} className="text-white" />
        </div>
        <h1 className="mb-4 text-5xl font-black tracking-tight text-gray-900 dark:text-white md:text-6xl">
          Mermaid <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">Studio</span>
        </h1>
        <p className="mx-auto max-w-lg text-xl font-medium text-gray-500 dark:text-gray-400">
          整合圖表與文件的全方位編輯器
          <span className="mt-2 block text-sm font-normal opacity-70">支援即時預覽與本地存儲</span>
        </p>
      </div>

      <div className="animate-slide-up relative z-10 grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2" role="navigation" aria-label="編輯器選擇">
        {/* Markdown Option */}
        <button
          onClick={() => onSelectMode('markdown')}
          className="glass-card group relative flex flex-col items-center overflow-hidden rounded-3xl p-10 hover:ring-2 hover:ring-primary-500/50"
          aria-label="開啟 Markdown 編輯器"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white dark:bg-primary-900/20 dark:text-primary-400" aria-hidden="true">
            <FileText size={36} />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Markdown Docs</h2>
          <p className="mb-8 text-center leading-relaxed text-gray-500 dark:text-gray-400">
            撰寫文件並即時預覽，適合筆記、規格文件和 README
          </p>
          <div className="flex items-center text-sm font-bold tracking-wide text-primary-600 transition-all duration-300 group-hover:translate-x-2 dark:text-primary-400">
            開始編寫 <ArrowRight size={18} className="ml-2" aria-hidden="true" />
          </div>
        </button>

        {/* Mermaid Option */}
        <button
          onClick={() => onSelectMode('mermaid')}
          className="glass-card group relative flex flex-col items-center overflow-hidden rounded-3xl p-10 hover:ring-2 hover:ring-primary-500/50"
          aria-label="開啟 Mermaid 圖表編輯器"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white dark:bg-primary-900/20 dark:text-primary-400" aria-hidden="true">
            <Workflow size={36} />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Mermaid Charts</h2>
          <p className="mb-8 text-center leading-relaxed text-gray-500 dark:text-gray-400">
            使用文字語法建立 UML 圖表、流程圖和各種架構關係圖
          </p>
          <div className="flex items-center text-sm font-bold tracking-wide text-primary-600 transition-all duration-300 group-hover:translate-x-2 dark:text-primary-400">
            開啟工作室 <ArrowRight size={18} className="ml-2" aria-hidden="true" />
          </div>
        </button>
      </div>

      <footer className="relative z-10 mt-20 flex flex-col items-center gap-2 text-sm font-medium text-gray-400 dark:text-gray-600">
        <div className="h-px w-12 bg-gray-200 dark:bg-gray-800" />
        <p>&copy; {new Date().getFullYear()} Mermaid Studio. Secure & Local.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
