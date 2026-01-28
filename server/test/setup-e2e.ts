/**
 * Jest E2E Test Setup
 * Sets up environment variables required for e2e tests
 * This file runs before all test files
 */

// Set required environment variables for e2e tests
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
process.env.DATABASE_USERNAME = 'postgres';
process.env.DATABASE_PASSWORD = 'postgres';
process.env.DATABASE_NAME = 'test_db';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRATION = '7d';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.MAIL_HOST = 'smtp.test.com';
process.env.MAIL_PORT = '587';
process.env.MAIL_SECURE = 'false';
process.env.MAIL_USER = 'test@test.com';
process.env.MAIL_PASSWORD = 'test-password';
process.env.MAIL_FROM = 'test@test.com';
