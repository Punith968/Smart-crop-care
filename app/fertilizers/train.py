from __future__ import annotations

import pandas as pd
from joblib import dump
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.shared.paths import (
    FERTILIZER_DATASET_PATH,
    FERTILIZER_MODEL_PATH,
    ensure_artifacts_dir,
)

TARGET_COLUMN = "Fertilizer Name"
NUMERIC_COLUMNS = [
    "Temperature",
    "Humidity",
    "Moisture",
    "Nitrogen",
    "Phosphorous",
    "Potassium",
]
CATEGORICAL_COLUMNS = ["Soil Type", "Crop Type"]
ENGINEERED_NUMERIC_COLUMNS = NUMERIC_COLUMNS + [
    "nutrient_total",
    "np_ratio",
    "pk_ratio",
    "moisture_temperature_index",
    "humidity_temperature_index",
    "nutrient_density",
]
ENGINEERED_CATEGORICAL_COLUMNS = CATEGORICAL_COLUMNS + ["Soil Crop Pair"]


class FertilizerFeatureEngineer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        df = pd.DataFrame(X).copy()
        df = df.loc[:, NUMERIC_COLUMNS + CATEGORICAL_COLUMNS]
        eps = 1e-6

        df["nutrient_total"] = df["Nitrogen"] + df["Phosphorous"] + df["Potassium"]
        df["np_ratio"] = df["Nitrogen"] / (df["Phosphorous"] + eps)
        df["pk_ratio"] = df["Phosphorous"] / (df["Potassium"] + eps)
        df["moisture_temperature_index"] = df["Moisture"] * df["Temperature"]
        df["humidity_temperature_index"] = df["Humidity"] * df["Temperature"]
        df["nutrient_density"] = df["nutrient_total"] / (df["Moisture"] + 1.0)
        df["Soil Crop Pair"] = (
            df["Soil Type"].astype(str).str.strip() + "_" + df["Crop Type"].astype(str).str.strip()
        )
        return df


def build_fertilizer_pipeline() -> Pipeline:
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
            ("feature_engineering", FertilizerFeatureEngineer()),
            ("preprocessor", preprocessor),
            (
                "classifier",
                ExtraTreesClassifier(
                    n_estimators=500,
                    max_depth=None,
                    min_samples_split=2,
                    min_samples_leaf=1,
                    random_state=42,
                    n_jobs=1,
                ),
            ),
        ]
    )


def train_fertilizer_model() -> float:
    df = pd.read_csv(FERTILIZER_DATASET_PATH)

    X = df[NUMERIC_COLUMNS + CATEGORICAL_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = build_fertilizer_pipeline()

    model.fit(X_train, y_train)
    accuracy = model.score(X_test, y_test)

    ensure_artifacts_dir()
    dump(model, FERTILIZER_MODEL_PATH)
    return float(accuracy)


if __name__ == "__main__":
    score = train_fertilizer_model()
    print(f"Fertilizer model trained. Validation accuracy: {score:.4f}")
