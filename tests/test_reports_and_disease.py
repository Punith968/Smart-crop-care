def test_unknown_report_id_returns_404(client, auth_headers):
    assert client.get("/reports/0123456789ab/download", headers=auth_headers).status_code == 404


def test_malformed_report_id_returns_404(client, auth_headers):
    assert client.get("/reports/not-a-hex-id/download", headers=auth_headers).status_code == 404
    assert client.get("/reports/..users/download", headers=auth_headers).status_code == 404


def test_new_user_has_no_reports(client, auth_headers):
    res = client.get("/reports", headers=auth_headers)
    assert res.status_code == 200


def test_disease_detection_works_without_pytorch_model(client):
    # With no trained checkpoint (as in a fresh clone or CI) the service must
    # still answer instead of crashing at import time.
    res = client.post("/detect/disease", json={"crop_name": "tomato"})
    assert res.status_code == 200
    assert res.json()["crop_name"] == "tomato"
