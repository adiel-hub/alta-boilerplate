#!/bin/bash
set -e

echo "=============================="
echo "  Alta Admin Setup (one-time)"
echo "=============================="
echo ""
echo "This deploys the project provisioning service."
echo "You only need to run this ONCE."
echo ""

# ── Collect tokens ────────────────

echo "1. Supabase access token"
echo "   Get from: https://supabase.com/dashboard/account/tokens"
read -p "   Token: " SUPABASE_ACCESS_TOKEN

echo ""
echo "2. Supabase organization ID"
echo "   Get from: supabase orgs list"
read -p "   Org ID: " SUPABASE_ORG_ID

echo ""
echo "3. Supabase admin project ref"
echo "   This is the project that will host the edge function."
echo "   Create a dedicated 'alta-admin' project at https://supabase.com/dashboard"
read -p "   Project ref: " ADMIN_PROJECT_REF

echo ""
echo "4. Vercel token (no expiration)"
echo "   Get from: https://vercel.com/account/tokens"
read -p "   Token: " VERCEL_TOKEN

echo ""
echo "5. Vercel team ID (optional, leave empty for personal account)"
read -p "   Team ID: " VERCEL_TEAM_ID

echo ""
echo "6. GitHub personal access token (repo scope)"
echo "   Get from: https://github.com/settings/tokens → Fine-grained → repo permissions"
read -p "   Token: " GITHUB_TOKEN

echo ""
echo "7. GitHub organization (optional, leave empty for personal account)"
read -p "   Org: " GITHUB_ORG

# Generate API key for the CLI
PASSWORD=$(openssl rand -hex 32)

echo ""
echo "── Setting secrets on Supabase project ──"
echo ""

cd packages/supabase

npx supabase link --project-ref "$ADMIN_PROJECT_REF" --token "$SUPABASE_ACCESS_TOKEN"

npx supabase secrets set \
  ADMIN_SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" \
  ADMIN_SUPABASE_ORG_ID="$SUPABASE_ORG_ID" \
  ADMIN_VERCEL_TOKEN="$VERCEL_TOKEN" \
  ADMIN_VERCEL_TEAM_ID="$VERCEL_TEAM_ID" \
  ADMIN_GITHUB_TOKEN="$GITHUB_TOKEN" \
  ADMIN_GITHUB_ORG="$GITHUB_ORG" \
  PASSWORD="$PASSWORD" \
  --token "$SUPABASE_ACCESS_TOKEN"

echo ""
echo "── Deploying edge function ──"
echo ""

npx supabase functions deploy create-project --no-verify-jwt --token "$SUPABASE_ACCESS_TOKEN"

cd ../..

SERVICE_URL="https://${ADMIN_PROJECT_REF}.supabase.co/functions/v1/create-project"

echo ""
echo "=============================="
echo "  Admin setup complete!"
echo "=============================="
echo ""
echo "  Edge function deployed to:"
echo "  $SERVICE_URL"
echo ""
echo "  Now update these 2 values in packages/create-alta-app/index.mjs:"
echo ""
echo "    ALTA_SERVICE_URL = '${SERVICE_URL}'"
echo "    PASSWORD     = '${PASSWORD}'"
echo ""
echo "  Then publish the CLI:"
echo "    cd packages/create-alta-app && npm publish"
echo ""
echo "  After that, anyone can run:"
echo "    npx create-alta-app my-project"
echo "  and get a full GitHub + Supabase + Vercel project with auto-deploy."
