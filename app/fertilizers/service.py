from typing import Dict

import pandas as pd
from joblib import load

from app.fertilizers.schema import FertilizerRequest
from app.fertilizers.train import CATEGORICAL_COLUMNS, NUMERIC_COLUMNS
from app.shared.paths import FERTILIZER_MODEL_PATH


_fertilizer_model = None


def _load_model():
    global _fertilizer_model
    if _fertilizer_model is None:
        _fertilizer_model = load(FERTILIZER_MODEL_PATH)
    return _fertilizer_model


def predict_fertilizer(payload: FertilizerRequest) -> Dict[str, str]:
    model = _load_model()
    row = {
        "Temperature": payload.temperature,
        "Humidity": payload.humidity,
        "Moisture": payload.moisture,
        "Soil Type": payload.soil_type,
        "Crop Type": payload.crop_type,
        "Nitrogen": payload.nitrogen,
        "Phosphorous": payload.phosphorous,
        "Potassium": payload.potassium,
    }
    feature_row = pd.DataFrame([row], columns=NUMERIC_COLUMNS + CATEGORICAL_COLUMNS)
    prediction = model.predict(feature_row)[0]
    return {"recommended_fertilizer": str(prediction)}
