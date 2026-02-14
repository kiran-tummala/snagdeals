#!/usr/bin/env bash
set -euo pipefail

# Usage: sudo ./setup.sh your.domain.com
DOMAIN=${1:-}
if [ -z "$DOMAIN" ]; then
  echo "Usage: sudo $0 your.domain.com" >&2
  exit 1
fi

echo "Updating system and installing dependencies..."
apt update && apt upgrade -y
apt install -y docker.io nginx certbot python3-certbot-nginx ufw

echo "Installing Docker Compose plugin..."
apt install -y docker-compose-plugin || true

echo "Enabling Docker service..."
systemctl enable --now docker

mkdir -p /opt/snagdeals
cp ./docker-compose.n8n.yml /opt/snagdeals/docker-compose.yml || true

echo "Setting up firewall (allow OpenSSH, HTTP, HTTPS)..."
ufw allow OpenSSH
ufw allow http
ufw allow https
ufw --force enable

echo "Creating webroot for certbot..."
mkdir -p /var/www/certbot

echo "Deploying frontend to /var/www/snagdeals..."
mkdir -p /var/www/snagdeals
cp -r ../frontend/dist/* /var/www/snagdeals/ || echo "Warning: frontend/dist not found — build frontend first"

echo "Copy nginx config template and replace domain placeholder..."
mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
cp ./nginx/snagdeals.conf /etc/nginx/sites-available/snagdeals.conf
sed -i "s/YOUR_DOMAIN_HERE/${DOMAIN}/g" /etc/nginx/sites-available/snagdeals.conf
ln -sf /etc/nginx/sites-available/snagdeals.conf /etc/nginx/sites-enabled/snagdeals.conf

echo "Testing nginx config and reloading..."
nginx -t
systemctl reload nginx

echo "Run certbot to obtain TLS certificates..."
certbot --nginx -d ${DOMAIN} -d n8n.${DOMAIN}

echo "Place your .env file at /opt/snagdeals/.env with DB and secrets, then run:"
echo "  cd /opt/snagdeals && docker compose up -d"

echo "Setup complete. After starting containers, check logs: docker compose logs -f"
