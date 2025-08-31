#!/usr/bin/env python3
"""
Comprehensive CrewAI Server Testing & Validation
Tests crew execution without requiring external dependencies
"""

import asyncio
import json
import logging
import sys
from typing import Dict, Any, List
from unittest.mock import Mock, AsyncMock, patch

# Mock CrewAI components for testing
class MockAgent:
    def __init__(self, role, goal, backstory, **kwargs):
        self.role = role
        self.goal = goal
        self.backstory = backstory
        self.tools = kwargs.get('tools', [])
        self.verbose = kwargs.get('verbose', True)
        self.memory = kwargs.get('memory', True)
        self.max_iter = kwargs.get('max_iter', 2)

class MockTask:
    def __init__(self, description, agent, expected_output, **kwargs):
        self.description = description
        self.agent = agent
        self.expected_output = expected_output

class MockCrew:
    def __init__(self, agents, tasks, **kwargs):
        self.agents = agents
        self.tasks = tasks
        self.verbose = kwargs.get('verbose', True)
        self.memory = kwargs.get('memory', True)
        self.max_iter = kwargs.get('max_iter', 3)
    
    def kickoff(self, inputs):
        """Mock crew execution with realistic results"""
        return MockCrewResult(
            raw=self._generate_mock_result(inputs),
            tasks_output=[
                MockTaskOutput(f"Task {i+1} completed successfully") 
                for i in range(len(self.tasks))
            ]
        )

class MockCrewResult:
    def __init__(self, raw, tasks_output=None):
        self.raw = raw
        self.tasks_output = tasks_output or []

class MockTaskOutput:
    def __init__(self, output):
        self.raw = output

    def _generate_mock_result(self, inputs):
        """Generate realistic mock results based on crew type"""
        if 'architect' in str(self.agents[0].role).lower():
            return json.dumps({
                "scenes": [
                    {
                        "scene_id": "scene_001",
                        "title": "Opening Scene",
                        "description": "Character introduction in urban setting",
                        "characters": ["protagonist", "supporting_character"],
                        "location": "city_street",
                        "mood": "mysterious",
                        "duration": "2-3 minutes"
                    }
                ],
                "characters": [
                    {
                        "name": "protagonist",
                        "role": "main_character",
                        "traits": ["determined", "mysterious"],
                        "arc": "discovery_journey"
                    }
                ],
                "locations": [
                    {
                        "name": "city_street",
                        "type": "exterior",
                        "atmosphere": "urban_noir",
                        "time_of_day": "evening"
                    }
                ],
                "themes": ["identity", "discovery", "transformation"]
            })
        elif 'director' in str(self.agents[0].role).lower():
            return json.dumps({
                "scene_breakdowns": [
                    {
                        "scene_id": "scene_001",
                        "shots": [
                            {
                                "shot_number": 1,
                                "type": "wide_shot",
                                "camera_angle": "eye_level",
                                "movement": "static",
                                "duration": "5 seconds",
                                "description": "Establishing shot of city street"
                            },
                            {
                                "shot_number": 2,
                                "type": "medium_shot",
                                "camera_angle": "slightly_low",
                                "movement": "slow_push_in",
                                "duration": "8 seconds",
                                "description": "Character walking towards camera"
                            }
                        ],
                        "lighting": "golden_hour_natural",
                        "equipment": ["steadicam", "85mm_lens"],
                        "crew_notes": "Capture urban atmosphere with natural lighting"
                    }
                ],
                "production_requirements": {
                    "shooting_days": 1,
                    "crew_size": "standard",
                    "equipment_level": "professional"
                }
            })
        else:
            return "Mock crew execution completed successfully"


