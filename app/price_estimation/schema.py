from pydantic import BaseModel, Field


class PriceRequest(BaseModel):
    crop_name: str = Field(..., description="Crop name")
    acres: float = Field(..., gt=0, description="Land size in acres")
    soil_type: str | None = Field(default=None, description="Optional soil type")
    market_price_per_kg: float | None = Field(
        default=None,
        gt=0,
        description="Optional local selling price override",
    )


class PriceResponse(BaseModel):
    crop_name: str
    total_cost: float
    expected_revenue: float
    expected_profit: float
    cost_per_acre: float | None = None
    profit_margin: float | None = None
    prediction_source: str = "rule_based"
