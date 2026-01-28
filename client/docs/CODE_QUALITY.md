# Code Quality Standards

## Overview
This document outlines the code quality standards and ESLint rules for the frontend application.

## ESLint Configuration

### Mandatory Rules (All set to ERROR)

#### 1. No Unused Variables/Imports
```javascript
'@typescript-eslint/no-unused-vars': 'error'
```

**Rule**: All variables and imports must be used, or prefixed with underscore if intentionally unused.

**Examples:**
```typescript
// ❌ BAD - unused import
import { User, Post } from '@/interfaces';  // Post not used
const name = 'John';  // name not used

// ✅ GOOD - all imports used
import { User } from '@/interfaces';

// ✅ GOOD - intentionally unused (required by interface)
function handleClick(_event: React.MouseEvent) {
  doSomething();
}
```

#### 2. No Explicit Any Types
```javascript
'@typescript-eslint/no-explicit-any': 'error'
```

**Rule**: Never use `any` type. Use proper types, `unknown`, generics, or union types.

**Examples:**
```typescript
// ❌ BAD - using any
function process(data: any) { ... }
const items: any[] = [];

// ✅ GOOD - proper types
function process<T>(data: T) { ... }
const items: User[] = [];
function handle(data: unknown) {
  if (isUser(data)) {
    // use data as User
  }
}
```

#### 3. No Console Statements
```javascript
'no-console': 'error'
```

**Rule**: No `console.log`, `console.error`, `console.warn` in production code.

**Examples:**
```typescript
// ❌ BAD - console statements
console.log('Debug:', user);
console.error('Error:', error);

// ✅ GOOD - proper error handling
// Frontend: Remove debug statements or use error service
try {
  await fetchData();
} catch (error) {
  setError('Failed to fetch data');
}

// Backend: Use NestJS Logger
this.logger.log('Processing data');
this.logger.error('Error occurred', error.stack);
```

#### 4. No Debugger Statements
```javascript
'no-debugger': 'error'
```

**Rule**: No `debugger` statements allowed.

#### 5. React Hooks Rules
```javascript
'react-hooks/rules-of-hooks': 'error'
'react-hooks/exhaustive-deps': 'error'
```

**Rule**: Hooks must follow React rules and have complete dependencies.

## File Organization Standards

### Strict Requirements

#### Interfaces
- **Location**: `interfaces/` folder
- **Extension**: `.interface.ts`
- **Rule**: ALL interfaces MUST be in this folder
- **Forbidden**: Inline interface definitions in components

```typescript
// ❌ BAD - inline interface
interface UserCardProps {
  user: User;
}

// ✅ GOOD - import from interfaces
import { UserCardProps } from '@/interfaces';
```

#### Types
- **Location**: `types/` folder
- **Extension**: `.types.ts`
- **Rule**: ALL type definitions MUST be in this folder
- **Forbidden**: Inline type definitions in components

```typescript
// ❌ BAD - inline type
type ResponseType = 'success' | 'error';

// ✅ GOOD - import from types
import { ResponseType } from '@/types';
```

#### Enums
- **Location**: `enums/` folder
- **Extension**: `.enum.ts`
- **Rule**: ALL enums MUST be in this folder
- **Forbidden**: Inline enum definitions in components

```typescript
// ❌ BAD - inline enum
enum UserStatus {
  Active = 'active',
  Inactive = 'inactive'
}

// ✅ GOOD - import from enums
import { UserStatus } from '@/enums';
```

## Running ESLint

### Commands
```bash
# Check for errors
yarn lint

# Auto-fix formatting issues
yarn lint --fix
```

### Before Every Commit
Run `yarn lint` and fix ALL errors. Zero tolerance policy.

### Common Fixes

#### Fix 1: Remove Unused Imports
```bash
# ESLint can auto-fix most unused imports
yarn lint --fix
```

#### Fix 2: Prefix Unused Parameters
```typescript
// If parameter is required by interface but not used
function handleSubmit(_event: React.FormEvent) {
  submitForm();
}
```

#### Fix 3: Add Explicit Types
```typescript
// Add type annotations to callbacks
users.map((user: User) => user.name)

// Or use typed arrays
const users: User[] = [];
users.map(user => user.name) // TypeScript infers type
```

## Pre-Commit Checklist

- [ ] **ESLint passes**: `yarn lint` shows NO errors
- [ ] **No unused variables or imports**
- [ ] **No console.log statements**
- [ ] **No debugger statements**
- [ ] **No inline interfaces/types/enums**
- [ ] **All interfaces in `/interfaces` folder**
- [ ] **All types in `/types` folder**
- [ ] **All enums in `/enums` folder**
- [ ] **All tests pass**: `yarn test`
- [ ] **TypeScript compiles**: `yarn tsc --noEmit`

## Zero Tolerance Policy

- **NO ESLint errors allowed in commits**
- **NO ESLint warnings should accumulate**
- Fix errors immediately, don't disable rules
- Never use `// eslint-disable` without team approval
- Code review will reject PRs with ESLint errors

## Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [React Hooks Rules](https://reactjs.org/docs/hooks-rules.html)
- [Project Copilot Instructions](/.github/copilot-instructions.md)
