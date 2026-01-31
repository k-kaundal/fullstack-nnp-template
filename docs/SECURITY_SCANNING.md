# Security Scanning Guide

## 🔒 Overview

This project includes comprehensive security scanning with multiple tools:

- **Dependency Scanning** - Snyk + Yarn Audit
- **CodeQL Analysis** - GitHub's semantic code analysis
- **Docker Security** - Trivy vulnerability scanner (optional)
- **Secrets Detection** - TruffleHog for leaked secrets

## 🛡️ Security Scans

### 1️⃣ Dependency Security Scan

**Tools Used:**

- **Snyk** - Commercial vulnerability scanner (optional)
- **Yarn Audit** - Built-in dependency vulnerability checker

**What It Checks:**

- Known vulnerabilities in npm packages
- Outdated dependencies with security issues
- License compliance issues

**Setup Snyk (Optional):**

1. Create account at https://snyk.io/
2. Get your API token
3. Add to GitHub Secrets:
   - Name: `SNYK_TOKEN`
   - Value: Your Snyk API token

**Without Snyk:**

- Workflow uses `continue-on-error: true`
- Yarn audit still runs (no token needed)

**Run Locally:**

```bash
cd server && yarn audit
cd client && yarn audit

# With details
yarn audit --json > audit-report.json
```

---

### 2️⃣ CodeQL Analysis

**What It Does:**

- Semantic code analysis for security vulnerabilities
- Detects SQL injection, XSS, path traversal, etc.
- Analyzes TypeScript and JavaScript

**Languages Scanned:**

- JavaScript
- TypeScript

**Configuration:**

```yaml
queries: security-and-quality
```

**View Results:**

- Go to: **Security** tab → **Code scanning alerts**
- GitHub shows vulnerabilities with severity and remediation

**No Setup Required:**

- CodeQL is free for public repositories
- Runs automatically on every push

---

### 3️⃣ Docker Image Security Scan

**Tool Used:** Trivy by Aqua Security

**Current Status:**

- ⚠️ **Skipped** - No Dockerfile exists yet
- Workflow checks for Dockerfile before running
- Won't fail if Dockerfile is missing

**When Dockerfile Added:**

The workflow will automatically:

1. Build the Docker image
2. Scan for vulnerabilities (CRITICAL, HIGH)
3. Upload results to GitHub Security

**To Enable Docker Scanning:**

1. Create `server/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copy source
COPY . .

# Build
RUN yarn build

# Expose port
EXPOSE 3001

# Start
CMD ["node", "dist/main.js"]
```

2. Push changes - Trivy will scan automatically

**Run Trivy Locally:**

```bash
# Install Trivy
brew install aquasecurity/trivy/trivy  # macOS
# Or: https://aquasecurity.github.io/trivy/latest/getting-started/installation/

# Build image
docker build -t fullstack-server:latest ./server

# Scan image
trivy image fullstack-server:latest

# Scan with specific severity
trivy image --severity CRITICAL,HIGH fullstack-server:latest

# Generate report
trivy image --format json --output trivy-report.json fullstack-server:latest
```

---

### 4️⃣ Secrets Scanning

**Tool Used:** TruffleHog OSS

**What It Detects:**

- API keys
- Private keys
- Passwords
- AWS credentials
- Database connection strings
- OAuth tokens

**Configuration:**

```yaml
extra_args: --debug --only-verified
```

**Best Practices:**

- ✅ Use environment variables for secrets
- ✅ Add secrets to `.gitignore`
- ✅ Use GitHub Secrets for CI/CD
- ✅ Rotate leaked secrets immediately
- ❌ Never commit `.env` files
- ❌ Never hardcode credentials

**If Secrets Detected:**

1. **Immediately rotate** the leaked secret
2. Remove from git history:
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch path/to/file" \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push (⚠️ dangerous):
   ```bash
   git push origin --force --all
   ```

---

## 📅 Scheduled Scans

Security scans run:

- ✅ **On every push** to any branch
- ✅ **On every pull request**
- ✅ **Daily at 2 AM UTC** (scheduled)

```yaml
schedule:
  - cron: '0 2 * * *' # Daily at 2 AM UTC
```

---

## 🚨 Handling Security Alerts

### Dependency Vulnerabilities

1. **View Alerts:**
   - Go to **Security** tab → **Dependabot alerts**
   - Check **Actions** tab for audit results

2. **Fix Vulnerabilities:**

   ```bash
   # Update specific package
   cd server
   yarn upgrade package-name

   # Update all dependencies
   yarn upgrade

   # Check for outdated
   yarn outdated
   ```

3. **Review Changes:**

   ```bash
   yarn test
   yarn lint
   ```

