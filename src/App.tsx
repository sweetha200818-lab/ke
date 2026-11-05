import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveView } from './components/Sidebar';
import { Header } from './components/Header';
import { WelcomeView } from './views/WelcomeView';
import { DashboardView } from './views/DashboardView';
import { UploadView } from './views/UploadView';
import { ChatView } from './views/ChatView';
import { SemanticSearchView } from './views/SemanticSearchView';
import { SummarizerView } from './views/SummarizerView';
import { ComparisonView } from './views/ComparisonView';
import { KeywordView } from './views/KeywordView';
import { DocumentLibraryView } from './views/DocumentLibraryView';
import { SettingsView } from './views/SettingsView';
import { ResearchDocument, DashboardStats } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalPapers: 0,
    processedPapers: 0,
    totalChunks: 0,
    totalQuestionsAsked: 0,
    vectorDimensions: 768,
    embeddingModel: 'gemini-embedding-2-preview',
    llmModel: 'gemini-3.8-flash',
  });
  const [loadingInitial, setLoadingInitial] = useState(true);

  const fetchAppData = async () => {
    try {
      const [docsRes, statsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/stats'),
      ]);

      if (docsRes.ok && docsRes.headers.get('content-type')?.includes('application/json')) {
        const docsData = await docsRes.json();
        setDocuments(docsData.documents || []);
      }
      if (statsRes.ok && statsRes.headers.get('content-type')?.includes('application/json')) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching app data:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchAppData();
  }, []);

  const handleResetData = async () => {
    if (confirm('Reset document library to pre-seeded landmark research papers?')) {
      try {
        await fetch('/api/reset-data', { method: 'POST' });
        await fetchAppData();
        alert('Reset corpus successfully.');
      } catch (err) {
        console.error('Failed to reset:', err);
      }
    }
  };

  const handleSelectPaperForChat = (paperId: string) => {
    setSelectedPaperId(paperId);
    setActiveView('chat');
  };

  const handleSelectPaperForSummary = (paperId: string) => {
    setSelectedPaperId(paperId);
    setActiveView('summarize');
  };

  const handleOpenChatWithQuery = (query: string, docId?: string) => {
    if (docId) setSelectedPaperId(docId);
    setActiveView('chat');
  };

  const handleSearchConcept = (concept: string) => {
    setActiveView('search');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'welcome':
        return (
          <WelcomeView
            setActiveView={setActiveView}
            onExploreDemo={() => {
              if (documents.length > 0) setSelectedPaperId(documents[0].id);
            }}
          />
        );
      case 'dashboard':
        return (
          <DashboardView
            stats={stats}
            documents={documents}
            setActiveView={setActiveView}
            onSelectPaperForChat={handleSelectPaperForChat}
            onSelectPaperForSummary={handleSelectPaperForSummary}
          />
        );
      case 'upload':
        return (
          <UploadView
            onUploadSuccess={fetchAppData}
            setActiveView={setActiveView}
            onSelectPaperForChat={handleSelectPaperForChat}
          />
        );
      case 'chat':
        return (
          <ChatView
            documents={documents}
            selectedPaperId={selectedPaperId}
            setSelectedPaperId={setSelectedPaperId}
          />
        );
      case 'search':
        return (
          <SemanticSearchView
            documents={documents}
            onOpenChatWithQuery={handleOpenChatWithQuery}
          />
        );
      case 'summarize':
        return (
          <SummarizerView
            documents={documents}
            initialPaperId={selectedPaperId}
          />
        );
      case 'compare':
        return <ComparisonView documents={documents} />;
      case 'keywords':
        return (
          <KeywordView
            documents={documents}
            initialPaperId={selectedPaperId}
            onSearchConcept={handleSearchConcept}
          />
        );
      case 'library':
        return (
          <DocumentLibraryView
            documents={documents}
            onDeleteDocument={async (docId) => {
              try {
                await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
                await fetchAppData();
              } catch (err) {
                console.error('Delete error:', err);
              }
            }}
            onSelectPaperForChat={handleSelectPaperForChat}
            onSelectPaperForSummary={handleSelectPaperForSummary}
            setActiveView={setActiveView}
          />
        );
      case 'settings':
        return <SettingsView stats={stats} onResetData={handleResetData} />;
      default:
        return (
          <DashboardView
            stats={stats}
            documents={documents}
            setActiveView={setActiveView}
            onSelectPaperForChat={handleSelectPaperForChat}
            onSelectPaperForSummary={handleSelectPaperForSummary}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        paperCount={documents.length}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeView={activeView}
          setActiveView={setActiveView}
          setMobileOpen={setMobileOpen}
          onResetData={handleResetData}
          totalPapers={documents.length}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
