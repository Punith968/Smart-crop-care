def test_register_login_me_logout_flow(client):
    res = client.post(
        "/auth/register",
        json={"username": "Ravi_K", "password": "secret123", "full_name": "Ravi K"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["username"] == "ravi_k"  # usernames are normalised to lower case
    headers = {"Authorization": f"Bearer {body['access_token']}"}

    me = client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["full_name"] == "Ravi K"

    login = client.post("/auth/login", json={"username": "ravi_k", "password": "secret123"})
    assert login.status_code == 200

    assert client.post("/auth/logout", headers=headers).status_code == 200
    assert client.get("/auth/me", headers=headers).status_code == 401


def test_duplicate_username_is_rejected(client):
    payload = {"username": "dupe_user", "password": "secret123"}
    assert client.post("/auth/register", json=payload).status_code == 200
    assert client.post("/auth/register", json=payload).status_code == 409


def test_wrong_password_is_rejected(client):
    client.post("/auth/register", json={"username": "pwcheck", "password": "secret123"})
    res = client.post("/auth/login", json={"username": "pwcheck", "password": "wrongpass"})
    assert res.status_code == 401


def test_invalid_token_is_rejected(client):
    res = client.get("/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert res.status_code == 401


def test_password_validation(client):
    res = client.post("/auth/register", json={"username": "shorty", "password": "123"})
    assert res.status_code == 422


def test_passwords_are_stored_hashed(client):
    import json
    import os
    from pathlib import Path

    client.post("/auth/register", json={"username": "hashcheck", "password": "plaintext99"})
    users = json.loads((Path(os.environ["SMART_CROP_STORAGE_DIR"]) / "users.json").read_text())
    record = next(u for u in users if u["username"] == "hashcheck")
    assert "plaintext99" not in json.dumps(record)
    assert len(record["salt"]) == 32 and len(record["password_hash"]) == 64