4. **Commit Fix:**
   ```bash
   git commit -m "fix(deps): upgrade vulnerable dependencies"
   ```

### Code Vulnerabilities (CodeQL)

1. **View Alerts:**
   - Go to **Security** tab → **Code scanning alerts**

2. **Analyze Issue:**
   - Read the vulnerability description
   - Check affected code location
   - Review remediation suggestions

3. **Fix Code:**
   - Follow GitHub's remediation guidance
   - Use parameterized queries for SQL
   - Sanitize user inputs
   - Validate data types

4. **Test Fix:**

   ```bash
   yarn test
   yarn test:cov
   ```

5. **Commit Fix:**
   ```bash
   git commit -m "fix(security): resolve SQL injection vulnerability"
   ```

---

## 🔍 Security Best Practices

### Environment Variables

**✅ DO:**

```typescript
// server/src/config/database.config.ts
export const databaseConfig = {
  host: process.env.DATABASE_HOST,
  password: process.env.DATABASE_PASSWORD,
};
```

**❌ DON'T:**

```typescript
// ❌ NEVER DO THIS
export const databaseConfig = {
  host: 'localhost',
  password: 'my-secret-password', // NEVER hardcode
};
```

### Input Validation

**✅ DO:**

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

**❌ DON'T:**

```typescript
// ❌ No validation
const user = await this.create(req.body);
```

### Database Queries

**✅ DO:**

```typescript
// Parameterized query
const user = await this.repository.findOne({
  where: { email: dto.email },
});
```

**❌ DON'T:**

```typescript
// ❌ String concatenation = SQL injection risk
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

### Authentication

**✅ DO:**

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: JwtPayload) {
  return this.service.getProfile(user.sub);
}
```

**❌ DON'T:**

```typescript
// ❌ No authentication
@Get('profile')
getProfile(@Query('userId') userId: string) {
  return this.service.getProfile(userId);
}
```

---

## 🛠️ Troubleshooting

### Snyk Fails: "SNYK_TOKEN not found"

**Problem:** Snyk token not configured

**Solution:**

- Get token from https://snyk.io/
- Add to GitHub Secrets as `SNYK_TOKEN`
- Or: Ignore (workflow has `continue-on-error: true`)

### CodeQL Fails: "Out of memory"

**Problem:** Large codebase

**Solution:** Add to workflow:

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    ram: 4096 # Increase memory
```

### Trivy Fails: "Image not found"

**Problem:** No Dockerfile exists

**Solution:**

- ✅ Already fixed - workflow checks for Dockerfile
- Create Dockerfile to enable scanning
- Or: Disable docker-scan job

### TruffleHog Fails: "Too many commits"

**Problem:** Large git history

**Solution:** Limit scan depth:

```yaml
extra_args: --max-depth 100 --only-verified
```

---

## 📊 Security Reports

### Viewing Reports

1. **GitHub Security Tab:**
   - Dependabot alerts
   - Code scanning alerts (CodeQL)
   - Secret scanning alerts

2. **Actions Tab:**
   - Detailed workflow logs
   - Artifact downloads (audit results)

3. **Pull Requests:**
   - Security checks status
   - New vulnerabilities introduced

### Generating Reports Locally

```bash
# Dependency audit
cd server && yarn audit --json > audit-report.json

# Trivy scan (if Dockerfile exists)
docker build -t fullstack-server:latest ./server
trivy image --format json --output trivy-report.json fullstack-server:latest

# CodeQL (requires GitHub CLI)
gh api /repos/k-kaundal/fullstack-nnp-template/code-scanning/alerts
```

---

## 🔐 Security Checklist

### Before Every Commit

- [ ] No hardcoded secrets or credentials
- [ ] Environment variables used for sensitive data
- [ ] Input validation on all user inputs
- [ ] Parameterized database queries
- [ ] Authentication on protected endpoints
- [ ] Error messages don't leak sensitive info

### Before Every Release

- [ ] Run full security scan
- [ ] Update all dependencies
- [ ] Review and fix all security alerts
- [ ] Rotate any exposed secrets
- [ ] Update security documentation
- [ ] Test authentication flows

### Monthly

- [ ] Review Dependabot alerts
- [ ] Update dependencies
- [ ] Check for new CVEs
- [ ] Audit access tokens
- [ ] Review user permissions

---

## 📚 Additional Resources

- **Snyk**: https://docs.snyk.io/
- **CodeQL**: https://codeql.github.com/docs/
- **Trivy**: https://aquasecurity.github.io/trivy/
- **TruffleHog**: https://github.com/trufflesecurity/trufflehog
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **GitHub Security**: https://docs.github.com/en/code-security

---

**Need help?** Open an issue or check the
[contributing guide](../CONTRIBUTING.md).
