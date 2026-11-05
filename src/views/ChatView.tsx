import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Trash2,
  BookOpen,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Copy,
  Check,
  Loader2,
  Download,
  FileDown,
} from 'lucide-react';
import { ResearchDocument, ChatMessage, Citation } from '../types';
import { exportChatAsPDF, exportChatAsMarkdown } from '../utils/exportUtils';

interface ChatViewProps {
  documents: ResearchDocument[];
  selectedPaperId: string | null;
  setSelectedPaperId: (id: string | null) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  documents,
  selectedPaperId,
  setSelectedPaperId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_welcome',
      sender: 'assistant',
      text: 'Hello! I am your AI Research Paper Assistant. Ask me any question about your uploaded research papers. I retrieve the most relevant passages from the vector database and provide context-grounded answers with exact page citations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const targetDoc = documents.find((d) => d.id === selectedPaperId);
  const targetDocTitle = targetDoc ? targetDoc.title : 'All Uploaded Research Papers';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionToSend?: string) => {
    const query = (questionToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          documentId: selectedPaperId || undefined,
        }),
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
        throw new Error(data.error || 'Failed to fetch answer');
      }

      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        sender: 'assistant',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || [],
        unsupportedInfo: data.unsupportedInfo,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        sender: 'assistant',
        text: `Error connecting to RAG pipeline: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'm_welcome',
        sender: 'assistant',
        text: 'Chat history cleared. What research question would you like to explore next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportPDF = () => {
    setExportMenuOpen(false);
    exportChatAsPDF(messages, targetDocTitle);
  };

  const handleExportMarkdown = () => {
    setExportMenuOpen(false);
    exportChatAsMarkdown(messages, targetDocTitle);
  };

  const suggestedQuestions = [
    'How does Multi-Head Attention calculate scaled dot-product attention?',
    'What is the degradation problem in deep networks and how does ResNet solve it?',
    'What BLEU score does the Transformer achieve on WMT 2014 English-to-German?',
    'Why do residual shortcut connections not introduce extra parameter complexity?',
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Top Controls: Paper Selector & Actions */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-medium text-slate-300">Target Corpus:</span>
          <select
            value={selectedPaperId || ''}
            onChange={(e) => setSelectedPaperId(e.target.value || null)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-xs sm:max-w-md truncate"
          >
            <option value="">All Uploaded Research Papers ({documents.length})</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title} ({doc.pageCount} pages)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Export chat transcript"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export Chat</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-slate-950 border border-slate-800 shadow-xl p-1.5 z-50 text-xs space-y-1">
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:bg-indigo-950/60 hover:text-indigo-200 transition-colors text-left"
                >
                  <FileDown className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-medium block">Export as PDF (.pdf)</span>
                    <span className="text-[10px] text-slate-500">Formatted scholarly report</span>
                  </div>
                </button>

                <button
                  onClick={handleExportMarkdown}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:bg-indigo-950/60 hover:text-indigo-200 transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="font-medium block">Export Markdown (.md)</span>
                    <span className="text-[10px] text-slate-500">Plain text with citations</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-3xl rounded-2xl p-5 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-xs'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-bl-xs'
              }`}
            >
              {/* Header meta */}
              <div className="flex items-center justify-between gap-4 mb-2 text-[11px] opacity-75 font-mono">
                <span className="font-semibold">
                  {msg.sender === 'user' ? 'Researcher' : 'Gemini 3.8 Flash (RAG)'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message text */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </div>

              {/* Unsupported info indicator */}
              {msg.unsupportedInfo && (
                <div className="mt-3 p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    The answer could not be completely verified from the indexed papers. Guardrails prevent generating ungrounded facts.
                  </span>
                </div>
              )}

              {/* Citations section */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Retrieved Sources & Evidence ({msg.citations.length})</span>
                  </div>

                  <div className="space-y-2">
                    {msg.citations.map((citation, cIdx) => {
                      const isExpanded = expandedCitationId === citation.chunkId;
                      return (
                        <div
                          key={citation.chunkId || cIdx}
                          className="rounded-lg bg-slate-950/60 border border-slate-800 overflow-hidden text-xs"
                        >
                          <button
                            onClick={() =>
                              setExpandedCitationId(isExpanded ? null : citation.chunkId)
                            }
                            className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-mono text-indigo-400 font-semibold">
                                [{cIdx + 1}]
                              </span>
                              <span className="font-medium text-slate-300 truncate">
                                {citation.documentTitle}
                              </span>
                              <span className="text-slate-500 font-mono">
                                · Page {citation.pageNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-[11px] text-emerald-400 tabular-nums">
                                {Math.round(citation.similarityScore * 100)}% match
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-3 bg-slate-950/90 border-t border-slate-800/60 font-mono text-[11px] text-slate-300 leading-relaxed">
                              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                                Exact Extracted Chunk Snippet:
                              </div>
                              "{citation.snippet}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Copy action */}
              {msg.sender === 'assistant' && (
                <div className="mt-3 flex items-center justify-end">
                  <button
                    onClick={() => copyToClipboard(msg.text, msg.id)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy answer</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-3 text-xs">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Retrieving vector chunks and synthesizing answer with citations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts strip if empty */}
      {messages.length <= 2 && (
        <div className="my-3 flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="pt-3 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask a question about your uploaded research papers..."
            className="w-full pl-4 pr-24 py-3.5 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none shadow-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="mt-2 text-center text-[11px] text-slate-500 font-mono">
          Retrieves top-K semantic chunks from vector store · Grounded in verified excerpts · Export transcript to PDF / Markdown
        </div>
      </div>
    </div>
  );
};
