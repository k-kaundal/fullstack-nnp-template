# CI/CD & Code Quality Setup Guide

This document provides comprehensive information about the CI/CD pipeline and
code quality tools configured in this project.

## Table of Contents

- [Overview](#overview)
- [Git Hooks](#git-hooks)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Code Quality Tools](#code-quality-tools)
- [Security Scanning](#security-scanning)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Overview

This project implements a production-ready CI/CD pipeline with:

- **Automated testing** on every pull request
- **Linting and formatting** checks
- **Security scanning** for dependencies and code
- **Code coverage reporting** with Codecov and Coveralls
- **SonarQube integration** for code quality metrics
- **Automated deployment** to staging and production
- **Git hooks** for pre-commit and pre-push validation

## Git Hooks

### Husky Configuration

We use Husky to manage Git hooks that enforce code quality standards before
commits and pushes.

**Installed Hooks:**

- `pre-commit` - Runs linting, formatting, and type checking
- `pre-push` - Runs all tests
- `commit-msg` - Validates commit message format

### Pre-Commit Hook

**What it does:**

1. Runs lint-staged to format and lint only staged files
2. Type checks TypeScript in both server and client
3. Prevents commit if any check fails

**Location:** `.husky/pre-commit`

**To bypass (not recommended):** \`\`\`bash git commit --no-verify -m "your
message" \`\`\`

### Pre-Push Hook

**What it does:**

1. Runs all tests in server and client
2. Prevents push if tests fail

**Location:** `.husky/pre-push`

**To bypass (not recommended):** \`\`\`bash git push --no-verify \`\`\`

### Commit Message Validation

**Format:** Follows [Conventional Commits](https://www.conventionalcommits.org/)

**Valid commit types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `build:` - Build system or dependencies
- `ci:` - CI/CD changes
- `chore:` - Other changes (maintenance)
- `revert:` - Revert previous commit

**Examples:** \`\`\`bash git commit -m "feat: add user authentication" git
commit -m "fix: resolve database connection issue" git commit -m "docs: update
API documentation" \`\`\`

**Configuration:** `.commitlintrc.js`

### Lint-Staged

Runs linters and formatters only on staged files for faster pre-commit checks.

**What it does:**

- ESLint with auto-fix
- Prettier formatting
- TypeScript compilation check

**Configuration:** `.lintstagedrc.json`

## GitHub Actions Workflows

### 1. CI Workflow (.github/workflows/ci.yml)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

1. **backend-test**: Lint and test server with PostgreSQL
2. **frontend-test**: Lint and build client
3. **e2e-test**: Run end-to-end tests
4. **security-audit**: Run `yarn audit` on dependencies
5. **build-check**: Verify production builds

**Duration:** ~5-8 minutes

### 2. Security Scanning (.github/workflows/security.yml)

**Triggers:**

- Push to `main` or `develop`
- Pull requests
- Daily at 2 AM UTC (scheduled)

**Jobs:**

1. **dependency-scan**: Snyk and yarn audit for vulnerabilities
2. **codeql-analysis**: GitHub CodeQL for code security
3. **docker-scan**: Trivy scanner for Docker images
4. **secrets-scan**: TruffleHog for exposed secrets

**Required Secrets:**

- `SNYK_TOKEN` - Snyk API token (optional)

### 3. Code Coverage (.github/workflows/coverage.yml)

**Triggers:**

- Push to `main` or `develop`
- Pull requests

**Jobs:**

1. **coverage**: Run tests with coverage
2. Upload to Codecov and Coveralls
3. Generate coverage badges
4. Comment coverage report on PRs
5. Enforce 80% coverage threshold

**Required Secrets:**

- `CODECOV_TOKEN` - Codecov API token
- `GITHUB_TOKEN` - Auto-provided by GitHub

**Coverage Threshold:** 80% (fails if below)

### 4. SonarQube Analysis (.github/workflows/sonarqube.yml)

**Triggers:**

- Push to `main` or `develop`
- Pull requests

**Jobs:**

1. Run tests with coverage
2. Send coverage to SonarQube
3. Quality gate check
4. Comment results on PR

**Required Secrets:**

- `SONAR_TOKEN` - SonarQube token
- `SONAR_HOST_URL` - SonarQube server URL

**Configuration:** `sonar-project.properties`

### 5. Staging Deployment (.github/workflows/deploy-staging.yml)

**Triggers:**

- Push to `develop` branch
- Manual workflow dispatch

**Jobs:**

1. Build server and client
2. Run database migrations
3. Deploy client to Vercel
4. Deploy server to Railway/Render/Heroku
5. Run smoke tests
6. Notify Slack on success/failure

**Required Secrets:**

- `STAGING_API_URL`
- `STAGING_DATABASE_URL`
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `RAILWAY_TOKEN`, `RAILWAY_SERVICE_ID`
- `SLACK_WEBHOOK` (optional)

**Environment:** `staging`

### 6. Production Deployment (.github/workflows/deploy-production.yml)

**Triggers:**

- Push tags matching `v*.*.*` (e.g., `v1.0.0`)
- Manual workflow dispatch

**Jobs:**

1. Validate release tag
2. Create backup
3. Build and deploy
4. Run smoke tests
5. Create GitHub release
6. Notify Slack

**Required Secrets:**

- `PRODUCTION_API_URL`
- `PRODUCTION_DATABASE_URL`
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `RAILWAY_PRODUCTION_SERVICE_ID`
- `SLACK_WEBHOOK` (optional)

**Environment:** `production`

**To deploy:** \`\`\`bash

# Update version in package.json

# Create and push tag

git tag v1.0.0 git push origin v1.0.0 \`\`\`

## Code Quality Tools

### ESLint

**Purpose:** Static code analysis to catch bugs and enforce coding standards

**Features:**

- TypeScript strict rules
- Import organization
- No unused variables
- No implicit any types
- Consistent code style

**Configuration:**

- Root: `.eslintrc.js`
- Server: `server/.eslintrc.js`
- Client: `client/eslint.config.mjs`

**Commands:** \`\`\`bash yarn lint # Lint entire project yarn lint:server # Lint
server only yarn lint:client # Lint client only yarn lint:fix # Auto-fix issues
\`\`\`

### Prettier

**Purpose:** Code formatting for consistent style

**Features:**

- Semi-colons enabled
- Single quotes
- Trailing commas
- 100 character line width
- 2-space indentation

**Configuration:** `.prettierrc.json` **Ignore:** `.prettierignore`

**Commands:** \`\`\`bash yarn format # Format entire project yarn format:check #
Check formatting yarn format:server # Format server only yarn format:client #
Format client only \`\`\`

### TypeScript Strict Mode

**Enabled in both server and client:**

- `strict: true`
- `strictNullChecks: true`
- `noImplicitAny: true`
- `strictBindCallApply: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noUncheckedIndexedAccess: true`

**Benefits:**

- Catch bugs at compile time
- Better IDE support
- Safer refactoring
- Improved code quality

### Import Organization

**ESLint Plugin:** `eslint-plugin-import`

**Rules:**

- Organized by groups (builtin, external, internal, etc.)
- Alphabetically sorted
- Newlines between groups
- No circular dependencies
- No duplicate imports

**Example:** \`\`\`typescript // Node.js built-in modules import { readFileSync
} from 'fs';

// npm packages import { Injectable } from '@nestjs/common'; import express from
'express';

// Internal modules import { UsersService } from '../users/users.service';

// Type imports import type { Request, Response } from 'express'; \`\`\`

## Security Scanning

### Snyk

**Purpose:** Vulnerability scanning for dependencies

**Setup:**

1. Sign up at [snyk.io](https://snyk.io/)
2. Get API token from account settings
3. Add `SNYK_TOKEN` to GitHub Secrets

**Runs:** Daily and on every push

### CodeQL

**Purpose:** Semantic code analysis for security vulnerabilities

**Languages:** JavaScript, TypeScript

**Setup:** Automatic (no configuration needed)

**Runs:** On every push and pull request

### Trivy

**Purpose:** Container image vulnerability scanning

**Setup:** Automatic

**Runs:** On every push (if Docker images exist)

### TruffleHog

**Purpose:** Detect exposed secrets in code

**Setup:** Automatic

**Runs:** On every push and pull request

## Deployment

### Staging Environment

**URL:** `https://staging.yourapp.com`

**Deployment Flow:**

1. Push to `develop` branch
2. CI pipeline runs
3. Auto-deploy to staging on success
4. Smoke tests verify deployment

**Platforms:**

- **Client:** Vercel
- **Server:** Railway/Render/Heroku (choose one)

### Production Environment

**URL:** `https://yourapp.com`

**Deployment Flow:**

1. Create version tag (`v1.0.0`)
2. Push tag to GitHub
3. Validation checks run
4. Manual approval required
5. Deploy to production
6. Smoke tests verify deployment
7. GitHub release created

**Best Practices:**

- Always test in staging first
- Use semantic versioning (v1.0.0, v1.1.0, v2.0.0)
- Include changelog in release
- Monitor logs after deployment
- Keep backup before major releases

## Configuration

### Required GitHub Secrets

**CI/CD:**

- `CODECOV_TOKEN` - Codecov API token
- `SONAR_TOKEN` - SonarQube token
- `SONAR_HOST_URL` - SonarQube server URL
- `SNYK_TOKEN` - Snyk API token (optional)

**Staging Deployment:**

- `STAGING_API_URL` - Staging API URL
- `STAGING_DATABASE_URL` - Staging database connection string
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `RAILWAY_TOKEN` - Railway API token
- `RAILWAY_SERVICE_ID` - Railway service ID

**Production Deployment:**

- `PRODUCTION_API_URL` - Production API URL
- `PRODUCTION_DATABASE_URL` - Production database connection
- `RAILWAY_PRODUCTION_SERVICE_ID` - Railway production service

**Notifications (Optional):**

- `SLACK_WEBHOOK` - Slack webhook URL

### Required Repository Settings

**GitHub Pages (for coverage badges):**

1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: gh-pages

**Environments:**

1. Create `staging` environment
2. Create `production` environment
3. Add protection rules (require approvals for production)

## Troubleshooting

### Pre-Commit Hook Fails

**Problem:** Hook fails with linting errors

**Solution:** \`\`\`bash

# Fix linting errors

yarn lint:fix

# Format code

yarn format

# Try commit again

git commit -m "your message" \`\`\`

### Tests Fail in CI but Pass Locally

**Problem:** Different environment or dependencies

**Solution:** \`\`\`bash

# Clear caches

rm -rf node_modules rm -rf server/node_modules rm -rf client/node_modules

# Reinstall

yarn install:all

# Run tests

yarn test:all \`\`\`

### Coverage Below Threshold

**Problem:** Code coverage is below 80%

**Solution:**

1. Write more unit tests
2. Add integration tests
3. Test edge cases
4. Check coverage report: \`\`\`bash cd server yarn test:cov open
   coverage/lcov-report/index.html \`\`\`

### Deployment Fails

**Problem:** Deployment fails in GitHub Actions

**Solution:**

1. Check logs in Actions tab
2. Verify all secrets are configured
3. Test build locally: \`\`\`bash yarn build:all \`\`\`
4. Check database migrations: \`\`\`bash cd server yarn migration:run \`\`\`

### SonarQube Analysis Fails

**Problem:** Quality gate failed

**Solution:**

1. Check SonarQube dashboard
2. Fix code smells and bugs
3. Improve test coverage
4. Update technical debt

## Best Practices

### Commit Messages

- Use conventional commits format
- Keep subject line under 72 characters
- Write descriptive commit messages
- Reference issues in footer

### Pull Requests

- Create small, focused PRs
- Write clear PR descriptions
- Add screenshots for UI changes
- Request reviews from team members
- Wait for CI to pass before merging

### Code Quality

- Maintain 80%+ test coverage
- Fix all ESLint errors
- Follow TypeScript strict mode
- Organize imports properly
- Write meaningful variable names
- Add JSDoc comments for public APIs

### Security

- Never commit secrets
- Review dependencies regularly
- Fix security vulnerabilities promptly
- Use environment variables for config
- Enable 2FA on accounts

### Deployment

- Test thoroughly in staging
- Deploy during low-traffic hours
- Monitor logs after deployment
- Keep rollback plan ready
- Document breaking changes

## Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [Codecov Documentation](https://docs.codecov.com/)

---

**Last Updated:** January 31, 2026 **Version:** 1.0.0
