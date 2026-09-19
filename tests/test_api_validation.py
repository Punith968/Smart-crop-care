from fastapi.testclient import TestClient

from app.application.main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_crop_prediction_rejects_missing_required_field():
    payload = {
        "N": 90,
        "P": 42,
        "K": 43,
        "temperature": 21.5,
        "humidity": 80,
        "ph": 6.5,
        "rainfall": 200,
        # soil_type intentionally omitted
    }

    response = client.post("/predict/crop", json=payload)

    assert response.status_code == 422
    assert any(error["loc"][-1] == "soil_type" for error in response.json()["detail"])
