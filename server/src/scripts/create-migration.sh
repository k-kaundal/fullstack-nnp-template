#!/bin/bash

###############################################################################
# Create Empty Migration Script
# Usage: ./src/scripts/create-migration.sh MigrationName
# Example: ./src/scripts/create-migration.sh AddCustomIndexes
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if migration name is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Migration name is required${NC}"
  echo "Usage: ./src/scripts/create-migration.sh MigrationName"
  echo "Example: ./src/scripts/create-migration.sh AddCustomIndexes"
  exit 1
fi

MIGRATION_NAME=$1

echo -e "${YELLOW}🔧 Creating empty migration: ${MIGRATION_NAME}${NC}"

# Create empty migration
yarn typeorm migration:create src/migrations/${MIGRATION_NAME}

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Empty migration created successfully!${NC}"
  echo -e "${GREEN}📁 Location: src/migrations/${MIGRATION_NAME}.ts${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "1. Edit the migration file and add your SQL"
  echo "2. Run migration: yarn migration:run"
  echo "3. Rollback if needed: yarn migration:revert"
else
  echo -e "${RED}❌ Failed to create migration${NC}"
  exit 1
fi
