import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  ArrowRight,
  ShieldAlert,
  FileCheck,
} from 'lucide-react';
import { ResearchDocument } from '../types';
import { ActiveView } from '../components/Sidebar';

interface UploadViewProps {
  onUploadSuccess: () => void;
  setActiveView: (view: ActiveView) => void;
  onSelectPaperForChat: (paperId: string) => void;
}

interface UploadProgressItem {
  name: string;
  size: number;
  status: 'uploading' | 'parsing' | 'chunking' | 'embedding' | 'done' | 'duplicate' | 'error';
  errorMessage?: string;
  docId?: string;
  chunksCount?: number;
}

export const UploadView: React.FC<UploadViewProps> = ({
  onUploadSuccess,
  setActiveView,
  onSelectPaperForChat,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progressList, setProgressList] = useState<UploadProgressItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const pdfFiles = Array.from(files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      alert('Please select valid PDF research paper documents.');
      return;
    }

    setUploading(true);
    const initialList: UploadProgressItem[] = pdfFiles.map((file) => ({
      name: file.name,
      size: file.size,
      status: 'uploading',
    }));
    setProgressList(initialList);

    const formData = new FormData();
    pdfFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      // Step: Simulating granular progression in UI for transparent Knowledge Engineering stages
      setTimeout(() => {
        setProgressList((prev) =>
          prev.map((item) => (item.status === 'uploading' ? { ...item, status: 'parsing' } : item))
        );
      }, 700);

      setTimeout(() => {
        setProgressList((prev) =>
          prev.map((item) => (item.status === 'parsing' ? { ...item, status: 'chunking' } : item))
        );
      }, 1500);

      setTimeout(() => {
        setProgressList((prev) =>
          prev.map((item) => (item.status === 'chunking' ? { ...item, status: 'embedding' } : item))
        );
      }, 2300);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const raw = await response.text();
        throw new Error(
          raw.length > 0 && !raw.startsWith('<')
            ? raw.slice(0, 100)
            : 'File upload failed or was rejected by server.'
        );
      }

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Update progress states based on server response
      const serverDocs: { document: ResearchDocument; chunksAdded: number; duplicate: boolean }[] =
        data.documents || [];

      setProgressList(
        pdfFiles.map((f) => {
          const matched = serverDocs.find(
            (sd) => sd.document.filename === f.name || f.name.includes(sd.document.title)
          );
          if (matched) {
            return {
              name: f.name,
              size: f.size,
              status: matched.duplicate ? 'duplicate' : 'done',
              docId: matched.document.id,
              chunksCount: matched.chunksAdded,
            };
          }
          return {
            name: f.name,
            size: f.size,
            status: 'done',
          };
        })
      );

      onUploadSuccess();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setProgressList((prev) =>
        prev.map((item) => ({
          ...item,
          status: 'error',
          errorMessage: err.message || 'Processing failed',
        }))
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header and Intro */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">PDF Document Ingestion</h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload multi-page academic research papers. The system automatically parses pages with PyMuPDF, divides content into sliding overlapping chunks, calculates dense vector embeddings, and registers them into the ChromaDB vector store.
        </p>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.005]'
            : 'border-slate-700 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">
            Drag & drop PDF research papers here
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Supports single or multiple PDF documents up to 25MB each. Text extraction and embedding generation start automatically.
          </p>
          <div className="mt-5">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Browse Local Files</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pipeline Stages Legend */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
        <div className="font-semibold text-slate-300 mb-2">Automated RAG Ingestion Pipeline:</div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>1. PyMuPDF Text Extract</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>2. Text Cleaning & Normalization</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>3. Sliding Overlap Chunking</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>4. Vector Embeddings & Indexing</span>
          </div>
        </div>
      </div>

      {/* Upload & Processing Progress Log */}
      {progressList.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Processing Queue & Status</h3>
          <div className="space-y-2">
            {progressList.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-slate-200 block truncate max-w-md">
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {(item.size / (1024 * 1024)).toFixed(2)} MB
                      {item.chunksCount !== undefined && ` · ${item.chunksCount} chunks generated`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.status === 'uploading' && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-blue-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading binary...</span>
                    </span>
                  )}
                  {item.status === 'parsing' && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-purple-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Parsing with PyMuPDF...</span>
                    </span>
                  )}
                  {item.status === 'chunking' && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-indigo-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Splitting overlapping chunks...</span>
                    </span>
                  )}
                  {item.status === 'embedding' && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating vector coordinates...</span>
                    </span>
                  )}
                  {item.status === 'done' && (
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Indexed & Ready</span>
                      </span>
                      {item.docId && (
                        <button
                          onClick={() => onSelectPaperForChat(item.docId!)}
                          className="flex items-center gap-1 px-3 py-1 rounded-md bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"
                        >
                          <span>Ask Questions</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                  {item.status === 'duplicate' && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Duplicate Skipped (Already Indexed)</span>
                      </span>
                      {item.docId && (
                        <button
                          onClick={() => onSelectPaperForChat(item.docId!)}
                          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                        >
                          Query Existing &rarr;
                        </button>
                      )}
                    </div>
                  )}
                  {item.status === 'error' && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>{item.errorMessage || 'Error processing'}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
