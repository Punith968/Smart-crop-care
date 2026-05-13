from __future__ import annotations

import pandas as pd
from joblib import dump
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from app.shared.paths import CROP_DATASET_PATH, CROP_MODEL_PATH, ensure_artifacts_dir


FEATURE_COLUMNS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
ENGINEERED_COLUMNS = FEATURE_COLUMNS + [
    "npk_total",
    "np_ratio",
    "nk_ratio",
    "pk_ratio",
    "temperature_humidity_index",
    "rainfall_ph_interaction",
    "moisture_balance_index",
]
TARGET_COLUMN = "label"


class CropFeatureEngineer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        df = pd.DataFrame(X).copy()
        df = df.loc[:, FEATURE_COLUMNS]
        eps = 1e-6

        df["npk_total"] = df["N"] + df["P"] + df["K"]
        df["np_ratio"] = df["N"] / (df["P"] + eps)
        df["nk_ratio"] = df["N"] / (df["K"] + eps)
        df["pk_ratio"] = df["P"] / (df["K"] + eps)
        df["temperature_humidity_index"] = df["temperature"] * (df["humidity"] / 100.0)
        df["rainfall_ph_interaction"] = df["rainfall"] * df["ph"]
        df["moisture_balance_index"] = df["humidity"] + (df["rainfall"] / 10.0)
        return df


def build_crop_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "numeric",
                Pipeline(steps=[("imputer", SimpleImputer(strategy="median"))]),
                ENGINEERED_COLUMNS,
            )
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )

    return Pipeline(
        steps=[
            ("feature_engineering", CropFeatureEngineer()),
            ("preprocessor", preprocessor),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=450,
                    max_depth=24,
                    min_samples_split=3,
                    min_samples_leaf=1,
                    random_state=42,
                    n_jobs=1,
                    class_weight="balanced_subsample",
                ),
            ),
        ]
    )


def train_crop_model() -> float:
    df = pd.read_csv(CROP_DATASET_PATH)

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = build_crop_pipeline()

    model.fit(X_train, y_train)
    accuracy = model.score(X_test, y_test)

    ensure_artifacts_dir()
    dump(model, CROP_MODEL_PATH)
    return float(accuracy)


if __name__ == "__main__":
    score = train_crop_model()
    print(f"Crop model trained. Validation accuracy: {score:.4f}")
