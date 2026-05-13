from pydantic import BaseModel, Field


class FertilizerRequest(BaseModel):
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., description="Humidity percentage")
    moisture: float = Field(..., description="Soil moisture")
    soil_type: str = Field(..., description="Soil type")
    crop_type: str = Field(..., description="Crop type")
    nitrogen: float = Field(..., description="Nitrogen value")
    phosphorous: float = Field(..., description="Phosphorous value")
    potassium: float = Field(..., description="Potassium value")


class FertilizerResponse(BaseModel):
    recommended_fertilizer: str
