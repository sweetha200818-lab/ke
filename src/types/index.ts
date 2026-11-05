export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  chunkIndex: number;
  text: string;
  charCount: number;
  embedding?: number[];
}

export interface ResearchDocument {
  id: string;
  title: string;
  filename: string;
  fileSize: number; // in bytes
  pageCount: number;
  chunkCount: number;
  uploadedAt: string;
  processed: boolean;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  summary?: PaperSummary;
  keywords?: PaperKeywords;
  isDemo?: boolean;
}

export interface PaperSummary {
  abstract: string;
  researchObjective: string;
  methodology: string;
  keyFindings: string;
  conclusion: string;
  futureScope: string;
  generatedAt: string;
}

export interface PaperKeywords {
  topics: string[];
  technicalTerms: { term: string; definition: string; importance: 'high' | 'medium' | 'low' }[];
  frequentConcepts: { concept: string; frequency: number }[];
}

export interface PaperComparisonMatrix {
  paperIds: string[];
  paperTitles: string[];
  comparisonAspects: {
    aspect: 'Research Objective' | 'Methodology & Architecture' | 'Datasets & Benchmarks' | 'Key Findings' | 'Advantages & Strengths' | 'Limitations & Future Work';
    items: { paperId: string; paperTitle: string; content: string }[];
  }[];
  synthesis: string;
  generatedAt: string;
}

export interface Citation {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  snippet: string;
  similarityScore: number; // 0.0 to 1.0
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: Citation[];
  unsupportedInfo?: boolean;
}

export interface SearchResult {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  snippet: string;
  similarityScore: number;
  matchScorePercentage: number;
}

export interface DashboardStats {
  totalPapers: number;
  processedPapers: number;
  totalChunks: number;
  totalQuestionsAsked: number;
  vectorDimensions: number;
  embeddingModel: string;
  llmModel: string;
}
