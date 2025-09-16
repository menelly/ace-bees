from __future__ import annotations

import uuid
from typing import Dict, List

from ..models.community import Beekeeper, PollinatorPoints


class CommunityService:
    def __init__(self, db_manager):
        self.db = db_manager
        self._points: Dict[str, int] = {}
        self._posts: Dict[str, dict] = {}

    async def get_leaderboard(self, limit: int = 50) -> List[dict]:
        items = sorted(self._points.items(), key=lambda kv: kv[1], reverse=True)[:limit]
        return [{"beekeeper_id": bid, "points": pts} for bid, pts in items]

    async def create_knowledge_post(self, beekeeper_id: str, title: str, content: str, tags: List[str]) -> dict:
        pid = uuid.uuid4().hex
        post = {"id": pid, "beekeeper_id": beekeeper_id, "title": title, "content": content, "tags": tags}
        self._posts[pid] = post
        return post

    async def award_points(self, beekeeper_id: str, points: int, reason: str) -> int:
        self._points[beekeeper_id] = self._points.get(beekeeper_id, 0) + int(points)
        return self._points[beekeeper_id]

