#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TOKENS_FILE="$SCRIPT_DIR/.tokens"
ENV_FILE="$ROOT_DIR/apps/web/.env"

echo "=============================="
echo "  Alta Project Setup"
echo "=============================="
echo ""

# ── Get or load tokens ────────────

if [ -f "$TOKENS_FILE" ]; then
  echo "Using saved tokens from scripts/.tokens"
  source "$TOKENS_FILE"
else
  echo "First-time setup — logging in to Supabase & Vercel..."
  echo ""

  # Supabase login
  echo "1/2 Opening Supabase login..."
  npx supabase login

  # Read token from Supabase CLI config
  SUPABASE_TOKEN_FILE="$HOME/.supabase/access-token"
  if [ -f "$SUPABASE_TOKEN_FILE" ]; then
    SUPABASE_ACCESS_TOKEN=$(cat "$SUPABASE_TOKEN_FILE")
  else
    echo "Could not find Supabase token. Paste it manually."
    echo "Get from: https://supabase.com/dashboard/account/tokens"
    read -p "Supabase access token: " SUPABASE_ACCESS_TOKEN
  fi

  # Get Supabase org
  echo ""
  echo "Fetching Supabase organizations..."
  ORG_OUTPUT=$(npx supabase orgs list --token "$SUPABASE_ACCESS_TOKEN" 2>/dev/null)
  ORG_COUNT=$(echo "$ORG_OUTPUT" | grep -c "│" 2>/dev/null || echo "0")

  if [ "$ORG_COUNT" -eq 1 ]; then
    SUPABASE_ORG_ID=$(echo "$ORG_OUTPUT" | grep "│" | awk -F'│' '{gsub(/^[ \t]+|[ \t]+$/, "", $2); print $2}')
    echo "Using org: $SUPABASE_ORG_ID"
  else
    echo "$ORG_OUTPUT"
    echo ""
    read -p "Organization ID: " SUPABASE_ORG_ID
  fi

  # Vercel login
  echo ""
  echo "2/2 Opening Vercel login..."
  npx vercel login

  # Read token from Vercel CLI config
  VERCEL_AUTH_FILE="$HOME/Library/Application Support/com.vercel.cli/auth.json"
  if [ ! -f "$VERCEL_AUTH_FILE" ]; then
    VERCEL_AUTH_FILE="$HOME/.local/share/com.vercel.cli/auth.json"
  fi

  if [ -f "$VERCEL_AUTH_FILE" ]; then
    VERCEL_TOKEN=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$VERCEL_AUTH_FILE','utf8')).token)")
  else
    echo "Could not find Vercel token. Paste it manually."
    echo "Get from: https://vercel.com/account/tokens"
    read -p "Vercel token: " VERCEL_TOKEN
  fi

  # Get Vercel team
  VERCEL_TEAM=""
  TEAMS_OUTPUT=$(npx vercel teams ls --token "$VERCEL_TOKEN" 2>/dev/null || true)
  if echo "$TEAMS_OUTPUT" | grep -q "altahq"; then
    VERCEL_TEAM="altahq"
  else
    echo ""
    echo "$TEAMS_OUTPUT"
    read -p "Vercel team slug (leave empty for personal): " VERCEL_TEAM
  fi

  # Save tokens for next time
  cat > "$TOKENS_FILE" <<EOF
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN
SUPABASE_ORG_ID=$SUPABASE_ORG_ID
VERCEL_TOKEN=$VERCEL_TOKEN
VERCEL_TEAM=$VERCEL_TEAM
EOF

  echo ""
  echo "Tokens saved to scripts/.tokens"
  echo "Share this file with your team so they skip the login step."
  echo ""
fi

# ── Validate tokens ───────────────

if [ -z "$SUPABASE_ACCESS_TOKEN" ] || [ -z "$SUPABASE_ORG_ID" ] || [ -z "$VERCEL_TOKEN" ]; then
  echo "Error: Missing values in scripts/.tokens"
  exit 1
fi

# ── Project name ──────────────────

read -p "Project name: " PROJECT_NAME
if [ -z "$PROJECT_NAME" ]; then
  echo "Error: Project name is required."
  exit 1
fi

# ── Supabase ──────────────────────

echo ""
echo "── Creating Supabase project ──"

DB_PASSWORD=$(openssl rand -base64 24)

PROJECT_OUTPUT=$(npx supabase projects create "$PROJECT_NAME" \
  --org-id "$SUPABASE_ORG_ID" \
  --db-password "$DB_PASSWORD" \
  --region "us-east-1" \
  --token "$SUPABASE_ACCESS_TOKEN" 2>&1)

echo "$PROJECT_OUTPUT"

PROJECT_REF=$(echo "$PROJECT_OUTPUT" | grep -oE '[a-z]{20}' | head -1)

if [ -z "$PROJECT_REF" ]; then
  read -p "Enter the project ref manually: " PROJECT_REF
fi

SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

echo "Waiting for project to provision..."
sleep 30

echo "Fetching API keys..."
ANON_KEY=""
for i in 1 2 3; do
  KEYS_OUTPUT=$(npx supabase projects api-keys --project-ref "$PROJECT_REF" --token "$SUPABASE_ACCESS_TOKEN" 2>&1)
  ANON_KEY=$(echo "$KEYS_OUTPUT" | grep "anon" | awk '{print $NF}')
  if [ -n "$ANON_KEY" ]; then break; fi
  echo "  Retrying in 15s... ($i/3)"
  sleep 15
done

if [ -z "$ANON_KEY" ]; then
  echo "Could not fetch keys. Get them from:"
  echo "  https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api"
  read -p "Anon key: " ANON_KEY
fi

echo "VITE_SUPABASE_URL=${SUPABASE_URL}" > "$ENV_FILE"
echo "VITE_SUPABASE_ANON_KEY=${ANON_KEY}" >> "$ENV_FILE"

cd "$ROOT_DIR/packages/supabase"
npx supabase link --project-ref "$PROJECT_REF" -p "$DB_PASSWORD" --token "$SUPABASE_ACCESS_TOKEN"
cd "$ROOT_DIR"

echo "Supabase ready."

# ── Vercel ────────────────────────

echo ""
echo "── Creating Vercel project ──"

VERCEL_SCOPE_FLAG=""
if [ -n "$VERCEL_TEAM" ]; then
  VERCEL_SCOPE_FLAG="--scope $VERCEL_TEAM"
fi

npx vercel link --yes --project "$PROJECT_NAME" --token "$VERCEL_TOKEN" $VERCEL_SCOPE_FLAG

echo "$SUPABASE_URL" | npx vercel env add VITE_SUPABASE_URL production preview development --yes --token "$VERCEL_TOKEN" 2>/dev/null || true
echo "$ANON_KEY" | npx vercel env add VITE_SUPABASE_ANON_KEY production preview development --yes --token "$VERCEL_TOKEN" 2>/dev/null || true

echo "Vercel ready."

# ── Done ──────────────────────────

echo ""
echo "=============================="
echo "  Setup complete!"
echo "=============================="
echo ""
echo "  Project:     $PROJECT_NAME"
echo "  Supabase:    $SUPABASE_URL"
echo "  Vercel:      https://${PROJECT_NAME}.vercel.app"
echo "  DB password: $DB_PASSWORD (save this!)"
echo ""
echo "  pnpm dev        → start developing"
echo "  pnpm deploy     → deploy to Vercel"
