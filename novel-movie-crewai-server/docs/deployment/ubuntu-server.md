# Ubuntu Server Deployment Guide

Complete guide for deploying the Novel Movie CrewAI Server on Ubuntu in production.

## 🎯 Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04 LTS or 22.04 LTS
- **CPU**: 4+ cores (8+ recommended)
- **RAM**: 8GB minimum (16GB+ recommended)
- **Storage**: 50GB+ SSD
- **Network**: Stable internet connection

### Access Requirements
- SSH access to Ubuntu server
- Sudo privileges
- Domain name (optional, for SSL)

## 🚀 Quick Deployment

### Automated Setup (Recommended)

```bash
# 1. Download and run setup script
wget https://raw.githubusercontent.com/your-org/novel-movie-crewai-server/main/scripts/setup_server.sh
chmod +x setup_server.sh
sudo ./setup_server.sh

# 2. Clone repository
sudo -u crewai git clone https://github.com/your-org/novel-movie-crewai-server.git /opt/novel-movie-crewai-server
sudo chown -R crewai:crewai /opt/novel-movie-crewai-server

# 3. Configure environment
cd /opt/novel-movie-crewai-server
sudo -u crewai cp .env.example .env
sudo -u crewai nano .env  # Edit configuration

# 4. Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 📋 Manual Setup (Step by Step)

### Step 1: System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Install system dependencies
sudo apt install -y \
    build-essential \
    curl \
    git \
    nginx \
    redis-server \
    supervisor \
    htop \
    ufw \
    certbot \
    python3-certbot-nginx
```

### Step 2: User and Directory Setup

```bash
# Create application user
sudo useradd -m -s /bin/bash crewai
sudo usermod -aG sudo crewai

# Create application directory
sudo mkdir -p /opt/novel-movie-crewai-server
sudo chown crewai:crewai /opt/novel-movie-crewai-server

# Create log directory
sudo mkdir -p /var/log/crewai-server
sudo chown crewai:crewai /var/log/crewai-server
```

### Step 3: Application Setup

```bash
# Clone repository
sudo -u crewai git clone https://github.com/your-org/novel-movie-crewai-server.git /opt/novel-movie-crewai-server

# Set permissions
sudo chown -R crewai:crewai /opt/novel-movie-crewai-server

# Switch to application directory
cd /opt/novel-movie-crewai-server

# Create virtual environment
sudo -u crewai python3.11 -m venv venv

# Install dependencies
sudo -u crewai ./venv/bin/pip install --upgrade pip
sudo -u crewai ./venv/bin/pip install -r requirements.txt
```

### Step 4: Configuration

```bash
# Copy environment template
sudo -u crewai cp .env.example .env

# Edit configuration
sudo -u crewai nano .env
```

**Required Environment Variables**:
```env
# Server Configuration
CREWAI_HOST=0.0.0.0
CREWAI_PORT=5001
CREWAI_WORKERS=4
CREWAI_LOG_LEVEL=INFO

# External Services
PATHRAG_API_URL=http://movie.ft.tc:5000
NOVEL_MOVIE_API_URL=https://your-novel-movie-app.com
NOVEL_MOVIE_API_KEY=your-api-key-here

# AI Services
OPENROUTER_API_KEY=your-openrouter-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Database and Queue
REDIS_URL=redis://localhost:6379

# Environment
ENVIRONMENT=production
DEBUG=false
```

### Step 5: Service Configuration

```bash
# Install systemd service
sudo cp deployment/systemd/crewai-server.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable crewai-server

# Configure Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 5001/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### Step 6: Nginx Configuration

```bash
# Copy Nginx configuration
sudo cp deployment/nginx/crewai-server.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/crewai-server.conf /etc/nginx/sites-enabled/

# Edit domain name in config
sudo nano /etc/nginx/sites-available/crewai-server.conf
# Replace 'your-domain.com' with your actual domain

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: SSL Certificate (Optional)

```bash
# Get SSL certificate with Certbot
sudo certbot --nginx -d your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 8: Start Services

```bash
# Start CrewAI server
sudo systemctl start crewai-server

# Check status
sudo systemctl status crewai-server

