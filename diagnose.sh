#!/bin/bash
# Diagnostic script for Stock Portfolio Tracker deployment
# Run this on your server to diagnose connection issues

echo "🔍 Stock Portfolio Tracker Diagnostics"
echo "======================================"
echo ""

# Get the port (default to 3000)
PORT=${PORT:-3000}
APP_DIR="/home/$(whoami)/Code/StockThing/frontend"

echo "1. Checking if process is running..."
echo "-----------------------------------"

# Check PM2
if command -v pm2 > /dev/null 2>&1 || [ -f ~/.local/bin/pm2 ]; then
  PM2_CMD=$(command -v pm2 2>/dev/null || echo "$HOME/.local/bin/pm2")
  if $PM2_CMD list 2>/dev/null | grep -q StockThing; then
    echo "✅ PM2 process found:"
    $PM2_CMD list | grep StockThing
  else
    echo "❌ PM2 process 'StockThing' not found"
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

# Check systemd service
if systemctl --user list-units 2>/dev/null | grep -q stockthing; then
  echo "✅ Systemd service found:"
  systemctl --user status stockthing --no-pager -l | head -10
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
  echo "Last 20 lines of logs:"
  tail -20 "$APP_DIR/logs/app.log"
else
  echo "⚠️ Log file not found at $APP_DIR/logs/app.log"
fi

echo ""
echo "7. Checking environment variables..."
echo "-----------------------------------"
cd "$APP_DIR" 2>/dev/null || echo "⚠️ Cannot cd to $APP_DIR"
if [ -f logs/app.pid ]; then
  APP_PID=$(cat logs/app.pid)
  echo "Environment for PID $APP_PID:"
  cat /proc/$APP_PID/environ 2>/dev/null | tr '\0' '\n' | grep -E "PORT|HOSTNAME" || echo "⚠️ Cannot read process environment"
fi

echo ""
echo "8. Checking Oracle Cloud ingress rules..."
echo "-----------------------------------"
echo "⚠️ Please verify in Oracle Cloud Console:"
echo "   - Security List → Ingress Rules"
echo "   - Port $PORT should be open for 0.0.0.0/0 (or your IP)"
echo "   - Protocol: TCP"

echo ""
echo "======================================"
echo "Diagnostics complete!"

