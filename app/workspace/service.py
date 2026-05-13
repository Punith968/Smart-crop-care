from __future__ import annotations

import base64
import binascii
from pathlib import Path
from uuid import uuid4

from app.crop_recommendation.schema import CropRequest
from app.crop_recommendation.service import predict_crop
from app.diseases_detection.schema import DiseaseRequest
from app.diseases_detection.service import detect_disease
from app.fertilizers.schema import FertilizerRequest
from app.fertilizers.service import predict_fertilizer
from app.price_estimation.schema import PriceRequest
from app.price_estimation.service import estimate_price
from app.shared.paths import UPLOADS_DIR, ensure_storage_dirs
from app.workspace.schema import AdvisoryWorkspaceRequest, DiseaseWorkspaceRequest


def run_advisory_workspace(payload: AdvisoryWorkspaceRequest) -> dict[str, object]:
    crop = predict_crop(
        CropRequest(
            N=payload.N,
            P=payload.P,
            K=payload.K,
            temperature=payload.temperature,
            humidity=payload.humidity,
            ph=payload.ph,
            rainfall=payload.rainfall,
        )
    )

    fertilizer = predict_fertilizer(
        FertilizerRequest(
            temperature=payload.temperature,
            humidity=payload.humidity,
            moisture=payload.moisture,
            soil_type=payload.soil_type,
            crop_type=crop["recommended_crop"],
            nitrogen=payload.N,
            phosphorous=payload.P,
            potassium=payload.K,
        )
    )

    price = estimate_price(
        PriceRequest(
            crop_name=crop["recommended_crop"],
            acres=payload.acres,
            soil_type=payload.soil_type,
        )
    )

    summary = {
        "headline": (
            f"{crop['recommended_crop'].title()} is the strongest crop match for the current field, "
            f"paired with {fertilizer['recommended_fertilizer']} support."
        ),
        "profit_signal": (
            f"Expected profit is approximately Rs. {price['expected_profit']:.2f} "
            f"from {payload.acres:.2f} acres."
        ),
    }

    return {
        "crop": crop,
        "fertilizer": fertilizer,
        "price": price,
        "summary": summary,
    }


def _persist_image_data(image_data: str) -> str | None:
    if not image_data:
        return None

    if "," in image_data:
        _, encoded = image_data.split(",", 1)
    else:
        encoded = image_data

    try:
        binary = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error):
        return None

    ensure_storage_dirs()
    filename = f"disease-upload-{uuid4().hex[:12]}.png"
    file_path = UPLOADS_DIR / filename
    file_path.write_bytes(binary)
    return str(file_path)


def run_disease_workspace(payload: DiseaseWorkspaceRequest) -> dict[str, object]:
    image_path = _persist_image_data(payload.image_data) if payload.image_data else None
    return detect_disease(
        DiseaseRequest(
            crop_name=payload.crop_name,
            image_path=image_path,
        )
    )
