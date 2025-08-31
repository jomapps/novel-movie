# Development Guide

Guide for developers contributing to the Novel Movie CrewAI Server.

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Git
- Redis (for local development)
- Docker (optional)
- IDE with Python support (VS Code, PyCharm)

### Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/novel-movie-crewai-server.git
cd novel-movie-crewai-server

# 2. Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install development dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # If available

# 4. Configure environment
cp .env.example .env
# Edit .env with development settings

# 5. Start Redis (if not using Docker)
# Ubuntu/Debian: sudo systemctl start redis-server
# macOS: brew services start redis
# Or use Docker: docker run -d -p 6379:6379 redis:alpine

# 6. Run the server
python main.py
```

### Docker Development

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f crewai-server

# Execute commands in container
docker-compose exec crewai-server bash
```

## 🏗️ Project Structure

### Core Components
```
novel-movie-crewai-server/
├── main.py                    # FastAPI application entry point
├── config/                    # Configuration management
│   ├── settings.py           # Environment-based settings
│   └── logging.py            # Logging configuration
├── crews/                     # CrewAI implementations
│   ├── base_crew.py          # Abstract base crew
│   ├── architect_crew.py     # Story analysis crew
│   └── director_crew.py      # Scene breakdown crew
├── tools/                     # Agent tools
│   ├── pathrag_tool.py       # PathRAG integration
│   └── payload_tool.py       # PayloadCMS integration
├── services/                  # External service clients
│   ├── pathrag_service.py    # PathRAG API client
│   ├── payload_service.py    # PayloadCMS API client
│   └── queue_service.py      # Redis queue management
├── models/                    # Pydantic data models
│   └── crew_models.py        # API request/response models
├── utils/                     # Utility functions
│   └── error_handling.py     # Error handling utilities
└── tests/                     # Test suite
    ├── test_crews/           # Crew tests
    ├── test_tools/           # Tool tests
    └── test_services/        # Service tests
```

### Key Files
- **main.py**: FastAPI server with endpoints and lifecycle management
- **base_crew.py**: Abstract base class for all crews
- **settings.py**: Centralized configuration management
- **error_handling.py**: Global exception handling

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_crews/test_architect_crew.py

# Run with coverage
pytest --cov=. --cov-report=html

# Run integration tests
pytest tests/integration/
```

### Test Structure

```python
# Example test file: tests/test_crews/test_architect_crew.py
import pytest
from crews.architect_crew import ArchitectCrew

class TestArchitectCrew:
    @pytest.fixture
    def crew(self):
        return ArchitectCrew(
            project_id="test-project",
            user_id="test-user"
        )
    
    async def test_crew_execution(self, crew):
        input_data = {
            "story_text": "Test story content",
            "preferences": {"style": "cinematic"}
        }
        
        result = await crew.execute_async(input_data)
        
        assert result.success is True
        assert result.data is not None
```

### Test Categories
1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Service integration testing
3. **End-to-End Tests**: Complete workflow testing
4. **Performance Tests**: Load and stress testing

## 🔧 Development Workflow

### Branch Strategy
```bash
# Create feature branch
git checkout -b feature/new-crew-type

# Make changes and commit
git add .
git commit -m "feat: add new crew type for audio processing"

# Push and create PR
git push origin feature/new-crew-type
```

### Commit Convention
Use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

### Code Quality

```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .

# Sort imports
isort .
```

## 🎭 Creating New Crews

### 1. Define Crew Class

```python
# crews/my_new_crew.py
from typing import Dict, Any, List
from crewai import Agent, Task
from crews.base_crew import BaseCrew

class MyNewCrew(BaseCrew):
    """
    Custom crew for specific movie production task
    """
    
    def create_agents(self) -> List[Agent]:
        """Create specialized agents"""
        specialist_agent = Agent(
            role='Domain Specialist',
            goal='Accomplish specific production task',
            backstory='Expert background and experience',
            llm=self.llm,
            tools=[],  # Add relevant tools
            verbose=True
        )
        
        return [specialist_agent]
    
    def create_tasks(self) -> List[Task]:
        """Create task workflow"""
        analysis_task = Task(
            description="""
            Detailed task description with:
            1. Clear objectives
            2. Input requirements
            3. Expected outputs
            4. Success criteria
            """,
            agent=self.agents[0],
            expected_output='Specific output format description'
        )
        
        return [analysis_task]
```

### 2. Register Crew

```python
# main.py - Add to crew_map
crew_map = {
    'architect': ArchitectCrew,
    'director': DirectorCrew,
    'my_new_crew': MyNewCrew,  # Add new crew
}
```

### 3. Add Tests

```python
# tests/test_crews/test_my_new_crew.py
import pytest
from crews.my_new_crew import MyNewCrew

