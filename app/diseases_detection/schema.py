from pydantic import BaseModel, Field


class DiseaseRequest(BaseModel):
    crop_name: str = Field(..., description="Crop name")
    image_path: str | None = Field(
        default=None,
        description="Optional local image path for CNN disease detection",
    )


class DiseaseResponse(BaseModel):
    crop_name: str
    likely_disease: str
    recommendation: str
    risk_score: float | None = Field(default=None, description="Risk score from 0 to 100")
    justification: str = Field(..., description="Technical justification for the diagnosis")
    confidence: float | None = None
    prediction_source: str = "resnet50_cnn"
