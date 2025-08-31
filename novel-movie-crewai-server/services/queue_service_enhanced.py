"""
Redis-based Queue System for CrewAI Server
"""

import asyncio
import json
import logging
from typing import Dict, Any, Optional
import redis.asyncio as redis
from datetime import datetime, timedelta

from config.settings import settings


class QueueService:
    """Redis-based queue service for background job processing"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.redis_client = None
        self.mock_mode = settings.MOCK_SERVICES
        
    async def connect(self):
        """Connect to Redis"""
        if self.mock_mode:
            self.redis_client = MockRedisClient()
        else:
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                password=settings.REDIS_PASSWORD,
                decode_responses=True
            )
    
    async def enqueue_job(self, job_data: Dict[str, Any]) -> str:
        """Enqueue a crew execution job"""
        job_id = f"job_{datetime.now().timestamp()}"
        
        job_payload = {
            "job_id": job_id,
            "status": "queued",
            "created_at": datetime.now().isoformat(),
            "data": job_data
        }
        
        await self.redis_client.lpush("crew_jobs", json.dumps(job_payload))
        await self.redis_client.set(f"job:{job_id}", json.dumps(job_payload))
        
        self.logger.info(f"Job queued: {job_id}")
        return job_id
    
    async def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get job status"""
        job_data = await self.redis_client.get(f"job:{job_id}")
        if job_data:
            return json.loads(job_data)
        return None
    
    async def update_job_status(self, job_id: str, status: str, result: Optional[Dict] = None):
        """Update job status"""
        job_data = await self.get_job_status(job_id)
        if job_data:
            job_data["status"] = status
            job_data["updated_at"] = datetime.now().isoformat()
            if result:
                job_data["result"] = result
            
            await self.redis_client.set(f"job:{job_id}", json.dumps(job_data))


class MockRedisClient:
    """Mock Redis client for development"""
    
    def __init__(self):
        self.data = {}
        self.lists = {}
    
    async def lpush(self, key: str, value: str):
        if key not in self.lists:
            self.lists[key] = []
        self.lists[key].insert(0, value)
    
    async def set(self, key: str, value: str):
        self.data[key] = value
    
    async def get(self, key: str):
        return self.data.get(key)
