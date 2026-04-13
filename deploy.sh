#!/bin/bash
# =============================================================================
# Evolvity Site — Deploy to ServerSea via FTP
# Requires: lftp  (brew install lftp)
# Usage:    ./deploy.sh
# =============================================================================

# --- Configuration ---
REMOTE_PATH="/public_html"         # Remote web root (adjust if different)

# Load credentials from .env (FTP_HOST, FTP_PORT, FTP_USER, FTP_PASS)
ENV_FILE="$(cd "$(dirname "$0")" && pwd)/.env"
if [[ ! -f "$ENV_FILE" ]]; then
    echo "ERROR: .env file not found at $ENV_FILE"
    exit 1
fi
# shellcheck source=.env
source "$ENV_FILE"

# Local project root
LOCAL_PATH="$(cd "$(dirname "$0")" && pwd)"

# --- Check lftp is installed ---
if ! command -v lftp &>/dev/null; then
    echo "ERROR: lftp is not installed. Run:  brew install lftp"
    exit 1
fi

# --- Sanity check ---
if [[ -z "$FTP_PASS" ]]; then
    echo "ERROR: FTP_PASS is not set in .env"
    exit 1
fi

echo "Deploying Evolvity site to ftp://$FTP_HOST$REMOTE_PATH"
echo "Source: $LOCAL_PATH"
echo ""

lftp -u "$FTP_USER","$FTP_PASS" "ftp://$FTP_HOST:$FTP_PORT" <<EOF
set ftp:ssl-allow no
set net:timeout 30
set net:max-retries 3

mirror --reverse --verbose --delete \
    --exclude .git/ \
    --exclude .claude/ \
    --exclude .DS_Store \
    --exclude CLAUDE.md \
    --exclude deploy.sh \
    --exclude .env \
    "$LOCAL_PATH" \
    "$REMOTE_PATH"

bye
EOF

STATUS=$?

if [[ $STATUS -eq 0 ]]; then
    echo ""
    echo "Deploy complete. Site is live at https://www.evolvity.com/"
else
    echo ""
    echo "Deploy FAILED (lftp exit code $STATUS)."
    exit $STATUS
fi
