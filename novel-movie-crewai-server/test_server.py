#!/usr/bin/env python3
"""
Test script for CrewAI server
Run this to verify the server is working correctly
"""

import asyncio
import json
import sys
from typing import Dict, Any

import aiohttp


async def test_health_check(base_url: str) -> bool:
    """Test health check endpoint"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{base_url}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Health check passed: {data['status']}")
                    return True
                else:
                    print(f"❌ Health check failed: {response.status}")
                    return False
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False


async def test_stats_endpoint(base_url: str) -> bool:
    """Test stats endpoint"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{base_url}/stats") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Stats endpoint working: {data['total_jobs']} total jobs")
                    return True
                else:
                    print(f"❌ Stats endpoint failed: {response.status}")
                    return False
    except Exception as e:
        print(f"❌ Stats endpoint error: {str(e)}")
        return False


async def test_crew_execution(base_url: str) -> bool:
    """Test crew execution endpoint"""
    try:
        test_request = {
            "crew_type": "architect",
            "project_id": "test-project-123",
            "user_id": "test-user-456",
            "input_data": {
                "story_text": "Test story for CrewAI server validation",
                "preferences": {
                    "style": "cinematic",
                    "complexity": "medium"
                }
            },
            "config": {
                "verbose": True,
                "temperature": 0.7
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{base_url}/crews/execute",
                json=test_request
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('success'):
                        job_id = data.get('job_id')
                        print(f"✅ Crew execution started: {job_id}")
                        
                        # Test job status endpoint
                        await asyncio.sleep(2)  # Wait a bit
                        return await test_job_status(base_url, job_id)
                    else:
                        print(f"❌ Crew execution failed: {data.get('error')}")
                        return False
                else:
                    print(f"❌ Crew execution request failed: {response.status}")
                    return False
    except Exception as e:
        print(f"❌ Crew execution error: {str(e)}")
        return False


async def test_job_status(base_url: str, job_id: str) -> bool:
    """Test job status endpoint"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{base_url}/crews/status/{job_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    status = data.get('status')
                    print(f"✅ Job status retrieved: {status}")
                    return True
                else:
                    print(f"❌ Job status request failed: {response.status}")
                    return False
    except Exception as e:
        print(f"❌ Job status error: {str(e)}")
        return False


async def run_tests(base_url: str = "http://localhost:5001"):
    """Run all tests"""
    print("🧪 Testing Novel Movie CrewAI Server")
    print("=" * 40)
    print(f"Server URL: {base_url}")
    print()
    
    tests = [
        ("Health Check", test_health_check),
        ("Stats Endpoint", test_stats_endpoint),
        ("Crew Execution", test_crew_execution),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"🔍 Running {test_name}...")
        try:
            result = await test_func(base_url)
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            results.append((test_name, False))
        print()
    
    # Summary
    print("📊 Test Results Summary")
    print("-" * 25)
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print()
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! CrewAI server is working correctly.")
        return True
    else:
        print("⚠️  Some tests failed. Check the server configuration.")
        return False


if __name__ == "__main__":
    # Get server URL from command line or use default
    server_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5001"
    
    # Run tests
    success = asyncio.run(run_tests(server_url))
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)
