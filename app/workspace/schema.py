from pydantic import BaseModel, Field


class AdvisoryWorkspaceRequest(BaseModel):
    N: float = Field(..., description="Nitrogen value")
    P: float = Field(..., description="Phosphorus value")
    K: float = Field(..., description="Potassium value")
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., description="Humidity percentage")
    ph: float = Field(..., description="Soil pH")
    rainfall: float = Field(..., description="Rainfall in mm")
    moisture: float = Field(..., description="Soil moisture")
    soil_type: str = Field(..., description="Soil type")
    acres: float = Field(..., gt=0, description="Cultivated area in acres")


class DiseaseWorkspaceRequest(BaseModel):
    crop_name: str = Field(..., description="Crop name")
    image_data: str | None = Field(
        default=None,
        description="Optional base64 data URL of an uploaded crop image",
    )
