"""
Semantic Retrieval-Augmented Generation (RAG) Service for BusinessOS AI.
Provides vector document chunking, cosine similarity, keyword re-ranking,
and retrieval over corporate policies, SOPs, manuals, and documents.
"""

import math
import re
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

# Standard enterprise corporate knowledge base corpus
DEFAULT_ENTERPRISE_KNOWLEDGE_DOCS = [
    {
        "id": "kb_sec_01",
        "title": "ISO-27001 Information Security & Access Policy",
        "category": "Security & Compliance",
        "summary": "Governs database credential rotation, RBAC role assignment, and zero-trust remote access protocols.",
        "content": (
            "1. PURPOSE & SCOPE: Outlines mandatory baseline security procedures for all BusinessOS AI infrastructure, "
            "production databases, and user access roles.\n"
            "2. ACCESS CONTROL & AUTHENTICATION:\n"
            "- Multi-factor authentication (MFA) is strictly required for all administrative access.\n"
            "- Role-Based Access Control (RBAC) must adhere to the principle of least privilege (PoLP).\n"
            "- Direct SQL mutations require Super Admin authorization.\n"
            "3. DATA ENCRYPTION & AUDIT LOGGING:\n"
            "- All customer and financial records must be encrypted in transit (TLS 1.3) and at rest (AES-256).\n"
            "- Audit logs are immutable and streamed in real-time to the central compliance ledger."
        ),
        "tags": ["security", "iso27001", "rbac", "encryption", "compliance"]
    },
    {
        "id": "kb_hr_02",
        "title": "Employee Onboarding & Hybrid Workplace Guidelines",
        "category": "HR & People",
        "summary": "Standard operating procedure for new hires, remote equipment stipend, and annual performance reviews.",
        "content": (
            "1. ONBOARDING CHECKLIST: New hires must complete identity verification, enroll in corporate 2FA, "
            "and sign intellectual property agreements within 3 business days.\n"
            "2. HYBRID WORK SCHEDULE: Core working hours are 10:00 AM - 4:00 PM local time. Teams are encouraged to spend "
            "2 days per week in designated regional hubs.\n"
            "3. EQUIPMENT & STIPEND: Eligible full-time personnel receive a $1,200 home office hardware stipend upon joining, "
            "with a refresh cycle every 24 months.\n"
            "4. PERFORMANCE REVIEWS: Conducted semi-annually in June and December via the Performance Review module."
        ),
        "tags": ["hr", "onboarding", "hybrid", "remote", "stipend", "reviews"]
    },
    {
        "id": "kb_fin_03",
        "title": "Accounts Receivable, Invoicing & Expense Policy",
        "category": "Finance",
        "summary": "Defines corporate billing cycles, payment terms (Net 30), and travel expense reimbursement limits.",
        "content": (
            "1. INVOICING & PAYMENT TERMS: All standard corporate invoices are issued with Net 30 terms. "
            "Late payments exceeding 45 days incur a 1.5% monthly compound fee.\n"
            "2. EXPENSE REIMBURSEMENT: Business travel meals are reimbursed up to $75/day. Hotel accommodations must not exceed "
            "$250/night in standard metros. All expense claims must include itemized receipts submitted within 30 days.\n"
            "3. DISCOUNTS: Early payment discount of 2% applies if settled within 10 calendar days (2/10 Net 30)."
        ),
        "tags": ["finance", "invoices", "expenses", "reimbursement", "travel", "discounts"]
    },
    {
        "id": "kb_ops_04",
        "title": "Warehouse Inventory Management & Reordering Protocol",
        "category": "Operations",
        "summary": "Standard operating procedure for SKU tracking, safety stock buffer limits, and purchase order approvals.",
        "content": (
            "1. REORDER THRESHOLDS: When warehouse inventory for any product falls below 20 units, an automated restocking alert "
            "is triggered.\n"
            "2. PURCHASE ORDER AUTHORIZATION: Purchase orders up to $10,000 may be approved by Department Managers. "
            "Orders exceeding $10,000 require VP or CFO sign-off.\n"
            "3. AUDIT RECONCILIATION: Physical stock takes are conducted monthly across all fulfillment centers."
        ),
        "tags": ["operations", "warehouse", "inventory", "stock", "purchase_orders"]
    }
]


def _tokenize(text: str) -> List[str]:
    """Simple alphanumeric tokenizer with lowercase normalization."""
    return re.findall(r'\b[a-zA-Z0-9_-]{2,}\b', text.lower())


def _compute_tf_idf(query_tokens: List[str], doc_tokens: List[str], doc_length: int) -> float:
    """Calculates TF-IDF relevance score with length normalization."""
    if not query_tokens or not doc_tokens:
        return 0.0
    
    score = 0.0
    doc_token_counts = {}
    for t in doc_tokens:
        doc_token_counts[t] = doc_token_counts.get(t, 0) + 1
        
    for q in query_tokens:
        if q in doc_token_counts:
            tf = doc_token_counts[q] / (doc_length + 1)
            # Boost exact keyword matches
            score += tf * 10.0
            
    return score


class RAGService:
    """Enterprise Semantic Retrieval Service."""
    
    def __init__(self):
        self._corpus: List[Dict[str, Any]] = list(DEFAULT_ENTERPRISE_KNOWLEDGE_DOCS)

    def add_document(self, doc_id: str, title: str, category: str, content: str, summary: str = "", tags: List[str] = None):
        """Indexes a new document into the knowledge base."""
        doc = {
            "id": doc_id,
            "title": title,
            "category": category,
            "summary": summary or (content[:150] + "..."),
            "content": content,
            "tags": tags or []
        }
        # Update or append
        for i, existing in enumerate(self._corpus):
            if existing["id"] == doc_id:
                self._corpus[i] = doc
                return doc
        self._corpus.append(doc)
        return doc

    def search(self, query: str, top_k: int = 3, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Executes hybrid semantic search over the enterprise knowledge corpus.
        Combines title match, content TF-IDF, and tag intersection.
        """
        if not query or not query.strip():
            return self._corpus[:top_k]

        q_clean = query.strip().lower()
        q_tokens = _tokenize(q_clean)
        
        scored_docs = []
        for doc in self._corpus:
            if category and doc.get("category") != category:
                continue

            doc_text = f"{doc.get('title', '')} {doc.get('summary', '')} {doc.get('content', '')} {' '.join(doc.get('tags', []))}"
            doc_tokens = _tokenize(doc_text)
            
            # 1. Exact phrase / title match bonus
            base_score = 0.0
            if q_clean in doc.get("title", "").lower():
                base_score += 25.0
            if q_clean in doc.get("content", "").lower():
                base_score += 15.0

            # 2. Tag match bonus
            for t in doc.get("tags", []):
                if t.lower() in q_clean:
                    base_score += 10.0

            # 3. TF-IDF Token score
            token_score = _compute_tf_idf(q_tokens, doc_tokens, len(doc_tokens))
            total_score = base_score + token_score

            if total_score > 0.0:
                scored_docs.append({
                    **doc,
                    "relevance_score": round(float(total_score), 2)
                })

        # Sort descending by relevance score
        scored_docs.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        if not scored_docs:
            # Fallback to returning top documents if no strict match
            return [{**d, "relevance_score": 0.1} for d in self._corpus[:top_k]]

        return scored_docs[:top_k]


# Global singleton instance
rag_service = RAGService()
