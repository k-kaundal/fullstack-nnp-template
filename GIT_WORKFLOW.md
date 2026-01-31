# Git Workflow & Commit Guidelines

## 🎯 Quick Reference

### ✅ Correct Commit Format

```bash
# ✅ CORRECT - Will pass commitlint
git commit -m "feat: add user authentication"
git commit -m "fix: resolve token refresh bug"
git commit -m "docs: update API documentation"
git commit -m "test: add user service tests"
git commit -m "chore: upgrade dependencies"

# ❌ WRONG - Will fail commitlint
git commit -m "add user authentication"        # Missing type and colon
git commit -m "feat add authentication"        # Missing colon
git commit -m "Added new feature"              # Wrong format
git commit -m "update docs"                    # Missing type
```

**Required Format:** `<type>: <description>`

The **colon (`:`)** is **mandatory** after the type!

---

## 🔧 Commit Types

| Type        | Description           | Example                            |
| ----------- | --------------------- | ---------------------------------- |
| `feat:`     | New feature           | `feat: add email verification`     |
| `fix:`      | Bug fix               | `fix: resolve login timeout`       |
| `docs:`     | Documentation         | `docs: update installation guide`  |
| `test:`     | Tests                 | `test: add integration tests`      |
| `refactor:` | Code refactoring      | `refactor: improve error handling` |
| `style:`    | Code style/formatting | `style: fix indentation`           |
| `chore:`    | Maintenance           | `chore: upgrade typescript`        |
| `perf:`     | Performance           | `perf: optimize database queries`  |
| `ci:`       | CI/CD changes         | `ci: add SonarQube workflow`       |
| `build:`    | Build system          | `build: update webpack config`     |
| `revert:`   | Revert commit         | `revert: undo previous changes`    |

---

## 🔄 Pre-commit Workflow

When you run `git commit`, the following happens **automatically**:

### 1️⃣ **lint-staged** runs:

- **Server TypeScript files**: `cd server && yarn lint --fix && yarn format`
- **Client TypeScript files**: `cd client && yarn lint --fix && yarn format`
- **JSON/Markdown files**: `yarn format` (Prettier only)
- Auto-stages any fixed files

### 2️⃣ **TypeScript type check**:

- Server: `cd server && yarn tsc --noEmit`
- Client: `cd client && yarn tsc --noEmit`

### 3️⃣ **commitlint** validates message:

- Checks for conventional commit format
- Fails if missing type or colon

### 4️⃣ **Commit succeeds** ✅ (if all checks pass)

---

## 🚨 Common Errors & Solutions

### Error: "subject may not be empty" or "type may not be empty"

**Problem:** Missing colon (`:`) after commit type

**Solution:**

```bash
# ❌ Wrong
git commit -m "fix bug"

# ✅ Correct
git commit -m "fix: resolve authentication bug"
```

### Error: "Command 'eslint' not found"

**Problem:** ESLint not installed in workspace

**Solution:**

```bash
# Install dependencies
yarn install
cd server && yarn install
cd ../client && yarn install
```

### Error: "Type check failed"

**Problem:** TypeScript errors in code

**Solution:**

```bash
# Check TypeScript errors
cd server && yarn tsc --noEmit  # Server
cd client && yarn tsc --noEmit  # Client

# Fix the errors shown, then commit again
```

### Error: "ESLint errors found"

**Problem:** ESLint rules violated

**Solution:**

```bash
# Check ESLint errors
cd server && yarn lint          # Server
cd client && yarn lint          # Client

# Auto-fix what's possible
cd server && yarn lint --fix    # Server
cd client && yarn lint --fix    # Client

# Fix remaining errors manually, then commit
```

---

## 📁 Monorepo Linting Structure

```
root/                           # Only Prettier, lint-staged, husky
├── .lintstagedrc.json         # lint-staged config
├── .husky/                    # Git hooks
│   ├── pre-commit             # Runs lint-staged + type check
│   └── commit-msg             # Validates commit message
├── server/                    # ESLint 9 + @typescript-eslint v8
│   ├── eslint.config.mjs      # Flat config format
│   └── package.json           # Has eslint & prettier
└── client/                    # ESLint 9 + separate config
    ├── eslint.config.mjs      # Flat config format
    └── package.json           # Has eslint & prettier
```

**Key Points:**

- Root only runs Prettier on config files (JSON, Markdown, YAML)
- Server and client have separate ESLint configs
- lint-staged uses `cd server &&` and `cd client &&` to run workspace-specific
  commands

---

## 💡 Best Practices

### ✅ DO:

- Write clear, descriptive commit messages
- Use the correct commit type
- Commit often with small, focused changes
- Fix ESLint/TypeScript errors before committing
- Run tests before pushing

### ❌ DON'T:

- Don't use `--no-verify` to bypass hooks (unless emergency)
- Don't commit with TypeScript errors
- Don't commit with ESLint errors
- Don't use generic messages like "update" or "fix"
- Don't commit commented-out code or console.logs

---

## 🔍 Manual Checks (Optional)

Run these manually before committing if you want to catch issues early:

```bash
# Lint and format
cd server && yarn lint && yarn format
cd client && yarn lint && yarn format

# Type check
cd server && yarn tsc --noEmit
cd client && yarn tsc --noEmit

# Run tests
cd server && yarn test
cd server && yarn test:cov  # With coverage

# Test commit message format (before committing)
echo "feat: my new feature" | npx commitlint
```

---

## 🆘 Emergency Bypass (NOT RECOMMENDED)

Only use in critical production emergencies:

```bash
# Bypass all hooks (DANGEROUS)
git commit --no-verify -m "emergency: fix critical production bug"
```

**⚠️ Warning:** This skips all quality checks. Only use when:

- Production is down
- Fix must be deployed immediately
- You'll fix quality issues in next commit

---

## 📚 Additional Resources

- **Conventional Commits**: https://www.conventionalcommits.org/
- **commitlint**: https://github.com/conventional-changelog/commitlint
- **Husky**: https://typicode.github.io/husky/
- **lint-staged**: https://github.com/okonet/lint-staged
- **ESLint**: https://eslint.org/
- **Prettier**: https://prettier.io/

---

## 🎯 Examples by Scenario

### Adding a new feature

```bash
git commit -m "feat: add two-factor authentication"
git commit -m "feat(auth): implement 2FA with TOTP"
```

### Fixing a bug

```bash
git commit -m "fix: resolve memory leak in cache service"
git commit -m "fix(users): prevent duplicate email registration"
```

### Updating documentation

```bash
git commit -m "docs: add Git workflow guide"
git commit -m "docs(api): update authentication endpoints"
```

### Writing tests

```bash
git commit -m "test: add unit tests for user service"
git commit -m "test(auth): add integration tests for login flow"
```

### Refactoring code

```bash
git commit -m "refactor: simplify error handling logic"
git commit -m "refactor(api): extract common response utilities"
```

### Dependency updates

```bash
git commit -m "chore: upgrade ESLint to v9"
git commit -m "chore(deps): update typescript to 5.3.3"
```

### Performance improvements

```bash
git commit -m "perf: optimize database query performance"
git commit -m "perf(cache): implement Redis caching layer"
```

---

**Need Help?** Check [`CONTRIBUTING.md`](./CONTRIBUTING.md) for detailed
contribution guidelines.
