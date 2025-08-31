"""
Pydantic models for CrewAI server API
"""

from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class CrewRequest(BaseModel):
    """Request model for crew execution"""
    crew_type: str = Field(..., description="Type of crew to execute")
    project_id: str = Field(..., description="Novel Movie project ID")
    user_id: str = Field(..., description="User ID")
    input_data: Dict[str, Any] = Field(..., description="Input data for the crew")
    config: Dict[str, Any] = Field(default_factory=dict, description="Crew configuration")


class CrewResponse(BaseModel):
    """Response model for crew execution"""
    success: bool = Field(..., description="Whether the request was successful")
    job_id: str = Field(..., description="Unique job identifier")
    message: Optional[str] = Field(None, description="Response message")
    estimated_time: Optional[str] = Field(None, description="Estimated completion time")
    result: Optional[Dict[str, Any]] = Field(None, description="Execution result")
    error: Optional[str] = Field(None, description="Error message if failed")


class JobStatus(BaseModel):
    """Job status model"""
    job_id: str = Field(..., description="Unique job identifier")
    status: str = Field(..., description="Job status: queued, running, completed, failed")
    crew_type: str = Field(..., description="Type of crew")
    project_id: str = Field(..., description="Project ID")
    created_at: float = Field(..., description="Job creation timestamp")
    started_at: Optional[float] = Field(None, description="Job start timestamp")
    completed_at: Optional[float] = Field(None, description="Job completion timestamp")
    progress: int = Field(default=0, description="Progress percentage (0-100)")
    result: Optional[Dict[str, Any]] = Field(None, description="Job result")
    error: Optional[str] = Field(None, description="Error message if failed")


class StoryGraph(BaseModel):
    """Story graph data model"""
    scenes: List[Dict[str, Any]] = Field(default_factory=list)
    characters: List[Dict[str, Any]] = Field(default_factory=list)
    locations: List[Dict[str, Any]] = Field(default_factory=list)
    themes: List[Dict[str, Any]] = Field(default_factory=list)
    relationships: List[Dict[str, Any]] = Field(default_factory=list)


class AgentResult(BaseModel):
    """Agent execution result"""
    success: bool = Field(..., description="Whether execution was successful")
    data: Optional[Dict[str, Any]] = Field(None, description="Result data")
    error: Optional[str] = Field(None, description="Error message")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Execution metadata")
    execution_time: Optional[float] = Field(None, description="Execution time in seconds")
    tokens_used: Optional[int] = Field(None, description="Tokens consumed")


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    service: str = Field(..., description="Service name")
    version: str = Field(..., description="Service version")
    port: int = Field(..., description="Service port")
    timestamp: float = Field(..., description="Response timestamp")


class StatsResponse(BaseModel):
    """Statistics response"""
    active_jobs: int = Field(..., description="Number of active jobs")
    completed_jobs: int = Field(..., description="Number of completed jobs")
    failed_jobs: int = Field(..., description="Number of failed jobs")
    total_jobs: int = Field(..., description="Total number of jobs")
    uptime: float = Field(..., description="Server uptime in seconds")
    settings: Dict[str, Any] = Field(..., description="Server settings")
