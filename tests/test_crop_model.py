import numpy as np
import pandas as pd
import pytest
from joblib import dump

import app.crop_recommendation.service as crop_service
from app.crop_recommendation.train import (
    FEATURE_COLUMNS,
    CropFeatureEngineer,
    build_crop_pipeline,
)

CROP_PAYLOAD = {
    "N": 90, "P": 40, "K": 40, "temperature": 24, "humidity": 80,
    "ph": 6.5, "rainfall": 200, "soil_type": "Clay",
}


def synthetic_dataset(n_per_class=40, seed=0):
    """Three well-separated crop profiles so a small model learns them reliably."""
    rng = np.random.default_rng(seed)
    profiles = {
        "rice": dict(N=90, P=40, K=40, Temperature=24, Humidity=80, pH=6.5, Rainfall=200, Soil_Type="Clay"),
        "millet": dict(N=20, P=20, K=20, Temperature=32, Humidity=35, pH=7.5, Rainfall=40, Soil_Type="Sandy"),
        "cotton": dict(N=120, P=50, K=20, Temperature=28, Humidity=60, pH=7.0, Rainfall=90, Soil_Type="Black"),
    }
    rows = []
    for crop, p in profiles.items():
        for _ in range(n_per_class):
            row = {k: (v + rng.normal(0, max(abs(v) * 0.05, 0.1)) if isinstance(v, (int, float)) else v)
                   for k, v in p.items()}
            row["Crop_name"] = crop
            rows.append(row)
    return pd.DataFrame(rows)


def test_feature_engineer_adds_npk_ratios():
    df = pd.DataFrame([{**dict(zip(FEATURE_COLUMNS, [60, 30, 20, 28, 65, 6.2, 120, "Sandy"]))}])
    out = CropFeatureEngineer().transform(df)
    assert out.loc[0, "npk_total"] == 110
    assert out.loc[0, "np_ratio"] == pytest.approx(2.0, rel=1e-4)
    assert out.loc[0, "nk_ratio"] == pytest.approx(3.0, rel=1e-4)
    assert out.loc[0, "pk_ratio"] == pytest.approx(1.5, rel=1e-4)


def test_feature_engineer_handles_zero_potassium():
    df = pd.DataFrame([dict(zip(FEATURE_COLUMNS, [10, 10, 0, 25, 50, 7, 100, "Loamy"]))])
    out = CropFeatureEngineer().transform(df)
    assert np.isfinite(out[["nk_ratio", "pk_ratio"]].to_numpy()).all()


def test_pipeline_learns_separable_profiles():
    df = synthetic_dataset()
    model = build_crop_pipeline().set_params(classifier__n_estimators=30)
    model.fit(df[FEATURE_COLUMNS], df["Crop_name"])
    holdout = synthetic_dataset(n_per_class=10, seed=1)
    assert model.score(holdout[FEATURE_COLUMNS], holdout["Crop_name"]) > 0.95


def test_pipeline_tolerates_unseen_soil_type():
    df = synthetic_dataset()
    model = build_crop_pipeline().set_params(classifier__n_estimators=10)
    model.fit(df[FEATURE_COLUMNS], df["Crop_name"])
    row = df[FEATURE_COLUMNS].iloc[[0]].copy()
    row["Soil_Type"] = "Volcanic"
    assert model.predict(row)[0] in {"rice", "millet", "cotton"}


@pytest.fixture
def trained_crop_model(tmp_path, monkeypatch):
    df = synthetic_dataset()
    model = build_crop_pipeline().set_params(classifier__n_estimators=30)
    model.fit(df[FEATURE_COLUMNS], df["Crop_name"])
    path = tmp_path / "crop_pipeline.joblib"
    dump(model, path)
    monkeypatch.setattr(crop_service, "CROP_MODEL_PATH", path)
    monkeypatch.setattr(crop_service, "_crop_model", None)
    return path


def test_predict_crop_endpoint(client, trained_crop_model):
    res = client.post("/predict/crop", json=CROP_PAYLOAD)
    assert res.status_code == 200
    assert res.json() == {"recommended_crop": "rice"}


def test_top_crops_endpoint_ranks_by_confidence(client, trained_crop_model):
    res = client.post("/predict/crop/top", json=CROP_PAYLOAD)
    assert res.status_code == 200
    top = res.json()["top_crops"]
    assert top[0]["crop"] == "rice"
    assert len(top) == 3  # only three classes exist


def test_untrained_model_returns_clear_error(client, tmp_path, monkeypatch):
    monkeypatch.setattr(crop_service, "CROP_MODEL_PATH", tmp_path / "missing.joblib")
    monkeypatch.setattr(crop_service, "_crop_model", None)
    res = client.post("/predict/crop", json=CROP_PAYLOAD)
    assert res.status_code == 400
    assert "not trained" in res.json()["detail"]


def test_crop_request_validation(client):
    res = client.post("/predict/crop", json={"N": 10})
    assert res.status_code == 422
