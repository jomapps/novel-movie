# Novel Movie CrewAI Server - Deployment Guide

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd novel-movie-crewai-server

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run the server
python main.py
```

Server will be available at: **http://localhost:5001**

### Docker Development

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f crewai-server

# Stop services
docker-compose down
```

## 🖥️ Ubuntu Server Deployment

### Step 1: Server Setup

```bash
# On your Ubuntu server
wget https://raw.githubusercontent.com/your-org/novel-movie-crewai-server/main/scripts/setup_server.sh
chmod +x setup_server.sh
./setup_server.sh
```

### Step 2: Clone Repository

```bash
# Clone to the application directory
sudo -u crewai git clone <repository-url> /opt/novel-movie-crewai-server
sudo chown -R crewai:crewai /opt/novel-movie-crewai-server
```

### Step 3: Configure Environment

```bash
cd /opt/novel-movie-crewai-server
sudo -u crewai cp .env.example .env
sudo -u crewai nano .env
```

**Required Environment Variables:**
```env
CREWAI_PORT=5001
PATHRAG_API_URL=http://movie.ft.tc:5000
NOVEL_MOVIE_API_URL=http://your-novel-movie-app.com
OPENROUTER_API_KEY=your-openrouter-key
REDIS_URL=redis://localhost:6379
```

### Step 4: Deploy

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Step 5: Verify Deployment

```bash
# Check service status
sudo systemctl status crewai-server

# Test the server
python test_server.py

# Check health endpoint
curl http://localhost:5001/health
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CREWAI_HOST` | Server host | `0.0.0.0` |
| `CREWAI_PORT` | Server port | `5001` |
| `CREWAI_WORKERS` | Worker processes | `4` |
| `PATHRAG_API_URL` | PathRAG service URL | `http://movie.ft.tc:5000` |
| `NOVEL_MOVIE_API_URL` | Novel Movie app URL | Required |
| `OPENROUTER_API_KEY` | OpenRouter API key | Required |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |

### Service Management

```bash
# Start service
sudo systemctl start crewai-server

# Stop service
sudo systemctl stop crewai-server

# Restart service
sudo systemctl restart crewai-server

# View logs
sudo journalctl -u crewai-server -f

# Check status
sudo systemctl status crewai-server
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Execute Crew
```bash
POST /crews/execute
Content-Type: application/json

{
  "crew_type": "architect",
  "project_id": "project-123",
  "user_id": "user-456",
  "input_data": {
    "story_text": "Your story content...",
    "preferences": {}
  },
  "config": {
    "temperature": 0.7,
    "verbose": true
  }
}
```

### Job Status
```bash
GET /crews/status/{job_id}
```

### Server Stats
```bash
GET /stats
```

## 🧪 Testing

### Run Test Suite
```bash
# Test local server
python test_server.py

# Test remote server
python test_server.py http://your-server:5001
```

### Manual Testing
```bash
# Health check
curl http://localhost:5001/health

# Stats
curl http://localhost:5001/stats

# Execute crew (example)
curl -X POST http://localhost:5001/crews/execute \
  -H "Content-Type: application/json" \
  -d '{
    "crew_type": "architect",
    "project_id": "test-123",
    "user_id": "test-user",
    "input_data": {
      "story_text": "Test story content"
    }
  }'
```

## 🔍 Monitoring

### Logs
```bash
# Service logs
sudo journalctl -u crewai-server -f

# Application logs (if configured)
tail -f /var/log/crewai-server/app.log
```

### Health Monitoring
```bash
# Simple health check script
#!/bin/bash
if curl -f http://localhost:5001/health > /dev/null 2>&1; then
    echo "✅ CrewAI server is healthy"
else
    echo "❌ CrewAI server is down"
    sudo systemctl restart crewai-server
fi
```

## 🚨 Troubleshooting

### Common Issues

1. **Service won't start**
   ```bash
   # Check logs
   sudo journalctl -u crewai-server -n 50
   
   # Check environment file
   sudo -u crewai cat /opt/novel-movie-crewai-server/.env
   
   # Test manually
   sudo -u crewai /opt/novel-movie-crewai-server/venv/bin/python /opt/novel-movie-crewai-server/main.py
   ```

2. **Port already in use**
   ```bash
   # Check what's using port 5001
   sudo lsof -i :5001
   
   # Change port in .env file
   CREWAI_PORT=5002
   ```

3. **Redis connection failed**
   ```bash
   # Check Redis status
   sudo systemctl status redis-server
   
   # Start Redis
   sudo systemctl start redis-server
   ```

4. **PathRAG connection issues**
   ```bash
   # Test PathRAG connectivity
   curl http://movie.ft.tc:5000/health
   
   # Check firewall
   sudo ufw status
   ```

### Performance Tuning

1. **Increase workers for high load**
   ```env
   CREWAI_WORKERS=8
   ```

2. **Adjust memory limits**
   ```bash
   # Edit systemd service
   sudo systemctl edit crewai-server
   
   # Add:
   [Service]
   MemoryMax=2G
   ```

## 🔐 Security

### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow ssh
sudo ufw allow 5001/tcp
sudo ufw enable
```

### SSL/HTTPS (with Nginx)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📈 Scaling

### Horizontal Scaling
- Deploy multiple CrewAI server instances
- Use load balancer (Nginx, HAProxy)
- Share Redis instance across servers

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Adjust worker count
- Optimize Redis configuration

## 🔄 Updates

### Update Deployment
```bash
cd /opt/novel-movie-crewai-server
sudo -u crewai git pull
./scripts/deploy.sh
```

### Rollback
```bash
sudo -u crewai git checkout previous-commit-hash
./scripts/deploy.sh
```
