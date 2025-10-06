#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verifying Fetch Student Sprint Setup..."
echo ""

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Found $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check pnpm
echo -n "Checking pnpm... "
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✓${NC} Found v$PNPM_VERSION"
else
    echo -e "${RED}✗${NC} pnpm not found. Install with: npm install -g pnpm"
    exit 1
fi

# Check Docker
echo -n "Checking Docker... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
    echo -e "${GREEN}✓${NC} Found $DOCKER_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Docker not found. Some features require Docker."
fi

# Check Docker Compose
echo -n "Checking Docker Compose... "
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d ' ' -f4 | cut -d ',' -f1)
    echo -e "${GREEN}✓${NC} Found $COMPOSE_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Docker Compose not found. Database services require Docker Compose."
fi

echo ""
echo "📦 Checking Dependencies..."

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${RED}✗${NC} Dependencies not installed. Run: pnpm install"
    exit 1
fi

echo ""
echo "📁 Checking Project Structure..."

# Check apps
for app in backend admin mobile; do
    if [ -d "apps/$app" ]; then
        echo -e "${GREEN}✓${NC} apps/$app exists"
    else
        echo -e "${RED}✗${NC} apps/$app missing"
    fi
done

# Check packages
for pkg in config types ui; do
    if [ -d "packages/$pkg" ]; then
        echo -e "${GREEN}✓${NC} packages/$pkg exists"
    else
        echo -e "${RED}✗${NC} packages/$pkg missing"
    fi
done

echo ""
echo "🔧 Checking Environment Files..."

# Check .env files
if [ -f "apps/backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env exists"
else
    echo -e "${YELLOW}⚠${NC} Backend .env missing. Copy from apps/backend/.env.example"
fi

if [ -f "apps/admin/.env" ]; then
    echo -e "${GREEN}✓${NC} Admin .env exists"
else
    echo -e "${YELLOW}⚠${NC} Admin .env missing. Copy from apps/admin/.env.example"
fi

if [ -f "apps/mobile/.env" ]; then
    echo -e "${GREEN}✓${NC} Mobile .env exists"
else
    echo -e "${YELLOW}⚠${NC} Mobile .env missing. Copy from apps/mobile/.env.example"
fi

echo ""
echo "🐳 Checking Docker Services..."

if command -v docker &> /dev/null; then
    # Check if Postgres is running
    if docker ps | grep -q postgres; then
        echo -e "${GREEN}✓${NC} PostgreSQL is running"
    else
        echo -e "${YELLOW}⚠${NC} PostgreSQL not running. Start with: pnpm docker:up"
    fi

    # Check if Redis is running
    if docker ps | grep -q redis; then
        echo -e "${GREEN}✓${NC} Redis is running"
    else
        echo -e "${YELLOW}⚠${NC} Redis not running. Start with: pnpm docker:up"
    fi
fi

echo ""
echo "📊 Summary:"
echo "============================================"

# Count issues
ISSUES=0

if ! command -v node &> /dev/null; then ((ISSUES++)); fi
if ! command -v pnpm &> /dev/null; then ((ISSUES++)); fi
if [ ! -d "node_modules" ]; then ((ISSUES++)); fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ Setup looks good!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Start Docker services: pnpm docker:up"
    echo "  2. Start development: pnpm dev"
    echo "  3. Check QUICKSTART.md for more info"
else
    echo -e "${RED}✗ Found $ISSUES issue(s)${NC}"
    echo "Please fix the issues above before continuing."
fi

echo ""
