from __future__ import annotations

import asyncio
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import AsyncIterator, Deque, Dict, List, Optional

from ..models.hive import Hive, HiveStatus, SensorReading


class HiveMonitoringService:
    def __init__(self, db_manager):
        self.db = db_manager
        self._hives: Dict[str, Hive] = {}
        self._status: Dict[str, HiveStatus] = {}
        self._readings: Dict[str, Deque[SensorReading]] = defaultdict(lambda: deque(maxlen=5000))
        self._subscribers: Dict[str, List[asyncio.Queue]] = defaultdict(list)
        self._running = True

    async def start_monitoring(self) -> None:
        while self._running:
            # Simulate periodic status updates
            now = datetime.utcnow()
            for hive_id in list(self._hives.keys()):
                base = self._status.get(
                    hive_id,
                    HiveStatus(
                        hive_id=hive_id, temperature_c=35.5, humidity_pct=55.0, weight_kg=28.0, sound_db=52.0
                    ),
                )
                # Tiny drift
                new = HiveStatus(
                    hive_id=hive_id,
                    temperature_c=round(base.temperature_c + 0.1, 2),
                    humidity_pct=round(base.humidity_pct + 0.05, 2),
                    weight_kg=round(base.weight_kg + 0.01, 2),
                    sound_db=round(base.sound_db + 0.02, 2),
                    updated_at=now,
                )
                self._status[hive_id] = new
                await self._broadcast(hive_id, {"type": "status", "data": new.dict()})
            await asyncio.sleep(2)

    def health_check(self) -> str:
        return "ok"

    async def create_hive(self, name: str, location: dict, beekeeper_id: str, hive_type: str) -> Hive:
        hive = Hive(name=name, location=location, beekeeper_id=beekeeper_id, hive_type=hive_type)
        self._hives[hive.id] = hive
        self._status[hive.id] = HiveStatus(
            hive_id=hive.id, temperature_c=35.0, humidity_pct=55.0, weight_kg=28.0, sound_db=52.0
        )
        return hive

    async def get_hive(self, hive_id: str) -> Optional[Hive]:
        return self._hives.get(hive_id)

    async def get_current_status(self, hive_id: str) -> Optional[HiveStatus]:
        return self._status.get(hive_id)

    async def get_recent_activity(self, hive_id: str, hours: int = 24) -> List[dict]:
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        return [r.dict() for r in self._readings[hive_id] if r.timestamp >= cutoff]

    async def store_sensor_reading(
        self, hive_id: str, sensor_type: str, value: float, unit: str, timestamp: datetime
    ) -> SensorReading:
        reading = SensorReading(hive_id=hive_id, sensor_type=sensor_type, value=value, unit=unit, timestamp=timestamp)
        self._readings[hive_id].append(reading)
        await self._broadcast(hive_id, {"type": "reading", "data": reading.dict()})
        return reading

    async def get_sensor_history(
        self, hive_id: str, sensor_type: str, hours: int = 24, limit: int = 1000
    ) -> List[SensorReading]:
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        items = [r for r in self._readings[hive_id] if r.sensor_type == sensor_type and r.timestamp >= cutoff]
        return items[-limit:]

    async def get_sensor_summary(self, hive_id: str, sensor_type: str, hours: int = 24) -> dict:
        rows = await self.get_sensor_history(hive_id, sensor_type, hours, limit=10000)
        if not rows:
            return {"count": 0}
        vals = [r.value for r in rows]
        return {
            "count": len(vals),
            "min": min(vals),
            "max": max(vals),
            "avg": round(sum(vals) / len(vals), 3),
        }

    async def subscribe_to_updates(self, hive_id: str) -> AsyncIterator[dict]:
        q: asyncio.Queue = asyncio.Queue()
        self._subscribers[hive_id].append(q)
        try:
            while True:
                payload = await q.get()
                yield payload
        finally:
            self._subscribers[hive_id].remove(q)

    async def _broadcast(self, hive_id: str, payload: dict) -> None:
        for q in self._subscribers[hive_id]:
            await q.put(payload)

