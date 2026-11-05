# AI Research Paper Assistant 🎓🤖

An intelligent, modern research assistant designed to help students, scholars, and scientists upload, understand, analyze, semantically search, summarize, and compare academic research papers using **Artificial Intelligence, Knowledge Engineering, Retrieval-Augmented Generation (RAG), and Vector Database technology**.

---

## 🌟 Key Features

1. **Academic Dashboard**: High-level telemetry covering total indexed papers, vectorized text chunks, processed tokens, and quick navigation.
2. **PDF Ingestion & Processing**: Multi-file PDF drag-and-drop, text sanitization, page-level tracking, sliding window chunking with overlap, vector embedding generation, and duplicate prevention.
3. **Interactive RAG Research Chatbot**: In-depth Q&A with strict context verification powered by Google Gemini (`gemini-3.8-flash`). Answers include exact citations `[Document Name, Page X]` and source passage inspectors.
4. **Semantic Search Engine**: Meaning- and concept-based similarity search over document chunks with percentage relevance scores and snippet citations.
5. **Structured Paper Summarizer**: Automatically generates comprehensive 6-part academic summaries:
   - Abstract
   - Research Objective
   - Methodology
   - Key Findings
   - Conclusion
   - Future Scope
6. **Side-by-Side Paper Comparison**: Compare two or more research papers across objectives, architectures, datasets, results, advantages, and limitations in a clean matrix.
7. **Keyword & Topic Extraction**: Identifies domain research concepts, technical glossaries with definitions, and frequent terminology.
8. **Document Library & Chunk Inspector**: Full paper management with chunk inspection, page preview, and vector deletion.
9. **Pre-Loaded Landmark Papers**: Pre-seeded with *Attention Is All You Need* (Vaswani et al.) and *Deep Residual Learning for Image Recognition* (He et al.) for instant evaluation.

---

## 🏗️ System Architecture & RAG Pipeline

```
[ User PDF Upload ]
        │
        ▼
[ PyMuPDF Text Extraction & Cleaning ]
        │
        ▼
[ Overlapping Sliding Chunking (with Page Metadata) ]
        │
        ▼
[ Vector Embedding Generation (SentenceTransformers / Gemini) ]
        │
        ▼
[ Vector Database Storage (ChromaDB / Vector Store) ]
        │
        ├─────────────────────────────────────────────────┐
        ▼                                                 ▼
[ Semantic Search ]                               [ RAG Chatbot ]
• Cosine Similarity Scoring                      • Top-K Context Retrieval
• Page-Level Citations                            • Grounded Gemini Prompting
• Concept Relevance                               • Unsupported Info Guardrail
                                                  • Document & Page Citations
```

---

## 🚀 Running the Application

### Option A: Integrated Full-Stack (Default AI Studio Environment)

The application includes an integrated Express + Vite full-stack server running on port `3000`:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

### Option B: Standalone Python FastAPI + ChromaDB Backend

To run the dedicated Python FastAPI backend independently:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Set your Gemini API key in .env
cp .env.example .env
# Edit .env with your GEMINI_API_KEY

# 5. Start the FastAPI server
uvicorn main:app --reload --port 8000
```

The interactive FastAPI Swagger documentation will be available at `http://localhost:8000/docs`.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | Dashboard telemetry and vector counts |
| `GET` | `/api/documents` | List all processed papers |
| `POST` | `/api/upload` | Upload PDF file and process into vector chunks |
| `POST` | `/api/process-document` | Parse and chunk uploaded paper |
| `POST` | `/api/chat` | RAG Q&A with Gemini 3.8 Flash & page citations |
| `POST` | `/api/semantic-search` | Semantic cosine similarity search |
| `POST` | `/api/summarize` | Generate 6-section academic summary |
| `POST` | `/api/compare` | Multi-paper comparative matrix |
| `POST` | `/api/keywords` | Extract technical terms & research topics |
| `DELETE` | `/api/documents/:id` | Delete paper and its vector embeddings |

---

## 🔒 Security & Privacy

- All Gemini API calls are performed strictly server-side.
- API keys are never exposed in client bundles or browser network requests.
- Strict anti-hallucination prompt guardrails ensure unsupported questions receive clear disclaimers.
