"""
Architect Crew - Story Structure Analysis
Phase 1: Parse story and create knowledge graph
"""

from typing import Dict, Any, List
from crewai import Agent, Task
from crews.base_crew import BaseCrew
from tools.pathrag_tool import PathRAGTool
from tools.payload_tool import PayloadTool


class ArchitectCrew(BaseCrew):
    """
    Architect Crew specializes in story structure analysis and knowledge graph creation.
    
    Responsibilities:
    - Parse story text into structured scenes
    - Identify characters, locations, and themes
    - Create knowledge graph relationships
    - Store structured data in PathRAG
    """
    
    def create_agents(self) -> List[Agent]:
        """Create agents for story architecture analysis"""
        
        story_parser_agent = Agent(
            role='Story Structure Analyst',
            goal='Parse and analyze story text to identify scenes, characters, locations, and narrative elements with precision',
            backstory="""You are an expert story analyst with deep understanding of narrative structure, 
                        character development, and cinematic storytelling. You excel at breaking down complex 
                        stories into their fundamental components while preserving the artistic intent and 
                        emotional resonance of the original work.""",
            llm=self.llm,
            tools=[PayloadTool()],
            verbose=True,
            memory=True,
            max_iter=2
        )
        
        graph_builder_agent = Agent(
            role='Knowledge Graph Architect',
            goal='Create structured graph relationships between story elements using PathRAG intelligent storage',
            backstory="""You are a data architect specializing in knowledge graphs and story relationships. 
                        You understand how to model complex narrative relationships using PathRAG's advanced 
                        graph storage and retrieval capabilities. Your expertise ensures that story elements 
                        are connected in ways that enable intelligent querying and analysis by other AI agents.""",
            llm=self.llm,
            tools=[PathRAGTool(), PayloadTool()],
            verbose=True,
            memory=True,
            max_iter=2
        )
        
        return [story_parser_agent, graph_builder_agent]
    
    def create_tasks(self) -> List[Task]:
        """Create tasks for story architecture workflow"""
        
        parse_story_task = Task(
            description="""
            Analyze the provided story text and extract comprehensive narrative elements:
            
            1. **Scene Breakdown**: Identify individual scenes with clear boundaries
            2. **Character Analysis**: Extract all characters with their roles and relationships
            3. **Location Mapping**: Identify all settings and their atmospheric qualities
            4. **Object Inventory**: Catalog key props and objects that drive the narrative
            5. **Emotional Architecture**: Map the emotional beats and character arcs
            6. **Dialogue Extraction**: Separate and structure dialogue sections
            7. **Thematic Elements**: Identify underlying themes and motifs
            8. **Narrative Purpose**: Determine the function of each story element
            
            **Input Data**: 
            - Story Text: {story_text}
            - Project ID: {project_id}
            - User Preferences: {user_preferences}
            
            **Output Requirements**:
            - Structured JSON with all identified elements
            - Clear scene boundaries and sequence numbers
            - Character roles and relationships
            - Location details with atmospheric descriptions
            - Thematic analysis with supporting evidence
            """,
            agent=self.agents[0],  # Story Parser Agent
            expected_output='Comprehensive JSON structure containing scenes, characters, locations, themes, and their relationships'
        )
        
        build_graph_task = Task(
            description="""
            Using the parsed story elements, create a comprehensive knowledge graph:
            
            1. **Entity Creation**: Structure scene data with all narrative attributes
            2. **Character Entities**: Create detailed character profiles with metadata
            3. **Location Entities**: Build location nodes with atmospheric and functional data
            4. **Theme Entities**: Establish thematic elements with manifestation patterns
            5. **Relationship Mapping**: Create semantic relationships between all elements
            6. **PathRAG Integration**: Save the complete graph using PathRAG's custom knowledge graph format
            7. **Validation**: Verify graph creation and relationship integrity
            8. **Status Update**: Update project status in PayloadCMS with completion data
            
            **Requirements**:
            - Use PathRAG's intelligent storage for natural language querying capability
            - Ensure all relationships are semantically meaningful
            - Include metadata for enhanced context retrieval
            - Validate graph completeness before finalizing
            
            **Input**: 
            - Parsed Story Data: {parsed_story}
            - Project ID: {project_id}
            - Graph Configuration: {graph_config}
            
            **Success Criteria**:
            - All story elements successfully stored in PathRAG
            - Relationships enable intelligent querying
            - Project status updated with completion metrics
            """,
            agent=self.agents[1],  # Graph Builder Agent
            expected_output='Confirmation of successful PathRAG knowledge graph creation with entity and relationship counts, plus validation results'
        )
        
        return [parse_story_task, build_graph_task]
    
    async def preprocess_input(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Preprocess input data for architect crew"""
        
        # Get project and story context
        project_context = self.get_project_context()
        story_context = self.get_story_context()
        
        # Prepare enhanced input data
        processed_input = {
            'story_text': input_data.get('story_text', ''),
            'project_id': self.project_id,
            'user_id': self.user_id,
            'user_preferences': input_data.get('preferences', {}),
            'project_context': project_context,
            'story_context': story_context,
            'graph_config': {
                'enable_semantic_search': True,
                'include_emotional_analysis': True,
                'create_character_arcs': True,
                'map_thematic_elements': True
            }
        }
        
        self.logger.info(f"Preprocessed input for architect crew: {len(processed_input['story_text'])} characters")
        
        return processed_input
    
    async def postprocess_result(self, result: Any) -> Dict[str, Any]:
        """Postprocess architect crew results"""
        
        try:
            # Extract result data
            if hasattr(result, 'raw'):
                result_text = result.raw
            else:
                result_text = str(result)
            
            # Parse and structure the result
            processed_result = {
                'success': True,
                'phase': 'architect',
                'project_id': self.project_id,
                'result_summary': result_text[:500] + '...' if len(result_text) > 500 else result_text,
                'full_result': result_text,
                'next_phase': 'director',
                'recommendations': {
                    'proceed_to_scene_breakdown': True,
                    'estimated_scenes': 'TBD',  # Would be extracted from result
                    'complexity_level': 'medium'  # Would be analyzed from result
                }
            }
            
            self.logger.info(f"Architect crew completed for project {self.project_id}")
            
            return processed_result
            
        except Exception as e:
            self.logger.error(f"Failed to postprocess architect result: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'phase': 'architect',
                'project_id': self.project_id
            }
