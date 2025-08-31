"""
Novel Movie CrewAI Server
FastAPI server for AI agent orchestration
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import Dict, Any

import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config.settings import settings
from config.logging import setup_logging
from crews.architect_crew import ArchitectCrew
from crews.director_crew import DirectorCrew
from models.crew_models import CrewRequest, CrewResponse, JobStatus
from services.queue_service import QueueService
from utils.error_handling import setup_exception_handlers

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Job storage (in production, use Redis or database)
job_storage: Dict[str, Dict[str, Any]] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    logger.info("Starting Novel Movie CrewAI Server")
    
    # Initialize services
    await QueueService.initialize()
    
    yield
    
    # Cleanup
    logger.info("Shutting down Novel Movie CrewAI Server")
    await QueueService.cleanup()


# Create FastAPI app
app = FastAPI(
    title="Novel Movie CrewAI Server",
    description="AI agent orchestration for movie production",
    version="1.0.0",
    lifespan=lifespan
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup exception handlers
setup_exception_handlers(app)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "novel-movie-crewai-server",
        "version": "1.0.0",
        "port": settings.CREWAI_PORT,
        "timestamp": asyncio.get_event_loop().time()
    }


@app.get("/stats")
async def get_stats():
    """Get server statistics"""
    return {
        "active_jobs": len([j for j in job_storage.values() if j.get("status") == "running"]),
        "completed_jobs": len([j for j in job_storage.values() if j.get("status") == "completed"]),
        "failed_jobs": len([j for j in job_storage.values() if j.get("status") == "failed"]),
        "total_jobs": len(job_storage),
        "uptime": asyncio.get_event_loop().time(),
        "settings": {
            "workers": settings.CREWAI_WORKERS,
            "log_level": settings.CREWAI_LOG_LEVEL,
            "environment": settings.ENVIRONMENT
        }
    }


@app.post("/crews/execute", response_model=CrewResponse)
async def execute_crew(request: CrewRequest, background_tasks: BackgroundTasks):
    """Execute a CrewAI crew"""
    try:
        # Validate crew type
        crew_map = {
            'architect': ArchitectCrew,
            'director': DirectorCrew,
            # Add other crews as implemented
        }
        
        if request.crew_type not in crew_map:
            raise HTTPException(
                status_code=400, 
                detail=f"Unknown crew type: {request.crew_type}"
            )
        
        # Generate job ID
        job_id = f"{request.crew_type}_{request.project_id}_{int(asyncio.get_event_loop().time())}"
        
        # Store job info
        job_storage[job_id] = {
            "job_id": job_id,
            "crew_type": request.crew_type,
            "project_id": request.project_id,
            "user_id": request.user_id,
            "status": "queued",
            "created_at": asyncio.get_event_loop().time(),
            "input_data": request.input_data,
            "config": request.config
        }
        
        # Execute crew in background
        background_tasks.add_task(
            execute_crew_background,
            job_id,
            crew_map[request.crew_type],
            request
        )
        
        logger.info(f"Queued crew execution: {job_id}")
        
        return CrewResponse(
            success=True,
            job_id=job_id,
            message=f"Crew {request.crew_type} queued successfully",
            estimated_time="2-5 minutes"
        )
        
    except Exception as e:
        logger.error(f"Crew execution failed: {str(e)}")
        return CrewResponse(
            success=False,
            job_id="",
            error=str(e)
        )


@app.get("/crews/status/{job_id}", response_model=JobStatus)
async def get_crew_status(job_id: str):
    """Get crew execution status"""
    if job_id not in job_storage:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = job_storage[job_id]
    
    return JobStatus(
        job_id=job_id,
        status=job["status"],
        crew_type=job["crew_type"],
        project_id=job["project_id"],
        created_at=job["created_at"],
        completed_at=job.get("completed_at"),
        result=job.get("result"),
        error=job.get("error"),
        progress=job.get("progress", 0)
    )


async def execute_crew_background(job_id: str, crew_class, request: CrewRequest):
    """Execute crew in background"""
    try:
        # Update job status
        job_storage[job_id]["status"] = "running"
        job_storage[job_id]["started_at"] = asyncio.get_event_loop().time()
        
        logger.info(f"Starting crew execution: {job_id}")
        
        # Create and execute crew
        crew = crew_class(
            project_id=request.project_id,
            user_id=request.user_id,
            config=request.config
        )
        
        # Execute crew (this will be async in real implementation)
        result = await crew.execute_async(request.input_data)
        
        # Update job with results
        job_storage[job_id].update({
            "status": "completed",
            "completed_at": asyncio.get_event_loop().time(),
            "result": result,
            "progress": 100
        })
        
        logger.info(f"Crew execution completed: {job_id}")
        
    except Exception as e:
        logger.error(f"Crew execution failed: {job_id} - {str(e)}")
        job_storage[job_id].update({
            "status": "failed",
            "completed_at": asyncio.get_event_loop().time(),
            "error": str(e),
            "progress": 0
        })


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.CREWAI_HOST,
        port=settings.CREWAI_PORT,
        workers=1,  # Use 1 worker for development
        log_level=settings.CREWAI_LOG_LEVEL.lower(),
        reload=settings.ENVIRONMENT == "development"
    )
