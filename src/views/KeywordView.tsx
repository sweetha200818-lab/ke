import React, { useState } from 'react';
import {
  KeyRound,
  BookOpen,
  Sparkles,
  Loader2,
  Tag,
  BookMarked,
  BarChart3,
  Search,
} from 'lucide-react';
import { ResearchDocument, PaperKeywords } from '../types';

interface KeywordViewProps {
  documents: ResearchDocument[];
  initialPaperId: string | null;
  onSearchConcept: (concept: string) => void;
}

export const KeywordView: React.FC<KeywordViewProps> = ({
  documents,
  initialPaperId,
  onSearchConcept,
}) => {
  const [selectedPaperId, setSelectedPaperId] = useState<string>(
    initialPaperId || (documents[0]?.id || '')
  );
  const [keywords, setKeywords] = useState<PaperKeywords | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedDoc = documents.find((d) => d.id === selectedPaperId);

  const handleExtract = async () => {
    if (!selectedPaperId || loading) return;

    setLoading(true);
    setKeywords(null);

    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: selectedPaperId }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const raw = await response.text();
        throw new Error(raw.length > 0 && !raw.startsWith('<') ? raw.slice(0, 100) : 'Service unavailable');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract keywords');
      }

      setKeywords(data.keywords);
    } catch (err: any) {
      console.error('Keyword extraction error:', err);
      alert(`Extraction failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Keyword & Topic Extraction</h1>
        <p className="text-sm text-slate-400 mt-1">
          Extract high-entropy domain terms, technical definitions, and core scholarly topics using automated ontology parsing and LLM concept induction.
        </p>
      </div>

      {/* Selector & Trigger */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Target Paper:</span>
            <select
              value={selectedPaperId}
              onChange={(e) => setSelectedPaperId(e.target.value)}
              className="mt-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-sm sm:max-w-md truncate"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleExtract}
          disabled={!selectedPaperId || loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-xs shadow-xs transition-colors shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Inducing Key Concepts...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Extract Research Keywords</span>
            </>
          )}
        </button>
      </div>

      {/* Keywords Breakdown */}
      {keywords && (
        <div className="space-y-6">
          {/* Research Topics */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Tag className="w-4 h-4" />
              <span>Primary Research Domains & Subfields</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.topics?.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => onSearchConcept(topic)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-indigo-900/40 border border-slate-700 hover:border-indigo-500/40 text-xs text-slate-200 hover:text-indigo-200 transition-colors flex items-center gap-1.5"
                >
                  <span>{topic}</span>
                  <Search className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Technical Terms & Scholarly Definitions */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
              <BookMarked className="w-4 h-4" />
              <span>Technical Lexicon & Contextual Definitions</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {keywords.technicalTerms?.map((termObj, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-200">{termObj.term}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-500/20 text-indigo-400">
                      {termObj.importance} priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {termObj.definition}
                  </p>
                  <button
                    onClick={() => onSearchConcept(termObj.term)}
                    className="pt-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    <span>Find in paper chunks &rarr;</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Frequent Concepts Bar Chart Simulation */}
          {keywords.frequentConcepts && keywords.frequentConcepts.length > 0 && (
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <BarChart3 className="w-4 h-4" />
                <span>Salient Concept Frequency & Salience</span>
              </div>
              <div className="space-y-2.5">
                {keywords.frequentConcepts.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300">{item.concept}</span>
                      <span className="text-slate-500 tabular-nums">freq: {item.frequency}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(15, (item.frequency / 20) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!keywords && !loading && (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <KeyRound className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">
            Select a paper to extract technical ontology
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Extracts domain keywords, contextual definitions, and concept frequencies with one click.
          </p>
        </div>
      )}
    </div>
  );
};
