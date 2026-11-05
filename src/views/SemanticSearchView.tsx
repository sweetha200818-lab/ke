import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  FileText,
  Percent,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ResearchDocument, SearchResult } from '../types';

interface SemanticSearchViewProps {
  documents: ResearchDocument[];
  onOpenChatWithQuery: (query: string, docId?: string) => void;
}

export const SemanticSearchView: React.FC<SemanticSearchViewProps> = ({
  documents,
  onOpenChatWithQuery,
}) => {
  const [query, setQuery] = useState('');
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copiedChunkId, setCopiedChunkId] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          documentId: selectedPaperId || undefined,
          limit: 10,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const raw = await response.text();
        throw new Error(raw.length > 0 && !raw.startsWith('<') ? raw.slice(0, 100) : 'Search service unavailable');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results || []);
    } catch (err: any) {
      console.error('Semantic search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copySnippet = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedChunkId(id);
    setTimeout(() => setCopiedChunkId(null), 2000);
  };

  const suggestedSearches = [
    'Self-attention computational complexity compared to recurrent layers',
    'Vanishing and exploding gradient mitigation in deep networks',
    'WMT English to French benchmark translation evaluation',
    'Shortcut connections with zero added parameter complexity',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Semantic Vector Search</h1>
        <p className="text-sm text-slate-400 mt-1">
          Perform concept-level queries using dense mathematical embeddings. The engine maps natural language questions onto high-dimensional vector representations to discover contextually related paper passages.
        </p>
      </div>

      {/* Search Input Box & Filter */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts, methodologies, metrics, architectures..."
              className="w-full pl-12 pr-28 py-3.5 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Filter Scope:</span>
              <select
                value={selectedPaperId || ''}
                onChange={(e) => setSelectedPaperId(e.target.value || null)}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Entire Library ({documents.length} papers)</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            <span className="font-mono text-[11px] text-slate-500">
              Cosine Similarity Ranking · Threshold: &gt;0.2
            </span>
          </div>
        </form>

        {/* Suggested Queries */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[11px] text-slate-500 mb-2">Try sample semantic queries:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedSearches.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(s);
                  setTimeout(() => handleSearch(), 50);
                }}
                className="text-left text-xs px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results List */}
      {loading && (
        <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <span>Computing query embedding and searching ChromaDB vector collection...</span>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
          No relevant research paper sections matched your query. Try broadening your terms or removing document filters.
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span>Found {results.length} relevant passages</span>
            <span>Sorted by Cosine Similarity Metric</span>
          </div>

          <div className="space-y-3">
            {results.map((item, idx) => (
              <div
                key={item.chunkId || idx}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
              >
                {/* Meta header */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-semibold text-slate-200">{item.documentTitle}</span>
                    <span className="text-slate-500 font-mono">· Page {item.pageNumber}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400 text-[11px]">
                      sim: {item.similarityScore}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tabular-nums">
                      {item.matchScorePercentage}% Match
                    </span>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-sm text-slate-300 leading-relaxed font-sans">
                  "{item.snippet}"
                </div>

                {/* Action footer */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => copySnippet(item.snippet, item.chunkId)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {copiedChunkId === item.chunkId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied snippet</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy passage</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onOpenChatWithQuery(query, item.documentId)}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    <span>Ask Gemini about this passage</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
