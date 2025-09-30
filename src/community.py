from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional


class Beekeeper(BaseModel):
    id: str
    name: str
    city: Optional[str] = None


class PollinatorPoints(BaseModel):
    beekeeper_id: str
    points: int = Field(default=0, ge=0)

