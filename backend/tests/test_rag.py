import pytest
from app.services.ai.rag_service import rag_service


def test_rag_service_semantic_search():
    # 1. Search for security policy
    sec_results = rag_service.search("ISO-27001 database credential rotation")
    assert len(sec_results) > 0
    assert "ISO-27001" in sec_results[0]["title"]
    assert sec_results[0]["relevance_score"] > 0

    # 2. Search for HR hybrid guidelines
    hr_results = rag_service.search("hybrid workplace stipend")
    assert len(hr_results) > 0
    assert "Onboarding" in hr_results[0]["title"] or "Hybrid" in hr_results[0]["title"]


def test_rag_service_add_document():
    doc = rag_service.add_document(
        doc_id="kb_custom_99",
        title="Custom Disaster Recovery Protocol",
        category="Operations",
        content="Failover procedures for multi-region database outages.",
        tags=["disaster", "failover"]
    )
    assert doc["id"] == "kb_custom_99"

    search_res = rag_service.search("disaster failover")
    assert any(d["id"] == "kb_custom_99" for d in search_res)
