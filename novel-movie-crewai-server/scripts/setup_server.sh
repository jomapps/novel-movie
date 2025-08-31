#!/bin/bash

# Novel Movie CrewAI Server Setup Script
# Ubuntu Server Setup for CrewAI deployment

set -e

echo "🚀 Setting up Novel Movie CrewAI Server on Ubuntu"
echo "=================================================="

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Python 3.11+
echo "🐍 Installing Python 3.11..."
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Install system dependencies
echo "📚 Installing system dependencies..."
sudo apt install -y \
    build-essential \
    curl \
    git \
    nginx \
    redis-server \
    supervisor \
    htop \
    ufw

# Create application user
echo "👤 Creating application user..."
sudo useradd -m -s /bin/bash crewai || echo "User already exists"
sudo usermod -aG sudo crewai

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/novel-movie-crewai-server
sudo chown crewai:crewai /opt/novel-movie-crewai-server

# Setup Python virtual environment
echo "🔧 Setting up Python virtual environment..."
sudo -u crewai python3.11 -m venv /opt/novel-movie-crewai-server/venv

# Install Python dependencies
echo "📦 Installing Python dependencies..."
sudo -u crewai /opt/novel-movie-crewai-server/venv/bin/pip install --upgrade pip
sudo -u crewai /opt/novel-movie-crewai-server/venv/bin/pip install wheel

# Configure Redis
echo "🔴 Configuring Redis..."
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 5001/tcp  # CrewAI server port
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# Create log directory
echo "📝 Creating log directory..."
sudo mkdir -p /var/log/crewai-server
sudo chown crewai:crewai /var/log/crewai-server

# Create systemd service directory
echo "⚙️ Preparing systemd service..."
sudo mkdir -p /etc/systemd/system

echo "✅ Server setup completed!"
echo ""
echo "Next steps:"
echo "1. Clone the CrewAI server repository to /opt/novel-movie-crewai-server"
echo "2. Copy .env.example to .env and configure"
echo "3. Run the deploy script: ./scripts/deploy.sh"
echo ""
echo "Repository should be cloned to: /opt/novel-movie-crewai-server"
echo "Make sure to set proper ownership: sudo chown -R crewai:crewai /opt/novel-movie-crewai-server"
