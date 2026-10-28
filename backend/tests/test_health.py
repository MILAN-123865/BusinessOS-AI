def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "HEALTHY"


def test_cors_configuration(client):
    response = client.get("/test-cors")
    assert response.status_code == 200
    data = response.json()
    assert "cors" in data
