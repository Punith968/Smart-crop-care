from typing import Dict, List

import numpy as np
import pandas as pd
from joblib import load

from app.crop_recommendation.schema import CropRequest
from app.crop_recommendation.train import FEATURE_COLUMNS
from app.shared.paths import CROP_MODEL_PATH


_crop_model = None
_label_encoder = None


def _load_model():
    global _crop_model
    if _crop_model is None:
        _crop_model = load(CROP_MODEL_PATH)
    return _crop_model


def predict_crop(payload: CropRequest) -> Dict[str, str]:
    model = _load_model()
    feature_row = pd.DataFrame(
        [[
            payload.N,
            payload.P,
            payload.K,
            payload.temperature,
            payload.humidity,
            payload.ph,
            payload.rainfall,
        ]],
        columns=FEATURE_COLUMNS,
    )
    prediction = model.predict(feature_row)[0]
    return {"recommended_crop": str(prediction)}


def predict_top_crops(payload: CropRequest, top_n: int = 4) -> Dict[str, List[Dict[str, str]]]:
    model = _load_model()
    feature_row = pd.DataFrame(
        [[
            payload.N,
            payload.P,
            payload.K,
            payload.temperature,
            payload.humidity,
            payload.ph,
            payload.rainfall,
        ]],
        columns=FEATURE_COLUMNS,
    )

    probs = model.predict_proba(feature_row)[0]
    top_indices = np.argsort(probs)[-top_n:][::-1]

    crops = []
    for idx in top_indices:
        crop_name = model.named_steps['classifier'].classes_[idx]
        confidence = float(probs[idx] * 100)
        crops.append({
            "crop": str(crop_name),
            "confidence": f"{confidence:.2f}%"
        })

    return {"top_crops": crops}
