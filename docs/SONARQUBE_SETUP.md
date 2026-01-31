# SonarQube/SonarCloud Configuration Guide

## 🎯 Overview

This project uses **SonarCloud** for continuous code quality and security
analysis.

## ⚙️ Configuration

### File: `sonar-project.properties`

```properties
# Project identification
sonar.projectKey=k-kaundal_fullstack-nnp-template
sonar.organization=kaundal-vip
sonar.projectName=Fullstack NNP Template

# Source directories (NO wildcards allowed)
sonar.sources=server/src,client/app,client/components,client/lib
sonar.tests=server/test,server/src

# Test file patterns (wildcards allowed here)
sonar.test.inclusions=**/*.spec.ts,**/*.test.ts,**/*.test.tsx

# Exclusions (wildcards allowed)
sonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/coverage/**

# Coverage reports
sonar.typescript.lcov.reportPaths=server/coverage/lcov.info
```

## 🚨 Important Rules

### ❌ NO Wildcards in Sources/Tests

```properties
# ❌ WRONG - Will cause error
sonar.sources=server/**/*.ts
sonar.tests=server/test/**/*.spec.ts

# ✅ CORRECT - Only directory paths
sonar.sources=server/src,client/app
sonar.tests=server/test,server/src
```

### ✅ Wildcards Allowed in Inclusions/Exclusions

```properties
# ✅ CORRECT - Wildcards work here
sonar.test.inclusions=**/*.spec.ts,**/*.test.ts
sonar.exclusions=**/node_modules/**,**/dist/**
```

## 🔧 Setup SonarCloud

### 1. Create SonarCloud Account

1. Go to https://sonarcloud.io/
2. Sign in with GitHub
3. Authorize SonarCloud

### 2. Import Repository

1. Click **"+"** → **"Analyze new project"**
2. Select organization (or create one)
3. Import: `k-kaundal/fullstack-nnp-template`

### 3. Get Token

1. Go to **My Account** → **Security**
2. Generate token:
   - Name: `GitHub Actions`
   - Type: **Project Analysis Token**
3. Copy the token

### 4. Add to GitHub Secrets

1. Go to repository settings:

   ```
   https://github.com/k-kaundal/fullstack-nnp-template/settings/secrets/actions
   ```

2. Add secret:
   - Name: `SONAR_TOKEN`
   - Value: Paste token from SonarCloud

## 📊 Analysis Details

### What SonarCloud Analyzes

- **Code Quality:**
  - Code smells
  - Duplications
  - Maintainability issues

- **Security:**
  - Security hotspots
  - Vulnerabilities
  - Hard-coded credentials

- **Reliability:**
  - Bugs
  - Code reliability issues

- **Coverage:**
  - Test coverage percentage
  - Uncovered lines

### Quality Gates

```properties
sonar.qualitygate.wait=true
sonar.qualitygate.timeout=300
```

**Default Quality Gate:**

- Coverage ≥ 80%
- Maintainability Rating = A
- Reliability Rating = A
- Security Rating = A
- 0 Bugs
- 0 Vulnerabilities
- 0 Security Hotspots

## 🔕 Suppressing False Positives

### Hard-Coded Password False Positives

For validation error messages like `"Password is required"`:

```properties
sonar.issue.ignore.multicriteria=e1,e2,e3

# Ignore in client components
sonar.issue.ignore.multicriteria.e1.ruleKey=typescript:S2068
sonar.issue.ignore.multicriteria.e1.resourceKey=**/client/app/**/*.tsx

# Ignore in DTOs
sonar.issue.ignore.multicriteria.e2.ruleKey=typescript:S2068
sonar.issue.ignore.multicriteria.e2.resourceKey=**/dto/**
```

### Insecure Random in Tests

For test files using `Math.random()`:

```properties
sonar.issue.ignore.multicriteria.e3.ruleKey=typescript:S2245
sonar.issue.ignore.multicriteria.e3.resourceKey=**/*.spec.ts,**/*.test.ts
```

## 🐛 Common Errors

### Error: "Invalid value of sonar.tests"

```
ERROR Invalid value of sonar.tests
ERROR Wildcards ** and * are not supported in "sonar.sources" and "sonar.tests"
```

**Problem:** Wildcards in `sonar.tests` or `sonar.sources`

**Solution:**

```properties
# ❌ Wrong
sonar.tests=server/test/**/*.spec.ts

# ✅ Correct
sonar.tests=server/test,server/src
sonar.test.inclusions=**/*.spec.ts
```

### Error: "Could not find a default branch"

**Problem:** Branch protection or token issues

**Solution:** Ensure `SONAR_TOKEN` is set in GitHub Secrets

### Error: "Quality gate failed"

**Problem:** Code doesn't meet quality standards

**Solution:**

1. Check SonarCloud dashboard
2. Fix reported issues
3. Re-run analysis

## 📈 Viewing Results

### On SonarCloud

1. Go to:
   https://sonarcloud.io/project/overview?id=k-kaundal_fullstack-nnp-template
2. View:
   - **Overview** - Summary and quality gate status
   - **Issues** - Code smells, bugs, vulnerabilities
   - **Security Hotspots** - Security concerns
   - **Measures** - Detailed metrics
   - **Code** - File-by-file analysis

### In Pull Requests

SonarCloud automatically comments on PRs with:

- Quality gate status (✅/❌)
- New issues introduced
- Coverage changes
- Link to detailed analysis

### Quality Gate Badge

Add to README.md:

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=k-kaundal_fullstack-nnp-template&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=k-kaundal_fullstack-nnp-template)
```

## 🔄 Running Analysis

### Automatic (CI/CD)

Analysis runs automatically via GitHub Actions:

```yaml
# .github/workflows/sonarqube.yml
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

**Triggers:**

- Every push to any branch
- Every pull request

### Manual (Local)

Install SonarScanner:

```bash
# macOS
brew install sonar-scanner

# Or download from:
# https://docs.sonarcloud.io/advanced-setup/ci-based-analysis/sonarscanner-cli/
```

Run analysis:

```bash
# Generate coverage first
cd server && yarn test:cov && cd ..

# Run SonarScanner
sonar-scanner \
  -Dsonar.projectKey=k-kaundal_fullstack-nnp-template \
  -Dsonar.organization=kaundal-vip \
  -Dsonar.sources=server/src \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.token=YOUR_SONAR_TOKEN
```

## 📋 Best Practices

### 1. Fix Issues Promptly

- Don't let issues accumulate
- Fix security issues immediately
- Address code smells regularly

### 2. Maintain Coverage

- Keep coverage ≥ 80%
- Write tests for new features
- Don't skip test coverage

### 3. Review Reports

- Check SonarCloud before merging PRs
- Address new issues introduced
- Monitor quality trends

### 4. Suppress Wisely

- Only suppress false positives
- Document why suppression is needed
- Review suppressions regularly

### 5. Update Configuration

- Keep sonar-project.properties updated
- Add new source directories
- Update exclusions as needed

## 🔗 Additional Resources

- **SonarCloud Docs**: https://docs.sonarcloud.io/
- **Rules Reference**: https://rules.sonarsource.com/
- **Quality Gates**: https://docs.sonarcloud.io/improving/quality-gates/
- **GitHub Integration**:
  https://docs.sonarcloud.io/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/

---

**Need help?** Open an issue or check the
[contributing guide](../CONTRIBUTING.md).
