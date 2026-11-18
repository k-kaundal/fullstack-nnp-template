# AGENTS.md — Guide for AI Coding Agents

This repository is **explicitly optimized for AI coding agents** (GitHub Copilot, Cursor, Claude, OpenCode, etc.). Follow this guide plus `.github/copilot-instructions.md` (1000+ lines of detailed standards) for every change.

## Project Overview

**Fullstack NNP Template** — production-ready monorepo:

| Workspace | Stack                                              | Path      |
| --------- | -------------------------------------------------- | --------- |
| Backend   | NestJS 10 + TypeORM + PostgreSQL + GraphQL + JWT   | `server/` |
| Frontend  | Next.js 16 (App Router) + React 19 + Tailwind v4   | `client/` |
| Root      | Husky, lint-staged, commitlint, shared tooling     | `/`       |

## Prerequisites

- **Node.js 22+** (see `.nvmrc` — CI and Husky hooks enforce v22)
- **Yarn 1.22+** (workspaces are NOT used; each package installs independently)
- **Docker** (PostgreSQL 16 + pgAdmin via `docker compose`)

## Common Commands

Run from the repo root unless noted.

| Task                       | Command                                  |
| -------------------------- | ---------------------------------------- |
| Initial setup              | `./setup.sh`                             |
| Verify environment         | `./verify.sh`                            |
| Install all dependencies   | `yarn install:all`                       |
| Start backend (dev)        | `yarn dev:server` (port 3001)            |
| Start frontend (dev)       | `yarn dev:client` (port 3000)            |
| Start PostgreSQL (Docker)  | `docker compose up -d`                   |
| Lint both workspaces       | `yarn lint:all`                          |
| Type-check both workspaces | `yarn type-check`                        |
| Backend unit tests         | `yarn test:server`                       |
| Backend E2E tests          | `yarn test:server:e2e`                   |
| Build everything           | `yarn build:all`                         |
| Security audit             | `yarn audit:all`                         |
| DB migrations              | `cd server && yarn migration:run`        |
| Seed database              | `cd server && yarn seed`                 |

Default credentials after seeding: `admin@example.com` / `Admin@123`.

## Code Standards (Zero-Tolerance)

Enforced by Husky pre-commit hooks (`.husky/pre-commit`) — commits fail if any check fails:

1. **TypeScript strict** — `no-explicit-any` is an **error**, not a warning. Never use `any`; use `unknown` + type guards.
2. **No console.log** — use NestJS `Logger` (server) or toast/logger (client). Only `console.warn`/`console.error` allowed in root config.
3. **No window.alert** — use the Toast/Modal components in `client/components/ui/`.
4. **ESLint must pass** — both workspaces use flat config (`eslint.config.mjs` at root delegates to workspaces; run `yarn lint:all`).
5. **Prettier formatting** — runs via lint-staged on commit.
6. **Conventional commits** — `type: description` (validated by commitlint). Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
7. **Tests required** — every controller/service must have a `.spec.ts`; 80%+ coverage expected. All feature modules (`analytics`, `blog`, `contact`, `mail`, `newsletter`, `rbac`, `users`, `auth`) have spec files — extend them when adding behavior.

## Architecture Rules

### Server (`server/src/`)

- **Modules**: feature-based (auth, users, rbac, newsletter, blog, contact, analytics, mail) + `common/` (shared infra) + `graphql/` (resolver module).
- **Pattern**: `*.controller.ts` → `*.service.ts` → `*.module.ts` + `dto/` + `entities/`.
- **DTOs**: class-validator decorators; custom validators in `common/decorators/` (`@IsStrongPassword`, `@NoXss`, `@NoSqlInjection`, `@IsValidUUID`, `@IsNotDisposableEmail`).
- **Auth**: JWT access (15min) + refresh (7d), token blacklisting, RBAC via guards.
- **API responses**: standardized via `common/utils/api-response.util.ts`.
- **Errors**: error codes enum in `common/enums/error-codes.enum.ts`, exception classes in `common/exceptions/`.
- **GraphQL**: Apollo Server v4 coexists with REST (`/graphql`); disabled in serverless (Vercel/Lambda).
- **Migrations**: TypeORM CLI config at `src/config/typeorm.config.ts`; migration files live ONLY in `src/migrations/` — never put them in `src/database/migrations/`.

### Client (`client/`)

- **App Router** (`app/`): `admin/`, `auth/`, `contact/`, `profile/` routes + root home page (no `(public)` route group).
- **Components**: `components/ui/` (Modal, Table, Toast, Sidebar, …), `components/auth/`, `components/user/`.
- **State/hooks**: `hooks/` (useAuth, useUsers, useTheme), `lib/providers/`.
- **API client**: `lib/api/` with axios interceptors + auto token refresh queue.
- **Types**: `interfaces/` + `types/` + `enums/` — never inline interfaces in components.
- **Styling**: Tailwind CSS v4 (CSS-first config in `app/globals.css`), dark mode via `next-themes`.

## Security Rules

- Never commit `.env`, `.env.local`, credentials, or tokens. Use `.env.example` templates.
- All user input must pass through DTO validation + sanitization decorators.
- Auth endpoints are rate-limited (5 req/15min); general API 100 req/min — do not remove `@nestjs/throttler` guards.
- Secrets scanning runs in CI (TruffleHog); Snyk + CodeQL run on every PR.

## Dependency Management

- **Package manager**: Yarn 1.x with per-workspace `yarn.lock` (root, `server/`, `client/` each have their own).
- **Adding a dependency**: `cd <workspace> && yarn add <pkg>` — never edit `package.json` versions blindly; keep `^` semver ranges.
- **Security fixes**: check `yarn audit` output; prefer patch/minor bumps within the declared range.
- After changing any `package.json`, run `yarn install` in that workspace and commit the updated `yarn.lock`.

## CI/CD

Workflows in `.github/workflows/`:

- `ci.yml` — backend tests + frontend build + E2E + security audit (runs on every PR/push).
- `security.yml` — Snyk, CodeQL, Trivy (Docker), TruffleHog (secrets), daily cron.

PRs must pass all checks. Node version is pinned to 22 via `actions/setup-node@v4` and `.nvmrc`.

## What NOT to Do

- ❌ Don't add `any` types, `@ts-ignore`, or disable ESLint rules without a comment explaining why.
- ❌ Don't commit directly to `main` — use feature branches (`feat/*`, `fix/*`, `docs/*`, …).
- ❌ Don't run `git commit`/`git push`/`git rebase` without explicit user confirmation.
- ❌ Don't introduce a second package manager (npm/pnpm/bun) — Yarn 1.x only.
- ❌ Don't edit `yarn.lock` manually.
- ❌ Don't add new dependencies without checking bundle size impact on the client.

## Key Documentation

- `README.md` — full feature list, setup, architecture diagrams.
- `.github/copilot-instructions.md` — 1000+ lines of detailed coding standards (read this first for non-trivial changes).
- `server/docs/` — backend guides (auth, RBAC, caching, error handling, GraphQL, rate limiting, …).
- `client/docs/` — frontend guides (architecture, components, session management, …).
- Root guides: `QUICK_START.md`, `TESTING_GUIDE.md`, `GIT_WORKFLOW.md`, `CONTRIBUTING.md`.
