#!/bin/bash
# Diagnostic script for Stock Portfolio Tracker deployment
# Run this on your server to diagnose connection issues

echo "🔍 Stock Portfolio Tracker Diagnostics"
echo "======================================"
echo ""

# Detect actual user (handle sudo)
if [ -n "$SUDO_USER" ]; then
  ACTUAL_USER="$SUDO_USER"
else
  ACTUAL_USER="$(whoami)"
fi

# Get the port (default to 3000)
PORT=${PORT:-3000}
APP_DIR="/home/$ACTUAL_USER/Code/StockThing/frontend"

echo "Running as user: $ACTUAL_USER"
echo "App directory: $APP_DIR"
echo ""

echo "1. Checking if process is running..."
echo "-----------------------------------"

# Check PM2 (try both current user and actual user)
PM2_CMD=""
if command -v pm2 > /dev/null 2>&1; then
  PM2_CMD="pm2"
elif [ -f "/home/$ACTUAL_USER/.local/bin/pm2" ]; then
  PM2_CMD="/home/$ACTUAL_USER/.local/bin/pm2"
elif [ -f "$HOME/.local/bin/pm2" ]; then
  PM2_CMD="$HOME/.local/bin/pm2"
fi

if [ -n "$PM2_CMD" ] && $PM2_CMD list 2>/dev/null | grep -q StockThing; then
  echo "✅ PM2 process found:"
  $PM2_CMD list | grep StockThing
else
  echo "❌ PM2 process 'StockThing' not found"
  # Check if PM2 is installed but no process
  if [ -n "$PM2_CMD" ]; then
    echo "   PM2 is installed at: $PM2_CMD"
    echo "   PM2 processes:"
    $PM2_CMD list 2>/dev/null || echo "   (No PM2 processes)"
  else
    echo "   PM2 not found"
  fi
fi

# Check nohup/systemd
if [ -f "$APP_DIR/logs/app.pid" ]; then
  APP_PID=$(cat "$APP_DIR/logs/app.pid" 2>/dev/null)
  if ps -p "$APP_PID" > /dev/null 2>&1; then
    echo "✅ Process running (PID: $APP_PID)"
  else
    echo "❌ Process not running (PID file exists but process is dead)"
  fi
fi

# Check systemd service (as actual user)
if sudo -u "$ACTUAL_USER" systemctl --user list-units 2>/dev/null | grep -q stockthing; then
  echo "✅ Systemd service found:"
  sudo -u "$ACTUAL_USER" systemctl --user status stockthing --no-pager -l 2>/dev/null | head -10 || true
else
  echo "⚠️ Systemd service not found or not accessible"
fi

echo ""
echo "2. Checking what's listening on port $PORT..."
echo "-----------------------------------"
if command -v ss > /dev/null 2>&1; then
  LISTENING=$(ss -tlnp | grep ":$PORT ")
  if [ -n "$LISTENING" ]; then
    echo "✅ Found listener:"
    echo "$LISTENING"
  else
    echo "❌ Nothing listening on port $PORT"
  fi
elif command -v netstat > /dev/null 2>&1; then
  LISTENING=$(netstat -tlnp | grep ":$PORT ")
  if [ -n "$LISTENING" ]; then
    echo "✅ Found listener:"
    echo "$LISTENING"
  else
    echo "❌ Nothing listening on port $PORT"
  fi
else
  echo "⚠️ ss/netstat not available"
fi

echo ""
echo "3. Checking network binding..."
echo "-----------------------------------"
if command -v ss > /dev/null 2>&1; then
  BINDING=$(ss -tlnp | grep ":$PORT " | awk '{print $4}')
  if echo "$BINDING" | grep -q "0.0.0.0"; then
    echo "✅ Listening on 0.0.0.0:$PORT (accessible externally)"
  elif echo "$BINDING" | grep -q "127.0.0.1"; then
    echo "❌ Only listening on 127.0.0.1:$PORT (NOT accessible externally)"
    echo "   Fix: Set HOSTNAME=0.0.0.0 environment variable"
  else
    echo "⚠️ Binding: $BINDING"
  fi
