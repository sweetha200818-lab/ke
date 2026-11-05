"""
RAG Engine: Document Ingestion, PyMuPDF Parsing, SentenceTransformers Embeddings,
ChromaDB Persistent Storage, and Google Gemini API Synthesis.
"""

import os
import hashlib
import json
from typing import List, Dict, Any, Optional
import fitz  # PyMuPDF
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from google import genai
from google.genai import types

class RAGEngine:
    def __init__(self, persist_dir: str = "./data/chroma_db"):
        self.persist_dir = persist_dir
        os.makedirs(self.persist_dir, exist_ok=True)
        
        # 1. Initialize ChromaDB client with persistent local storage
        self.chroma_client = chromadb.PersistentClient(path=self.persist_dir)
        self.collection = self.chroma_client.get_or_create_collection(
            name="research_papers",
            metadata={"hnsw:space": "cosine"}
        )
        
        # 2. Initialize Sentence Transformers embedding model
        # Using lightweight, high-performance all-MiniLM-L6-v2 (384-dimensional dense vectors)
        print("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        
        # 3. Initialize Google Gemini API client
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.ai = genai.Client(api_key=self.gemini_api_key) if self.gemini_api_key else None

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Extract text page-by-page from PDF binary using PyMuPDF (fitz).
        Returns a list of dicts with pageNumber and text.
        """
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages_data = []
        for page_index in range(len(doc)):
            page = doc[page_index]
            text = page.get_text("text")
            # Clean and normalize
            cleaned = " ".join(text.split())
            if cleaned:
                pages_data.append({
                    "page_number": page_index + 1,
                    "text": cleaned
                })
        return pages_data

    def chunk_document(
        self,
        pages: List[Dict[str, Any]],
        chunk_size: int = 600,
        chunk_overlap: int = 120
    ) -> List[Dict[str, Any]]:
        """
        Split page texts into overlapping chunks, preserving page-level metadata.
        """
        chunks = []
        chunk_idx = 0
        for page in pages:
            text = page["text"]
            start = 0
            while start < len(text):
                end = min(start + chunk_size, len(text))
                slice_text = text[start:end].strip()
                if len(slice_text) > 40:
                    chunks.append({
                        "chunk_index": chunk_idx,
                        "page_number": page["page_number"],
                        "text": slice_text
                    })
                    chunk_idx += 1
                if end >= len(text):
                    break
                start = max(start + 1, end - chunk_overlap)
        return chunks

    def index_document(
        self,
        doc_id: str,
        title: str,
        chunks: List[Dict[str, Any]]
    ) -> int:
        """
        Compute dense embeddings and store chunks + metadata in ChromaDB.
        """
        if not chunks:
            return 0

        texts = [c["text"] for c in chunks]
        embeddings = self.embedding_model.encode(texts).tolist()

        ids = [f"{doc_id}_c{c['chunk_index']}" for c in chunks]
        metadatas = [
            {
                "document_id": doc_id,
                "document_title": title,
                "page_number": c["page_number"],
                "chunk_index": c["chunk_index"]
            }
            for c in chunks
        ]

        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )
        return len(chunks)

    def search_similar(
        self,
        query: str,
        doc_id_filter: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Compute query embedding and query ChromaDB vector collection.
        """
        query_vector = self.embedding_model.encode([query]).tolist()[0]
        where_filter = {"document_id": doc_id_filter} if doc_id_filter else None

        results = self.collection.query(
            query_embeddings=[query_vector],
            n_results=top_k,
            where=where_filter
        )

        formatted_results = []
        if results and "documents" in results and len(results["documents"]) > 0:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results["distances"][0] if "distances" in results else [0.0] * len(docs)

            for doc_text, meta, dist in zip(docs, metas, distances):
                # Chroma cosine distance is 1 - similarity
                similarity = max(0.0, min(1.0, 1.0 - dist))
                formatted_results.append({
                    "document_id": meta["document_id"],
                    "document_title": meta["document_title"],
                    "page_number": meta["page_number"],
                    "snippet": doc_text,
                    "similarity_score": round(similarity, 4),
                    "match_score_percentage": round(similarity * 100)
                })

        return formatted_results

    def rag_chat(
        self,
        question: str,
        doc_id_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Complete RAG inference: retrieve top passages from ChromaDB and
        synthesize grounded response with page citations using Gemini 3.8 Flash.
        """
        retrieved_passages = self.search_similar(question, doc_id_filter, top_k=5)
        if not retrieved_passages:
            return {
                "answer": "No relevant document passages were found in the vector database.",
                "citations": [],
                "unsupported_info": True
            }

        context_str = "\n\n".join([
            f"[Source {i+1}] Paper: {p['document_title']}, Page: {p['page_number']}\nContent: {p['snippet']}"
            for i, p in enumerate(retrieved_passages)
        ])

        system_prompt = (
            "You are an expert academic research paper assistant. "
            "Answer the user's research question strictly based on the provided retrieved excerpts. "
            "If the excerpts do not contain the answer, state: "
            "'The provided research paper excerpts do not contain sufficient evidence to answer this question.' "
            "Always include citations in brackets, for example: [Paper Title, Page X]."
        )

        user_content = f"Retrieved Context:\n{context_str}\n\nQuestion: {question}"

        if self.ai:
            response = self.ai.models.generate_content(
                model="gemini-3.8-flash",
                contents=user_content,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                )
            )
            answer = response.text or ""
        else:
            top = retrieved_passages[0]
            answer = f"Synthesized from '{top['document_title']}' (Page {top['page_number']}):\n{top['snippet']}"

        return {
            "answer": answer,
            "citations": retrieved_passages,
            "unsupported_info": "insufficient evidence" in answer.lower()
        }

    def delete_document(self, doc_id: str):
        """
        Remove all chunk embeddings matching document_id from ChromaDB.
        """
        self.collection.delete(where={"document_id": doc_id})