class TestMyNewCrew:
    async def test_crew_execution(self):
        crew = MyNewCrew(
            project_id="test",
            user_id="test"
        )
        
        result = await crew.execute_async({
            "input_data": "test"
        })
        
        assert result.success is True
```

## 🛠️ Creating New Tools

### 1. Define Tool Class

```python
# tools/my_custom_tool.py
import json
from crewai_tools import BaseTool

class MyCustomTool(BaseTool):
    name: str = "my_custom_tool"
    description: str = """
    Tool description explaining:
    - What the tool does
    - Available actions
    - Input format
    - Output format
    """
    
    def _run(self, input_str: str) -> str:
        """Execute tool operation"""
        try:
            input_data = json.loads(input_str)
            action = input_data.get('action')
            
            if action == 'my_action':
                return self._handle_my_action(input_data)
            else:
                return json.dumps({'error': f'Unknown action: {action}'})
                
        except Exception as e:
            return json.dumps({'error': str(e)})
    
    def _handle_my_action(self, data):
        """Handle specific action"""
        # Implement tool logic
        result = {"success": True, "data": "processed"}
        return json.dumps(result)
```

### 2. Add Tool to Crew

```python
# In crew class
from tools.my_custom_tool import MyCustomTool

def create_agents(self) -> List[Agent]:
    agent = Agent(
        role='Agent Role',
        goal='Agent Goal',
        backstory='Agent Background',
        llm=self.llm,
        tools=[MyCustomTool()],  # Add custom tool
        verbose=True
    )
    return [agent]
```

## 🔍 Debugging

### Local Debugging

```python
# Add debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Use debugger
import pdb; pdb.set_trace()

# Or with ipdb
import ipdb; ipdb.set_trace()
```

### Remote Debugging

```bash
# View server logs
sudo journalctl -u crewai-server -f

# Debug specific job
curl http://localhost:5001/crews/status/job-id

# Check service health
curl http://localhost:5001/health
curl http://localhost:5001/stats
```

### Common Debug Scenarios

1. **Crew Execution Issues**:
   ```python
   # Add logging to crew methods
   self.logger.info(f"Starting crew execution: {input_data}")
   self.logger.debug(f"Agent response: {result}")
   ```

2. **Tool Integration Issues**:
   ```python
   # Test tool independently
   tool = MyCustomTool()
   result = tool._run('{"action": "test"}')
   print(result)
   ```

3. **Service Connection Issues**:
   ```python
   # Test service connectivity
   service = PathRAGService()
   health = await service.health_check()
   print(health)
   ```

## 📚 Documentation

### Code Documentation

```python
class MyCrew(BaseCrew):
    """
    Brief description of the crew's purpose.
    
    This crew handles specific movie production tasks by:
    - Task 1 description
    - Task 2 description
    
    Args:
        project_id: Novel Movie project identifier
        user_id: User identifier
        config: Optional crew configuration
    
    Returns:
        AgentResult with processed data
    
    Example:
        >>> crew = MyCrew("project-123", "user-456")
        >>> result = await crew.execute_async(input_data)
        >>> print(result.success)
        True
    """
```

### API Documentation

Update API documentation when adding new endpoints:
- Add to `docs/api/api-reference.md`
- Include request/response examples
- Document error codes and responses

## 🚀 Performance Optimization

### Profiling

```python
# Profile crew execution
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()

# Execute crew
result = await crew.execute_async(input_data)

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(10)
```

### Memory Optimization

```python
# Monitor memory usage
import tracemalloc

tracemalloc.start()

# Execute code
result = await crew.execute_async(input_data)

current, peak = tracemalloc.get_traced_memory()
print(f"Current memory usage: {current / 1024 / 1024:.1f} MB")
print(f"Peak memory usage: {peak / 1024 / 1024:.1f} MB")
```

### Async Best Practices

```python
# Use async/await properly
async def process_data(self, data):
    # Good: Use async for I/O operations
    result = await self.external_service.call(data)
    
    # Good: Use asyncio.gather for parallel operations
    tasks = [self.process_item(item) for item in data]
    results = await asyncio.gather(*tasks)
    
    return results
```

## 🔒 Security Considerations

### Input Validation

```python
from pydantic import BaseModel, validator

class CrewInput(BaseModel):
    story_text: str
    preferences: dict
    
    @validator('story_text')
    def validate_story_text(cls, v):
        if len(v) > 100000:  # 100KB limit
            raise ValueError('Story text too long')
        return v
```

### API Security

```python
# Add authentication middleware
from fastapi import HTTPException, Depends

async def verify_api_key(api_key: str = Header(None)):
    if api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return api_key
```

---

For more information, see:
- [Testing Guide](./testing.md)
- [Code Style Guide](./code-style.md)
- [API Reference](../api/api-reference.md)
