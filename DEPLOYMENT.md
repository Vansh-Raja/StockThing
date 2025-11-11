# Deployment Guide

## GitHub Secrets Required

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Required Secrets

1. **SSH_PRIVATE_KEY**
   - Your SSH private key for accessing the Oracle Cloud server
   - Generate with: `ssh-keygen -t rsa -b 4096 -C "your_email@example.com"`
   - Copy the private key content (starts with `-----BEGIN RSA PRIVATE KEY-----`)

2. **SERVER_HOST**
   - Your Oracle Cloud server IP address or hostname
   - Example: `140.238.251.211`

3. **SERVER_USER**
   - SSH username for the server
   - Example: `ubuntu`

4. **PORT** (Optional)
   - Port number for the Next.js app (defaults to 3000 if not set)
   - Example: `3000`

## Server Setup

### Prerequisites

1. **Bun** - Will be automatically installed if not present
   - The deployment script will install the latest version
   - For version consistency, ensure the same Bun version is used in CI and production
2. **PM2** - Process manager for Node.js/Bun apps
   ```bash
   npm install -g pm2
   ```

### Version Management

The project uses `bun.lock` (similar to Python's `requirements.txt`) to ensure exact version matching:
- **`package.json`** - Defines dependencies (like requirements.txt)
- **`bun.lock`** - Locks exact versions (committed to repo for consistency)
- The deployment uses `--frozen-lockfile` flag to ensure exact versions match between environments

### Server Configuration

The deployment script will:
- Create `/home/{SERVER_USER}/Code/StockThing/` directory
- Copy frontend files to the server
- Install dependencies using Bun
- Build the Next.js app
- Start the app with PM2 on the specified port

### Manual Server Setup (if needed)

```bash
# Install PM2 globally
npm install -g pm2

# Navigate to app directory
cd /home/ubuntu/Code/StockThing/frontend

# Install dependencies
bun install

# Build the app
bun run build

# Start with PM2
PORT=3000 pm2 start bun --name "StockThing" -- run start

# Save PM2 configuration
pm2 save

# Enable PM2 to start on boot
pm2 startup
```

## Deployment Process

1. Push to `main` branch or manually trigger workflow
2. GitHub Actions will:
   - Checkout code
   - Install Bun
   - Install dependencies
   - Build Next.js app
   - Deploy to server via SSH
   - Start app with PM2

## Monitoring

- View logs: `pm2 logs StockThing`
- Check status: `pm2 status`
- Restart: `pm2 restart StockThing`
- Stop: `pm2 stop StockThing`

## Troubleshooting

- Check PM2 logs: `pm2 logs StockThing --lines 50`
- Verify port is open: `netstat -tulpn | grep 3000`
- Check firewall: `sudo ufw status`
- View system logs: `journalctl -u pm2-ubuntu`

