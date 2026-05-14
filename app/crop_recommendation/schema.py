from pydantic import BaseModel, Field


class CropRequest(BaseModel):
    N: float = Field(..., description="Nitrogen value")
    P: float = Field(..., description="Phosphorus value")
    K: float = Field(..., description="Potassium value")
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., description="Relative humidity")
    ph: float = Field(..., description="Soil pH")
    rainfall: float = Field(..., description="Rainfall in mm")
    soil_type: str = Field(..., description="Soil type")


class CropResponse(BaseModel):
    recommended_crop: str


class CropPrediction(BaseModel):
    crop: str
    confidence: str


class TopCropsResponse(BaseModel):
    top_crops: list[CropPrediction]
