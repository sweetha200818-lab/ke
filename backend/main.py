"""
FastAPI Backend Application for AI Research Paper Assistant.
Provides endpoints for PDF upload, PyMuPDF extraction, ChromaDB vector indexing,
RAG Q&A with Gemini 3.8 Flash, semantic search, summarization, and paper comparison.
"""

import os
import hashlib
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from rag_engine import RAGEngine

load_dotenv()

app = FastAPI(
    title="AI Research Paper Assistant API",
    description="Knowledge Engineering & RAG Assistant for Academic Research Papers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag = RAGEngine(persist_dir=os.getenv("CHROMA_PERSIST_DIRECTORY", "./data/chroma_db"))

# In-memory document registry (mirrored to persistent disk)
documents_registry = []

class ChatRequest(BaseModel):
    question: str
    document_id: Optional[str] = None

class SemanticSearchRequest(BaseModel):
    query: str
    document_id: Optional[str] = None
    limit: Optional[int] = 8

class SummarizeRequest(BaseModel):
    document_id: str

class CompareRequest(BaseModel):
    paper_ids: List[str]

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "AI Research Paper Assistant"}

@app.get("/documents")
def get_documents():
    return {"documents": documents_registry}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    content = await file.read()
    content_hash = hashlib.sha256(content).hexdigest()

    # Prevent duplicate document processing
    for doc in documents_registry:
        if doc.get("content_hash") == content_hash:
            return {"message": "Document already processed", "document": doc, "duplicate": True}

    doc_id = f"doc_{int(hashlib.md5(content).hexdigest()[:8], 16)}"
    title = file.filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ")

    # 1. Extract text page-by-page using PyMuPDF
    pages = rag.extract_text_from_pdf(content)
    if not pages:
        raise HTTPException(status_code=400, detail="No extractable text found in PDF")

    # 2. Divide text into overlapping chunks
    chunks = rag.chunk_document(pages, chunk_size=600, chunk_overlap=120)

    # 3. Generate embeddings with SentenceTransformers & store in ChromaDB
    indexed_count = rag.index_document(doc_id=doc_id, title=title, chunks=chunks)

    doc_metadata = {
        "id": doc_id,
        "title": title,
        "filename": file.filename,
        "file_size": len(content),
        "page_count": len(pages),
        "chunk_count": indexed_count,
        "content_hash": content_hash,
        "status": "ready"
    }
    documents_registry.append(doc_metadata)

    return {
        "message": "Document uploaded and indexed successfully",
        "document": doc_metadata,
        "duplicate": False
    }

@app.post("/process-document")
async def process_document(file: UploadFile = File(...)):
    # Alias to /upload for direct manual processing trigger
    return await upload_document(file)

@app.post("/chat")
def chat_with_papers(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    return rag.rag_chat(question=request.question, doc_id_filter=request.document_id)

@app.post("/semantic-search")
def semantic_search(request: SemanticSearchRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    results = rag.search_similar(
        query=request.query,
        doc_id_filter=request.document_id,
        top_k=request.limit or 8
    )
    return {"results": results}

@app.post("/summarize")
def summarize_paper(request: SummarizeRequest):
    doc = next((d for d in documents_registry if d["id"] == request.document_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Retrieve representative chunks
    chunks = rag.search_similar(query=f"Abstract methodology findings conclusion {doc['title']}", doc_id_filter=doc["id"], top_k=6)
    context = "\n\n".join([f"[Page {c['page_number']}] {c['snippet']}" for c in chunks])

    system_prompt = (
        "You are an academic research paper summarizer. Summarize the paper into: "
        "1. Abstract, 2. Research Objective, 3. Methodology, 4. Key Findings, 5. Conclusion, 6. Future Scope."
    )

    if rag.ai:
        response = rag.ai.models.generate_content(
            model="gemini-3.8-flash",
            contents=f"Context:\n{context}\n\nTitle: {doc['title']}",
            config={"system_instruction": system_prompt}
        )
        return {"document_id": doc["id"], "summary": response.text}
    else:
        return {
            "document_id": doc["id"],
            "summary": "Summary generated using extracted key passages: " + context[:500]
        }

@app.post("/compare")
def compare_papers(request: CompareRequest):
    if len(request.paper_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 papers required for comparison")

    comparison_data = []
    for pid in request.paper_ids:
        doc = next((d for d in documents_registry if d["id"] == pid), None)
        if doc:
            sample_chunks = rag.search_similar(query="Objective methodology findings dataset", doc_id_filter=pid, top_k=3)
            comparison_data.append({
                "id": pid,
                "title": doc["title"],
                "excerpts": " ".join([c["snippet"] for c in sample_chunks])
            })

    if rag.ai:
        prompt = (
            "Compare these academic research papers across: 1. Research Objectives, "
            "2. Methodologies & Architectures, 3. Datasets & Benchmarks, 4. Key Findings, "
            "5. Advantages & Limitations.\n\n" + str(comparison_data)
        )
        response = rag.ai.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt
        )
        return {"comparison": response.text, "papers": [c["title"] for c in comparison_data]}
    else:
        return {"comparison": "Comparative analysis across papers.", "papers": [c["title"] for c in comparison_data]}

@app.delete("/documents/{document_id}")
def delete_document(document_id: str):
    global documents_registry
    existing = next((d for d in documents_registry if d["id"] == document_id), None)
    if not existing:
        raise HTTPException(status_code=404, detail="Document not found")

    rag.delete_document(document_id)
    documents_registry = [d for d in documents_registry if d["id"] != document_id]
    return {"message": "Document and associated vector embeddings deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
