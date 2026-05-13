from typing import Dict

import pandas as pd
from joblib import load

from app.price_estimation.schema import PriceRequest
from app.price_estimation.train import (
    CATEGORICAL_COLUMNS,
    NUMERIC_COLUMNS,
    build_cost_profile_lookup,
    calculate_financial_targets,
)
from app.shared.paths import COST_DATASET_PATH, COST_MODEL_PATH


_cost_model = None
_cost_profiles = None


def _load_model():
    global _cost_model
    if _cost_model is None and COST_MODEL_PATH.exists():
        _cost_model = load(COST_MODEL_PATH)
    return _cost_model


def _load_profiles():
    global _cost_profiles
    if _cost_profiles is None:
        _cost_profiles = build_cost_profile_lookup(pd.read_csv(COST_DATASET_PATH))
    return _cost_profiles


def _get_profile(crop_name: str) -> dict[str, float | str]:
    profiles = _load_profiles()
    crop_key = crop_name.strip().lower()
    if crop_key in profiles:
        return profiles[crop_key]
    return profiles["rice"]


def _build_feature_row(payload: PriceRequest) -> tuple[str, pd.DataFrame]:
    profile = _get_profile(payload.crop_name)
    crop_name = str(profile["crop_name"])

    row = {
        "crop_name": crop_name,
        "soil_type": payload.soil_type or profile["soil_type"],
        "acres": payload.acres,
        "seed_cost_per_acre": float(profile["seed_cost_per_acre"]),
        "fertilizer_cost_per_acre": float(profile["fertilizer_cost_per_acre"]),
        "labor_cost_per_acre": float(profile["labor_cost_per_acre"]),
        "machinery_cost_per_acre": float(profile["machinery_cost_per_acre"]),
        "water_cost_per_acre": float(profile["water_cost_per_acre"]),
        "yield_kg_per_acre": float(profile["yield_kg_per_acre"]),
        "market_price_per_kg": payload.market_price_per_kg or float(profile["market_price_per_kg"]),
    }

    cols = ["crop_name", "soil_type"] + NUMERIC_COLUMNS
    return crop_name, pd.DataFrame([row], columns=cols)


def estimate_price(payload: PriceRequest) -> Dict[str, float | str]:
    crop_name, feature_row = _build_feature_row(payload)
    model = _load_model()

    if model is not None:
        prediction = model.predict(feature_row)[0]
        total_cost, expected_revenue, expected_profit = [float(value) for value in prediction]
        prediction_source = "trained_regressor"
    else:
        targets = calculate_financial_targets(feature_row.iloc[0].to_dict())
        total_cost = float(targets["total_cost"])
        expected_revenue = float(targets["expected_revenue"])
        expected_profit = float(targets["expected_profit"])
        prediction_source = "seed_formula"

    cost_per_acre = total_cost / payload.acres
    profit_margin = (expected_profit / expected_revenue) if expected_revenue else 0.0

    return {
        "crop_name": crop_name,
        "total_cost": total_cost,
        "expected_revenue": expected_revenue,
        "expected_profit": expected_profit,
        "cost_per_acre": float(cost_per_acre),
        "profit_margin": float(profit_margin),
        "prediction_source": prediction_source,
    }
