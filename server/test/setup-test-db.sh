#!/bin/bash

# Setup Test Database Script
# Creates a test database for E2E tests

echo "Setting up test database..."

# Database configuration
DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-5432}
DB_USER=${DATABASE_USERNAME:-postgres}
DB_PASSWORD=${DATABASE_PASSWORD:-postgres}
DB_NAME="test_db"

# Set PGPASSWORD environment variable to avoid password prompt
export PGPASSWORD=$DB_PASSWORD

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1; then
  echo "❌ PostgreSQL is not running on $DB_HOST:$DB_PORT"
  echo "Please start PostgreSQL first"
  exit 1
fi

# Drop test database if it exists (to start fresh)
echo "Dropping existing test database (if any)..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 && \
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE $DB_NAME;"

# Create test database
echo "Creating test database: $DB_NAME..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

if [ $? -eq 0 ]; then
  echo "✅ Test database '$DB_NAME' created successfully!"
else
  echo "❌ Failed to create test database"
  exit 1
fi

# Unset password
unset PGPASSWORD

echo "✅ Test database setup complete!"
