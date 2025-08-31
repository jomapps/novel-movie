"""
PayloadCMS Tool for CrewAI Agents
Provides access to Novel Movie application data
"""

import json
import logging
from typing import Any, Dict, Optional

from crewai_tools import BaseTool
from services.payload_service import PayloadService


class PayloadTool(BaseTool):
    """
    Tool for interacting with Novel Movie PayloadCMS API.
    
    This tool allows CrewAI agents to:
    - Get project data and configurations
    - Retrieve story content and metadata
    - Update project status and workflow state
    - Access user preferences and settings
    """
    
    name: str = "novel_movie_data"
    description: str = """
    Access Novel Movie application data through PayloadCMS API.
    
    Available actions:
    - get_project: Get project data and configuration
    - get_story: Get story content and metadata
    - update_status: Update project workflow status
    - get_user_preferences: Get user preferences and settings
    - save_results: Save crew execution results
    
    Input format: JSON string with 'action' and relevant parameters.
    """
    
    def __init__(self):
        super().__init__()
        self.payload_service = PayloadService()
        self.logger = logging.getLogger(__name__)
    
    def _run(self, input_str: str) -> str:
        """Execute PayloadCMS operations"""
        try:
            # Parse input
            input_data = json.loads(input_str)
            action = input_data.get('action')
            
            if not action:
                return json.dumps({'error': 'Missing required parameter: action'})
            
            # Execute action
            if action == 'get_project':
                return self._get_project(input_data.get('project_id'))
            
            elif action == 'get_story':
                return self._get_story(input_data.get('project_id'))
            
            elif action == 'update_status':
                return self._update_status(
                    input_data.get('project_id'),
                    input_data.get('status'),
                    input_data.get('data')
                )
            
            elif action == 'get_user_preferences':
                return self._get_user_preferences(input_data.get('user_id'))
            
            elif action == 'save_results':
                return self._save_results(
                    input_data.get('project_id'),
                    input_data.get('crew_type'),
                    input_data.get('results')
                )
            
            else:
                return json.dumps({'error': f'Unknown action: {action}'})
                
        except json.JSONDecodeError:
            return json.dumps({'error': 'Invalid JSON input'})
        except Exception as e:
            self.logger.error(f"Payload tool error: {str(e)}")
            return json.dumps({'error': str(e)})
    
    def _get_project(self, project_id: Optional[str]) -> str:
        """Get project data from PayloadCMS"""
        try:
            if not project_id:
                return json.dumps({'error': 'Missing project_id parameter'})
            
            # Mock project data (replace with actual PayloadService call)
            project_data = {
                'id': project_id,
                'name': 'The Magician',
                'status': 'in_progress',
                'workflow_status': {
                    'current_step': 'story_analysis',
                    'completed_steps': ['initial_concept', 'story_generation'],
                    'next_step': 'scene_breakdown'
                },
                'settings': {
                    'genre': 'thriller',
                    'tone': 'dark',
                    'target_audience': 'adult',
                    'style_preferences': 'cinematic'
                },
                'created_at': '2025-08-30T10:00:00Z',
                'updated_at': '2025-08-30T18:00:00Z'
            }
            
            self.logger.info(f"Retrieved project data for {project_id}")
            return json.dumps(project_data)
            
        except Exception as e:
            return json.dumps({'error': f'Failed to get project: {str(e)}'})
    
    def _get_story(self, project_id: Optional[str]) -> str:
        """Get story content from PayloadCMS"""
        try:
            if not project_id:
                return json.dumps({'error': 'Missing project_id parameter'})
            
            # Mock story data (replace with actual PayloadService call)
            story_data = {
                'project_id': project_id,
                'current_content': 'The story content would be here...',
                'metadata': {
                    'word_count': 1500,
                    'estimated_scenes': 5,
                    'main_characters': ['Alistair', 'Elena', 'The Audience'],
                    'primary_location': 'Theatre'
                },
                'quality_metrics': {
                    'overall_quality': 8.5,
                    'story_coherence': 9.0,
                    'character_development': 8.0,
                    'engagement': 8.5
                },
                'generation_history': [
                    {
                        'step': 'initial_generation',
                        'timestamp': '2025-08-30T10:00:00Z',
                        'quality': 7.5
                    },
                    {
                        'step': 'enhancement_1',
                        'timestamp': '2025-08-30T12:00:00Z',
                        'quality': 8.5
                    }
                ]
            }
            
            self.logger.info(f"Retrieved story data for project {project_id}")
            return json.dumps(story_data)
            
        except Exception as e:
            return json.dumps({'error': f'Failed to get story: {str(e)}'})
    
    def _update_status(self, project_id: Optional[str], status: Optional[str], data: Optional[Dict]) -> str:
        """Update project workflow status"""
        try:
            if not project_id:
                return json.dumps({'error': 'Missing project_id parameter'})
            
            if not status:
                return json.dumps({'error': 'Missing status parameter'})
            
            # Mock status update (replace with actual PayloadService call)
            result = {
                'project_id': project_id,
                'previous_status': 'story_analysis',
                'new_status': status,
                'updated_at': '2025-08-30T18:30:00Z',
                'success': True,
                'additional_data': data or {}
            }
            
            self.logger.info(f"Updated project {project_id} status to {status}")
            return json.dumps(result)
            
        except Exception as e:
            return json.dumps({'error': f'Failed to update status: {str(e)}'})
    
    def _get_user_preferences(self, user_id: Optional[str]) -> str:
        """Get user preferences and settings"""
        try:
            if not user_id:
                return json.dumps({'error': 'Missing user_id parameter'})
            
            # Mock user preferences (replace with actual PayloadService call)
            preferences = {
                'user_id': user_id,
                'preferences': {
                    'default_genre': 'thriller',
                    'preferred_tone': 'dark',
                    'style_preference': 'cinematic',
                    'complexity_level': 'medium',
                    'ai_assistance_level': 'high'
                },
                'settings': {
                    'auto_save': True,
                    'notifications': True,
                    'quality_threshold': 8.0
                }
            }
            
            self.logger.info(f"Retrieved user preferences for {user_id}")
            return json.dumps(preferences)
            
        except Exception as e:
            return json.dumps({'error': f'Failed to get user preferences: {str(e)}'})
    
    def _save_results(self, project_id: Optional[str], crew_type: Optional[str], results: Optional[Dict]) -> str:
        """Save crew execution results"""
        try:
            if not project_id:
                return json.dumps({'error': 'Missing project_id parameter'})
            
            if not crew_type:
                return json.dumps({'error': 'Missing crew_type parameter'})
            
            if not results:
                return json.dumps({'error': 'Missing results parameter'})
            
            # Mock save results (replace with actual PayloadService call)
            save_result = {
                'project_id': project_id,
                'crew_type': crew_type,
                'saved_at': '2025-08-30T18:30:00Z',
                'success': True,
                'result_id': f"{crew_type}_{project_id}_result",
                'data_size': len(str(results))
            }
            
            self.logger.info(f"Saved {crew_type} results for project {project_id}")
            return json.dumps(save_result)
            
        except Exception as e:
            return json.dumps({'error': f'Failed to save results: {str(e)}'})
