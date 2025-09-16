from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import List


@dataclass
class EnvironmentalSnapshot:
    air_quality: dict
    weather: dict
    bloom_calendar: List[str]
    pollution_sources: List[str]


class EnvironmentalService:
    def __init__(self) -> None:
        self._running = True

    async def start_data_collection(self) -> None:
        # Stubbed background loop
        while self._running:
            await asyncio.sleep(10)

    async def get_location_data(self, location: str) -> EnvironmentalSnapshot:
        # Return plausible demo data
        return EnvironmentalSnapshot(
            air_quality={"aqi": 42, "pm25": 7, "o3": 11},
            weather={"temp_c": 23.5, "humidity": 48, "precip_mm": 0.0},
            bloom_calendar=["lavender", "sunflower", "wild clover"],
            pollution_sources=["traffic", "construction"]
        )

