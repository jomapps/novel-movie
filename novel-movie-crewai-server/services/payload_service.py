"""
PayloadCMS Service Client
Python client for Novel Movie API integration
"""

import asyncio
import logging
from typing import Dict, Any, Optional
import aiohttp
from config.settings import settings


class PayloadService:
    """
    Async client for Novel Movie PayloadCMS API
    """
    
    def __init__(self):
        self.base_url = settings.NOVEL_MOVIE_API_URL
        self.api_key = settings.NOVEL_MOVIE_API_KEY
        self.logger = logging.getLogger(__name__)
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session with auth headers"""
        if self.session is None or self.session.closed:
            headers = {}
            if self.api_key:
                headers['Authorization'] = f'Bearer {self.api_key}'
            headers['Content-Type'] = 'application/json'
            
            self.session = aiohttp.ClientSession(
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=30)
            )
        return self.session
    
    async def get_project_data(self, project_id: str) -> Dict[str, Any]:
        """Get project data from PayloadCMS"""
        try:
            session = await self._get_session()
            async with session.get(f"{self.base_url}/api/projects/{project_id}") as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise Exception(f"Failed to get project data: {response.status}")
        except Exception as e:
            self.logger.error(f"PayloadCMS project request failed: {str(e)}")
            # Return mock data for development
            return {
                'id': project_id,
                'name': 'Mock Project',
                'status': 'in_progress',
                'workflow_status': {
                    'current_step': 'story_analysis',
                    'completed_steps': ['initial_concept'],
                    'next_step': 'scene_breakdown'
                },
                'settings': {
                    'genre': 'thriller',
                    'tone': 'dark',
                    'target_audience': 'adult'
                }
            }
    
    async def get_story_data(self, project_id: str) -> Dict[str, Any]:
        """Get story data from PayloadCMS"""
        try:
            session = await self._get_session()
            async with session.get(
                f"{self.base_url}/api/stories",
                params={'where[project][equals]': project_id}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('docs') and len(data['docs']) > 0:
                        return data['docs'][0]
                    else:
                        raise Exception("No story found for project")
                else:
                    raise Exception(f"Failed to get story data: {response.status}")
        except Exception as e:
            self.logger.error(f"PayloadCMS story request failed: {str(e)}")
            # Return mock data for development
            return {
                'project_id': project_id,
                'current_content': 'Mock story content for development...',
                'metadata': {
                    'word_count': 1500,
                    'estimated_scenes': 5,
                    'main_characters': ['Character A', 'Character B'],
                    'primary_location': 'Theatre'
                },
                'quality_metrics': {
                    'overall_quality': 8.5,
                    'story_coherence': 9.0,
                    'character_development': 8.0
                }
            }
    
    async def update_project_status(self, project_id: str, status: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Update project workflow status"""
        try:
            session = await self._get_session()
            payload = {
                'workflowStatus': {
                    'currentStep': status
                }
            }
            
            if data:
                payload.update(data)
            
            async with session.patch(
                f"{self.base_url}/api/projects/{project_id}",
                json=payload
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise Exception(f"Failed to update project status: {response.status}")
        except Exception as e:
            self.logger.error(f"PayloadCMS status update failed: {str(e)}")
            # Return mock response for development
            return {
                'id': project_id,
                'status': status,
                'updated_at': 'mock_timestamp',
                'success': True
            }
    
    async def save_crew_results(self, project_id: str, crew_type: str, results: Dict[str, Any]) -> Dict[str, Any]:
        """Save crew execution results to PayloadCMS"""
        try:
            session = await self._get_session()
            payload = {
                'project': project_id,
                'crew_type': crew_type,
                'results': results,
                'created_at': 'current_timestamp'
            }
            
            async with session.post(
                f"{self.base_url}/api/crew-results",
                json=payload
            ) as response:
                if response.status == 201:
                    return await response.json()
                else:
                    raise Exception(f"Failed to save crew results: {response.status}")
        except Exception as e:
            self.logger.error(f"PayloadCMS save results failed: {str(e)}")
            # Return mock response for development
            return {
                'id': f"{crew_type}_{project_id}_result",
                'project_id': project_id,
                'crew_type': crew_type,
                'saved_at': 'mock_timestamp',
                'success': True
            }
    
    async def get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user preferences from PayloadCMS"""
        try:
            session = await self._get_session()
            async with session.get(f"{self.base_url}/api/users/{user_id}") as response:
                if response.status == 200:
                    user_data = await response.json()
                    return user_data.get('preferences', {})
                else:
                    raise Exception(f"Failed to get user preferences: {response.status}")
        except Exception as e:
            self.logger.error(f"PayloadCMS user preferences request failed: {str(e)}")
            # Return mock preferences for development
            return {
                'default_genre': 'thriller',
                'preferred_tone': 'dark',
                'style_preference': 'cinematic',
                'complexity_level': 'medium',
                'ai_assistance_level': 'high'
            }
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    def __del__(self):
        """Cleanup on deletion"""
        if self.session and not self.session.closed:
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(self.close())
            except RuntimeError:
                pass
