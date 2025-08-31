"""
Configuration settings for CrewAI server
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Server Configuration
    CREWAI_HOST: str = "0.0.0.0"
    CREWAI_PORT: int = 5001
    CREWAI_WORKERS: int = 4
    CREWAI_LOG_LEVEL: str = "INFO"
    
    # External Services
    PATHRAG_API_URL: str = "http://movie.ft.tc:5000"
    NOVEL_MOVIE_API_URL: str = "http://localhost:3000"
    NOVEL_MOVIE_API_KEY: Optional[str] = None
    
    # AI Services
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_DEFAULT_MODEL: str = "anthropic/claude-sonnet-4"
    OPENROUTER_ADVANCED_MODEL: str = "google/gemini-2.5-pro"
    
    # Database and Queue
    REDIS_URL: str = "redis://localhost:6379"
    
    # Monitoring and Logging
    SENTRY_DSN: Optional[str] = None
    PROMETHEUS_PORT: int = 9090
    LOG_LEVEL: str = "INFO"
    
    # Development
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
