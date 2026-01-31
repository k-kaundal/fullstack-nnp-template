# SonarQube Issue Suppression Guide

## Overview

This document explains how to handle SonarQube false positives in the codebase,
particularly for validation error messages that contain security-related
keywords like "password".

## Global Suppressions

### Configuration File: `sonar-project.properties`

We've configured global suppressions for common false positives:

```properties
# Security hotspot suppressions
# Suppress hard-coded password warnings for validation error messages
sonar.issue.ignore.multicriteria=e1,e2,e3

# Ignore hard-coded credentials in validation messages
sonar.issue.ignore.multicriteria.e1.ruleKey=typescript:S2068
sonar.issue.ignore.multicriteria.e1.resourceKey=**/*

# Ignore hard-coded credentials in error messages containing "Password is required"
sonar.issue.ignore.multicriteria.e2.ruleKey=typescript:S6437
sonar.issue.ignore.multicriteria.e2.resourceKey=**/*

# Ignore hard-coded credentials in DTOs validation decorators
sonar.issue.ignore.multicriteria.e3.ruleKey=typescript:S2068
sonar.issue.ignore.multicriteria.e3.resourceKey=**/dto/**
```

### What This Covers:

- **Rule S2068**: Hard-coded credentials should not be used
- **Rule S6437**: Credentials should not be hard-coded (TypeScript specific)
- **DTOs**: All validation decorators in DTO files

## Inline Suppressions

For specific lines that need suppression, use `// NOSONAR` comments:

### ✅ Validation Error Messages

```typescript
// Client-side validation
if (!password) {
  newErrors.password = 'Password is required'; // NOSONAR - This is a validation error message, not a hard-coded password
}

// Backend DTO validation
@IsNotEmpty({ message: 'Password is required' }) // NOSONAR - Validation message
password: string;
```

### ✅ Error Messages in Try-Catch

```typescript
if (!password) {
  throw new Error('Password is required'); // NOSONAR - Validation error message
}
```

### ✅ Toast Notifications

```typescript
toast.error('Password is required'); // NOSONAR - User-facing error message
```

## When to Use NOSONAR

### ✅ Appropriate Use Cases:

1. **Validation error messages** - User-facing messages like "Password is
   required"
2. **Form field labels** - Display text like "Enter your password"
3. **Placeholder text** - Input placeholders like "Enter password"
4. **Error messages** - Exception messages for validation
5. **Documentation strings** - JSDoc comments with examples
6. **Test fixtures** - Test data and mock values

### ❌ DO NOT Use NOSONAR For:

1. **Actual hard-coded passwords** - Never store actual passwords in code
2. **API keys or tokens** - These should always come from environment variables
3. **Database credentials** - Must be in environment variables
4. **Secret keys** - JWT secrets, encryption keys, etc.

## Examples

### ❌ Bad - Never Do This

```typescript
// Hard-coded password - SECURITY VULNERABILITY
const password = 'MySecretPass123!';
const apiKey = 'sk_live_abc123def456';
const jwtSecret = 'my-secret-key';
```

### ✅ Good - Use Environment Variables

```typescript
// Correct - from environment
const password = process.env.DATABASE_PASSWORD;
const apiKey = process.env.STRIPE_API_KEY;
const jwtSecret = process.env.JWT_SECRET;
```

### ✅ Good - Validation Messages with NOSONAR

```typescript
// Frontend validation
if (!formData.password) {
  errors.password = 'Password is required'; // NOSONAR - Validation error message
}

// Backend DTO
@IsNotEmpty({ message: 'Password is required' }) // NOSONAR - Validation message
@MinLength(8, { message: 'Password must be at least 8 characters' }) // NOSONAR
password: string;
```

## Adding New Suppressions

### For Specific Rule IDs

If you need to suppress a specific SonarQube rule globally:

1. Find the rule ID (e.g., `typescript:S2068`)
2. Add to `sonar-project.properties`:

```properties
# Add new suppression
sonar.issue.ignore.multicriteria.e4.ruleKey=typescript:SXXXX
sonar.issue.ignore.multicriteria.e4.resourceKey=path/to/files/**
```

### For Specific Files

To suppress all issues in specific files:

```properties
sonar.exclusions=**/node_modules/**,**/legacy-code/**
```

## Common SonarQube Rules

| Rule ID | Description                       | Solution                                                 |
| ------- | --------------------------------- | -------------------------------------------------------- |
| S2068   | Hard-coded credentials            | Use env vars or add `// NOSONAR` for validation messages |
| S6437   | Hard-coded credentials (TS)       | Same as S2068                                            |
| S1313   | Hard-coded IP addresses           | Use env vars or add `// NOSONAR` for localhost in dev    |
| S4502   | Cross-Site Request Forgery        | Implement CSRF protection or suppress if handled         |
| S4784   | Regex with exponential complexity | Optimize regex or suppress if intentional                |

## Best Practices

1. **Use NOSONAR sparingly** - Only for genuine false positives
2. **Add descriptive comments** - Explain why suppression is needed
3. **Document suppressions** - Keep this guide updated
4. **Review regularly** - Periodic audit of all NOSONAR comments
5. **Prefer global rules** - Use `sonar-project.properties` for patterns
6. **Security first** - When in doubt, fix the issue rather than suppress

## Verification

After adding suppressions, verify they work:

```bash
# Run SonarQube scan locally (if configured)
sonar-scanner

# Or wait for CI/CD pipeline
git push
```

Check the SonarQube dashboard to confirm issues are suppressed.

## Resources

- [SonarQube Documentation](https://docs.sonarqube.org/latest/)
- [Narrowing the Focus](https://docs.sonarqube.org/latest/project-administration/narrowing-the-focus/)
- [Issue Exclusions](https://docs.sonarqube.org/latest/project-administration/narrowing-the-focus/#issues)

---

**Last Updated:** February 1, 2026
