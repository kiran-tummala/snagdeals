#!/usr/bin/env bash
set -euo pipefail

# Auto-update script: pulls latest images and restarts containers
# Place at /opt/snagdeals/auto_update.sh and make executable

DIR=/opt/snagdeals
LOG=/var/log/snagdeals-auto-update.log

if [ ! -d "$DIR" ]; then
  echo "Directory $DIR not found" >&2
  exit 1
fi

cd "$DIR"
echo "$(date --iso-8601=seconds) - Starting auto-update" >> "$LOG"

# Pull latest images and recreate containers
export COMPOSE_HTTP_TIMEOUT=200
docker compose pull --quiet
docker compose up -d --remove-orphans

# Cleanup unused images
docker image prune -af --filter "until=240h" || true

echo "$(date --iso-8601=seconds) - Update complete" >> "$LOG"
