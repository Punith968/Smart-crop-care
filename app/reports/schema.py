from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ReportCreateRequest(BaseModel):
    module: str = Field(..., min_length=3, max_length=50)
    title: str = Field(..., min_length=3, max_length=120)
    payload: dict[str, Any] = Field(default_factory=dict)
    result: dict[str, Any] = Field(default_factory=dict)
    notes: str | None = Field(default=None, max_length=500)


class ReportItem(BaseModel):
    id: str
    module: str
    title: str
    created_at: str
    filename: str
    size_bytes: int


class ReportSummary(BaseModel):
    total_reports: int
    total_bytes: int
    reports: list[ReportItem]
