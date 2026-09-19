import pytest
from pydantic import ValidationError

from app.crop_recommendation.schema import CropRequest


def test_crop_request_rejects_missing_required_field():
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

    with pytest.raises(ValidationError) as exc_info:
        CropRequest.model_validate(payload)

    assert any(error["loc"] == ("soil_type",) for error in exc_info.value.errors())
