from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
from joblib import dump
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.shared.paths import COST_DATASET_PATH, COST_MODEL_PATH, ensure_artifacts_dir

CATEGORICAL_COLUMNS = ["crop_name", "soil_type"]
NUMERIC_COLUMNS = [
    "acres",
    "seed_cost_per_acre",
    "fertilizer_cost_per_acre",
    "labor_cost_per_acre",
    "machinery_cost_per_acre",
    "water_cost_per_acre",
    "yield_kg_per_acre",
    "market_price_per_kg",
]
ENGINEERED_NUMERIC_COLUMNS = NUMERIC_COLUMNS + [
    "input_cost_per_acre",
    "acreage_log",
    "yield_value_per_acre",
    "water_cost_share",
    "mechanization_ratio",
]
ENGINEERED_CATEGORICAL_COLUMNS = CATEGORICAL_COLUMNS
TARGET_COLUMNS = ["total_cost", "expected_revenue", "expected_profit"]


class CostFeatureEngineer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        df = pd.DataFrame(X).copy()
        df = df.loc[:, CATEGORICAL_COLUMNS + NUMERIC_COLUMNS]

        cost_components = [
            "seed_cost_per_acre",
            "fertilizer_cost_per_acre",
            "labor_cost_per_acre",
            "machinery_cost_per_acre",
            "water_cost_per_acre",
        ]
        df["input_cost_per_acre"] = df[cost_components].sum(axis=1)
        df["acreage_log"] = np.log1p(df["acres"].clip(lower=0.1))
        df["yield_value_per_acre"] = df["yield_kg_per_acre"] * df["market_price_per_kg"]
        df["water_cost_share"] = df["water_cost_per_acre"] / (df["input_cost_per_acre"] + 1.0)
        df["mechanization_ratio"] = df["machinery_cost_per_acre"] / (df["labor_cost_per_acre"] + 1.0)
        return df


def calculate_financial_targets(row: dict[str, Any]) -> dict[str, float]:
    input_cost_per_acre = (
        float(row["seed_cost_per_acre"])
        + float(row["fertilizer_cost_per_acre"])
        + float(row["labor_cost_per_acre"])
        + float(row["machinery_cost_per_acre"])
        + float(row["water_cost_per_acre"])
    )
    total_cost = float(row["acres"]) * input_cost_per_acre
    expected_revenue = float(row["acres"]) * float(row["yield_kg_per_acre"]) * float(row["market_price_per_kg"])
    expected_profit = expected_revenue - total_cost
    return {
        "total_cost": total_cost,
        "expected_revenue": expected_revenue,
        "expected_profit": expected_profit,
    }


def build_cost_profile_lookup(seed_df: pd.DataFrame) -> dict[str, dict[str, Any]]:
    profiles: dict[str, dict[str, Any]] = {}
    for crop_name, group in seed_df.groupby(seed_df["crop_name"].str.strip().str.lower()):
        first_row = group.iloc[0]
        profiles[crop_name] = {
            "crop_name": crop_name,
            "soil_type": str(first_row["soil_type"]),
            "seed_cost_per_acre": float(group["seed_cost_per_acre"].median()),
            "fertilizer_cost_per_acre": float(group["fertilizer_cost_per_acre"].median()),
            "labor_cost_per_acre": float(group["labor_cost_per_acre"].median()),
            "machinery_cost_per_acre": float(group["machinery_cost_per_acre"].median()),
            "water_cost_per_acre": float(group["water_cost_per_acre"].median()),
            "yield_kg_per_acre": float(group["yield_kg_per_acre"].median()),
            "market_price_per_kg": float(group["market_price_per_kg"].median()),
        }
    return profiles


def _augment_cost_dataset(seed_df: pd.DataFrame, samples_per_profile: int = 40) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    records: list[dict[str, Any]] = []

    for _, row in seed_df.iterrows():
        for _ in range(samples_per_profile):
            acres = float(rng.uniform(0.75, 8.0))
            new_row = row.to_dict()
            new_row["acres"] = round(acres, 2)
            new_row["seed_cost_per_acre"] = round(float(row["seed_cost_per_acre"]) * rng.normal(1.0, 0.05), 2)
            new_row["fertilizer_cost_per_acre"] = round(
                float(row["fertilizer_cost_per_acre"]) * rng.normal(1.0, 0.08), 2
            )
            new_row["labor_cost_per_acre"] = round(float(row["labor_cost_per_acre"]) * rng.normal(1.0, 0.07), 2)
            new_row["machinery_cost_per_acre"] = round(
                float(row["machinery_cost_per_acre"]) * rng.normal(1.0, 0.06), 2
            )
            new_row["water_cost_per_acre"] = round(float(row["water_cost_per_acre"]) * rng.normal(1.0, 0.06), 2)
            new_row["yield_kg_per_acre"] = round(float(row["yield_kg_per_acre"]) * rng.normal(1.0, 0.07), 2)
            new_row["market_price_per_kg"] = round(float(row["market_price_per_kg"]) * rng.normal(1.0, 0.06), 2)
            new_row.update(calculate_financial_targets(new_row))
            records.append(new_row)

    return pd.DataFrame.from_records(records)


def build_cost_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                        ("scaler", StandardScaler()),
                    ]
                ),
                ENGINEERED_NUMERIC_COLUMNS,
            ),
            (
                "cat",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore")),
                    ]
                ),
                ENGINEERED_CATEGORICAL_COLUMNS,
            ),
        ],
        remainder="drop",
    )

    return Pipeline(
        steps=[
            ("feature_engineering", CostFeatureEngineer()),
            ("preprocessor", preprocessor),
            (
                "regressor",
                RandomForestRegressor(
                    n_estimators=450,
                    max_depth=22,
                    min_samples_leaf=1,
                    random_state=42,
                    n_jobs=1,
                ),
            ),
        ]
    )


def train_cost_model() -> float:
    seed_df = pd.read_csv(COST_DATASET_PATH)
    dataset = _augment_cost_dataset(seed_df)

    X = dataset[CATEGORICAL_COLUMNS + NUMERIC_COLUMNS]
    y = dataset[TARGET_COLUMNS]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = build_cost_pipeline()
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    score = r2_score(y_test, predictions)

    ensure_artifacts_dir()
    dump(model, COST_MODEL_PATH)
    return float(score)


if __name__ == "__main__":
    score = train_cost_model()
    print(f"Cost estimation model trained. Validation R^2: {score:.4f}")