class CrewValidationTester:
    """Comprehensive testing for CrewAI server components"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.test_results = []
        
    async def run_all_tests(self) -> bool:
        """Run comprehensive validation tests"""
        print("🧪 CrewAI Server Validation Testing")
        print("=" * 50)
        print()
        
        tests = [
            ("Architect Crew Structure", self.test_architect_crew_structure),
            ("Director Crew Structure", self.test_director_crew_structure),
            ("Crew Execution Flow", self.test_crew_execution_flow),
            ("Tool Integration", self.test_tool_integration),
            ("Error Handling", self.test_error_handling),
            ("Result Processing", self.test_result_processing),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"🔍 Running {test_name}...")
            try:
                result = await test_func()
                self.test_results.append((test_name, result))
                if result:
                    print(f"✅ {test_name}: PASSED")
                    passed += 1
                else:
                    print(f"❌ {test_name}: FAILED")
            except Exception as e:
                print(f"❌ {test_name}: ERROR - {str(e)}")
                self.test_results.append((test_name, False))
            print()
        
        # Summary
        print("📊 Validation Results Summary")
        print("-" * 30)
        print(f"Tests Passed: {passed}/{total}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        if passed == total:
            print("🎉 All validation tests passed!")
            print("✅ CrewAI server is ready for Phase 3 integration")
            return True
        else:
            print("⚠️  Some tests failed. Review implementation before proceeding.")
            return False
    
    async def test_architect_crew_structure(self) -> bool:
        """Test architect crew structure and components"""
        try:
            with patch('crewai.Agent', MockAgent), \
                 patch('crewai.Task', MockTask), \
                 patch('crewai.Crew', MockCrew):
                
                # Import here to use mocked classes
                sys.path.append('.')
                from crews.architect_crew import ArchitectCrew
                
                # Create crew instance
                crew = ArchitectCrew(
                    project_id="test-project",
                    user_id="test-user",
                    config={"verbose": False}
                )
                
                # Validate agents
                agents = crew.create_agents()
                assert len(agents) == 2, f"Expected 2 agents, got {len(agents)}"
                assert agents[0].role == 'Story Structure Analyst'
                assert agents[1].role == 'Knowledge Graph Architect'
                
                # Validate tasks
                tasks = crew.create_tasks()
                assert len(tasks) == 2, f"Expected 2 tasks, got {len(tasks)}"
                
                print("  ✓ Architect crew structure validated")
                return True
                
        except Exception as e:
            print(f"  ✗ Architect crew validation failed: {str(e)}")
            return False
    
    async def test_director_crew_structure(self) -> bool:
        """Test director crew structure and components"""
        try:
            with patch('crewai.Agent', MockAgent), \
                 patch('crewai.Task', MockTask), \
                 patch('crewai.Crew', MockCrew):
                
                from crews.director_crew import DirectorCrew
                
                # Create crew instance
                crew = DirectorCrew(
                    project_id="test-project",
                    user_id="test-user",
                    config={"verbose": False}
                )
                
                # Validate agents
                agents = crew.create_agents()
                assert len(agents) == 2, f"Expected 2 agents, got {len(agents)}"
                assert agents[0].role == 'Scene Analysis Director'
                assert agents[1].role == 'Cinematography Specialist'
                
                # Validate tasks
                tasks = crew.create_tasks()
                assert len(tasks) == 2, f"Expected 2 tasks, got {len(tasks)}"
                
                print("  ✓ Director crew structure validated")
                return True
                
        except Exception as e:
            print(f"  ✗ Director crew validation failed: {str(e)}")
            return False
    
    async def test_crew_execution_flow(self) -> bool:
        """Test crew execution workflow"""
        try:
            with patch('crewai.Agent', MockAgent), \
                 patch('crewai.Task', MockTask), \
                 patch('crewai.Crew', MockCrew):
                
                from crews.architect_crew import ArchitectCrew
                
                # Mock external services
                with patch('services.pathrag_service.PathRAGService') as mock_pathrag, \
                     patch('services.payload_service.PayloadService') as mock_payload:
                    
                    mock_pathrag.return_value = AsyncMock()
                    mock_payload.return_value = AsyncMock()
                    
                    crew = ArchitectCrew(
                        project_id="test-project",
                        user_id="test-user",
                        config={"verbose": False}
                    )
                    
                    # Test execution
                    input_data = {
                        "story_text": "Test story for validation",
                        "preferences": {"style": "cinematic"}
                    }
                    
                    result = await crew.execute_async(input_data)
                    
                    assert result.success == True, "Crew execution should succeed"
                    assert result.data is not None, "Result should contain data"
                    assert result.execution_time > 0, "Execution time should be recorded"
                    
                    print("  ✓ Crew execution flow validated")
                    return True
                    
        except Exception as e:
            print(f"  ✗ Crew execution validation failed: {str(e)}")
            return False
    
    async def test_tool_integration(self) -> bool:
        """Test tool integration and functionality"""
        try:
            # Test PathRAG tool
            from tools.pathrag_tool import PathRAGTool
            
            with patch('services.pathrag_service.PathRAGService') as mock_service:
                mock_service.return_value.save_graph = AsyncMock(return_value={"success": True})
                mock_service.return_value.query_story = AsyncMock(return_value={"results": []})
                
                tool = PathRAGTool()
                assert tool.name == "pathrag_knowledge_graph"
                assert "save_graph" in tool.description
                
            # Test Payload tool
            from tools.payload_tool import PayloadTool
            
            with patch('services.payload_service.PayloadService') as mock_service:
                mock_service.return_value.get_project_data = AsyncMock(return_value={"project": "test"})
                
                tool = PayloadTool()
                assert tool.name == "novel_movie_data"
                assert "get_project" in tool.description
            
            print("  ✓ Tool integration validated")
            return True
            
        except Exception as e:
            print(f"  ✗ Tool integration validation failed: {str(e)}")
            return False
    
    async def test_error_handling(self) -> bool:
        """Test error handling and recovery"""
        try:
            with patch('crewai.Agent', MockAgent), \
                 patch('crewai.Task', MockTask), \
                 patch('crewai.Crew', MockCrew):
                
                from crews.architect_crew import ArchitectCrew
                
                # Mock services to raise exceptions
                with patch('services.pathrag_service.PathRAGService') as mock_pathrag:
                    mock_pathrag.side_effect = Exception("Service unavailable")
                    
                    crew = ArchitectCrew(
                        project_id="test-project",
                        user_id="test-user",
                        config={"verbose": False}
                    )
                    
                    # Test that crew handles service failures gracefully
                    input_data = {"story_text": "Test story"}
                    result = await crew.execute_async(input_data)
                    
                    # Should handle error gracefully
                    assert result is not None, "Should return result even on error"
                    
            print("  ✓ Error handling validated")
            return True
            
        except Exception as e:
            print(f"  ✗ Error handling validation failed: {str(e)}")
            return False
    
    async def test_result_processing(self) -> bool:
        """Test result processing and formatting"""
        try:
            with patch('crewai.Agent', MockAgent), \
                 patch('crewai.Task', MockTask), \
                 patch('crewai.Crew', MockCrew):
                
                from crews.architect_crew import ArchitectCrew
                from crews.director_crew import DirectorCrew
                
                # Test architect result processing
                architect_crew = ArchitectCrew(
                    project_id="test-project",
                    user_id="test-user",
                    config={"verbose": False}
                )
                
                mock_result = MockCrewResult("Test architect result")
                processed = await architect_crew.postprocess_result(mock_result)
                
                assert processed['success'] == True
                assert processed['phase'] == 'architect'
                assert processed['next_phase'] == 'director'
                
                # Test director result processing
                director_crew = DirectorCrew(
                    project_id="test-project",
                    user_id="test-user",
                    config={"verbose": False}
                )
                
                mock_result = MockCrewResult("Test director result")
                processed = await director_crew.postprocess_result(mock_result)
                
                assert processed['success'] == True
                assert processed['phase'] == 'director'
                assert processed['next_phase'] == 'specialists'
                
            print("  ✓ Result processing validated")
            return True
            
        except Exception as e:
            print(f"  ✗ Result processing validation failed: {str(e)}")
            return False


async def main():
    """Run validation tests"""
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    # Run tests
    tester = CrewValidationTester()
    success = await tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())
