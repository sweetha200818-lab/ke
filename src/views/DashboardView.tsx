import React from 'react';
import {
  FileText,
  Layers,
  MessageSquare,
  Search,
  Upload,
  GitCompare,
  KeyRound,
  ArrowUpRight,
  Database,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ResearchDocument, DashboardStats } from '../types';
import { ActiveView } from '../components/Sidebar';

interface DashboardViewProps {
  stats: DashboardStats;
  documents: ResearchDocument[];
  setActiveView: (view: ActiveView) => void;
  onSelectPaperForChat: (paperId: string) => void;
  onSelectPaperForSummary: (paperId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  documents,
  setActiveView,
  onSelectPaperForChat,
  onSelectPaperForSummary,
}) => {
  const quickActions = [
    {
      title: 'Ask RAG Chatbot',
      desc: 'Query papers with page-level citations',
      icon: MessageSquare,
      view: 'chat' as ActiveView,
      color: 'indigo',
    },
    {
      title: 'Semantic Vector Search',
      desc: 'Retrieve relevant text by mathematical meaning',
      icon: Search,
      view: 'search' as ActiveView,
      color: 'purple',
    },
    {
      title: 'Summarize Paper',
      desc: 'Generate 6 structured scholarly sections',
      icon: FileText,
      view: 'summarize' as ActiveView,
      color: 'blue',
    },
    {
      title: 'Compare Multiple Papers',
      desc: 'Side-by-side matrices on datasets & methods',
      icon: GitCompare,
      view: 'compare' as ActiveView,
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Uploaded Papers</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono tabular-nums">
              {stats.totalPapers}
            </span>
            <span className="text-xs text-slate-500">corpus total</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Processed Documents</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-300 font-mono tabular-nums">
              {stats.processedPapers}
            </span>
            <span className="text-xs text-slate-500">100% indexed</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Vectorized Text Chunks</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-300 font-mono tabular-nums">
              {stats.totalChunks}
            </span>
            <span className="text-xs text-slate-500">in vector store</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Questions Answered</span>
            <MessageSquare className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-sky-300 font-mono tabular-nums">
              {stats.totalQuestionsAsked}
            </span>
            <span className="text-xs text-slate-500">RAG inquiries</span>
          </div>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div>
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">
          Quick Access Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => setActiveView(action.view)}
                className="p-5 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{action.desc}</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-indigo-400 font-medium">
                  <span>Open module</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Research Papers Table */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Recent Research Papers</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Indexed academic manuscripts ready for analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('upload')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Paper</span>
            </button>
            <button
              onClick={() => setActiveView('library')}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1"
            >
              View All ({documents.length}) &rarr;
            </button>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No research papers uploaded yet.</p>
            <button
              onClick={() => setActiveView('upload')}
              className="mt-4 px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Upload Your First Paper
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3 font-medium">Document Title</th>
                  <th className="px-4 py-3 font-medium">Pages</th>
                  <th className="px-4 py-3 font-medium">Vector Chunks</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Uploaded</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {documents.slice(0, 5).map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div>
                          <span className="font-medium text-slate-200 block truncate max-w-md">
                            {doc.title}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {doc.filename} · {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                            {doc.isDemo && ' · [Pre-loaded Landmark]'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono tabular-nums text-slate-300">
                      {doc.pageCount}
                    </td>
                    <td className="px-4 py-3.5 font-mono tabular-nums text-purple-300">
                      {doc.chunkCount} chunks
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => onSelectPaperForChat(doc.id)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 border border-indigo-500/20 transition-colors"
                      >
                        Ask Questions
                      </button>
                      <button
                        onClick={() => onSelectPaperForSummary(doc.id)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors"
                      >
                        Summarize
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Architectural Telemetry Information */}
      <div className="p-6 rounded-xl bg-slate-900/30 border border-slate-800 text-xs text-slate-400">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">Vector Engine:</span>
            <span>ChromaDB Architecture · Space: Cosine Similarity</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Model: {stats.llmModel}</span>
            <span>·</span>
            <span>Embedding Dimensions: {stats.vectorDimensions}d</span>
          </div>
        </div>
      </div>
    </div>
  );
};