# View logs
sudo journalctl -u crewai-server -f
```

## ✅ Verification

### Health Check
```bash
# Local check
curl http://localhost:5001/health

# External check (if domain configured)
curl https://your-domain.com/health
```

### Run Test Suite
```bash
cd /opt/novel-movie-crewai-server
sudo -u crewai python test_server.py
```

### Service Status
```bash
# Check all services
sudo systemctl status crewai-server
sudo systemctl status redis-server
sudo systemctl status nginx

# Check logs
sudo journalctl -u crewai-server -n 50
```

## 🔧 Configuration Management

### Environment Variables
Edit `/opt/novel-movie-crewai-server/.env`:

```bash
sudo -u crewai nano /opt/novel-movie-crewai-server/.env
# Restart service after changes
sudo systemctl restart crewai-server
```

### Service Configuration
Edit systemd service:

```bash
sudo systemctl edit crewai-server
# Add overrides in the editor
sudo systemctl daemon-reload
sudo systemctl restart crewai-server
```

### Nginx Configuration
Edit Nginx config:

```bash
sudo nano /etc/nginx/sites-available/crewai-server.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoring

### Service Monitoring
```bash
# Service status
sudo systemctl status crewai-server

# Real-time logs
sudo journalctl -u crewai-server -f

# Resource usage
htop
```

### Application Monitoring
```bash
# Health check
curl http://localhost:5001/health

# Server stats
curl http://localhost:5001/stats

# Redis status
redis-cli ping
```

### Log Files
- **Application logs**: `/var/log/crewai-server/`
- **System logs**: `sudo journalctl -u crewai-server`
- **Nginx logs**: `/var/log/nginx/crewai-server.*.log`

## 🔄 Maintenance

### Updates
```bash
cd /opt/novel-movie-crewai-server
sudo -u crewai git pull
sudo -u crewai ./venv/bin/pip install -r requirements.txt
sudo systemctl restart crewai-server
```

### Backup
```bash
# Backup configuration
sudo cp /opt/novel-movie-crewai-server/.env /backup/crewai-env-$(date +%Y%m%d).bak

# Backup logs
sudo tar -czf /backup/crewai-logs-$(date +%Y%m%d).tar.gz /var/log/crewai-server/
```

### Log Rotation
```bash
# Setup logrotate
sudo nano /etc/logrotate.d/crewai-server

# Add configuration:
/var/log/crewai-server/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 crewai crewai
    postrotate
        systemctl reload crewai-server
    endscript
}
```

## 🚨 Troubleshooting

### Service Won't Start
```bash
# Check service status
sudo systemctl status crewai-server

# Check logs
sudo journalctl -u crewai-server -n 50

# Test manually
sudo -u crewai /opt/novel-movie-crewai-server/venv/bin/python /opt/novel-movie-crewai-server/main.py
```

### Port Issues
```bash
# Check what's using port 5001
sudo lsof -i :5001

# Change port in .env if needed
sudo -u crewai nano /opt/novel-movie-crewai-server/.env
sudo systemctl restart crewai-server
```

### Redis Issues
```bash
# Check Redis status
sudo systemctl status redis-server

# Test Redis connection
redis-cli ping

# Restart Redis
sudo systemctl restart redis-server
```

### Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## 🔒 Security Hardening

### Firewall Configuration
```bash
# Restrict SSH access (optional)
sudo ufw limit ssh

# Allow only necessary ports
sudo ufw deny 5001  # Block direct access to app
sudo ufw allow 'Nginx Full'
sudo ufw reload
```

### Service Security
```bash
# Restrict service user permissions
sudo usermod -s /usr/sbin/nologin crewai

# Set proper file permissions
sudo chmod 600 /opt/novel-movie-crewai-server/.env
sudo chown crewai:crewai /opt/novel-movie-crewai-server/.env
```

### SSL Security
```bash
# Test SSL configuration
sudo certbot certificates

# Update SSL settings in Nginx
sudo nano /etc/nginx/sites-available/crewai-server.conf
# Add security headers and SSL optimizations
```

---

For additional help, see the [Troubleshooting Guide](../operations/troubleshooting.md) or [Monitoring Guide](./monitoring.md).
