import os
import pytest
from fastapi.testclient import TestClient

# Ensure test environment variables
os.environ["ENVIRONMENT"] = "local"
os.environ["DEBUG"] = "True"
os.environ["JWT_SECRET_KEY"] = "test_super_secret_key_at_least_32_characters_long"
os.environ["JWT_REFRESH_SECRET_KEY"] = "test_refresh_secret_key_at_least_32_chars"

from app.main import app
from app.core.security import create_access_token


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_headers():
    token = create_access_token(data={"sub": "user-test-id", "email": "admin@businessos.internal"})
    return {"Authorization": f"Bearer {token}"}
