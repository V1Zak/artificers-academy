"""
Database service using Supabase.

Provides access to user_progress and code_snippets tables.
Falls back to in-memory storage if Supabase is not configured.
"""

import logging
import threading
import uuid
from datetime import datetime, timezone
from typing import Optional

from supabase import create_client, Client

from app.config import get_settings
from app.models.schemas import ProgressEntry

logger = logging.getLogger(__name__)


class DatabaseError(Exception):
    """Raised when a database operation fails."""
    pass


class DatabaseService:
    """
    Database service for The Artificer's Academy.

    Uses Supabase when configured, falls back to in-memory storage
    for development without Supabase setup.

    Note: Methods are synchronous as the Supabase Python client is sync.
    """

    def __init__(self):
        self._client: Optional[Client] = None
        self._memory_store: dict[str, list[ProgressEntry]] = {}
        self._memory_snippets: dict[str, list[dict]] = {}
        self._init_client()

    def _init_client(self):
        """Initialize Supabase client if configured."""
        settings = get_settings()
        if settings.is_configured:
            try:
                self._client = create_client(
                    settings.supabase_url,
                    settings.supabase_service_key
                )
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                self._client = None

    @property
    def is_connected(self) -> bool:
        """Check if connected to Supabase."""
        return self._client is not None

    # ==========================================
    # Progress Methods
    # ==========================================

    def get_progress(self, user_id: str) -> list[ProgressEntry]:
        """Get all progress entries for a user."""
        if not self.is_connected:
            return list(self._memory_store.get(user_id, []))

        try:
            response = self._client.table("user_progress") \
                .select("*") \
                .eq("user_id", user_id) \
                .execute()

            return [
                ProgressEntry(
                    level_id=row["level_id"],
                    phase_id=row["phase_id"],
                    completed=row["completed"],
                    code_snapshot=row.get("code_snapshot"),
                )
                for row in response.data
            ]
        except Exception as e:
            logger.error(f"Failed to get progress for user {user_id}: {e}")
            raise DatabaseError(f"Failed to retrieve progress: {e}")

    def upsert_progress(
        self,
        user_id: str,
        level_id: str,
        phase_id: str,
        completed: bool,
        code_snapshot: Optional[str] = None,
    ) -> None:
        """Insert or update progress for a user/level/phase."""
        if not self.is_connected:
            # In-memory fallback
            if user_id not in self._memory_store:
                self._memory_store[user_id] = []

            # Find existing entry
            existing = None
            for entry in self._memory_store[user_id]:
                if entry.level_id == level_id and entry.phase_id == phase_id:
                    existing = entry
                    break

            if existing:
                existing.completed = completed
                if code_snapshot:
                    existing.code_snapshot = code_snapshot
            else:
                self._memory_store[user_id].append(ProgressEntry(
                    level_id=level_id,
                    phase_id=phase_id,
                    completed=completed,
                    code_snapshot=code_snapshot,
                ))
            return

        try:
            # Supabase upsert
            data = {
                "user_id": user_id,
                "level_id": level_id,
                "phase_id": phase_id,
                "completed": completed,
            }

            if code_snapshot:
                data["code_snapshot"] = code_snapshot

            if completed:
                data["completed_at"] = datetime.now(timezone.utc).isoformat()

            self._client.table("user_progress") \
                .upsert(data, on_conflict="user_id,level_id,phase_id") \
                .execute()
        except Exception as e:
            logger.error(f"Failed to upsert progress for user {user_id}: {e}")
            raise DatabaseError(f"Failed to save progress: {e}")

    # ==========================================
    # Code Snippets Methods
    # ==========================================

    def save_snippet(
        self,
        user_id: str,
        level_id: str,
        title: str,
        code: str,
        is_valid: bool,
        validation_result: Optional[dict] = None,
    ) -> str:
        """Save a code snippet and return its ID."""
        if not self.is_connected:
            # In-memory fallback with unique ID
            snippet_id = str(uuid.uuid4())
            if user_id not in self._memory_snippets:
                self._memory_snippets[user_id] = []
            self._memory_snippets[user_id].append({
                "id": snippet_id,
                "user_id": user_id,
                "level_id": level_id,
                "title": title,
                "code": code,
                "is_valid": is_valid,
                "validation_result": validation_result,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            return snippet_id

        try:
            response = self._client.table("code_snippets") \
                .insert({
                    "user_id": user_id,
                    "level_id": level_id,
                    "title": title,
                    "code": code,
                    "is_valid": is_valid,
                    "validation_result": validation_result,
                }) \
                .execute()

            return response.data[0]["id"]
        except Exception as e:
            logger.error(f"Failed to save snippet for user {user_id}: {e}")
            raise DatabaseError(f"Failed to save snippet: {e}")

    def get_snippets(self, user_id: str, level_id: Optional[str] = None) -> list[dict]:
        """Get code snippets for a user, optionally filtered by level."""
        if not self.is_connected:
            snippets = self._memory_snippets.get(user_id, [])
            if level_id:
                snippets = [s for s in snippets if s["level_id"] == level_id]
            return sorted(snippets, key=lambda x: x["created_at"], reverse=True)

        try:
            query = self._client.table("code_snippets") \
                .select("*") \
                .eq("user_id", user_id)

            if level_id:
                query = query.eq("level_id", level_id)

            response = query.order("created_at", desc=True).execute()
            return response.data
        except Exception as e:
            logger.error(f"Failed to get snippets for user {user_id}: {e}")
            raise DatabaseError(f"Failed to retrieve snippets: {e}")

    def delete_snippet(self, user_id: str, snippet_id: str) -> bool:
        """Delete a code snippet. Returns True if deleted."""
        if not self.is_connected:
            if user_id in self._memory_snippets:
                original_len = len(self._memory_snippets[user_id])
                self._memory_snippets[user_id] = [
                    s for s in self._memory_snippets[user_id] if s["id"] != snippet_id
                ]
                return len(self._memory_snippets[user_id]) < original_len
            return False

        try:
            response = self._client.table("code_snippets") \
                .delete() \
                .eq("id", snippet_id) \
                .eq("user_id", user_id) \
                .execute()

            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Failed to delete snippet {snippet_id}: {e}")
            raise DatabaseError(f"Failed to delete snippet: {e}")


# Thread-safe singleton
_db_service: Optional[DatabaseService] = None
_db_lock = threading.Lock()


def get_database() -> DatabaseService:
    """Get the database service instance (thread-safe singleton)."""
    global _db_service
    if _db_service is None:
        with _db_lock:
            # Double-check locking pattern
            if _db_service is None:
                _db_service = DatabaseService()
    return _db_service
