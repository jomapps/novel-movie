"""
Test Data Generator for CrewAI Server Validation
Provides realistic sample data for testing crew execution
"""

import json
from typing import Dict, Any, List


class TestDataGenerator:
    """Generate realistic test data for crew validation"""
    
    @staticmethod
    def get_sample_story() -> str:
        """Get a sample story for testing"""
        return """
        FADE IN:

        EXT. CITY STREET - EVENING

        The golden hour light filters through the urban canyon, casting long shadows across the bustling street. MAYA CHEN (28), a determined data analyst with tired eyes, walks briskly through the crowd, clutching a worn leather briefcase.

        She stops at a coffee shop window, her reflection showing the weight of recent discoveries. Inside the briefcase are documents that could change everything - evidence of a conspiracy that reaches the highest levels of the tech company she works for.

        MAYA
        (to herself)
        Three years of my life... all built on lies.

        A BLACK SUV pulls up across the street. Maya notices it immediately - the same vehicle she's seen outside her apartment for the past week. Her grip tightens on the briefcase.

        MAYA (CONT'D)
        Not today.

        She ducks into the coffee shop, weaving through the evening crowd. The BARISTA, JAMES (22), a film student with an easy smile, recognizes her.

        JAMES
        The usual? Double espresso, no sugar?

        MAYA
        Make it to go. And James... if anyone asks, you haven't seen me.

        James's expression shifts, sensing the urgency. He nods and quickly prepares her order.

        Through the window, Maya watches two SUITED MEN exit the SUV. They're scanning the street, clearly looking for someone. Her phone buzzes - a text from an unknown number: "We need to talk. Pier 47. Come alone."

        Maya grabs her coffee and heads for the back exit, her mind racing. The conspiracy she's uncovered is bigger than she imagined, and now she's become the target. But she has allies she doesn't know about yet - people who have been waiting for someone like her to emerge with the truth.

        As she slips out the back door into the alley, the camera pulls back to reveal the scope of the urban landscape, hinting at the larger forces at play in this story of corporate espionage, personal courage, and the price of truth.

        FADE TO BLACK.
        """
    
    @staticmethod
    def get_sample_project_data() -> Dict[str, Any]:
        """Get sample project data"""
        return {
            "project_id": "test-project-001",
            "title": "Urban Shadows",
            "genre": "thriller",
            "user_id": "test-user-001",
            "status": "in_development",
            "preferences": {
                "style": "cinematic",
                "complexity": "medium",
                "tone": "suspenseful",
                "target_audience": "adult"
            },
            "metadata": {
                "created_at": "2025-08-30T10:00:00Z",
                "updated_at": "2025-08-30T15:30:00Z",
                "version": "1.0"
            }
        }
    
    @staticmethod
    def get_expected_architect_output() -> Dict[str, Any]:
        """Get expected output structure from architect crew"""
        return {
            "scenes": [
                {
                    "scene_id": "scene_001",
                    "title": "Coffee Shop Encounter",
                    "description": "Maya discovers she's being followed and makes contact with ally",
                    "location": "coffee_shop_interior",
                    "time_of_day": "evening",
                    "characters": ["maya_chen", "james_barista", "suited_men"],
                    "mood": "tense_suspenseful",
                    "duration_estimate": "3-4 minutes",
                    "story_function": "inciting_incident",
                    "emotional_beats": ["discovery", "fear", "determination"]
                }
            ],
            "characters": [
                {
                    "name": "maya_chen",
                    "role": "protagonist",
                    "age": 28,
                    "occupation": "data_analyst",
                    "traits": ["determined", "intelligent", "cautious"],
                    "arc": "reluctant_hero_to_active_agent",
                    "relationships": {
                        "james_barista": "friendly_acquaintance",
                        "suited_men": "antagonistic"
                    }
                },
                {
                    "name": "james_barista",
                    "role": "supporting_ally",
                    "age": 22,
                    "occupation": "barista_film_student",
                    "traits": ["observant", "helpful", "intuitive"],
                    "story_function": "local_ally"
                }
            ],
            "locations": [
                {
                    "name": "city_street_evening",
                    "type": "exterior",
                    "atmosphere": "urban_golden_hour",
                    "mood": "bustling_but_ominous",
                    "visual_elements": ["long_shadows", "crowd", "urban_canyon"]
                },
                {
                    "name": "coffee_shop_interior",
                    "type": "interior",
                    "atmosphere": "warm_refuge",
                    "mood": "temporary_safety",
                    "visual_elements": ["evening_crowd", "warm_lighting", "back_exit"]
                }
            ],
            "themes": [
                {
                    "theme": "truth_vs_deception",
                    "manifestation": "corporate_conspiracy_discovery",
                    "character_impact": "maya_moral_awakening"
                },
                {
                    "theme": "individual_vs_system",
                    "manifestation": "lone_analyst_vs_corporation",
                    "character_impact": "david_goliath_dynamic"
                }
            ],
            "story_structure": {
                "act": "act_1",
                "sequence": "inciting_incident",
                "plot_points": ["conspiracy_evidence", "surveillance_discovery", "ally_contact"],
                "next_scene_setup": "pier_meeting_preparation"
            }
        }
    
    @staticmethod
    def get_expected_director_output() -> Dict[str, Any]:
        """Get expected output structure from director crew"""
        return {
            "scene_breakdowns": [
                {
                    "scene_id": "scene_001",
                    "title": "Coffee Shop Encounter",
                    "shots": [
                        {
                            "shot_number": 1,
                            "type": "wide_shot",
                            "camera_angle": "eye_level",
                            "movement": "static",
                            "lens": "35mm",
                            "duration": "5 seconds",
                            "description": "Establishing shot of busy city street at golden hour",
                            "lighting": "natural_golden_hour",
                            "mood": "urban_energy"
                        },
                        {
                            "shot_number": 2,
                            "type": "medium_shot",
                            "camera_angle": "slightly_low",
                            "movement": "tracking_with_subject",
                            "lens": "50mm",
                            "duration": "8 seconds",
                            "description": "Maya walking through crowd, briefcase prominent",
                            "lighting": "natural_backlit",
                            "mood": "determined_but_anxious"
                        },
                        {
                            "shot_number": 3,
                            "type": "close_up",
                            "camera_angle": "eye_level",
                            "movement": "static",
                            "lens": "85mm",
                            "duration": "3 seconds",
                            "description": "Maya's reflection in coffee shop window",
                            "lighting": "mixed_interior_exterior",
                            "mood": "introspective_moment"
                        },
                        {
                            "shot_number": 4,
                            "type": "medium_wide_shot",
                            "camera_angle": "high_angle",
                            "movement": "slow_push_in",
                            "lens": "24mm",
                            "duration": "6 seconds",
                            "description": "Black SUV pulling up across street",
                            "lighting": "natural_evening",
                            "mood": "ominous_threat"
                        }
                    ],
                    "lighting_design": {
                        "primary": "natural_golden_hour",
                        "secondary": "practical_coffee_shop",
                        "mood": "warm_exterior_cool_threat",
                        "equipment": ["reflectors", "bounce_boards", "minimal_artificial"]
                    },
                    "camera_equipment": {
                        "primary_camera": "cinema_camera",
                        "lenses": ["24mm", "35mm", "50mm", "85mm"],
                        "support": ["steadicam", "tripod", "handheld"],
                        "special": ["tracking_dolly"]
                    },
                    "audio_requirements": {
                        "dialogue": "boom_mic_primary",
                        "ambient": "city_street_evening",
                        "effects": ["car_doors", "footsteps", "coffee_shop_ambiance"],
                        "music": "subtle_tension_building"
                    }
                }
            ],
            "production_requirements": {
                "shooting_days": 1,
                "crew_size": "standard_narrative",
                "equipment_level": "professional",
                "locations": ["city_street", "coffee_shop_interior"],
                "special_requirements": ["vehicle_coordination", "crowd_control"],
                "estimated_budget": "medium"
            },
            "technical_specifications": {
                "format": "4K_cinema",
                "aspect_ratio": "2.39:1",
                "frame_rate": "24fps",
                "color_profile": "log_for_grading",
                "delivery": "theatrical_streaming"
            }
        }
    
    @staticmethod
    def get_crew_execution_requests() -> List[Dict[str, Any]]:
        """Get sample crew execution requests for testing"""
        return [
            {
                "crew_type": "architect",
                "project_id": "test-project-001",
                "user_id": "test-user-001",
                "input_data": {
                    "story_text": TestDataGenerator.get_sample_story(),
                    "project_data": TestDataGenerator.get_sample_project_data(),
                    "preferences": {
                        "analysis_depth": "detailed",
                        "focus_areas": ["character_development", "visual_storytelling"],
                        "output_format": "structured_json"
                    }
                },
                "config": {
                    "verbose": True,
                    "temperature": 0.7,
                    "max_iterations": 2
                }
            },
            {
                "crew_type": "director",
                "project_id": "test-project-001",
                "user_id": "test-user-001",
                "input_data": {
                    "story_structure": TestDataGenerator.get_expected_architect_output(),
                    "project_data": TestDataGenerator.get_sample_project_data(),
                    "preferences": {
                        "shot_complexity": "professional",
                        "equipment_level": "standard",
                        "budget_tier": "medium"
                    }
                },
                "config": {
                    "verbose": True,
                    "temperature": 0.6,
                    "max_iterations": 2
                }
            }
        ]
    
    @staticmethod
    def get_pathrag_mock_responses() -> Dict[str, Any]:
        """Get mock responses for PathRAG service"""
        return {
            "save_graph": {
                "success": True,
                "graph_id": "graph_test_001",
                "entities_created": 15,
                "relationships_created": 23,
                "storage_time": 1.2,
                "message": "Knowledge graph successfully created and stored"
            },
            "query_story": {
                "success": True,
                "results": [
                    {
                        "entity": "maya_chen",
                        "type": "character",
                        "relevance": 0.95,
                        "context": "Protagonist data analyst discovering corporate conspiracy"
                    },
                    {
                        "entity": "coffee_shop_scene",
                        "type": "scene",
                        "relevance": 0.87,
                        "context": "Key location for character development and plot advancement"
                    }
                ],
                "query_time": 0.3
            },
            "get_scene_context": {
                "success": True,
                "scene_data": {
                    "scene_id": "scene_001",
                    "context": "Evening encounter that establishes threat and introduces ally",
                    "related_entities": ["maya_chen", "james_barista", "coffee_shop"],
                    "narrative_function": "inciting_incident"
                }
            }
        }
    
    @staticmethod
    def get_payload_mock_responses() -> Dict[str, Any]:
        """Get mock responses for PayloadCMS service"""
        return {
            "get_project_data": TestDataGenerator.get_sample_project_data(),
            "get_story_data": {
                "story_id": "story_001",
                "content": TestDataGenerator.get_sample_story(),
                "metadata": {
                    "word_count": 450,
                    "estimated_runtime": "4-5 minutes",
                    "genre": "thriller",
                    "tone": "suspenseful"
                }
            },
            "update_status": {
                "success": True,
                "project_id": "test-project-001",
                "new_status": "architect_complete",
                "updated_at": "2025-08-30T16:00:00Z"
            },
            "save_results": {
                "success": True,
                "result_id": "result_001",
                "saved_at": "2025-08-30T16:00:00Z",
                "storage_location": "crew_results/architect/test-project-001"
            }
        }


# Export test data for easy import
SAMPLE_STORY = TestDataGenerator.get_sample_story()
SAMPLE_PROJECT = TestDataGenerator.get_sample_project_data()
EXPECTED_ARCHITECT_OUTPUT = TestDataGenerator.get_expected_architect_output()
EXPECTED_DIRECTOR_OUTPUT = TestDataGenerator.get_expected_director_output()
CREW_REQUESTS = TestDataGenerator.get_crew_execution_requests()
PATHRAG_MOCKS = TestDataGenerator.get_pathrag_mock_responses()
PAYLOAD_MOCKS = TestDataGenerator.get_payload_mock_responses()
