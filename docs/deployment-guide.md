# Vybe Backend Deployment Guide

## Overview

This guide covers deploying the Vybe backend to an Oracle VPS using PM2 for process management.

## Server Details

- **Backend URL**: https://api.feelyourvybe.com
- **Server IP**: 158.178.204.36
- **Port**: 3003
- **Deployment Path**: /var/www/vybe
- **Database**: PostgreSQL (vybe_db)

## Prerequisites

### 1. Server Setup

Ensure your Oracle VPS has the following installed:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 or higher)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install git -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE vybe_db;
CREATE USER portfolio_user WITH PASSWORD 'SATOSANb6';
GRANT ALL PRIVILEGES ON DATABASE vybe_db TO portfolio_user;
\q
```

### 3. Nginx Setup (for reverse proxy)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/api.feelyourvybe.com
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name api.feelyourvybe.com;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/api.feelyourvybe.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Deployment Steps

### 1. Clone Repository

```bash
# Create deployment directory
sudo mkdir -p /var/www/vybe
sudo chown $USER:$USER /var/www/vybe

# Clone the repository
cd /var/www/vybe
git clone https://github.com/your-username/your-repo-name.git .
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd /var/www/vybe/backend

# Install dependencies
npm install --production

# Copy production environment file
cp .env.production .env

# Run database migrations (if any)
npm run migrate # or your migration command
```

### 3. PM2 Configuration

Create a PM2 ecosystem file:

```bash
nano /var/www/vybe/ecosystem.config.js
```

Add this configuration:

```javascript
module.exports = {
  apps: [
    {
      name: "vybe-backend",
      script: "./src/server.js",
      cwd: "/var/www/vybe/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3003,
      },
      error_file: "/var/www/vybe/logs/err.log",
      out_file: "/var/www/vybe/logs/out.log",
      log_file: "/var/www/vybe/logs/combined.log",
      time: true,
    },
  ],
};
```

### 4. Start Application

```bash
# Create logs directory
mkdir -p /var/www/vybe/logs

# Start with PM2
cd /var/www/vybe
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

## SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.feelyourvybe.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Useful Commands

### PM2 Management

```bash
# View running processes
pm2 list

# View logs
pm2 logs vybe-backend

# Restart application
pm2 restart vybe-backend

# Stop application
pm2 stop vybe-backend

# Monitor resources
pm2 monit
```

### Deployment Updates

```bash
# Pull latest changes
cd /var/www/vybe
git pull origin main

# Install new dependencies (if any)
cd backend
npm install --production

# Restart application
pm2 restart vybe-backend
```

### Database Management

```bash
# Connect to database
psql -U portfolio_user -d vybe_db -h localhost

# Backup database
pg_dump -U portfolio_user -h localhost vybe_db > backup.sql

# Restore database
psql -U portfolio_user -h localhost vybe_db < backup.sql
```

## Monitoring and Logs

### Application Logs

```bash
# PM2 logs
pm2 logs vybe-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring

```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node
```

## Security Considerations

1. **Firewall Setup**:

```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

2. **Regular Updates**:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
cd /var/www/vybe/backend
npm audit fix
```

3. **Environment Variables**:

- Never commit `.env.production` to version control
- Use strong JWT secrets
- Regularly rotate API keys and passwords

## Troubleshooting

### Common Issues

1. **Port Already in Use**:

```bash
sudo lsof -i :3003
sudo kill -9 <PID>
```

2. **Database Connection Issues**:

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

3. **Nginx Issues**:

```bash
# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

4. **PM2 Issues**:

```bash
# Kill all PM2 processes
pm2 kill

# Restart PM2
pm2 resurrect
```

## Backup Strategy

### Automated Backup Script

Create `/var/www/vybe/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/vybe"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U portfolio_user -h localhost vybe_db > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/vybe --exclude=/var/www/vybe/node_modules

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Make it executable and add to crontab:

```bash
chmod +x /var/www/vybe/backup.sh
crontab -e
# Add: 0 2 * * * /var/www/vybe/backup.sh
```

## Support

For issues or questions:

- Check application logs: `pm2 logs vybe-backend`
- Check system logs: `journalctl -u nginx`
- Monitor system resources: `htop`
- Contact: technical@feelyourvybe.com
