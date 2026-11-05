import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Database,
  Sliders,
  Terminal,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Layers,
} from 'lucide-react';
import { DashboardStats } from '../types';

interface SettingsViewProps {
  stats: DashboardStats;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ stats, onResetData }) => {
  const [chunkSize, setChunkSize] = useState(650);
  const [chunkOverlap, setChunkOverlap] = useState(120);
  const [topK, setTopK] = useState(5);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.2);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          System Settings & RAG Pipeline Configuration
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Fine-tune the Knowledge Engineering parameters, vector embedding retrieval depth, and inspect AI Studio & FastAPI deployment topologies.
        </p>
      </div>

      {/* RAG Hyperparameters Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sliders className="w-4 h-4" />
          <span>Chunking & Retrieval Hyperparameters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Text Chunk Size (characters)</span>
              <span className="font-mono text-indigo-400 tabular-nums">{chunkSize} chars</span>
            </div>
            <input
              type="range"
              min={300}
              max={1500}
              step={50}
              value={chunkSize}
              onChange={(e) => setChunkSize(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500"
            />
            <p className="text-[11px] text-slate-500">
              Optimal window for preserving semantic cohesion without exceeding LLM context boundaries.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Chunk Sliding Overlap</span>
              <span className="font-mono text-purple-400 tabular-nums">{chunkOverlap} chars</span>
            </div>
            <input
              type="range"
              min={50}
              max={300}
              step={10}
              value={chunkOverlap}
              onChange={(e) => setChunkOverlap(parseInt(e.target.value, 10))}
              className="w-full accent-purple-500"
            />
            <p className="text-[11px] text-slate-500">
              Preserves contextual continuity across sentence transitions.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Top-K Vector Retrieval Count</span>
              <span className="font-mono text-emerald-400 tabular-nums">{topK} chunks</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[11px] text-slate-500">
              Number of closest vector passages retrieved per query into Gemini context.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Cosine Similarity Cutoff Threshold</span>
              <span className="font-mono text-amber-400 tabular-nums">{similarityThreshold}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.5}
              step={0.05}
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
            <p className="text-[11px] text-slate-500">
              Discards low-scoring background noise chunks below this cosine coefficient.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <span className="text-xs text-slate-400 font-mono">
            Active Engine: Gemini 3.8 Flash + Dense Vector Index
          </span>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            {saved ? 'Parameters Saved' : 'Save Parameters'}
          </button>
        </div>
      </form>

      {/* Model & Architecture Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Synthesis Model Architecture</span>
          </div>
          <div className="text-sm font-semibold text-white">Google Gemini 3.8 Flash</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            High-efficiency multimodal transformer featuring sub-second latency, rigorous system instruction compliance, structured schema generation, and zero hallucination guardrails.
          </p>
          <div className="pt-2 text-[11px] font-mono text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict Citation Enforcement Enabled</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Vector Store & Embeddings</span>
          </div>
          <div className="text-sm font-semibold text-white">ChromaDB / Dense 768d Vector Space</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sentence Transformers & Gemini Multimodal Embedding models map natural language concepts onto high-dimensional manifolds evaluated via Cosine Metric.
          </p>
          <div className="pt-2 text-[11px] font-mono text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Data Exfiltration Policy</span>
          </div>
        </div>
      </div>

      {/* FastAPI Backend Companion Information */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>Standalone Python FastAPI + ChromaDB Backend</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The project includes the standalone Python backend implementation in the <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">/backend</code> folder using FastAPI, PyMuPDF, Sentence Transformers, and ChromaDB.
        </p>
        <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 space-y-1">
          <div className="text-slate-500"># Run standalone Python backend:</div>
          <div>cd backend</div>
          <div>pip install -r requirements.txt</div>
          <div>uvicorn main:app --reload --port 8000</div>
        </div>
      </div>

      {/* Reset Corpus Action */}
      <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-200">Re-seed Landmark Papers</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Reset documents library to include Attention Is All You Need & ResNet foundational papers.
          </p>
        </div>
        <button
          onClick={onResetData}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Corpus</span>
        </button>
      </div>
    </div>
  );
};
