"""
Base crew class for CrewAI implementations
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

from crewai import Crew, Agent, Task
from langchain_openai import ChatOpenAI

from config.settings import settings
from models.crew_models import AgentResult
from services.pathrag_service import PathRAGService
from services.payload_service import PayloadService


class BaseCrew(ABC):
    """Abstract base class for all CrewAI crews"""
    
    def __init__(self, project_id: str, user_id: str, config: Optional[Dict[str, Any]] = None):
        self.project_id = project_id
        self.user_id = user_id
        self.config = config or {}
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model=self.config.get('model', settings.OPENROUTER_DEFAULT_MODEL),
            temperature=self.config.get('temperature', 0.7),
            openai_api_key=settings.OPENROUTER_API_KEY,
            openai_api_base=settings.OPENROUTER_BASE_URL
        )
        
        # Initialize services
        self.pathrag_service = PathRAGService()
        self.payload_service = PayloadService()
        
        # Create crew components
        self.agents = self.create_agents()
        self.tasks = self.create_tasks()
        self.crew = self.create_crew()
    
    @abstractmethod
    def create_agents(self) -> List[Agent]:
        """Create and return list of agents for this crew"""
        pass
    
    @abstractmethod
    def create_tasks(self) -> List[Task]:
        """Create and return list of tasks for this crew"""
        pass
    
    def create_crew(self) -> Crew:
        """Create the CrewAI crew instance"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            verbose=self.config.get('verbose', True),
            memory=self.config.get('memory', True),
            max_iter=self.config.get('max_iter', 3)
        )
    
    async def execute_async(self, input_data: Dict[str, Any]) -> AgentResult:
        """Execute the crew asynchronously"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            self.logger.info(f"Starting crew execution for project {self.project_id}")
            
            # Prepare input data
            processed_input = await self.preprocess_input(input_data)
            
            # Execute crew in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, 
                self.crew.kickoff, 
                processed_input
            )
            
            # Process results
            processed_result = await self.postprocess_result(result)
            
            execution_time = asyncio.get_event_loop().time() - start_time
            
            self.logger.info(f"Crew execution completed in {execution_time:.2f}s")
            
            return AgentResult(
                success=True,
                data=processed_result,
                execution_time=execution_time,
                metadata={
                    'project_id': self.project_id,
                    'user_id': self.user_id,
                    'crew_type': self.__class__.__name__
                }
            )
            
        except Exception as e:
            execution_time = asyncio.get_event_loop().time() - start_time
            self.logger.error(f"Crew execution failed: {str(e)}")
            
            return AgentResult(
                success=False,
                error=str(e),
                execution_time=execution_time,
                metadata={
                    'project_id': self.project_id,
                    'user_id': self.user_id,
                    'crew_type': self.__class__.__name__
                }
            )
    
    async def preprocess_input(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Preprocess input data before crew execution"""
        # Default implementation - override in subclasses
        return input_data
    
    async def postprocess_result(self, result: Any) -> Dict[str, Any]:
        """Postprocess crew execution result"""
        # Default implementation - override in subclasses
        if hasattr(result, 'raw'):
            return {'result': result.raw}
        return {'result': str(result)}
    
    def get_project_context(self) -> Dict[str, Any]:
        """Get project context from Novel Movie API"""
        try:
            return self.payload_service.get_project_data(self.project_id)
        except Exception as e:
            self.logger.warning(f"Failed to get project context: {str(e)}")
            return {}
    
    def get_story_context(self) -> Dict[str, Any]:
        """Get story context from Novel Movie API"""
        try:
            return self.payload_service.get_story_data(self.project_id)
        except Exception as e:
            self.logger.warning(f"Failed to get story context: {str(e)}")
            return {}
    
    async def query_pathrag(self, query: str, **kwargs) -> Dict[str, Any]:
        """Query PathRAG service"""
        try:
            return await self.pathrag_service.query(query, **kwargs)
        except Exception as e:
            self.logger.warning(f"PathRAG query failed: {str(e)}")
            return {'result': 'PathRAG service unavailable', 'error': str(e)}
