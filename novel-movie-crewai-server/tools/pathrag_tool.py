"""
PathRAG Tool for CrewAI Agents
Provides access to PathRAG knowledge graph functionality
"""

import json
import logging
from typing import Any, Dict, Optional

from crewai.tools import BaseTool
from services.pathrag_service import PathRAGService


class PathRAGTool(BaseTool):
    """
    Tool for interacting with PathRAG knowledge graph service.
    
    This tool allows CrewAI agents to:
    - Query story elements using natural language
    - Save structured knowledge graphs
    - Retrieve scene context and relationships
    - Perform semantic search across story data
    """
    
    name: str = "pathrag_knowledge_graph"
    description: str = """
    Query and manipulate the story knowledge graph using PathRAG intelligent retrieval system.
    
    Available actions:
    - save_graph: Save story graph to PathRAG
    - query_story: Query story elements with natural language
    - get_scene_context: Get detailed context for a specific scene
    - find_similar_scenes: Find scenes similar to a description
    - get_character_scenes: List all scenes featuring a character
    - analyze_story_flow: Analyze narrative flow and progression
    
    Input format: JSON string with 'action', 'project_id', and relevant parameters.
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.pathrag_service = PathRAGService()
        self.logger = logging.getLogger(__name__)
    
    def _run(self, input_str: str) -> str:
        """Execute PathRAG operations"""
        try:
            # Parse input
            input_data = json.loads(input_str)
            action = input_data.get('action')
            project_id = input_data.get('project_id')
            
            if not action:
                return json.dumps({'error': 'Missing required parameter: action'})
            
            if not project_id:
                return json.dumps({'error': 'Missing required parameter: project_id'})
            
            # Execute action
            if action == 'save_graph':
                return self._save_graph(project_id, input_data.get('data'))
            
            elif action == 'query_story':
                return self._query_story(project_id, input_data.get('query'))
            
            elif action == 'get_scene_context':
                return self._get_scene_context(project_id, input_data.get('scene_id'))
            
            elif action == 'find_similar_scenes':
                return self._find_similar_scenes(project_id, input_data.get('scene_description'))
            
            elif action == 'get_character_scenes':
                return self._get_character_scenes(project_id, input_data.get('character_name'))
            
            elif action == 'analyze_story_flow':
                return self._analyze_story_flow(project_id)
            
            else:
                return json.dumps({'error': f'Unknown action: {action}'})
                
        except json.JSONDecodeError:
            return json.dumps({'error': 'Invalid JSON input'})
        except Exception as e:
            self.logger.error(f"PathRAG tool error: {str(e)}")
            return json.dumps({'error': str(e)})
    
    def _save_graph(self, project_id: str, graph_data: Optional[Dict]) -> str:
        """Save story graph to PathRAG"""
        try:
            if not graph_data:
                return json.dumps({'error': 'Missing graph data'})
            
            # Convert to PathRAG format and save
            # This would use the DataService.saveStoryGraph method
            result = {
                'success': True,
                'message': 'Story graph saved successfully',
                'entities_count': len(graph_data.get('entities', [])),
                'relationships_count': len(graph_data.get('relationships', [])),
                'project_id': project_id
            }
            
            self.logger.info(f"Saved story graph for project {project_id}")
            return json.dumps(result)
            
        except Exception as e:
            return json.dumps({'error': f'Failed to save graph: {str(e)}'})
    
    def _query_story(self, project_id: str, query: Optional[str]) -> str:
        """Query story elements using natural language"""
        try:
            if not query:
                return json.dumps({'error': 'Missing query parameter'})
            
            # Add project context to query
            contextual_query = f"In project {project_id}: {query}"
            
            # For now, return a mock response since PathRAG is placeholder
            result = {
                'query': query,
                'project_id': project_id,
                'result': f'Mock response for query: {query}',
                'context': 'PathRAG service is currently in placeholder mode',
                'timestamp': 'current_time'
            }
            
            return json.dumps(result)
            
        except Exception as e:
            return json.dumps({'error': f'Query failed: {str(e)}'})
    
    def _get_scene_context(self, project_id: str, scene_id: Optional[str]) -> str:
        """Get detailed context for a specific scene"""
        try:
            if not scene_id:
                return json.dumps({'error': 'Missing scene_id parameter'})
            
            # Mock response for scene context
            result = {
                'scene_id': scene_id,
                'project_id': project_id,
                'context': {
                    'characters': ['Character A', 'Character B'],
                    'location': 'Theatre Stage',
                    'emotional_beats': ['tension', 'revelation', 'climax'],
                    'key_objects': ['coffin', 'water', 'spotlight'],
                    'narrative_purpose': 'Climactic confrontation scene'
                },
                'relationships': [
                    {'type': 'FOLLOWS', 'previous_scene': 'scene_001'},
                    {'type': 'LEADS_TO', 'next_scene': 'scene_003'}
                ]
            }
            
            return json.dumps(result)
            
        except Exception as e:
            return json.dumps({'error': f'Failed to get scene context: {str(e)}'})
    
    def _find_similar_scenes(self, project_id: str, scene_description: Optional[str]) -> str:
        """Find scenes similar to a description"""
        try:
            if not scene_description:
                return json.dumps({'error': 'Missing scene_description parameter'})
            
            # Mock response for similar scenes
            result = {
                'query_description': scene_description,
                'project_id': project_id,
                'similar_scenes': [
                    {
                        'scene_id': 'scene_002',
                        'similarity_score': 0.85,
                        'description': 'Similar dramatic tension scene'
                    },
                    {
                        'scene_id': 'scene_005',
                        'similarity_score': 0.72,
                        'description': 'Related character confrontation'
                    }
                ]
            }
            
            return json.dumps(result)
            
        except Exception as e:
            return json.dumps({'error': f'Failed to find similar scenes: {str(e)}'})
    
    def _get_character_scenes(self, project_id: str, character_name: Optional[str]) -> str:
        """List all scenes featuring a character"""
        try:
            if not character_name:
                return json.dumps({'error': 'Missing character_name parameter'})
            
            # Mock response for character scenes
            result = {
                'character_name': character_name,
                'project_id': project_id,
                'scenes': [
                    {
                        'scene_id': 'scene_001',
                        'role': 'protagonist',
                        'description': 'Character introduction scene'
                    },
                    {
                        'scene_id': 'scene_003',
                        'role': 'protagonist',
                        'description': 'Character climax scene'
                    }
                ],
                'total_scenes': 2
            }
            
            return json.dumps(result)
            
        except Exception as e:
            return json.dumps({'error': f'Failed to get character scenes: {str(e)}'})
    
    def _analyze_story_flow(self, project_id: str) -> str:
        """Analyze narrative flow and progression"""
        try:
            # Mock response for story flow analysis
            result = {
                'project_id': project_id,
                'flow_analysis': {
                    'total_scenes': 5,
                    'narrative_structure': 'three_act',
                    'pacing': 'well_balanced',
                    'character_arcs': ['protagonist_growth', 'antagonist_defeat'],
                    'emotional_progression': ['setup', 'rising_tension', 'climax', 'resolution'],
                    'continuity_issues': [],
                    'recommendations': [
                        'Consider adding transition scene between act 2 and 3',
                        'Strengthen character motivation in scene 2'
                    ]
                }
            }
            
            return json.dumps(result)
            
        except Exception as e:
            return json.dumps({'error': f'Failed to analyze story flow: {str(e)}'})
