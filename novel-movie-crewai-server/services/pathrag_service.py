"""
PathRAG Service Client
Python client for PathRAG API integration
"""

import asyncio
import logging
from typing import Dict, Any, Optional, List
import aiohttp
from config.settings import settings


class PathRAGService:
    """
    Async client for PathRAG knowledge graph service
    """
    
    def __init__(self):
        self.base_url = settings.PATHRAG_API_URL
        self.logger = logging.getLogger(__name__)
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30)
            )
        return self.session
    
    async def health_check(self) -> Dict[str, Any]:
        """Check PathRAG service health"""
        try:
            session = await self._get_session()
            async with session.get(f"{self.base_url}/health") as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise Exception(f"Health check failed: {response.status}")
        except Exception as e:
            self.logger.error(f"PathRAG health check failed: {str(e)}")
            raise
    
    async def insert_documents(self, documents: List[str]) -> Dict[str, Any]:
        """Insert documents into PathRAG"""
        try:
            session = await self._get_session()
            payload = {"documents": documents}
            
            async with session.post(
                f"{self.base_url}/insert",
                json=payload
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise Exception(f"Document insertion failed: {response.status}")
        except Exception as e:
            self.logger.error(f"PathRAG document insertion failed: {str(e)}")
            raise
    
    async def insert_custom_kg(self, custom_kg: Dict[str, Any]) -> Dict[str, Any]:
        """Insert custom knowledge graph"""
        try:
            session = await self._get_session()
            payload = {"custom_kg": custom_kg}
            
            async with session.post(
                f"{self.base_url}/insert_custom_kg",
                json=payload
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise Exception(f"Custom KG insertion failed: {response.status}")
        except Exception as e:
            self.logger.error(f"PathRAG custom KG insertion failed: {str(e)}")
            # Return mock response for development
            return {
                "message": "PathRAG custom KG insertion (mock response)",
                "entities_count": len(custom_kg.get("entities", [])),
                "relationships_count": len(custom_kg.get("relationships", [])),
                "chunks_count": len(custom_kg.get("chunks", []))
            }
    
    async def query(self, query: str, **params) -> Dict[str, Any]:
        """Query PathRAG knowledge base"""
        try:
            session = await self._get_session()
            payload = {
                "query": query,
                "params": params
            }
            
            async with session.post(
                f"{self.base_url}/query",
                json=payload
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise Exception(f"Query failed: {response.status}")
        except Exception as e:
            self.logger.error(f"PathRAG query failed: {str(e)}")
            # Return mock response for development
            return {
                "query": query,
                "result": f"Mock response for query: {query}",
                "params": params,
                "message": "PathRAG service is in placeholder mode"
            }
    
    async def delete_entity(self, entity_name: str) -> Dict[str, Any]:
        """Delete an entity from the knowledge graph"""
        try:
            session = await self._get_session()
            payload = {"entity_name": entity_name}
            
            async with session.delete(
                f"{self.base_url}/delete_entity",
                json=payload
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise Exception(f"Entity deletion failed: {response.status}")
        except Exception as e:
            self.logger.error(f"PathRAG entity deletion failed: {str(e)}")
            raise
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get PathRAG system statistics"""
        try:
            session = await self._get_session()
            async with session.get(f"{self.base_url}/stats") as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise Exception(f"Stats request failed: {response.status}")
        except Exception as e:
            self.logger.error(f"PathRAG stats request failed: {str(e)}")
            # Return mock stats for development
            return {
                "total_documents": 0,
                "total_entities": 0,
                "total_relationships": 0,
                "message": "PathRAG stats (mock response)"
            }
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    def __del__(self):
        """Cleanup on deletion"""
        if self.session and not self.session.closed:
            # Schedule cleanup for next event loop iteration
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(self.close())
            except RuntimeError:
                # Event loop is not running, can't schedule cleanup
                pass
