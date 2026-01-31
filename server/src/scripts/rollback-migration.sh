#!/bin/bash

###############################################################################
# Rollback Database Migrations Script
# Usage: ./src/scripts/rollback-migration.sh [count]
# Example: ./src/scripts/rollback-migration.sh 1
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COUNT=${1:-1}

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Database Migration Rollback          ║${NC}"
echo -e "${BLUE}║   Rolling back: ${COUNT} migration(s)    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Show current migrations
echo -e "${YELLOW}📋 Current migration status:${NC}"
yarn typeorm migration:show -d src/config/typeorm.config.ts

echo ""
echo -e "${RED}⚠️  WARNING: This will rollback the last ${COUNT} migration(s)${NC}"
read -p "Are you sure you want to continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}🔄 Rolling back migrations...${NC}"

  for ((i=1; i<=COUNT; i++)); do
    echo -e "${YELLOW}Rolling back migration $i of ${COUNT}...${NC}"
    yarn typeorm migration:revert -d src/config/typeorm.config.ts

    if [ $? -ne 0 ]; then
      echo -e "${RED}❌ Rollback failed at migration $i${NC}"
      exit 1
    fi
  done

  echo -e "${GREEN}✅ Rollback completed successfully!${NC}"
else
  echo -e "${YELLOW}⏸️  Rollback cancelled${NC}"
  exit 0
fi