fi

echo ""
echo "4. Checking firewall status..."
echo "-----------------------------------"
if command -v ufw > /dev/null 2>&1; then
  echo "UFW Status:"
  ufw status | head -5
  if ufw status | grep -q "$PORT"; then
    echo "✅ Port $PORT found in ufw rules"
  else
    echo "⚠️ Port $PORT not found in ufw rules"
    echo "   Run: sudo ufw allow $PORT/tcp"
  fi
else
  echo "⚠️ ufw not available"
fi

echo ""
echo "5. Testing local connection..."
echo "-----------------------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT 2>&1 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "500" ]; then
  echo "✅ Server responding locally (HTTP $HTTP_CODE)"
else
  echo "❌ Server not responding locally (HTTP $HTTP_CODE)"
fi

echo ""
echo "6. Checking application logs..."
echo "-----------------------------------"
if [ -f "$APP_DIR/logs/app.log" ]; then
  echo "Last 30 lines of logs:"
  tail -30 "$APP_DIR/logs/app.log"
elif [ -f "/home/$ACTUAL_USER/Code/StockThing/frontend/logs/app.log" ]; then
  echo "Found log at alternative location:"
  tail -30 "/home/$ACTUAL_USER/Code/StockThing/frontend/logs/app.log"
else
  echo "⚠️ Log file not found at $APP_DIR/logs/app.log"
  echo "   Checking for any log files..."
  find /home/$ACTUAL_USER/Code/StockThing -name "*.log" -type f 2>/dev/null | head -5 || echo "   No log files found"
fi

echo ""
echo "7. Checking for running processes..."
echo "-----------------------------------"
echo "Checking for bun/next processes:"
ps aux | grep -E "bun.*start|next.*start" | grep -v grep || echo "   No bun/next processes found"

echo ""
echo "8. Checking environment variables..."
echo "-----------------------------------"
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR" 2>/dev/null || echo "⚠️ Cannot cd to $APP_DIR"
  if [ -f logs/app.pid ]; then
    APP_PID=$(cat logs/app.pid)
    if ps -p "$APP_PID" > /dev/null 2>&1; then
      echo "Environment for PID $APP_PID:"
      cat /proc/$APP_PID/environ 2>/dev/null | tr '\0' '\n' | grep -E "PORT|HOSTNAME" || echo "⚠️ Cannot read process environment"
    else
      echo "⚠️ PID file exists but process is dead (PID: $APP_PID)"
    fi
  else
    echo "⚠️ PID file not found at $APP_DIR/logs/app.pid"
  fi
else
  echo "⚠️ App directory not found: $APP_DIR"
fi

echo ""
echo "9. Checking if app can be started..."
echo "-----------------------------------"
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR" 2>/dev/null
  if [ -f ".next/BUILD_ID" ]; then
    echo "✅ App is built (.next directory exists)"
    if [ -f "package.json" ]; then
      echo "✅ package.json found"
      if command -v bun > /dev/null 2>&1; then
        echo "✅ Bun is installed: $(bun --version)"
      else
        echo "❌ Bun not found in PATH"
      fi
    else
      echo "❌ package.json not found"
    fi
  else
    echo "❌ App not built (.next directory missing)"
    echo "   Run: cd $APP_DIR && bun install && bun run build"
  fi
else
  echo "❌ App directory not found: $APP_DIR"
fi

echo ""
echo "10. Checking Oracle Cloud ingress rules..."
echo "-----------------------------------"
echo "⚠️ Please verify in Oracle Cloud Console:"
echo "   - Security List → Ingress Rules"
echo "   - Port $PORT should be open for 0.0.0.0/0 (or your IP)"
echo "   - Protocol: TCP"

echo ""
echo "======================================"
echo "Diagnostics complete!"
echo ""
echo "💡 If the app is not running, try:"
echo "   cd $APP_DIR"
echo "   PORT=$PORT bun --bun node_modules/.bin/next start -H 0.0.0.0 -p $PORT"

