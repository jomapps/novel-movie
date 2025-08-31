# Novel Movie CrewAI Server

AI-powered movie production agents using CrewAI framework for the Novel Movie platform.

## Overview

This is a standalone CrewAI server that provides AI agent services for the Novel Movie application. It handles story analysis, scene breakdown, and production planning through specialized AI crews.

## Architecture

- **FastAPI Server**: REST API running on port 5001
- **CrewAI Framework**: Multi-agent orchestration
- **PathRAG Integration**: Knowledge graph storage and retrieval
- **Novel Movie API**: Integration with main application

## Quick Start

### Prerequisites

- Python 3.11+
- Redis (for queue management)
- Access to PathRAG service
- OpenRouter API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd novel-movie-crewai-server

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your configuration

# Run the server
python main.py
```

### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## API Endpoints

- `GET /health` - Health check
- `POST /crews/execute` - Execute a crew
- `GET /crews/status/{job_id}` - Get job status
- `GET /stats` - Server statistics

## Environment Variables

```env
# Server Configuration
CREWAI_HOST=0.0.0.0
CREWAI_PORT=5001
CREWAI_WORKERS=4

# External Services
PATHRAG_API_URL=http://movie.ft.tc:5000
NOVEL_MOVIE_API_URL=https://your-app.com
OPENROUTER_API_KEY=your-key

# Redis
REDIS_URL=redis://localhost:6379
```

## Deployment

### Ubuntu Server

```bash
# Run setup script
chmod +x scripts/setup_server.sh
./scripts/setup_server.sh

# Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Systemd Service

```bash
# Install service
sudo cp deployment/systemd/crewai-server.service /etc/systemd/system/
sudo systemctl enable crewai-server
sudo systemctl start crewai-server
```

## Development

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Run with auto-reload
uvicorn main:app --host 0.0.0.0 --port 5001 --reload
```

## Crews Available

1. **Architect Crew** - Story structure analysis
2. **Director Crew** - Scene breakdown
3. **Specialist Crews** - Technical analysis
4. **Supervisor Crew** - Quality control

## License

MIT License
