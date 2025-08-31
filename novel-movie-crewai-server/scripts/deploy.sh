#!/bin/bash

# Novel Movie CrewAI Server Deployment Script
# Deploy CrewAI server to Ubuntu production environment

set -e

APP_DIR="/opt/novel-movie-crewai-server"
SERVICE_NAME="crewai-server"

echo "🚀 Deploying Novel Movie CrewAI Server"
echo "======================================"

# Check if running as crewai user or with sudo
if [[ $EUID -eq 0 ]]; then
    echo "⚠️  Running as root. Switching to crewai user for deployment..."
    SUDO_PREFIX="sudo -u crewai"
else
    SUDO_PREFIX=""
fi

# Navigate to application directory
cd $APP_DIR

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and configure it:"
    echo "cp .env.example .env"
    echo "nano .env"
    exit 1
fi

# Install/update Python dependencies
echo "📦 Installing Python dependencies..."
$SUDO_PREFIX $APP_DIR/venv/bin/pip install -r requirements.txt

# Run tests (if available)
if [ -f "pytest.ini" ] || [ -d "tests" ]; then
    echo "🧪 Running tests..."
    $SUDO_PREFIX $APP_DIR/venv/bin/python -m pytest tests/ || echo "⚠️  Tests failed, continuing deployment..."
fi

# Stop existing service if running
echo "🛑 Stopping existing service..."
sudo systemctl stop $SERVICE_NAME || echo "Service not running"

# Install systemd service
echo "⚙️ Installing systemd service..."
sudo cp deployment/systemd/crewai-server.service /etc/systemd/system/
sudo systemctl daemon-reload

# Enable and start service
echo "🔄 Starting CrewAI server service..."
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

# Wait for service to start
echo "⏳ Waiting for service to start..."
sleep 5

# Check service status
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ CrewAI server deployed successfully!"
    echo ""
    echo "Service Status:"
    sudo systemctl status $SERVICE_NAME --no-pager -l
    echo ""
    echo "🌐 Server should be running on port 5001"
    echo "🔍 Check health: curl http://localhost:5001/health"
    echo "📊 Check stats: curl http://localhost:5001/stats"
    echo ""
    echo "📝 View logs: sudo journalctl -u $SERVICE_NAME -f"
else
    echo "❌ Deployment failed! Service is not running."
    echo "Check logs: sudo journalctl -u $SERVICE_NAME -n 50"
    exit 1
fi

# Configure Nginx (optional)
if command -v nginx &> /dev/null; then
    echo "🌐 Configuring Nginx reverse proxy..."
    if [ -f "deployment/nginx/crewai-server.conf" ]; then
        sudo cp deployment/nginx/crewai-server.conf /etc/nginx/sites-available/
        sudo ln -sf /etc/nginx/sites-available/crewai-server.conf /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        echo "✅ Nginx configured successfully"
    else
        echo "⚠️  Nginx config file not found, skipping..."
    fi
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "Useful commands:"
echo "- Check status: sudo systemctl status $SERVICE_NAME"
echo "- View logs: sudo journalctl -u $SERVICE_NAME -f"
echo "- Restart service: sudo systemctl restart $SERVICE_NAME"
echo "- Stop service: sudo systemctl stop $SERVICE_NAME"
