"""Regression tests: the SPA catch-all must not shadow API routes."""


def test_health_returns_json(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_protected_get_routes_reach_the_api(client):
    # Before the fix these returned index.html with HTTP 200.
    for path in ["/auth/me", "/reports", "/reports/download-all"]:
        res = client.get(path)
        assert res.status_code == 401, path
        assert res.headers["content-type"].startswith("application/json")


def test_spa_routes_and_static_assets_are_served(client):
    assert "<html" in client.get("/").text.lower()
    assert "<html" in client.get("/dashboard/anything").text.lower()
    assert client.get("/styles.css").headers["content-type"].startswith("text/css")


def test_catch_all_does_not_serve_files_outside_static_dir(client):
    res = client.get("/%2E%2E/%2E%2E/shared/paths.py")
    assert "STORAGE_DIR" not in res.text
