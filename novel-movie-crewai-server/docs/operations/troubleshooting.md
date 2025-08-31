# Troubleshooting Guide

Comprehensive troubleshooting guide for the Novel Movie CrewAI Server.

## 🚨 Quick Diagnostics

### Health Check Checklist
```bash
# 1. Server health
curl http://localhost:5001/health

# 2. Service status
sudo systemctl status crewai-server

# 3. Port availability
sudo lsof -i :5001

# 4. Redis connectivity
redis-cli ping

# 5. Log check
sudo journalctl -u crewai-server -n 20
```

## 🔧 Common Issues

### 1. Server Won't Start

#### Symptoms
- Service fails to start
- Port binding errors
- Import errors

#### Diagnosis
```bash
# Check service status
sudo systemctl status crewai-server

# View detailed logs
sudo journalctl -u crewai-server -n 50

# Test manual startup
sudo -u crewai /opt/novel-movie-crewai-server/venv/bin/python /opt/novel-movie-crewai-server/main.py
```

#### Solutions

**Port Already in Use**:
```bash
# Find process using port 5001
sudo lsof -i :5001

# Kill the process (if safe)
sudo kill -9 <PID>

# Or change port in .env
sudo -u crewai nano /opt/novel-movie-crewai-server/.env
# Change: CREWAI_PORT=5002
sudo systemctl restart crewai-server
```

**Python/Dependency Issues**:
```bash
# Reinstall dependencies
cd /opt/novel-movie-crewai-server
sudo -u crewai ./venv/bin/pip install --upgrade pip
sudo -u crewai ./venv/bin/pip install -r requirements.txt --force-reinstall
```

**Permission Issues**:
```bash
# Fix ownership
sudo chown -R crewai:crewai /opt/novel-movie-crewai-server
sudo chmod +x /opt/novel-movie-crewai-server/main.py
```

### 2. Redis Connection Failed

#### Symptoms
- Queue operations fail
- "Redis connection refused" errors
- Job status not updating

#### Diagnosis
```bash
# Check Redis status
sudo systemctl status redis-server

# Test Redis connection
redis-cli ping

# Check Redis configuration
sudo nano /etc/redis/redis.conf
```

#### Solutions

**Redis Not Running**:
```bash
# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Check status
sudo systemctl status redis-server
```

**Redis Configuration Issues**:
```bash
# Check Redis config
sudo nano /etc/redis/redis.conf

# Ensure these settings:
# bind 127.0.0.1
# port 6379
# protected-mode yes

# Restart Redis
sudo systemctl restart redis-server
```

**Connection String Issues**:
```bash
# Check .env file
sudo -u crewai cat /opt/novel-movie-crewai-server/.env | grep REDIS

# Should be: REDIS_URL=redis://localhost:6379
# Update if incorrect
sudo -u crewai nano /opt/novel-movie-crewai-server/.env
```

### 3. PathRAG Service Issues

#### Symptoms
- PathRAG tool errors
- Knowledge graph operations fail
- "PathRAG service unavailable" messages

#### Diagnosis
```bash
# Test PathRAG connectivity
curl http://movie.ft.tc:5000/health

# Check CrewAI server logs for PathRAG errors
sudo journalctl -u crewai-server | grep -i pathrag
```

#### Solutions

**PathRAG Service Down**:
- PathRAG service is currently in placeholder mode
- Server will use mock responses automatically
- Monitor PathRAG service status for updates

**Network Connectivity**:
```bash
# Test network connectivity
ping movie.ft.tc

# Check firewall rules
sudo ufw status

# Test specific port
telnet movie.ft.tc 5000
```

**Configuration Issues**:
```bash
# Verify PathRAG URL in .env
sudo -u crewai grep PATHRAG /opt/novel-movie-crewai-server/.env

# Should be: PATHRAG_API_URL=http://movie.ft.tc:5000
```

### 4. OpenRouter API Issues

#### Symptoms
- AI model requests fail
- "Invalid API key" errors
- Crew execution timeouts

#### Diagnosis
```bash
# Check API key configuration
sudo -u crewai grep OPENROUTER /opt/novel-movie-crewai-server/.env

# Test API key manually
curl -H "Authorization: Bearer your-key" https://openrouter.ai/api/v1/models
```

#### Solutions

**Invalid API Key**:
```bash
# Update API key in .env
sudo -u crewai nano /opt/novel-movie-crewai-server/.env
# Set: OPENROUTER_API_KEY=your-valid-key

# Restart service
sudo systemctl restart crewai-server
```

**Rate Limiting**:
- Check OpenRouter dashboard for usage limits
- Implement request throttling if needed
- Consider upgrading OpenRouter plan

### 5. Crew Execution Failures

#### Symptoms
- Jobs stuck in "running" status
- Crew execution timeouts
- Agent task failures

#### Diagnosis
```bash
# Check job status via API
curl http://localhost:5001/crews/status/your-job-id

# Check detailed logs
sudo journalctl -u crewai-server | grep -A 10 -B 10 "your-job-id"
```

#### Solutions

