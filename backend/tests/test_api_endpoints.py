def test_openapi_schema_generated(client):
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert "openapi" in schema
    assert "paths" in schema
    assert "/health" in schema["paths"] or "/api/v1/dashboard/metrics" in schema["paths"]


def test_public_docs_accessible(client):
    response = client.get("/docs")
    assert response.status_code == 200
