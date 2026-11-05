import React, { useState } from 'react';
import {
  Library,
  FileText,
  Trash2,
  Eye,
  MessageSquare,
  Sparkles,
  Layers,
  X,
  CheckCircle2,
  Upload,
  Calendar,
  HardDrive,
  Loader2,
} from 'lucide-react';
import { ResearchDocument, DocumentChunk } from '../types';
import { ActiveView } from '../components/Sidebar';

interface DocumentLibraryViewProps {
  documents: ResearchDocument[];
  onDeleteDocument: (docId: string) => void;
  onSelectPaperForChat: (paperId: string) => void;
  onSelectPaperForSummary: (paperId: string) => void;
  setActiveView: (view: ActiveView) => void;
}

export const DocumentLibraryView: React.FC<DocumentLibraryViewProps> = ({
  documents,
  onDeleteDocument,
  onSelectPaperForChat,
  onSelectPaperForSummary,
  setActiveView,
}) => {
  const [inspectingDoc, setInspectingDoc] = useState<ResearchDocument | null>(null);
  const [inspectingChunks, setInspectingChunks] = useState<DocumentChunk[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  const openInspector = async (doc: ResearchDocument) => {
    setInspectingDoc(doc);
    setLoadingChunks(true);
    try {
      const response = await fetch(`/api/documents/${doc.id}`);
      const data = await response.json();
      setInspectingChunks(data.chunks || []);
    } catch (err) {
      console.error('Failed to load chunks:', err);
    } finally {
      setLoadingChunks(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Document & Vector Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your corpus of academic papers. Inspect sliding-window text chunks, verify page metadata, and delete or query indexed documents.
          </p>
        </div>

        <button
          onClick={() => setActiveView('upload')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors shadow-xs shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Additional Papers</span>
        </button>
      </div>

      {/* Document Grid */}
      {documents.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <Library className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Your research corpus is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload PDF research papers to build your RAG knowledge base.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200 line-clamp-1">
                        {doc.title}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {doc.filename}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Indexed</span>
                  </span>
                </div>

                {/* Metadata strip */}
                <div className="mt-4 grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Pages</span>
                    <span className="font-semibold text-slate-200 tabular-nums">
                      {doc.pageCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Chunks</span>
                    <span className="font-semibold text-purple-300 tabular-nums">
                      {doc.chunkCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">File Size</span>
                    <span className="font-semibold text-slate-200 tabular-nums">
                      {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  {doc.isDemo && (
                    <span className="text-indigo-400 font-semibold">[Demo Benchmark]</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openInspector(doc)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Inspect Chunks</span>
                  </button>

                  <button
                    onClick={() => onSelectPaperForChat(doc.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs transition-colors font-medium"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Delete "${doc.title}" and remove all its vector embeddings?`)) {
                      onDeleteDocument(doc.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chunk Inspector Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{inspectingDoc.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Vector Chunks & Page Metadata Inspection ({inspectingDoc.chunkCount} Chunks)
                </p>
              </div>
              <button
                onClick={() => setInspectingDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {loadingChunks ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span>Loading chunks from storage...</span>
                </div>
              ) : (
                inspectingChunks.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="text-indigo-400 font-semibold">
                        Chunk #{c.chunkIndex + 1}
                      </span>
                      <span>Page {c.pageNumber} · {c.charCount} characters</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans font-normal">
                      "{c.text}"
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">
                Embedding: 768-dimensional coordinates stored
              </span>
              <button
                onClick={() => {
                  const id = inspectingDoc.id;
                  setInspectingDoc(null);
                  onSelectPaperForChat(id);
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
              >
                Start Chat With This Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
