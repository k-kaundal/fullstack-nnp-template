#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Fullstack NNP Template Setup Script     ║${NC}"
echo -e "${BLUE}╔═══════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 22+ first.${NC}"
    exit 1
fi

NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 22 ]; then
    echo -e "${RED}❌ Node.js 22+ is required (found v${NODE_MAJOR}). Use nvm: nvm install 22 && nvm use 22${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Start Docker containers
echo -e "${BLUE}📦 Starting PostgreSQL and pgAdmin with Docker...${NC}"
docker compose up -d
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database containers started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start Docker containers${NC}"
    exit 1
fi
echo ""

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
sleep 5
echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
echo ""

# Setup Backend
echo -e "${BLUE}🔧 Setting up backend...${NC}"
cd server

# Install dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
yarn install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${YELLOW}⚠ .env file already exists, skipping...${NC}"
fi

cd ..
echo ""

# Setup Frontend
echo -e "${BLUE}🎨 Setting up frontend...${NC}"
cd client

# Install dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
yarn install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}📝 Creating .env.local file...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✓ .env.local file created${NC}"
else
    echo -e "${YELLOW}⚠ .env.local file already exists, skipping...${NC}"
fi

cd ..
echo ""

# Summary
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Setup Complete! 🎉                ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Service URLs:${NC}"
echo -e "  Backend API:      ${GREEN}http://localhost:3001${NC}"
echo -e "  Swagger Docs:     ${GREEN}http://localhost:3001/api/docs${NC}"
echo -e "  Frontend:         ${GREEN}http://localhost:3000${NC}"
echo -e "  PostgreSQL:       ${GREEN}localhost:5432${NC}"
echo -e "  pgAdmin:          ${GREEN}http://localhost:5050${NC}"
echo -e "                    ${YELLOW}(admin@admin.com / admin)${NC}"
echo ""
echo -e "${BLUE}🚀 To start development:${NC}"
echo -e "  ${YELLOW}Terminal 1:${NC} cd server && yarn start:dev"
echo -e "  ${YELLOW}Terminal 2:${NC} cd client && yarn dev"
echo ""
echo -e "${BLUE}📚 Useful commands:${NC}"
echo -e "  ${YELLOW}Backend tests:${NC}       cd server && yarn test"
echo -e "  ${YELLOW}Backend lint:${NC}        cd server && yarn lint"
echo -e "  ${YELLOW}Frontend lint:${NC}       cd client && yarn lint"
echo -e "  ${YELLOW}Stop database:${NC}       docker compose down"
echo ""
echo -e "${GREEN}Happy coding! 💻${NC}"
