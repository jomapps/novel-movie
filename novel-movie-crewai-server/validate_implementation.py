#!/usr/bin/env python3
"""
Standalone Implementation Validator for CrewAI Server
Validates implementation structure without requiring external dependencies
"""

import os
import sys
import json
import ast
import inspect
from typing import Dict, Any, List, Tuple
from pathlib import Path


class ImplementationValidator:
    """Validates CrewAI server implementation structure and completeness"""
    
    def __init__(self):
        self.base_path = Path(".")
        self.results = []
        self.errors = []
        
    def run_validation(self) -> bool:
        """Run comprehensive implementation validation"""
        print("🔍 CrewAI Server Implementation Validation")
        print("=" * 50)
        print()
        
        validations = [
            ("Project Structure", self.validate_project_structure),
            ("Core Files Present", self.validate_core_files),
            ("Crew Implementations", self.validate_crew_implementations),
            ("Tool Implementations", self.validate_tool_implementations),
            ("Service Implementations", self.validate_service_implementations),
            ("Configuration Setup", self.validate_configuration),
            ("Documentation Coverage", self.validate_documentation),
            ("Test Infrastructure", self.validate_test_infrastructure),
        ]
        
        passed = 0
        total = len(validations)
        
        for name, validator in validations:
            print(f"🔍 Validating {name}...")
            try:
                result = validator()
                if result:
                    print(f"✅ {name}: PASSED")
                    passed += 1
                else:
                    print(f"❌ {name}: FAILED")
                self.results.append((name, result))
            except Exception as e:
                print(f"❌ {name}: ERROR - {str(e)}")
                self.results.append((name, False))
                self.errors.append(f"{name}: {str(e)}")
            print()
        
        # Summary
        print("📊 Validation Summary")
        print("-" * 25)
        print(f"Validations Passed: {passed}/{total}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        if self.errors:
            print("🚨 Errors Found:")
            for error in self.errors:
                print(f"  • {error}")
            print()
        
        # Phase completion assessment
        completion_percentage = (passed / total) * 100
        if completion_percentage >= 90:
            print("🎉 Phase 2 Implementation: COMPLETE")
            print("✅ Ready to proceed to Phase 3 (Service Integration)")
        elif completion_percentage >= 75:
            print("🟡 Phase 2 Implementation: NEARLY COMPLETE")
            print("⚠️  Address remaining issues before Phase 3")
        else:
            print("🔴 Phase 2 Implementation: INCOMPLETE")
            print("❌ Significant work needed before Phase 3")
        
        return passed == total
    
    def validate_project_structure(self) -> bool:
        """Validate project directory structure"""
        required_dirs = [
            "config", "crews", "tools", "services", "models", 
            "utils", "docs", "tests", "scripts", "deployment"
        ]
        
        missing_dirs = []
        for dir_name in required_dirs:
            if not (self.base_path / dir_name).exists():
                missing_dirs.append(dir_name)
        
        if missing_dirs:
            print(f"  ✗ Missing directories: {', '.join(missing_dirs)}")
            return False
        
        print("  ✓ All required directories present")
        return True
    
    def validate_core_files(self) -> bool:
        """Validate presence of core implementation files"""
        required_files = [
            "main.py",
            "requirements.txt",
            "Dockerfile",
            "docker-compose.yml",
            "README.md",
            "config/settings.py",
            "config/logging.py",
            "models/crew_models.py",
            "utils/error_handling.py"
        ]
        
        missing_files = []
        for file_path in required_files:
            if not (self.base_path / file_path).exists():
                missing_files.append(file_path)
        
        if missing_files:
            print(f"  ✗ Missing files: {', '.join(missing_files)}")
            return False
        
        print("  ✓ All core files present")
        return True
    
    def validate_crew_implementations(self) -> bool:
        """Validate crew implementation completeness"""
        crew_files = [
            "crews/base_crew.py",
            "crews/architect_crew.py", 
            "crews/director_crew.py"
        ]
        
        issues = []
        
        for crew_file in crew_files:
            file_path = self.base_path / crew_file
            if not file_path.exists():
                issues.append(f"Missing {crew_file}")
                continue
            
            # Check file content structure
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Parse AST to check for required methods
                tree = ast.parse(content)
                
                classes = [node for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
                if not classes:
                    issues.append(f"{crew_file}: No classes found")
                    continue
                
                main_class = classes[0]  # Assume first class is main
                methods = [node.name for node in main_class.body if isinstance(node, ast.FunctionDef)]
                
                required_methods = ["create_agents", "create_tasks"]
                if crew_file != "crews/base_crew.py":  # Base crew has different requirements
                    missing_methods = [m for m in required_methods if m not in methods]
                    if missing_methods:
                        issues.append(f"{crew_file}: Missing methods {missing_methods}")
                
            except Exception as e:
                issues.append(f"{crew_file}: Parse error - {str(e)}")
        
        if issues:
            for issue in issues:
                print(f"  ✗ {issue}")
            return False
        
        print("  ✓ All crew implementations valid")
        return True
    
    def validate_tool_implementations(self) -> bool:
        """Validate tool implementation completeness"""
        tool_files = [
            "tools/pathrag_tool.py",
            "tools/payload_tool.py"
        ]
        
        issues = []
        
        for tool_file in tool_files:
            file_path = self.base_path / tool_file
            if not file_path.exists():
                issues.append(f"Missing {tool_file}")
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check for required tool attributes
                required_attrs = ["name", "description"]
                for attr in required_attrs:
                    if f"{attr}:" not in content and f"{attr} =" not in content:
                        issues.append(f"{tool_file}: Missing {attr} attribute")
                
            except Exception as e:
                issues.append(f"{tool_file}: Read error - {str(e)}")
        
        if issues:
            for issue in issues:
                print(f"  ✗ {issue}")
            return False
        
        print("  ✓ All tool implementations valid")
        return True
    
    def validate_service_implementations(self) -> bool:
        """Validate service client implementations"""
        service_files = [
            "services/pathrag_service.py",
            "services/payload_service.py",
            "services/queue_service.py"
        ]
        
        issues = []
        
        for service_file in service_files:
            file_path = self.base_path / service_file
            if not file_path.exists():
                issues.append(f"Missing {service_file}")
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check for class definition
                if "class " not in content:
                    issues.append(f"{service_file}: No service class found")
                
                # Check for async methods (modern service pattern)
                if "async def" not in content:
                    issues.append(f"{service_file}: No async methods found")
                
            except Exception as e:
                issues.append(f"{service_file}: Read error - {str(e)}")
        
        if issues:
            for issue in issues:
                print(f"  ✗ {issue}")
            return False
        
        print("  ✓ All service implementations valid")
        return True
    
    def validate_configuration(self) -> bool:
        """Validate configuration setup"""
        config_checks = [
            ("settings.py exists", lambda: (self.base_path / "config/settings.py").exists()),
            ("logging.py exists", lambda: (self.base_path / "config/logging.py").exists()),
            ("environment template", lambda: any(
                (self.base_path / f).exists() for f in [".env.example", ".env.template", "config/.env.example"]
            ))
        ]
        
        issues = []
        
        for check_name, check_func in config_checks:
            try:
                if not check_func():
                    issues.append(check_name)
            except Exception as e:
                issues.append(f"{check_name}: {str(e)}")
        
        if issues:
            for issue in issues:
                print(f"  ✗ {issue}")
            return False
        
        print("  ✓ Configuration setup valid")
        return True
    
    def validate_documentation(self) -> bool:
        """Validate documentation coverage"""
        doc_files = [
            "docs/README.md",
            "docs/implementation/implementation-plan.md",
            "docs/implementation/phase-tracking.md",
            "docs/crews/overview.md",
            "docs/api/api-reference.md"
        ]
        
        missing_docs = []
        for doc_file in doc_files:
            if not (self.base_path / doc_file).exists():
                missing_docs.append(doc_file)
        
        if missing_docs:
            print(f"  ✗ Missing documentation: {', '.join(missing_docs)}")
            return False
        
        print("  ✓ Documentation coverage adequate")
        return True
    
    def validate_test_infrastructure(self) -> bool:
        """Validate test infrastructure"""
        test_files = [
            "test_server.py",
            "tests/test_crew_validation.py",
            "tests/test_data.py",
            "tests/mock_services.py"
        ]
        
        missing_tests = []
        for test_file in test_files:
            if not (self.base_path / test_file).exists():
                missing_tests.append(test_file)
        
        if missing_tests:
            print(f"  ✗ Missing test files: {', '.join(missing_tests)}")
            return False
        
        print("  ✓ Test infrastructure complete")
        return True
    
    def generate_completion_report(self) -> Dict[str, Any]:
        """Generate detailed completion report"""
        return {
            "validation_date": "2025-08-31",
            "phase": "Phase 2 - Core Crews Implementation",
            "overall_status": "validation_complete",
            "results": self.results,
            "errors": self.errors,
            "next_steps": [
                "Install required dependencies (crewai, fastapi, etc.)",
                "Test crew execution with mock services",
                "Validate PathRAG integration points",
                "Prepare for Phase 3 service integration"
            ],
            "recommendations": [
                "Create virtual environment for dependency management",
                "Set up CI/CD pipeline for automated testing",
                "Document API endpoints for integration testing",
                "Prepare mock data for comprehensive testing"
            ]
        }


def main():
    """Run implementation validation"""
    validator = ImplementationValidator()
    success = validator.run_validation()
    
    # Generate report
    report = validator.generate_completion_report()
    
    # Save report
    with open("validation_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"📄 Detailed report saved to: validation_report.json")
    
    return success


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
