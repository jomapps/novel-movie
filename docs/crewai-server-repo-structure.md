# CrewAI Server Repository Structure

## Overview

This document outlines the structure for a separate CrewAI server repository that can be cloned and deployed on Ubuntu servers independently from the main Novel Movie application.

## Repository Structure

```
novel-movie-crewai-server/
├── README.md                          # Setup and deployment instructions
├── requirements.txt                   # Python dependencies
├── Dockerfile                         # Container deployment
├── docker-compose.yml                # Local development setup
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore rules
├── setup.py                          # Package setup
├── pyproject.toml                     # Modern Python project config
├── main.py                           # FastAPI server entry point
├── config/                           # Configuration management
│   ├── __init__.py
│   ├── settings.py                   # Environment settings
│   ├── logging.py                    # Logging configuration
│   └── crew_configs.py               # Crew-specific configurations
├── crews/                            # CrewAI crew implementations
│   ├── __init__.py
│   ├── base_crew.py                  # Abstract base crew class
│   ├── architect_crew.py             # Phase 1: Story Architecture
│   ├── director_crew.py              # Phase 2: Scene Breakdown
│   ├── specialist_crews.py           # Phase 3: Parallel specialists
│   └── supervisor_crew.py            # Phase 4: Quality Control
├── tools/                            # CrewAI tools
│   ├── __init__.py
│   ├── base_tool.py                  # Abstract base tool
│   ├── payload_tool.py               # PayloadCMS integration
│   ├── pathrag_tool.py               # PathRAG integration
│   └── baml_tool.py                  # BAML integration (if needed)
├── services/                         # External service integrations
│   ├── __init__.py
│   ├── pathrag_service.py            # PathRAG API client
│   ├── payload_service.py            # Novel Movie API client
│   └── queue_service.py              # Queue management
├── models/                           # Data models and schemas
│   ├── __init__.py
│   ├── crew_models.py                # CrewAI request/response models
│   ├── story_models.py               # Story and scene models
│   └── job_models.py                 # Job and task models
├── utils/                            # Utility functions
│   ├── __init__.py
│   ├── logging_utils.py              # Logging helpers
│   ├── validation.py                 # Input validation
│   └── error_handling.py             # Error handling utilities
├── tests/                            # Test suite
│   ├── __init__.py
│   ├── conftest.py                   # Pytest configuration
│   ├── test_crews/                   # Crew tests
│   │   ├── test_architect_crew.py
│   │   └── test_director_crew.py
│   ├── test_tools/                   # Tool tests
│   │   ├── test_pathrag_tool.py
│   │   └── test_payload_tool.py
│   └── test_services/                # Service tests
│       ├── test_pathrag_service.py
│       └── test_payload_service.py
├── scripts/                          # Deployment and utility scripts
│   ├── setup_server.sh               # Ubuntu server setup script
│   ├── deploy.sh                     # Deployment script
│   ├── health_check.sh               # Health monitoring script
│   └── backup_logs.sh                # Log management script
├── deployment/                       # Deployment configurations
│   ├── systemd/                      # Systemd service files
│   │   └── crewai-server.service
│   ├── nginx/                        # Nginx configuration
│   │   └── crewai-server.conf
│   └── supervisor/                   # Supervisor configuration
│       └── crewai-server.conf
└── docs/                             # Documentation
    ├── API.md                        # API documentation
    ├── DEPLOYMENT.md                 # Deployment guide
    ├── DEVELOPMENT.md                # Development setup
    └── TROUBLESHOOTING.md            # Common issues and solutions
```

## Key Files Overview

### Main Application
- **main.py**: FastAPI server with health checks, crew execution endpoints
- **config/settings.py**: Environment-based configuration management
- **crews/**: Individual crew implementations using CrewAI framework

### Integration Layer
- **services/pathrag_service.py**: Client for PathRAG API communication
- **services/payload_service.py**: Client for Novel Movie API communication
- **tools/**: CrewAI tools that crews can use to interact with external services

### Deployment
- **scripts/setup_server.sh**: Automated Ubuntu server setup
- **deployment/**: Production deployment configurations
- **Dockerfile**: Containerized deployment option

## Environment Variables

```env
# Server Configuration
CREWAI_HOST=0.0.0.0
CREWAI_PORT=8000
CREWAI_WORKERS=4
CREWAI_LOG_LEVEL=INFO

# External Services
PATHRAG_API_URL=http://movie.ft.tc:5000
NOVEL_MOVIE_API_URL=https://your-novel-movie-app.com
NOVEL_MOVIE_API_KEY=your-api-key

# AI Services
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Database (if needed for caching)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=your-sentry-dsn
PROMETHEUS_PORT=9090
```

## Deployment Strategy

### Option 1: Direct Python Deployment
```bash
# Clone repository
git clone https://github.com/your-org/novel-movie-crewai-server.git
cd novel-movie-crewai-server

# Run setup script
chmod +x scripts/setup_server.sh
./scripts/setup_server.sh

# Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Option 2: Docker Deployment
```bash
# Clone repository
git clone https://github.com/your-org/novel-movie-crewai-server.git
cd novel-movie-crewai-server

# Build and run with Docker Compose
docker-compose up -d
```

### Option 3: Systemd Service
```bash
# After setup, install as system service
sudo cp deployment/systemd/crewai-server.service /etc/systemd/system/
sudo systemctl enable crewai-server
sudo systemctl start crewai-server
```

## Development Workflow

1. **Local Development**: Use docker-compose for local testing
2. **Testing**: Run pytest suite before deployment
3. **Staging**: Deploy to staging server for integration testing
4. **Production**: Deploy to production server with monitoring

## Integration with Novel Movie

The CrewAI server will communicate with the main Novel Movie application via:

1. **HTTP API**: Novel Movie sends requests to CrewAI server
2. **Webhooks**: CrewAI server sends completion notifications
3. **Shared Services**: Both use PathRAG for knowledge storage

## Next Steps

1. **Create Repository**: Set up the separate GitHub repository
2. **Implement Base Structure**: Create the core files and structure
3. **Test Locally**: Validate the setup works with docker-compose
4. **Deploy to Ubuntu**: Use the deployment scripts for server setup
5. **Integration Testing**: Connect with main Novel Movie application

This structure provides a clean separation of concerns while maintaining easy deployment and maintenance.