**Timeout Issues**:
```bash
# Increase timeout in .env
sudo -u crewai nano /opt/novel-movie-crewai-server/.env
# Add: CREW_TIMEOUT=600  # 10 minutes

# Restart service
sudo systemctl restart crewai-server
```

**Memory Issues**:
```bash
# Check memory usage
free -h
htop

# Increase system memory or reduce concurrent jobs
# Edit systemd service for memory limits
sudo systemctl edit crewai-server
# Add:
# [Service]
# MemoryMax=4G
```

### 6. Nginx/SSL Issues

#### Symptoms
- 502 Bad Gateway errors
- SSL certificate errors
- Domain not accessible

#### Diagnosis
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Check SSL certificate
sudo certbot certificates
```

#### Solutions

**Nginx Configuration Errors**:
```bash
# Fix configuration
sudo nano /etc/nginx/sites-available/crewai-server.conf

# Test configuration
sudo nginx -t

# Reload if valid
sudo systemctl reload nginx
```

**SSL Certificate Issues**:
```bash
# Renew certificate
sudo certbot renew

# Force renewal if needed
sudo certbot renew --force-renewal

# Check auto-renewal
sudo certbot renew --dry-run
```

## 📊 Performance Issues

### High CPU Usage

#### Diagnosis
```bash
# Monitor CPU usage
htop
top -p $(pgrep -f crewai-server)

# Check concurrent jobs
curl http://localhost:5001/stats
```

#### Solutions
```bash
# Reduce concurrent workers
sudo -u crewai nano /opt/novel-movie-crewai-server/.env
# Set: CREWAI_WORKERS=2

# Restart service
sudo systemctl restart crewai-server
```

### High Memory Usage

#### Diagnosis
```bash
# Check memory usage
free -h
ps aux | grep crewai

# Monitor memory over time
watch -n 5 'free -h'
```

#### Solutions
```bash
# Set memory limits
sudo systemctl edit crewai-server
# Add:
# [Service]
# MemoryMax=2G
# MemoryHigh=1.5G

# Restart service
sudo systemctl daemon-reload
sudo systemctl restart crewai-server
```

### Slow Response Times

#### Diagnosis
```bash
# Test response times
time curl http://localhost:5001/health

# Check queue length
curl http://localhost:5001/stats | jq '.active_jobs'

# Monitor logs for slow operations
sudo journalctl -u crewai-server | grep -i "slow\|timeout"
```

#### Solutions
- Optimize crew configurations
- Reduce AI model temperature for faster responses
- Implement caching for repeated operations
- Scale horizontally with multiple server instances

## 🔍 Debugging Tools

### Log Analysis
```bash
# Real-time log monitoring
sudo journalctl -u crewai-server -f

# Search for specific errors
sudo journalctl -u crewai-server | grep -i "error\|exception\|failed"

# Filter by time range
sudo journalctl -u crewai-server --since "1 hour ago"
```

### Network Debugging
```bash
# Test external service connectivity
curl -v http://movie.ft.tc:5000/health
curl -v https://openrouter.ai/api/v1/models

# Check DNS resolution
nslookup movie.ft.tc
dig movie.ft.tc

# Monitor network traffic
sudo netstat -tulpn | grep :5001
```

### Process Debugging
```bash
# Check process tree
pstree -p $(pgrep -f crewai-server)

# Monitor file descriptors
lsof -p $(pgrep -f crewai-server)

# Check system resources
iostat -x 1
vmstat 1
```

## 📞 Getting Help

### Information to Collect
When reporting issues, include:

1. **System Information**:
   ```bash
   uname -a
   lsb_release -a
   python3.11 --version
   ```

2. **Service Status**:
   ```bash
   sudo systemctl status crewai-server
   curl http://localhost:5001/health
   curl http://localhost:5001/stats
   ```

3. **Recent Logs**:
   ```bash
   sudo journalctl -u crewai-server -n 100 --no-pager
   ```

4. **Configuration** (sanitized):
   ```bash
   sudo -u crewai cat /opt/novel-movie-crewai-server/.env | sed 's/=.*/=***/'
   ```

### Support Channels
1. Check this troubleshooting guide
2. Review [GitHub Issues](https://github.com/your-org/novel-movie-crewai-server/issues)
3. Create new issue with collected information
4. Contact development team

## 📋 Frequently Asked Questions

### Q: Can I run multiple CrewAI servers?
A: Yes, you can run multiple instances behind a load balancer. Ensure they share the same Redis instance for job coordination.

### Q: How do I backup the server configuration?
A: Backup the `.env` file and any custom configurations:
```bash
sudo cp /opt/novel-movie-crewai-server/.env /backup/
sudo cp -r /opt/novel-movie-crewai-server/deployment/ /backup/
```

### Q: How do I update the server?
A: Use the deployment script:
```bash
cd /opt/novel-movie-crewai-server
sudo -u crewai git pull
./scripts/deploy.sh
```

### Q: What's the difference between development and production modes?
A: Production mode has optimized settings, proper logging, and security configurations. Development mode includes debug features and auto-reload.

---

If you can't find a solution here, check the [GitHub Issues](https://github.com/your-org/novel-movie-crewai-server/issues) or create a new issue with detailed information about your problem.
