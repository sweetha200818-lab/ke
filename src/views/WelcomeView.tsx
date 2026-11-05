import React from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Cpu,
  Search,
  MessageSquare,
  FileCheck2,
  GitCompare,
  Layers,
  Database,
} from 'lucide-react';
import { ActiveView } from '../components/Sidebar';

interface WelcomeViewProps {
  setActiveView: (view: ActiveView) => void;
  onExploreDemo: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ setActiveView, onExploreDemo }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      {/* Hero Visual Section */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-2xl">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/research_hero_banner_1793892553565.jpg"
            alt="AI Academic Research Lab"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        </div>

        <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Knowledge Engineering & RAG</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white text-balance leading-tight">
            AI Research Paper Assistant
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Accelerate your academic literature review. Upload PDF research papers, extract structured knowledge, query via context-grounded retrieval-augmented generation (RAG), run vector semantic searches, and compare findings across multi-author studies.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveView('upload')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Upload Research PDF</span>
            </button>

            <button
              onClick={() => {
                onExploreDemo();
                setActiveView('chat');
              }}
              className="px-4 py-3 text-xs font-mono text-indigo-300 hover:text-white transition-colors"
            >
              Explore Pre-Loaded Papers &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Core Capabilities Grid */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Core System Architecture</h2>
          <p className="text-sm text-slate-400 mt-1">
            Engineered around foundational principles of Document Parsing, High-Dimensional Vector Embeddings, and LLM Grounding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Retrieval-Augmented Generation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Questions are converted to embeddings to retrieve the top-5 most relevant paper chunks. Google Gemini synthesizes answers strictly grounded in cited passages with page references.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">ChromaDB & Vector Storage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Document chunks are indexed into vector space. Cosine similarity calculations compute semantic distance across dense 768-dimensional mathematical coordinates.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Document Pipeline & PyMuPDF</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts text from raw PDF streams, performs text normalization, sliding-window chunking with boundary overlap, and tracks exact page-level metadata.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 rounded-2xl bg-slate-900/40 border border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Built For Serious Research</h2>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            Unlike basic document summarizers, this application preserves bibliographic rigor. Every response points to exact pages and excerpts. If a paper does not contain sufficient empirical data, the system flags it immediately rather than hallucinating unsupported facts.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3">
              <FileCheck2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-200">6-Section Scholarly Summarizer</h4>
                <p className="text-xs text-slate-400">
                  Breaks down papers into Abstract, Research Objective, Methodology, Key Findings, Conclusion, and Future Horizons.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <GitCompare className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Side-by-Side Paper Matrix</h4>
                <p className="text-xs text-slate-400">
                  Contrast architectures, experimental datasets, benchmark BLEU/Top-5 scores, advantages, and limitations across 2 or more studies.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Search className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Semantic & Conceptual Search</h4>
                <p className="text-xs text-slate-400">
                  Search across your literature library using natural language ideas rather than exact keyword string matching.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <img
            src="/src/assets/images/research_rag_pipeline_1793892554376.jpg"
            alt="RAG Pipeline Flow"
            className="w-full h-auto object-cover"
          />
          <div className="p-4 border-t border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>RAG Workflow Architecture</span>
            <span>PyMuPDF &middot; ChromaDB &middot; Gemini</span>
          </div>
        </div>
      </div>
    </div>
  );
};
