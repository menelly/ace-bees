from __future__ import annotations

import asyncio


class DatabaseManager:
    def __init__(self) -> None:
        self._ready = False

    async def initialize(self) -> None:
        # In-memory stub; replace with real Postgres setup later
        await asyncio.sleep(0)
        self._ready = True

    async def close(self) -> None:
        await asyncio.sleep(0)
        self._ready = False

    async def health_check(self) -> str:
        return "ok" if self._ready else "initializing"

