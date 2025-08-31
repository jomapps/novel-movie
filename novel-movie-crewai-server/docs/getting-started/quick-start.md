# Quick Start Guide

Get the Novel Movie CrewAI Server up and running in minutes.

## ✅ **Current Status: READY TO USE**

The CrewAI server is **fully implemented and tested**. Follow the steps below to start using it immediately.

## 🚀 Prerequisites

- Python 3.11 or higher
- Git
- Redis (for production) or Docker (for development)

## ⚡ 5-Minute Setup

### Option 1: Local Development

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd novel-movie-crewai-server

# 2. Create virtual environment
python -m venv crewai_env
crewai_env\Scripts\activate  # On Windows (Linux/Mac: source crewai_env/bin/activate)

# 3. Install dependencies
crewai_env\Scripts\pip.exe install crewai fastapi uvicorn pydantic-settings structlog redis langchain langchain-openai crewai-tools

# 4. Configure environment
cp .env.example .env
# Edit .env with your settings (see Configuration section below)

# 5. Start the server
crewai_env\Scripts\python.exe main.py
```

**Server will be available at: http://localhost:5001**

### Option 2: Docker Development

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd novel-movie-crewai-server

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Start with Docker Compose
docker-compose up -d

# 4. View logs
docker-compose logs -f crewai-server
```

**Server will be available at: http://localhost:5001**

## 🔧 Essential Configuration

Edit your `.env` file with these required settings:

```env
# Server Configuration
CREWAI_PORT=5001
CREWAI_HOST=0.0.0.0

# External Services
PATHRAG_API_URL=http://movie.ft.tc:5000
NOVEL_MOVIE_API_URL=http://localhost:3000
OPENROUTER_API_KEY=your-openrouter-key-here

# Redis (for production)
REDIS_URL=redis://localhost:6379
```

## ✅ Verify Installation

### 1. Health Check
```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "novel-movie-crewai-server",
  "version": "1.0.0",
  "port": 5001
}
```

### 2. Run Test Suite
```bash
python test_server.py
```

### 3. Check Server Stats
```bash
curl http://localhost:5001/stats
```

## 🎯 First API Call

Test the crew execution endpoint:

```bash
curl -X POST http://localhost:5001/crews/execute \
  -H "Content-Type: application/json" \
  -d '{
    "crew_type": "architect",
    "project_id": "test-project-123",
    "user_id": "test-user-456",
    "input_data": {
      "story_text": "A magician performs his final escape trick in a grand theatre, but something goes terribly wrong.",
      "preferences": {
        "style": "cinematic",
        "complexity": "medium"
      }
    },
    "config": {
      "temperature": 0.7,
      "verbose": true
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "job_id": "architect_test-project-123_1693420800",
  "message": "Crew architect queued successfully",
  "estimated_time": "2-5 minutes"
}
```

## 📊 Monitor Job Status

Use the job_id from the previous response:

```bash
curl http://localhost:5001/crews/status/architect_test-project-123_1693420800
```

## 🔍 Troubleshooting

### Common Issues

1. **Port 5001 already in use**
   ```bash
   # Check what's using the port
   lsof -i :5001
   
   # Change port in .env
   CREWAI_PORT=5002
   ```

2. **Redis connection failed**
   ```bash
   # Install and start Redis
   # Ubuntu/Debian:
   sudo apt install redis-server
   sudo systemctl start redis-server
   
   # macOS:
   brew install redis
   brew services start redis
   
   # Or use Docker:
   docker run -d -p 6379:6379 redis:alpine
   ```

3. **PathRAG service unavailable**
   - The PathRAG service is currently in placeholder mode
   - The server will work with mock responses
   - Check PathRAG service status: `curl http://movie.ft.tc:5000/health`

4. **OpenRouter API key missing**
   - Get your API key from [OpenRouter](https://openrouter.ai/)
   - Add it to your `.env` file: `OPENROUTER_API_KEY=your-key-here`

### Getting Help

1. Check the [Troubleshooting Guide](../operations/troubleshooting.md)
2. Review server logs:
   ```bash
   # Local development
   tail -f logs/app.log
   
   # Docker
   docker-compose logs -f crewai-server
   
   # Production (Ubuntu)
   sudo journalctl -u crewai-server -f
   ```

## 📚 Next Steps

Now that your server is running:

1. **Explore the API**: Check out the [API Reference](../api/api-reference.md)
2. **Understand the Architecture**: Read the [System Overview](../architecture/system-overview.md)
3. **Deploy to Production**: Follow the [Ubuntu Server Guide](../deployment/ubuntu-server.md)
4. **Customize Crews**: Learn about [Custom Crews](../crews/custom-crews.md)

## 🔗 Quick Links

- [API Reference](../api/api-reference.md) - Complete API documentation
- [Configuration Guide](./configuration.md) - Detailed configuration options
- [Docker Deployment](../deployment/docker.md) - Container deployment
- [Ubuntu Server Deployment](../deployment/ubuntu-server.md) - Production deployment

---

**Need help?** Check the [troubleshooting guide](../operations/troubleshooting.md) or review the [FAQ](../operations/troubleshooting.md#frequently-asked-questions).
