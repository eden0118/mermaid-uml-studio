import React from 'react';
import { FileText, Workflow, ArrowRight } from 'lucide-react';
import { ViewMode } from '../types';

interface LandingPageProps {
  onSelectMode: (mode: ViewMode) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-primary-600 rounded-2xl shadow-lg mb-6">
            <span className="text-4xl font-bold text-white">M</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
          Mermaid <span className="text-primary-500">Studio</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          The all-in-one editor for diagrams and documentation. 
          Powered by Gemini AI and integrated with Google Drive.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Markdown Option */}
        <button
          onClick={() => onSelectMode('markdown')}
          className="group relative flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <FileText size={32} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Markdown Docs</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
            Write documentation with real-time preview. Best for notes, specs, and READMEs.
          </p>
          <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold text-sm group-hover:underline">
            Open Editor <ArrowRight size={16} className="ml-2" />
          </div>
        </button>

        {/* Mermaid Option */}
        <button
          onClick={() => onSelectMode('mermaid')}
          className="group relative flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Workflow size={32} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mermaid Charts</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
            Create complex UML diagrams, flowcharts, and graphs using simple text syntax.
          </p>
          <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold text-sm group-hover:underline">
            Open Studio <ArrowRight size={16} className="ml-2" />
          </div>
        </button>
      </div>

      <footer className="mt-16 text-gray-400 dark:text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} Mermaid Studio. Secure & Local.
      </footer>
    </div>
  );
};

export default LandingPage;
