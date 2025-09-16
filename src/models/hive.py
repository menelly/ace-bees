from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid


class Hive(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    name: str
    location: Dict[str, Any]
    beekeeper_id: str
    hive_type: str = "Langstroth"


class HiveStatus(BaseModel):
    hive_id: str
    temperature_c: float
    humidity_pct: float
    weight_kg: float
    sound_db: float
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SensorReading(BaseModel):
    id: str = Field(default_factory=lambda: f"r_{uuid.uuid4().hex[:8]}")
    hive_id: str
    sensor_type: str
    value: float
    unit: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

