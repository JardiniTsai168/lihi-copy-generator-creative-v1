#!/bin/bash
set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-root@157.245.151.126}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/beck-v1}"
APP_NAME="${APP_NAME:-beck-v1}"
HEALTH_URL="${HEALTH_URL:-https://copy.bktsai.link/health}"

cat <<EOF
This script is now a safe verifier only.

It does NOT write API keys or replace the server .env.
Keep real secrets on the server and update them manually there if needed.

Target:
- host: ${REMOTE_HOST}
- dir: ${REMOTE_DIR}
- pm2 app: ${APP_NAME}
- health: ${HEALTH_URL}
EOF

ssh "${REMOTE_HOST}" "cd '${REMOTE_DIR}' && pm2 restart '${APP_NAME}' --update-env && sleep 3 && curl -fsS '${HEALTH_URL}'"
