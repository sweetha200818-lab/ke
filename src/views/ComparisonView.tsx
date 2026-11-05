import React, { useState } from 'react';
import {
  GitCompare,
  CheckSquare,
  Square,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Download,
  FileDown,
  BookOpen,
  Layers,
} from 'lucide-react';
import { ResearchDocument, PaperComparisonMatrix } from '../types';
import { exportComparisonAsPDF, exportComparisonAsMarkdown } from '../utils/exportUtils';

interface ComparisonViewProps {
  documents: ResearchDocument[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ documents }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    documents.slice(0, 2).map((d) => d.id)
  );
  const [comparison, setComparison] = useState<PaperComparisonMatrix | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        alert('Please keep at least 2 papers selected for comparison.');
        return;
      }
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2 || loading) return;

    setLoading(true);
    setComparison(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperIds: selectedIds }),
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
        throw new Error(data.error || 'Comparison failed');
      }

      setComparison(data);
    } catch (err: any) {
      console.error('Comparison error:', err);
      alert(`Comparison failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyComparison = () => {
    if (!comparison) return;
    let text = `# Comparative Academic Analysis\nPapers: ${comparison.paperTitles.join(', ')}\n\n`;
    comparison.comparisonAspects.forEach((asp) => {
      text += `## ${asp.aspect}\n`;
      asp.items.forEach((item) => {
        text += `### ${item.paperTitle}\n${item.content}\n\n`;
      });
    });
    text += `## Synthesis & Meta-Evaluation\n${comparison.synthesis}\n`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Research Paper Comparison
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Perform multi-paper comparative meta-analysis. Select two or more manuscripts to evaluate contrasting research hypotheses, architectural mechanisms, dataset benchmarks, advantages, and limitations in a structured matrix with PDF and Markdown archival.
        </p>
      </div>

      {/* Multi-Paper Selection Strip */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select 2+ Papers To Contrast ({selectedIds.length} Selected)
          </span>
          <button
            onClick={handleCompare}
            disabled={selectedIds.length < 2 || loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-xs transition-colors shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Comparison Matrix...</span>
              </>
            ) : (
              <>
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare Selected Papers</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((doc) => {
            const isSelected = selectedIds.includes(doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => toggleSelect(doc.id)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-xs'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="mt-0.5 text-indigo-400 shrink-0">
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="flex-1 truncate">
                  <div className="font-medium text-slate-200 truncate">{doc.title}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {doc.pageCount} pages · {doc.chunkCount} chunks
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      {comparison && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="text-xs text-slate-300">
              <span className="text-slate-500">Comparing: </span>
              <span className="font-semibold">{comparison.paperTitles.join(' vs. ')}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyComparison}
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
                onClick={() => exportComparisonAsPDF(comparison)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-medium transition-colors shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={() => exportComparisonAsMarkdown(comparison)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-medium transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Markdown</span>
              </button>
            </div>
          </div>

          {/* Structured Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-300 font-mono border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5 w-1/4 font-semibold text-indigo-300">
                      Evaluation Aspect
                    </th>
                    {comparison.paperTitles.map((title, idx) => (
                      <th key={idx} className="px-5 py-3.5 font-semibold text-slate-200">
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {comparison.comparisonAspects.map((aspectRow, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 font-semibold text-indigo-400 bg-slate-950/40 align-top">
                        {aspectRow.aspect}
                      </td>
                      {aspectRow.items.map((item, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-5 py-4 text-slate-300 leading-relaxed align-top font-sans"
                        >
                          {item.content}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Synthesis Card */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Synthesis & Meta-Analytical Evaluation</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {comparison.synthesis}
            </p>
          </div>
        </div>
      )}

      {!comparison && !loading && (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <GitCompare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">
            Select 2 or more papers to generate comparative matrix
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Compare foundational architectural papers like Attention Is All You Need vs Deep Residual Learning, or your own uploaded research PDF documents.
          </p>
        </div>
      )}
    </div>
  );
};
