# Installation Guide

Detailed installation instructions for the Novel Movie CrewAI Server.

## 📋 System Requirements

### Minimum Requirements
- **OS**: Ubuntu 20.04+, macOS 10.15+, Windows 10+
- **Python**: 3.11 or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 10GB free space
- **Network**: Stable internet connection

### Recommended Requirements
- **OS**: Ubuntu 22.04 LTS
- **Python**: 3.11
- **RAM**: 16GB
- **CPU**: 4+ cores
- **Storage**: 50GB SSD
- **Network**: High-speed internet for AI API calls

## 🐍 Python Installation

### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Verify installation
python3.11 --version
```

### macOS
```bash
# Using Homebrew
brew install python@3.11

# Verify installation
python3.11 --version
```

### Windows
1. Download Python 3.11 from [python.org](https://www.python.org/downloads/)
2. Run installer with "Add to PATH" checked
3. Verify in Command Prompt: `python --version`

## 📦 Dependencies Installation

### System Dependencies

**Ubuntu/Debian**:
```bash
sudo apt install -y \
    build-essential \
    curl \
    git \
    redis-server \
    nginx \
    supervisor
```

**macOS**:
```bash
# Using Homebrew
brew install git redis nginx
```

**Windows**:
- Install Git from [git-scm.com](https://git-scm.com/)
- Install Redis using Docker or WSL

### Redis Setup

**Ubuntu/Debian**:
```bash
# Install and start Redis
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Test Redis
redis-cli ping  # Should return "PONG"
```

**macOS**:
```bash
# Install and start Redis
brew install redis
brew services start redis

# Test Redis
redis-cli ping  # Should return "PONG"
```

**Windows/Docker**:
```bash
# Run Redis in Docker
docker run -d -p 6379:6379 --name redis redis:alpine

# Test Redis
docker exec redis redis-cli ping  # Should return "PONG"
```

## 🚀 Application Installation

### Method 1: Local Development

```bash
# 1. Clone repository
git clone https://github.com/your-org/novel-movie-crewai-server.git
cd novel-movie-crewai-server

# 2. Create virtual environment
python3.11 -m venv venv

# 3. Activate virtual environment
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 4. Upgrade pip
pip install --upgrade pip

# 5. Install dependencies
pip install -r requirements.txt

# 6. Configure environment
cp .env.example .env
# Edit .env file with your settings

# 7. Test installation
python main.py
```

### Method 2: Docker Installation

```bash
# 1. Clone repository
git clone https://github.com/your-org/novel-movie-crewai-server.git
cd novel-movie-crewai-server

# 2. Configure environment
cp .env.example .env
# Edit .env file with your settings

# 3. Build and run with Docker Compose
docker-compose up -d

# 4. Verify installation
docker-compose logs crewai-server
curl http://localhost:5001/health
```

### Method 3: Production Installation (Ubuntu)

```bash
# 1. Run automated setup
wget https://raw.githubusercontent.com/your-org/novel-movie-crewai-server/main/scripts/setup_server.sh
chmod +x setup_server.sh
sudo ./setup_server.sh

# 2. Clone repository
sudo -u crewai git clone https://github.com/your-org/novel-movie-crewai-server.git /opt/novel-movie-crewai-server
sudo chown -R crewai:crewai /opt/novel-movie-crewai-server

# 3. Configure and deploy
cd /opt/novel-movie-crewai-server
sudo -u crewai cp .env.example .env
sudo -u crewai nano .env  # Edit configuration
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## ⚙️ Configuration

### Environment Variables

Create and edit `.env` file:

```env
# Server Configuration
CREWAI_HOST=0.0.0.0
CREWAI_PORT=5001
CREWAI_WORKERS=4
CREWAI_LOG_LEVEL=INFO

# External Services
PATHRAG_API_URL=http://movie.ft.tc:5000
NOVEL_MOVIE_API_URL=http://localhost:3000
NOVEL_MOVIE_API_KEY=your-api-key-here

# AI Services
OPENROUTER_API_KEY=your-openrouter-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=anthropic/claude-sonnet-4

# Database and Queue
REDIS_URL=redis://localhost:6379

# Monitoring and Logging
SENTRY_DSN=your-sentry-dsn-here
LOG_LEVEL=INFO

# Environment
ENVIRONMENT=development
DEBUG=false
```

