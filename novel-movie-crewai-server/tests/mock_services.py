"""
Mock Services for CrewAI Server Testing
Provides realistic mock implementations of external services
"""

import asyncio
import json
import logging
from typing import Dict, Any, Optional
from unittest.mock import AsyncMock

from tests.test_data import PATHRAG_MOCKS, PAYLOAD_MOCKS


class MockPathRAGService:
    """Mock PathRAG service for testing"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.stored_graphs = {}
        
    async def save_graph(self, project_id: str, graph_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mock graph saving"""
        await asyncio.sleep(0.1)  # Simulate processing time
        
        graph_id = f"graph_{project_id}_{len(self.stored_graphs)}"
        self.stored_graphs[graph_id] = {
            "project_id": project_id,
            "data": graph_data,
            "created_at": "2025-08-30T16:00:00Z"
        }
        
        response = PATHRAG_MOCKS["save_graph"].copy()
        response["graph_id"] = graph_id
        return response
    
    async def query_story(self, project_id: str, query: str) -> Dict[str, Any]:
        """Mock story querying"""
        await asyncio.sleep(0.05)  # Simulate query time
        return PATHRAG_MOCKS["query_story"]
    
    async def get_scene_context(self, project_id: str, scene_id: str) -> Dict[str, Any]:
        """Mock scene context retrieval"""
        await asyncio.sleep(0.03)
        return PATHRAG_MOCKS["get_scene_context"]
    
    async def find_similar_scenes(self, project_id: str, description: str) -> Dict[str, Any]:
        """Mock similar scene finding"""
        await asyncio.sleep(0.08)
        return {
            "success": True,
            "similar_scenes": [
                {
                    "scene_id": "scene_002",
                    "similarity": 0.78,
                    "description": "Another tense encounter scene"
                }
            ]
        }
    
    async def get_character_scenes(self, project_id: str, character_name: str) -> Dict[str, Any]:
        """Mock character scene retrieval"""
        await asyncio.sleep(0.04)
        return {
            "success": True,
            "character": character_name,
            "scenes": ["scene_001", "scene_003", "scene_007"],
            "total_appearances": 3
        }
    
    async def analyze_story_flow(self, project_id: str) -> Dict[str, Any]:
        """Mock story flow analysis"""
        await asyncio.sleep(0.15)
        return {
            "success": True,
            "flow_analysis": {
                "pacing": "well_balanced",
                "tension_curve": "ascending",
                "character_arcs": "developing",
                "plot_coherence": "strong"
            }
        }


class MockPayloadService:
    """Mock PayloadCMS service for testing"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.projects = {}
        self.stories = {}
        
    async def get_project_data(self, project_id: str) -> Dict[str, Any]:
        """Mock project data retrieval"""
        await asyncio.sleep(0.02)
        return PAYLOAD_MOCKS["get_project_data"]
    
    async def get_story_data(self, project_id: str) -> Dict[str, Any]:
        """Mock story data retrieval"""
        await asyncio.sleep(0.03)
        return PAYLOAD_MOCKS["get_story_data"]
    
    async def update_status(self, project_id: str, status: str, metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """Mock status update"""
        await asyncio.sleep(0.01)
        response = PAYLOAD_MOCKS["update_status"].copy()
        response["new_status"] = status
        if metadata:
            response["metadata"] = metadata
        return response
    
    async def save_results(self, project_id: str, crew_type: str, results: Dict[str, Any]) -> Dict[str, Any]:
        """Mock result saving"""
        await asyncio.sleep(0.05)
        response = PAYLOAD_MOCKS["save_results"].copy()
        response["storage_location"] = f"crew_results/{crew_type}/{project_id}"
        return response
    
    async def get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Mock user preferences retrieval"""
        await asyncio.sleep(0.01)
        return {
            "success": True,
            "user_id": user_id,
            "preferences": {
                "default_style": "cinematic",
                "complexity_preference": "medium",
                "output_format": "detailed",
                "notification_settings": {
                    "email_updates": True,
                    "progress_notifications": True
                }
            }
        }


