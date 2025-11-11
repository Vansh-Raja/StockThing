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

5. **SETUP_NGINX** (Optional)
   - Set to `true` or `yes` to automatically set up Nginx reverse proxy
   - Defaults to `false` if not set
   - Example: `true`

6. **NGINX_DOMAIN** (Optional, defaults to `stockthing.vanshraja.me`)
   - Domain name/subdomain for Nginx configuration
   - Example: `stockthing.vanshraja.me`

7. **NGINX_PORT** (Optional, defaults to `8080`)
   - Custom port for Nginx to listen on (useful for multiple apps on same server)
   - Defaults to `8080` if not set
   - Example: `8080`, `8081`, `9000`

## Server Setup

### Prerequisites

1. **Bun** - Will be automatically installed if not present
   - The deployment script will install the latest version
   - For version consistency, ensure the same Bun version is used in CI and production
2. **Process Manager** - The script will try PM2 first, fallback to nohup if PM2 fails
   - **PM2** (preferred): Will be installed to user directory (`~/.local/bin/pm2`) if not found
   - **nohup** (fallback): Simple background process, no installation needed
   - PM2 provides better process management (auto-restart, monitoring, logs)
   - nohup is simpler but requires manual process management

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
   - Build Next.js app (for CI validation)
   - Deploy to server via SSH
   - Install dependencies on server
   - Build Next.js app on server
   - Start app with PM2 or nohup
   - Optionally set up Nginx reverse proxy (if SETUP_NGINX=true)

## Nginx Reverse Proxy (Optional)

The deployment script can automatically set up Nginx as a reverse proxy:

### Benefits:
- Access app via custom domain and port (e.g., `stockthing.vanshraja.me:8080`)
- Better security and performance
- Support for multiple apps on same server (each on different port)
- Easier SSL/TLS setup later
- Health check endpoint at `/health`

### Setup:
1. **DNS Configuration** (Required):
   - Point your subdomain `stockthing.vanshraja.me` to your server's IP address
   - Add an A record: `stockthing` → `your-server-ip`

2. **GitHub Secrets**:
   - `SETUP_NGINX`: Set to `true` or `yes`
   - `NGINX_DOMAIN`: Your subdomain (defaults to `stockthing.vanshraja.me`)
   - `NGINX_PORT`: Custom port (defaults to `8080`)

3. The script will automatically:
   - Install Nginx if not present
   - Create configuration file for your subdomain
   - Enable the site
   - Test and reload Nginx
   - Configure firewall for the custom port

### Access:
- Via domain: `http://stockthing.vanshraja.me:8080`
- Via IP: `http://your-server-ip:8080`
- Health check: `http://stockthing.vanshraja.me:8080/health`

### Multiple Apps on Same Server:
Each app should use a different `NGINX_PORT`:
- App 1: `NGINX_PORT=8080`, `NGINX_DOMAIN=app1.vanshraja.me`
- App 2: `NGINX_PORT=8081`, `NGINX_DOMAIN=app2.vanshraja.me`
- App 3: `NGINX_PORT=8082`, `NGINX_DOMAIN=app3.vanshraja.me`

### Manual Nginx Management:
```bash
# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx
```

## Auto-Start on Boot

The app is configured to automatically start on system reboot:

- **PM2**: Uses `pm2 startup` to create a system service
- **nohup fallback**: Creates a systemd user service (`~/.config/systemd/user/stockthing.service`)

Both methods ensure the app restarts automatically after server reboots.

## Monitoring

### If using PM2:
- View logs: `pm2 logs StockThing` or `~/.local/bin/pm2 logs StockThing`
- Check status: `pm2 status` or `~/.local/bin/pm2 status`
- Restart: `pm2 restart StockThing` or `~/.local/bin/pm2 restart StockThing`
- Stop: `pm2 stop StockThing` or `~/.local/bin/pm2 stop StockThing`

### If using nohup/systemd:
- View logs: `tail -f logs/app.log` or `journalctl --user -u stockthing -f`
- Check status: `systemctl --user status stockthing` or `ps -p $(cat logs/app.pid)`
- Restart: `systemctl --user restart stockthing`
- Stop: `systemctl --user stop stockthing`
- Enable/disable auto-start: `systemctl --user enable stockthing` / `systemctl --user disable stockthing`

## Troubleshooting

- Check PM2 logs: `pm2 logs StockThing --lines 50`
- Verify port is open: `netstat -tulpn | grep 3000`
- Check firewall: `sudo ufw status`
- View system logs: `journalctl -u pm2-ubuntu`

