"""
Director Crew - Scene Breakdown and Shot Planning
Phase 2: Convert story structure into detailed scene plans
"""

from typing import Dict, Any, List
from crewai import Agent, Task
from crews.base_crew import BaseCrew
from tools.pathrag_tool import PathRAGTool
from tools.payload_tool import PayloadTool


class DirectorCrew(BaseCrew):
    """
    Director Crew specializes in scene breakdown and shot planning.
    
    Responsibilities:
    - Break down scenes into detailed shot sequences
    - Plan camera movements and angles
    - Determine lighting and mood requirements
    - Create detailed scene cards for production
    """
    
    def create_agents(self) -> List[Agent]:
        """Create agents for scene breakdown and direction"""
        
        scene_analyzer_agent = Agent(
            role='Scene Analysis Director',
            goal='Analyze story scenes and break them down into detailed shot sequences with cinematic precision',
            backstory="""You are an experienced film director with expertise in visual storytelling, 
                        cinematography, and scene composition. You understand how to translate narrative 
                        elements into compelling visual sequences that serve the story's emotional and 
                        dramatic needs. Your approach balances artistic vision with practical production 
                        considerations.""",
            llm=self.llm,
            tools=[PathRAGTool(), PayloadTool()],
            verbose=True,
            memory=True,
            max_iter=2
        )
        
        shot_generator_agent = Agent(
            role='Cinematography Specialist',
            goal='Generate detailed shot lists with camera specifications, lighting, and technical requirements',
            backstory="""You are a master cinematographer with deep knowledge of camera work, lighting 
                        design, and visual composition. You excel at creating shot lists that not only 
                        capture the story effectively but also consider practical aspects like equipment 
                        needs, crew requirements, and production efficiency. Your shots enhance the 
                        narrative while being technically achievable.""",
            llm=self.llm,
            tools=[PathRAGTool(), PayloadTool()],
            verbose=True,
            memory=True,
            max_iter=2
        )
        
        return [scene_analyzer_agent, shot_generator_agent]
    
    def create_tasks(self) -> List[Task]:
        """Create tasks for scene breakdown workflow"""
        
        analyze_scenes_task = Task(
            description="""
            Analyze the story structure from PathRAG and break down each scene into detailed components:
            
            1. **Scene Context Retrieval**: Query PathRAG for complete scene information
            2. **Character Blocking**: Determine character positions and movements
            3. **Emotional Beats**: Map emotional progression within each scene
            4. **Visual Requirements**: Identify key visual elements and props
            5. **Pacing Analysis**: Determine scene rhythm and timing
            6. **Transition Planning**: Plan connections between scenes
            7. **Mood and Atmosphere**: Define lighting and color palette needs
            8. **Technical Considerations**: Identify special requirements or challenges
            
            **Input Data**:
            - Project ID: {project_id}
            - Scene Selection: {scene_selection}
            - Director Preferences: {director_preferences}
            
            **PathRAG Queries to Execute**:
            - "Get all scenes for project {project_id} with character and location details"
            - "What are the emotional arcs in each scene?"
            - "What objects and props are featured in each scene?"
            
            **Output Requirements**:
            - Detailed scene breakdown with all components
            - Character movement and blocking notes
            - Technical requirements for each scene
            - Recommended shot approaches
            """,
            agent=self.agents[0],  # Scene Analyzer Agent
            expected_output='Comprehensive scene analysis with blocking, emotional beats, visual requirements, and technical considerations'
        )
        
        generate_shots_task = Task(
            description="""
            Create detailed shot lists for each analyzed scene:
            
            1. **Shot Sequence Planning**: Create logical shot progression for each scene
            2. **Camera Specifications**: Define camera angles, movements, and lens choices
            3. **Lighting Design**: Specify lighting setups and mood requirements
            4. **Audio Considerations**: Note dialogue, sound effects, and music needs
            5. **Continuity Planning**: Ensure visual and narrative continuity
            6. **Production Notes**: Add practical filming considerations
            7. **Alternative Options**: Provide backup shot options for flexibility
            8. **Integration with Story Graph**: Update PathRAG with shot-level details
            
            **Technical Specifications to Include**:
            - Camera type and lens recommendations
            - Lighting equipment and setup
            - Audio recording requirements
            - Special equipment needs (dollies, cranes, etc.)
            - Estimated shooting time per shot
            - Crew requirements
            
            **Input**:
            - Scene Analysis: {scene_analysis}
            - Project ID: {project_id}
            - Production Constraints: {production_constraints}
            
            **Integration Requirements**:
            - Save shot details to PathRAG for future reference
            - Update project status with scene breakdown completion
            - Generate production-ready shot lists
            """,
            agent=self.agents[1],  # Shot Generator Agent
            expected_output='Complete shot lists with technical specifications, production notes, and PathRAG integration confirmation'
        )
        
        return [analyze_scenes_task, generate_shots_task]
    
    async def preprocess_input(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Preprocess input data for director crew"""
        
        # Get project context and story graph from PathRAG
        project_context = self.get_project_context()
        
        # Query PathRAG for story structure
        story_query = f"Get all scenes and story structure for project {self.project_id}"
        story_graph = await self.query_pathrag(story_query, mode='hybrid', top_k=20)
        
        # Prepare enhanced input data
        processed_input = {
            'project_id': self.project_id,
            'user_id': self.user_id,
            'scene_selection': input_data.get('scenes', 'all'),
            'director_preferences': input_data.get('preferences', {
                'style': 'cinematic',
                'pacing': 'medium',
                'complexity': 'moderate'
            }),
            'production_constraints': input_data.get('constraints', {
                'budget': 'medium',
                'crew_size': 'small',
                'equipment': 'standard',
                'timeline': 'flexible'
            }),
            'project_context': project_context,
            'story_graph': story_graph
        }
        
        self.logger.info(f"Preprocessed input for director crew: project {self.project_id}")
        
        return processed_input
    
    async def postprocess_result(self, result: Any) -> Dict[str, Any]:
        """Postprocess director crew results"""
        
        try:
            # Extract result data
            if hasattr(result, 'raw'):
                result_text = result.raw
            else:
                result_text = str(result)
            
            # Parse and structure the result
            processed_result = {
                'success': True,
                'phase': 'director',
                'project_id': self.project_id,
                'result_summary': result_text[:500] + '...' if len(result_text) > 500 else result_text,
                'full_result': result_text,
                'next_phase': 'specialists',
                'deliverables': {
                    'scene_breakdowns': 'completed',
                    'shot_lists': 'completed',
                    'technical_specs': 'completed',
                    'production_notes': 'completed'
                },
                'recommendations': {
                    'proceed_to_specialists': True,
                    'estimated_shooting_days': 'TBD',  # Would be calculated from result
                    'crew_requirements': 'standard'  # Would be analyzed from result
                }
            }
            
            self.logger.info(f"Director crew completed for project {self.project_id}")
            
            return processed_result
            
        except Exception as e:
            self.logger.error(f"Failed to postprocess director result: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'phase': 'director',
                'project_id': self.project_id
            }
