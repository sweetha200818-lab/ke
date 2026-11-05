import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Download,
  FileDown,
  Loader2,
  Target,
  FlaskConical,
  Trophy,
  Compass,
} from 'lucide-react';
import { ResearchDocument, PaperSummary } from '../types';
import { exportSummaryAsPDF, exportSummaryAsMarkdown } from '../utils/exportUtils';

interface SummarizerViewProps {
  documents: ResearchDocument[];
  initialPaperId: string | null;
}

export const SummarizerView: React.FC<SummarizerViewProps> = ({
  documents,
  initialPaperId,
}) => {
  const [selectedPaperId, setSelectedPaperId] = useState<string>(
    initialPaperId || (documents[0]?.id || '')
  );
  const [summary, setSummary] = useState<PaperSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedDoc = documents.find((d) => d.id === selectedPaperId);

  const handleSummarize = async () => {
    if (!selectedPaperId || loading) return;

    setLoading(true);
    setSummary(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: selectedPaperId }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const rawText = await response.text();
        throw new Error(
          rawText.length > 0 && !rawText.startsWith('<')
            ? rawText.slice(0, 100)
            : 'Service returned unexpected response. Please try again.'
        );
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize paper');
      }

      setSummary(data.summary);
    } catch (err: any) {
      console.error('Summarize error:', err);
      alert(`Summarization failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyFullSummary = () => {
    if (!summary || !selectedDoc) return;
    const text = `# Academic Summary: ${selectedDoc.title}

## 1. Abstract
${summary.abstract}

## 2. Research Objective
${summary.researchObjective}

## 3. Methodology & Architecture
${summary.methodology}

## 4. Key Findings
${summary.keyFindings}

## 5. Conclusion
${summary.conclusion}

## 6. Future Scope
${summary.futureScope}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    if (!summary || !selectedDoc) return;
    exportSummaryAsPDF(selectedDoc.title, summary);
  };

  const handleExportMarkdown = () => {
    if (!summary || !selectedDoc) return;
    exportSummaryAsMarkdown(selectedDoc.title, summary);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Research Paper Summarizer
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Automate exhaustive academic literature extraction. Gemini 3.8 Flash decomposes raw manuscript text into six standardized scholarly dimensions with archival PDF and Markdown export.
        </p>
      </div>

      {/* Control Bar: Select Paper & Trigger */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Select Paper to Analyze:</span>
            <select
              value={selectedPaperId}
              onChange={(e) => setSelectedPaperId(e.target.value)}
              className="mt-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-sm sm:max-w-md truncate"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.pageCount} pages, {d.chunkCount} chunks)
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSummarize}
          disabled={!selectedPaperId || loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-xs shadow-md transition-colors shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Scholarly Sections...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate 6-Section Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Content Cards */}
      {summary && selectedDoc && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Paper Title:</span>
              <span className="text-sm font-semibold text-slate-200">{selectedDoc.title}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyFullSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-medium transition-colors shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-medium transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Markdown</span>
              </button>
            </div>
          </div>

          {/* Six Canonical Sections Grid */}
          <div className="space-y-4">
            {/* 1. Abstract */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
                <FileText className="w-4 h-4" />
                <span>1. Abstract</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">{summary.abstract}</p>
            </div>

            {/* 2. Research Objective */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs tracking-wider uppercase">
                <Target className="w-4 h-4" />
                <span>2. Research Objective</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {summary.researchObjective}
              </p>
            </div>

            {/* 3. Methodology */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
                <FlaskConical className="w-4 h-4" />
                <span>3. Methodology & Architecture</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {summary.methodology}
              </p>
            </div>

            {/* 4. Key Findings */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
                <Trophy className="w-4 h-4" />
                <span>4. Key Findings & Empirical Results</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {summary.keyFindings}
              </p>
            </div>

            {/* 5. Conclusion */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
                <FileText className="w-4 h-4" />
                <span>5. Conclusion</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {summary.conclusion}
              </p>
            </div>

            {/* 6. Future Scope */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs tracking-wider uppercase">
                <Compass className="w-4 h-4" />
                <span>6. Future Scope & Horizons</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {summary.futureScope}
              </p>
            </div>
          </div>
        </div>
      )}

      {!summary && !loading && (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Ready to synthesize paper</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Choose a research paper above and click "Generate 6-Section Summary" to extract Abstract, Objectives, Methods, Results, Conclusion, and Future Work with PDF & Markdown archival.
          </p>
        </div>
      )}
    </div>
  );
};
