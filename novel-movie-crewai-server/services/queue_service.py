"""
Queue Service for CrewAI Server
Handles job queuing and background processing
"""

import asyncio
import logging
from typing import Dict, Any, Optional
import redis.asyncio as redis
from config.settings import settings


class QueueService:
    """
    Async queue service using Redis
    """
    
    def __init__(self):
        self.redis_url = settings.REDIS_URL
        self.logger = logging.getLogger(__name__)
        self.redis_client: Optional[redis.Redis] = None
    
    @classmethod
    async def initialize(cls):
        """Initialize the queue service"""
        instance = cls()
        try:
            instance.redis_client = redis.from_url(
                instance.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            # Test connection
            await instance.redis_client.ping()
            instance.logger.info("Queue service initialized successfully")
        except Exception as e:
            instance.logger.warning(f"Redis connection failed: {str(e)}")
            instance.logger.info("Running without Redis queue support")
        return instance
    
    @classmethod
    async def cleanup(cls):
        """Cleanup queue service resources"""
        # Placeholder for cleanup logic
        pass
    
    async def add_job(self, job_id: str, job_data: Dict[str, Any]) -> bool:
        """Add a job to the queue"""
        try:
            if self.redis_client:
                await self.redis_client.hset(f"job:{job_id}", mapping=job_data)
                await self.redis_client.lpush("job_queue", job_id)
                self.logger.info(f"Job {job_id} added to queue")
                return True
            else:
                self.logger.warning("Redis not available, job not queued")
                return False
        except Exception as e:
            self.logger.error(f"Failed to add job to queue: {str(e)}")
            return False
    
    async def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get job data by ID"""
        try:
            if self.redis_client:
                job_data = await self.redis_client.hgetall(f"job:{job_id}")
                return job_data if job_data else None
            else:
                return None
        except Exception as e:
            self.logger.error(f"Failed to get job {job_id}: {str(e)}")
            return None
    
    async def update_job_status(self, job_id: str, status: str, data: Optional[Dict] = None) -> bool:
        """Update job status"""
        try:
            if self.redis_client:
                update_data = {"status": status}
                if data:
                    update_data.update(data)
                
                await self.redis_client.hset(f"job:{job_id}", mapping=update_data)
                self.logger.info(f"Job {job_id} status updated to {status}")
                return True
            else:
                return False
        except Exception as e:
            self.logger.error(f"Failed to update job status: {str(e)}")
            return False
    
    async def get_next_job(self) -> Optional[str]:
        """Get next job from queue"""
        try:
            if self.redis_client:
                job_id = await self.redis_client.brpop("job_queue", timeout=1)
                return job_id[1] if job_id else None
            else:
                return None
        except Exception as e:
            self.logger.error(f"Failed to get next job: {str(e)}")
            return None
    
    async def get_queue_stats(self) -> Dict[str, Any]:
        """Get queue statistics"""
        try:
            if self.redis_client:
                queue_length = await self.redis_client.llen("job_queue")
                return {
                    "queue_length": queue_length,
                    "redis_connected": True
                }
            else:
                return {
                    "queue_length": 0,
                    "redis_connected": False
                }
        except Exception as e:
            self.logger.error(f"Failed to get queue stats: {str(e)}")
            return {
                "queue_length": 0,
                "redis_connected": False,
                "error": str(e)
            }
