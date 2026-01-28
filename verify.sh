#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Fullstack NNP Template - Verification Test  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

ERRORS=0

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js installed: ${NODE_VERSION}${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    ((ERRORS++))
fi

# Check yarn
echo -e "${YELLOW}Checking yarn...${NC}"
if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn -v)
    echo -e "${GREEN}✓ yarn installed: ${YARN_VERSION}${NC}"
else
    echo -e "${RED}✗ yarn not found${NC}"
    ((ERRORS++))
fi

# Check Docker
echo -e "${YELLOW}Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker -v | cut -d ' ' -f3 | cut -d ',' -f1)
    echo -e "${GREEN}✓ Docker installed: ${DOCKER_VERSION}${NC}"
else
    echo -e "${RED}✗ Docker not found${NC}"
    ((ERRORS++))
fi

# Check Backend Dependencies
echo ""
echo -e "${YELLOW}Checking backend...${NC}"
if [ -d "server/node_modules" ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Backend dependencies not installed${NC}"
    echo -e "${YELLOW}  Run: cd server && yarn install${NC}"
    ((ERRORS++))
fi

# Check Backend .env
if [ -f "server/.env" ]; then
    echo -e "${GREEN}✓ Backend .env file exists${NC}"
else
    echo -e "${YELLOW}⚠ Backend .env file missing${NC}"
    echo -e "${YELLOW}  Run: cd server && cp .env.example .env${NC}"
fi

# Check Frontend Dependencies
echo ""
echo -e "${YELLOW}Checking frontend...${NC}"
if [ -d "client/node_modules" ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Frontend dependencies not installed${NC}"
    echo -e "${YELLOW}  Run: cd client && yarn install${NC}"
    ((ERRORS++))
fi

# Check Frontend .env
if [ -f "client/.env.local" ]; then
    echo -e "${GREEN}✓ Frontend .env.local file exists${NC}"
else
    echo -e "${YELLOW}⚠ Frontend .env.local file missing${NC}"
    echo -e "${YELLOW}  Run: cd client && cp .env.example .env.local${NC}"
fi

# Check Docker Containers
echo ""
echo -e "${YELLOW}Checking Docker containers...${NC}"
if docker ps | grep -q fullstack-nnp-postgres; then
    echo -e "${GREEN}✓ PostgreSQL container running${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL container not running${NC}"
    echo -e "${YELLOW}  Run: docker-compose up -d${NC}"
fi

if docker ps | grep -q fullstack-nnp-pgadmin; then
    echo -e "${GREEN}✓ pgAdmin container running${NC}"
else
    echo -e "${YELLOW}⚠ pgAdmin container not running${NC}"
    echo -e "${YELLOW}  Run: docker-compose up -d${NC}"
fi

# Test Backend Build
echo ""
echo -e "${YELLOW}Testing backend build...${NC}"
cd server
if yarn build &> /dev/null; then
    echo -e "${GREEN}✓ Backend builds successfully${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    ((ERRORS++))
fi
cd ..

# Test Frontend Build (if dependencies installed)
if [ -d "client/node_modules" ]; then
    echo ""
    echo -e "${YELLOW}Testing frontend build...${NC}"
    cd client
    if NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1 yarn build &> /dev/null; then
        echo -e "${GREEN}✓ Frontend builds successfully${NC}"
    else
        echo -e "${RED}✗ Frontend build failed${NC}"
        ((ERRORS++))
    fi
    cd ..
fi

# Summary
echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo -e "${GREEN}  Your template is ready to use!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  1. Start backend:  cd server && yarn start:dev"
    echo -e "  2. Start frontend: cd client && yarn dev"
    echo ""
    echo -e "${BLUE}Access:${NC}"
    echo -e "  Frontend:     ${GREEN}http://localhost:3000${NC}"
    echo -e "  Backend:      ${GREEN}http://localhost:3001${NC}"
    echo -e "  Swagger:      ${GREEN}http://localhost:3001/api/docs${NC}"
    echo -e "  pgAdmin:      ${GREEN}http://localhost:5050${NC}"
else
    echo -e "${RED}✗ ${ERRORS} error(s) found${NC}"
    echo -e "${YELLOW}  Please fix the issues above${NC}"
    exit 1
fi
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