class MockLLMService:
    """Mock LLM service for testing CrewAI components"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.call_count = 0
        
    def generate_response(self, prompt: str, context: Dict[str, Any] = None) -> str:
        """Generate mock LLM response based on prompt content"""
        self.call_count += 1
        
        if "story structure" in prompt.lower() or "parse" in prompt.lower():
            return json.dumps({
                "analysis_type": "story_structure",
                "scenes_identified": 1,
                "characters_found": ["maya_chen", "james_barista"],
                "locations_mapped": ["city_street", "coffee_shop"],
                "themes_extracted": ["truth_vs_deception", "individual_vs_system"],
                "narrative_structure": "three_act_thriller",
                "confidence": 0.92
            })
        
        elif "knowledge graph" in prompt.lower() or "relationships" in prompt.lower():
            return json.dumps({
                "graph_creation": "completed",
                "entities_created": 15,
                "relationships_mapped": 23,
                "pathrag_integration": "successful",
                "validation_status": "passed",
                "storage_confirmation": "graph_stored_successfully"
            })
        
        elif "scene breakdown" in prompt.lower() or "shots" in prompt.lower():
            return json.dumps({
                "scene_analysis": "completed",
                "total_shots": 8,
                "camera_setups": 4,
                "lighting_requirements": "natural_golden_hour_plus_practicals",
                "equipment_needs": ["steadicam", "tracking_dolly", "standard_lenses"],
                "estimated_shooting_time": "4_hours"
            })
        
        elif "cinematography" in prompt.lower() or "technical" in prompt.lower():
            return json.dumps({
                "shot_list_generation": "completed",
                "technical_specifications": "professional_standard",
                "equipment_recommendations": "standard_narrative_package",
                "crew_requirements": "director_dp_gaffer_sound",
                "production_notes": "urban_location_considerations_included"
            })
        
        else:
            return f"Mock LLM response for prompt: {prompt[:100]}..."


class MockCrewAIComponents:
    """Mock CrewAI framework components"""
    
    @staticmethod
    def create_mock_agent(role: str, goal: str, backstory: str, **kwargs):
        """Create a mock agent"""
        class MockAgent:
            def __init__(self, role, goal, backstory, **kwargs):
                self.role = role
                self.goal = goal
                self.backstory = backstory
                self.tools = kwargs.get('tools', [])
                self.llm = kwargs.get('llm')
                self.verbose = kwargs.get('verbose', True)
                self.memory = kwargs.get('memory', True)
                self.max_iter = kwargs.get('max_iter', 2)
        
        return MockAgent(role, goal, backstory, **kwargs)
    
    @staticmethod
    def create_mock_task(description: str, agent, expected_output: str, **kwargs):
        """Create a mock task"""
        class MockTask:
            def __init__(self, description, agent, expected_output, **kwargs):
                self.description = description
                self.agent = agent
                self.expected_output = expected_output
                self.context = kwargs.get('context', [])
        
        return MockTask(description, agent, expected_output, **kwargs)
    
    @staticmethod
    def create_mock_crew(agents, tasks, **kwargs):
        """Create a mock crew"""
        class MockCrew:
            def __init__(self, agents, tasks, **kwargs):
                self.agents = agents
                self.tasks = tasks
                self.verbose = kwargs.get('verbose', True)
                self.memory = kwargs.get('memory', True)
                self.max_iter = kwargs.get('max_iter', 3)
                self.llm_service = MockLLMService()
            
            def kickoff(self, inputs):
                """Mock crew execution"""
                # Simulate processing time
                import time
                time.sleep(0.1)
                
                # Generate response based on agent roles
                if any("architect" in str(agent.role).lower() for agent in self.agents):
                    result_text = self.llm_service.generate_response(
                        "story structure analysis", inputs
                    )
                elif any("director" in str(agent.role).lower() for agent in self.agents):
                    result_text = self.llm_service.generate_response(
                        "scene breakdown and cinematography", inputs
                    )
                else:
                    result_text = "Mock crew execution completed successfully"
                
                class MockResult:
                    def __init__(self, raw_output):
                        self.raw = raw_output
                        self.tasks_output = [
                            type('TaskOutput', (), {'raw': f"Task {i+1} completed"})()
                            for i in range(len(tasks))
                        ]
                
                return MockResult(result_text)
        
        return MockCrew(agents, tasks, **kwargs)


# Export mock services for easy import
def get_mock_pathrag_service():
    """Get configured mock PathRAG service"""
    return MockPathRAGService()

def get_mock_payload_service():
    """Get configured mock PayloadCMS service"""
    return MockPayloadService()

def get_mock_llm_service():
    """Get configured mock LLM service"""
    return MockLLMService()

def get_mock_crewai_components():
    """Get mock CrewAI components"""
    return MockCrewAIComponents()
