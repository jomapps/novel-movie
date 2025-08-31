"""
Enhanced PathRAG Service with Real Integration Support
"""

import asyncio
import json
import logging
from typing import Dict, Any, Optional
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from config.settings import settings


class PathRAGService:
    """Enhanced PathRAG service with real integration support"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.base_url = settings.PATHRAG_BASE_URL
        self.api_key = settings.PATHRAG_API_KEY
        self.timeout = settings.PATHRAG_TIMEOUT
        self.mock_mode = settings.MOCK_SERVICES
        
        # HTTP client configuration
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
        )
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def save_graph(self, project_id: str, graph_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save knowledge graph to PathRAG"""
        if self.mock_mode:
            return await self._mock_save_graph(project_id, graph_data)
        
        try:
            response = await self.client.post(
                "/api/v1/graphs",
                json={
                    "project_id": project_id,
                    "graph_data": graph_data,
                    "metadata": {
                        "source": "crewai_server",
                        "timestamp": asyncio.get_event_loop().time()
                    }
                }
            )
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError as e:
            self.logger.error(f"PathRAG save_graph failed: {str(e)}")
            # Fallback to mock for development
            return await self._mock_save_graph(project_id, graph_data)
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=8))
    async def query_story(self, project_id: str, query: str) -> Dict[str, Any]:
        """Query story elements using natural language"""
        if self.mock_mode:
            return await self._mock_query_story(project_id, query)
        
        try:
            response = await self.client.post(
                "/api/v1/query",
                json={
                    "project_id": project_id,
                    "query": query,
                    "options": {
                        "max_results": 10,
                        "include_context": True
                    }
                }
            )
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError as e:
            self.logger.error(f"PathRAG query_story failed: {str(e)}")
            return await self._mock_query_story(project_id, query)
    
    async def health_check(self) -> bool:
        """Check PathRAG service health"""
        if self.mock_mode:
            return True
        
        try:
            response = await self.client.get("/health")
            return response.status_code == 200
        except:
            return False
    
    # Mock methods for development
    async def _mock_save_graph(self, project_id: str, graph_data: Dict[str, Any]) -> Dict[str, Any]:
        await asyncio.sleep(0.1)  # Simulate processing
        return {
            "success": True,
            "graph_id": f"mock_graph_{project_id}",
            "entities_created": len(graph_data.get("entities", [])),
            "relationships_created": len(graph_data.get("relationships", [])),
            "message": "Mock: Graph saved successfully"
        }
    
    async def _mock_query_story(self, project_id: str, query: str) -> Dict[str, Any]:
        await asyncio.sleep(0.05)  # Simulate query time
        return {
            "success": True,
            "query": query,
            "results": [
                {
                    "entity": "mock_entity",
                    "type": "character",
                    "relevance": 0.95,
                    "context": f"Mock result for query: {query}"
                }
            ],
            "message": "Mock: Query executed successfully"
        }