### Required API Keys

1. **OpenRouter API Key**:
   - Sign up at [OpenRouter](https://openrouter.ai/)
   - Get API key from dashboard
   - Add to `.env`: `OPENROUTER_API_KEY=your-key`

2. **Novel Movie API Key** (if required):
   - Get from Novel Movie application
   - Add to `.env`: `NOVEL_MOVIE_API_KEY=your-key`

## ✅ Verification

### Health Check
```bash
# Check server health
curl http://localhost:5001/health

# Expected response:
{
  "status": "healthy",
  "service": "novel-movie-crewai-server",
  "version": "1.0.0",
  "port": 5001
}
```

### Test Suite
```bash
# Run comprehensive tests
python test_server.py

# Expected output:
🧪 Testing Novel Movie CrewAI Server
==========================================
🔍 Running Health Check...
✅ Health check passed: healthy
...
🎉 All tests passed! CrewAI server is working correctly.
```

### Service Status (Production)
```bash
# Check systemd service
sudo systemctl status crewai-server

# Check logs
sudo journalctl -u crewai-server -n 20
```

## 🔧 Post-Installation Setup

### Development Environment

```bash
# Install development dependencies (if available)
pip install -r requirements-dev.txt

# Setup pre-commit hooks
pre-commit install

# Run code quality checks
black .
flake8 .
mypy .
```

### Production Environment

```bash
# Setup log rotation
sudo nano /etc/logrotate.d/crewai-server

# Configure monitoring
# (See monitoring documentation)

# Setup backup procedures
# (See operations documentation)
```

## 🚨 Troubleshooting

### Common Installation Issues

1. **Python Version Issues**:
   ```bash
   # Check Python version
   python3.11 --version
   
   # If not found, install Python 3.11
   # (See Python installation section above)
   ```

2. **Permission Errors**:
   ```bash
   # Fix ownership
   sudo chown -R $USER:$USER /path/to/novel-movie-crewai-server
   
   # Fix permissions
   chmod +x scripts/*.sh
   ```

3. **Redis Connection Issues**:
   ```bash
   # Check Redis status
   redis-cli ping
   
   # Start Redis if not running
   sudo systemctl start redis-server  # Ubuntu
   brew services start redis          # macOS
   ```

4. **Port Already in Use**:
   ```bash
   # Check what's using port 5001
   lsof -i :5001
   
   # Change port in .env file
   CREWAI_PORT=5002
   ```

5. **Missing Dependencies**:
   ```bash
   # Reinstall dependencies
   pip install -r requirements.txt --force-reinstall
   
   # Check for system dependencies
   sudo apt install build-essential python3.11-dev  # Ubuntu
   ```

### Getting Help

1. Check the [Troubleshooting Guide](../operations/troubleshooting.md)
2. Review installation logs
3. Verify all prerequisites are met
4. Check GitHub issues for similar problems

## 📚 Next Steps

After successful installation:

1. **Configure Services**: Set up external service connections
2. **Run Tests**: Validate installation with test suite
3. **Explore API**: Try the [Quick Start Guide](./quick-start.md)
4. **Deploy**: Follow [Deployment Guide](../deployment/ubuntu-server.md) for production

## 🔄 Updates

### Updating the Application

```bash
# Development
cd novel-movie-crewai-server
git pull
pip install -r requirements.txt
python main.py

# Production
cd /opt/novel-movie-crewai-server
sudo -u crewai git pull
sudo -u crewai ./venv/bin/pip install -r requirements.txt
sudo systemctl restart crewai-server
```

### Version Management

```bash
# Check current version
curl http://localhost:5001/health | jq '.version'

# View changelog
git log --oneline --since="1 month ago"
```

---

For more detailed setup instructions, see:
- [Quick Start Guide](./quick-start.md)
- [Configuration Guide](./configuration.md)
- [Deployment Guide](../deployment/ubuntu-server.md)
