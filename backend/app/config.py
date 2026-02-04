"""
Application configuration.

Loads settings from environment variables with validation.
"""

import os
from functools import lru_cache


class Settings:
    """Application settings loaded from environment."""

    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL", "")
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY", "")
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.frontend_url = os.getenv("FRONTEND_URL", "")  # Production frontend URL

    @property
    def is_configured(self) -> bool:
        """Check if Supabase is configured."""
        return bool(self.supabase_url and self.supabase_service_key)

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment == "production"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
