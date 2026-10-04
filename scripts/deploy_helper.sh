#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "=========================================================="
echo "       🚀 Fixigo Cloud Deployment Helper Script"
echo "=========================================================="

echo ""
echo "Step 1: Running Phase 1 Backend Verification Tests..."
cd backend && npm test
cd "$DIR"

echo ""
echo "Step 2: Testing Frontend Production Build..."
npm run build

echo ""
echo "=========================================================="
echo "  ✅ Pre-Deployment Checks Passed (Tests & Build OK)"
echo "=========================================================="

echo ""
echo "Would you like to:"
echo "  1) Push changes to GitHub"
echo "  2) Test Render backend health endpoint"
echo "  3) Deploy frontend to Vercel via CLI"
echo "  4) View deployment guide"
echo "  5) Exit"
echo ""

read -p "Select option [1-5]: " OPTION

case $OPTION in
  1)
    echo ""
    read -p "Enter your GitHub repository URL (e.g. https://github.com/username/workconnect.git): " REPO_URL
    if [ -n "$REPO_URL" ]; then
      git remote remove origin 2>/dev/null || true
      git remote add origin "$REPO_URL"
      git branch -M main
      echo "Pushing code to $REPO_URL..."
      git push -u origin main
      echo "🎉 Code successfully pushed to GitHub!"
      echo "👉 Now head to https://dashboard.render.com to deploy via Blueprint (render.yaml)!"
    fi
    ;;
  2)
    echo ""
    read -p "Enter your live Render backend URL (e.g. https://fixigo-backend.onrender.com): " BURL
    if [ -n "$BURL" ]; then
      CLEAN_URL="${BURL%/}/api/health"
      echo "Pinging $CLEAN_URL..."
      curl -s -i "$CLEAN_URL"
    fi
    ;;
  3)
    echo ""
    read -p "Enter your live Render backend URL (e.g. https://fixigo-backend.onrender.com): " BURL
    if [ -n "$BURL" ]; then
      CLEAN_URL="${BURL%/}"
      echo "Deploying frontend to Vercel..."
      cd frontend
      npx vercel --prod --build-env VITE_API_URL="$CLEAN_URL" --build-env VITE_SOCKET_URL="$CLEAN_URL"
    fi
    ;;
  4)
    cat DEPLOYMENT_GUIDE.md
    ;;
  *)
    echo "Exiting helper. Run ./scripts/deploy_helper.sh anytime!"
    ;;
esac
