#!/bin/bash

###############################################################################
# Run Database Migrations Script
# Usage: ./src/scripts/run-migrations.sh [environment]
# Example: ./src/scripts/run-migrations.sh development
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENV=${1:-development}

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Database Migration Runner            ║${NC}"
echo -e "${BLUE}║   Environment: ${ENV}                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check pending migrations
echo -e "${YELLOW}📋 Checking pending migrations...${NC}"
yarn typeorm migration:show -d src/config/typeorm.config.ts

echo ""
read -p "Do you want to run pending migrations? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}🚀 Running migrations...${NC}"
  yarn typeorm migration:run -d src/config/typeorm.config.ts

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations completed successfully!${NC}"
  else
    echo -e "${RED}❌ Migration failed${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⏸️  Migration cancelled${NC}"
  exit 0
fi
