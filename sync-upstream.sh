#!/bin/bash
# Mission Control - Sync Upstream Updates Script
# Usage: ./sync-upstream.sh [--auto]
#   --auto    Skip confirmations and auto-rebuild

set -e

AUTO_MODE=false
if [ "$1" = "--auto" ]; then
    AUTO_MODE=true
fi

echo "🔄 Mission Control - Sync with Upstream"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo -e "${RED}Error: Please run this script from the mission-control directory${NC}"
    exit 1
fi

# Check if upstream remote exists
if ! git remote | grep -q "upstream"; then
    echo -e "${YELLOW}Adding upstream remote...${NC}"
    git remote add upstream https://github.com/crshdn/mission-control.git
    echo -e "${GREEN}✓ Upstream remote added${NC}"
fi

echo ""
echo "📥 Fetching updates from upstream..."
git fetch upstream

echo ""
echo "🔍 Checking for updates..."
LOCAL=$(git rev-parse HEAD)
UPSTREAM=$(git rev-parse upstream/main)

if [ "$LOCAL" = "$UPSTREAM" ]; then
    echo -e "${GREEN}✓ Already up to date with upstream!${NC}"
    exit 0
fi

echo ""
echo "📊 Commits to sync:"
git log --oneline HEAD..upstream/main

if [ "$AUTO_MODE" = true ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Auto mode: merging without confirmation${NC}"
    REPLY="y"
else
    echo ""
    echo -e "${YELLOW}⚠️  About to merge upstream changes${NC}"
    echo -e "${YELLOW}   Your custom fixes (webhook logic, status API) will be preserved${NC}"
    echo ""
    read -p "Continue with merge? (y/n) " -n 1 -r
    echo
fi

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "🔀 Merging upstream changes..."
if git merge upstream/main --no-edit; then
    echo -e "${GREEN}✓ Merge successful!${NC}"
else
    echo -e "${RED}✗ Merge conflict detected!${NC}"
    echo ""
    echo "Conflicting files:"
    git diff --name-only --diff-filter=U
    echo ""
    echo -e "${YELLOW}To resolve:${NC}"
    echo "1. Edit the conflicting files"
    echo "2. git add <files>"
    echo "3. git commit"
    echo ""
    echo -e "${YELLOW}Keep these changes from our fork:${NC}"
    echo "- src/app/api/webhooks/agent-completion/route.ts (smart testing skip)"
    echo "- src/app/api/tasks/[id]/status/route.ts (manual status override)"
    exit 1
fi

echo ""
echo "📤 Pushing to your fork..."
git push origin main
echo -e "${GREEN}✓ Sync complete!${NC}"

if [ "$AUTO_MODE" = true ]; then
    echo ""
    echo "🐳 Auto-rebuilding Docker container..."
    docker build -t mission-control:latest . && \
    docker stop mission-control 2>/dev/null || true && \
    docker rm mission-control 2>/dev/null || true && \
    docker run -d --name mission-control --network host --user node \
        -v /home/felix:/app/workspace \
        -v /home/felix/openclaw/mission-control/data:/app/data \
        --restart unless-stopped \
        mission-control:latest
    echo -e "${GREEN}✓ Container rebuilt and started!${NC}"
else
    echo ""
    echo "🐳 Rebuilding Docker container..."
    read -p "Rebuild now? (y/n) " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker build -t mission-control:latest . && \
        docker stop mission-control 2>/dev/null || true && \
        docker rm mission-control 2>/dev/null || true && \
        docker run -d --name mission-control --network host --user node \
            -v /home/felix:/app/workspace \
            -v /home/felix/openclaw/mission-control/data:/app/data \
            --restart unless-stopped \
            mission-control:latest
        echo -e "${GREEN}✓ Container rebuilt and started!${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 All done!${NC}"
