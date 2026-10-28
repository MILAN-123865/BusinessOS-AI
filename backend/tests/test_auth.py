def test_unauthenticated_request_rejected(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code in [401, 403]


def test_invalid_login_rejected(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "nonexistent@businessos.internal", "password": "WrongPassword123!"}
    )
    assert response.status_code in [400, 401, 404]


def test_malformed_login_rejected(client):
    response = client.post("/api/v1/auth/login", json={})
    assert response.status_code in [400, 422]
