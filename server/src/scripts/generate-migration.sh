#!/bin/bash

###############################################################################
# Generate TypeORM Migration Script
# Usage: ./src/scripts/generate-migration.sh MigrationName
# Example: ./src/scripts/generate-migration.sh AddUserRoleColumn
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
  echo "Usage: ./src/scripts/generate-migration.sh MigrationName"
  echo "Example: ./src/scripts/generate-migration.sh AddUserRoleColumn"
  exit 1
fi

MIGRATION_NAME=$1

echo -e "${YELLOW}🔧 Generating migration: ${MIGRATION_NAME}${NC}"

# Generate migration based on entity changes
yarn typeorm migration:generate -d src/config/typeorm.config.ts src/migrations/${MIGRATION_NAME}

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Migration generated successfully!${NC}"
  echo -e "${GREEN}📁 Location: src/migrations/${MIGRATION_NAME}.ts${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "1. Review the generated migration file"
  echo "2. Run migration: yarn migration:run"
  echo "3. Rollback if needed: yarn migration:revert"
else
  echo -e "${RED}❌ Failed to generate migration${NC}"
  exit 1
fi
