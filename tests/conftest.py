import os
import sys
import tempfile
from pathlib import Path

import pytest

# Isolate runtime storage before any app module reads the paths.
_STORAGE = tempfile.mkdtemp(prefix="smart-crop-test-")
os.environ["SMART_CROP_STORAGE_DIR"] = _STORAGE
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient  # noqa: E402

from app.application.main import app  # noqa: E402


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_headers(client):
    """Register a fresh user and return bearer headers for it."""
    import uuid

    username = f"user{uuid.uuid4().hex[:8]}"
    res = client.post(
        "/auth/register",
        json={"username": username, "password": "secret123", "full_name": "Test Farmer"},
    )
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}
