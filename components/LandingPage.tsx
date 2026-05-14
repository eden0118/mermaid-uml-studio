/**
 * LandingPage 元件
 * ============================================
 * 首頁選擇器，讓使用者選擇 Markdown 或 Mermaid 模式
 */

'use client';

import React from 'react';
import { FileText, Workflow, ArrowRight } from 'lucide-react';
import { ViewMode } from '@/types/types';

interface LandingPageProps {
  onSelectMode: (mode: ViewMode) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white p-8 dark:bg-gray-950">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary-500/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary-600/8 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-400/5 blur-3xl" />

      {/* Header */}
      <div className="animate-fade-in relative z-10 mb-16 text-center">
        <div className="mb-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-4 shadow-2xl shadow-primary-500/25">
          <Workflow size={32} className="text-white" />
        </div>
        <h1 className="mb-4 text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          Mermaid{' '}
          <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            Studio
          </span>
        </h1>
        <p className="mx-auto max-w-md text-base text-gray-500 dark:text-gray-400 sm:text-lg">
          整合圖表與文件的全方位編輯器
        </p>
        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
          支援即時預覽 · 本地存儲 · Google Drive 整合
        </p>
      </div>

      {/* Cards */}
      <div
        className="animate-slide-up relative z-10 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2"
        role="navigation"
        aria-label="編輯器選擇"
      >
        {/* Markdown Option */}
        <button
          onClick={() => onSelectMode('markdown')}
          className="glass-card group relative flex flex-col items-center overflow-hidden rounded-2xl p-8 sm:p-10 text-left transition-all hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-300/50 dark:hover:border-primary-700/50"
          aria-label="開啟 Markdown 編輯器"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary-500/25 dark:bg-primary-900/20 dark:text-primary-400" aria-hidden="true">
            <FileText size={28} />
          </div>
          <h2 className="relative mb-2 text-xl font-bold text-gray-900 dark:text-white">Markdown Docs</h2>
          <p className="relative mb-6 text-center text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            撰寫文件並即時預覽，適合筆記、規格文件和 README
          </p>
          <div className="relative flex items-center text-sm font-bold text-primary-600 transition-transform duration-300 group-hover:translate-x-1 dark:text-primary-400">
            開始編寫 <ArrowRight size={16} className="ml-1.5" aria-hidden="true" />
          </div>
        </button>

        {/* Mermaid Option */}
        <button
          onClick={() => onSelectMode('mermaid')}
          className="glass-card group relative flex flex-col items-center overflow-hidden rounded-2xl p-8 sm:p-10 text-left transition-all hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-300/50 dark:hover:border-primary-700/50"
          aria-label="開啟 Mermaid 圖表編輯器"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary-500/25 dark:bg-primary-900/20 dark:text-primary-400" aria-hidden="true">
            <Workflow size={28} />
          </div>
          <h2 className="relative mb-2 text-xl font-bold text-gray-900 dark:text-white">Mermaid Charts</h2>
          <p className="relative mb-6 text-center text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            使用文字語法建立 UML、流程圖和各種架構關係圖
          </p>
          <div className="relative flex items-center text-sm font-bold text-primary-600 transition-transform duration-300 group-hover:translate-x-1 dark:text-primary-400">
            開啟工作室 <ArrowRight size={16} className="ml-1.5" aria-hidden="true" />
          </div>
        </button>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-16 flex flex-col items-center gap-3 text-xs text-gray-400 dark:text-gray-600">
        <div className="h-px w-8 bg-gray-200 dark:bg-gray-800" />
        <p>&copy; {new Date().getFullYear()} Mermaid Studio · 安全 &amp; 本地端</p>
      </footer>
    </div>
  );
};

export default LandingPage;
