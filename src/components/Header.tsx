import React from 'react';
import { Menu, Upload, RefreshCw, Sparkles, BookOpen } from 'lucide-react';
import { ActiveView } from './Sidebar';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  setMobileOpen: (open: boolean) => void;
  onResetData: () => void;
  totalPapers: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  setMobileOpen,
  onResetData,
  totalPapers,
}) => {
  const viewTitles: Record<ActiveView, { title: string; category: string }> = {
    welcome: { title: 'Welcome & System Overview', category: 'Introduction' },
    dashboard: { title: 'Research Dashboard', category: 'Analytics' },
    upload: { title: 'Document Ingestion & Chunking', category: 'Knowledge Base' },
    chat: { title: 'AI Research Chatbot', category: 'RAG Synthesis' },
    search: { title: 'Semantic Vector Search', category: 'Information Retrieval' },
    summarize: { title: 'Academic Paper Summarizer', category: 'Structured Extraction' },
    compare: { title: 'Comparative Paper Analysis', category: 'Meta-Analysis' },
    keywords: { title: 'Keyword & Topic Discovery', category: 'Ontology' },
    library: { title: 'Document & Vector Library', category: 'Corpus' },
    settings: { title: 'RAG Pipeline & Model Settings', category: 'Configuration' },
  };

  const current = viewTitles[activeView] || { title: 'Research Assistant', category: 'Workspace' };

  return (
    <header className="h-16 px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-8">
      {/* Zone 1: Mobile toggle & Breadcrumb Title */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline font-mono">{current.category}</span>
          <span className="hidden sm:inline">/</span>
          <span className="font-semibold text-slate-200 text-sm tracking-tight whitespace-nowrap">
            {current.title}
          </span>
        </div>
      </div>

      {/* Zone 2: Single-line quick jump shortcuts */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => setActiveView('chat')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'chat' ? 'text-indigo-400' : ''
          }`}
        >
          RAG Chat
        </button>
        <button
          onClick={() => setActiveView('search')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'search' ? 'text-indigo-400' : ''
          }`}
        >
          Semantic Search
        </button>
        <button
          onClick={() => setActiveView('summarize')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'summarize' ? 'text-indigo-400' : ''
          }`}
        >
          Summaries
        </button>
        <button
          onClick={() => setActiveView('compare')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'compare' ? 'text-indigo-400' : ''
          }`}
        >
          Comparison
        </button>
      </nav>

      {/* Zone 3: Primary Action & Reset */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onResetData}
          title="Reload landmark demo papers (Transformer & ResNet)"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg border border-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>

        <button
          onClick={() => setActiveView('upload')}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload PDF</span>
        </button>
      </div>
    </header>
  );
};
