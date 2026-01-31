# Fullstack NNP Template - Contributing Guide

Thank you for considering contributing to this template! This guide will help
you understand how to contribute effectively.

## 🎯 Purpose

This template is designed to be a production-ready base for fullstack
applications. All contributions should maintain:

- Code quality and consistency
- Comprehensive documentation
- Test coverage
- Type safety
- Best practices

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/fullstack-nnp-template.git
   ```
3. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) enforced
by **commitlint** and **husky**.

### Automated Git Hooks

This project uses **Husky v10** for automated pre-commit and commit-msg
validation:

#### Pre-commit Hook

- **Runs automatically** before each commit
- **lint-staged**: Lints and formats only staged files
- **TypeScript type checking**: Validates types in server and client
- **Auto-fixes**: ESLint and Prettier run automatically

#### Commit Message Hook

- **Validates commit message format** using commitlint
- **Enforces conventional commits** - commit will fail if format is wrong
- **Required format**: `<type>: <description>`

### Commit Format (REQUIRED)

**✅ Correct Format:**

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve token refresh bug"
git commit -m "docs: update API documentation"
```

**❌ Incorrect Format (will fail):**

```bash
git commit -m "add user authentication"      # Missing type and colon
git commit -m "feat add authentication"      # Missing colon
git commit -m "Added new feature"            # Wrong format
```

### Commit Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (dependencies, config)
- `perf:` - Performance improvements
- `ci:` - CI/CD changes
- `build:` - Build system changes
- `revert:` - Revert previous commit

### Commit Message Examples

**With Scope (optional but recommended):**

```bash
feat(users): add email verification endpoint
fix(auth): resolve token refresh race condition
docs(readme): update installation instructions
test(users): add integration tests for user service
refactor(api): improve error handling consistency
chore(deps): upgrade typescript to 5.3.3
ci(github): add SonarQube analysis workflow
perf(cache): optimize cache key generation
```

**Without Scope:**

```bash
feat: add GraphQL support
fix: resolve YAML syntax errors
docs: add Git workflow documentation
test: increase coverage to 85%
```

### Pre-commit Workflow

When you run `git commit`:

1. **lint-staged runs:**
   - Server TypeScript files: `cd server && yarn lint --fix && yarn format`
   - Client TypeScript files: `cd client && yarn lint --fix && yarn format`
   - JSON/Markdown files: `yarn format` (Prettier)
   - Auto-stages fixed files

2. **TypeScript type check:**
   - Server: `cd server && yarn tsc --noEmit`
   - Client: `cd client && yarn tsc --noEmit`

3. **Commit message validation:**
   - commitlint checks format
   - Fails if not conventional commit format

4. **Commit succeeds if all pass ✅**

### Bypassing Hooks (NOT RECOMMENDED)

Only use in emergencies:

```bash
git commit --no-verify -m "emergency: fix critical production bug"
```

### Troubleshooting Commit Failures

**Error: "subject may not be empty" or "type may not be empty"**

- **Problem**: Missing colon (`:`) after type
- **Solution**: Use format `type: description`

```bash
# ❌ Wrong
git commit -m "fix bug"

# ✅ Correct
git commit -m "fix: resolve bug in authentication"
```

**Error: "Command 'eslint' not found"**

- **Problem**: ESLint not installed in workspace
- **Solution**: Run `yarn install` in server/ and client/

**Error: "Type check failed"**

- **Problem**: TypeScript errors in code
- **Solution**: Fix TypeScript errors before committing

### Best Practices

1. **Commit often** - Small, focused commits
2. **Clear messages** - Explain what and why, not how
3. **Test first** - Run tests before committing
4. **Atomic commits** - One logical change per commit
5. **No WIP commits** - Finish work before committing to main branches

## 🧪 Testing Requirements

All contributions must include tests:

### Backend

- Unit tests for services
- Controller tests
- E2E tests for critical flows
- Minimum 80% code coverage

```bash
cd server
yarn test
yarn test:cov
```

### Frontend

- Component tests (when applicable)
- Integration tests for critical features

## ✅ Pull Request Process

### Monorepo Structure & Linting

This project uses a **monorepo structure** with workspace-specific linting:

```
root/                    # Only Prettier, lint-staged, husky
├── server/              # ESLint 9 + @typescript-eslint v8
└── client/              # ESLint 9 + separate config
```

**lint-staged Configuration (.lintstagedrc.json):**

```json
{
  "*.{json,md,yml,yaml}": ["yarn prettier --write"],
  "*.{css,scss}": ["yarn prettier --write"],
  "server/**/*.{ts,tsx}": [
    "cd server && yarn lint --fix",
    "cd server && yarn format"
  ],
  "client/**/*.{ts,tsx}": [
    "cd client && yarn lint --fix",
    "cd client && yarn format"
  ]
}
```

**Key Points:**

- Root-level files: Prettier only (JSON, Markdown, YAML)
- Server TypeScript: ESLint + Prettier in server/ workspace
- Client TypeScript: ESLint + Prettier in client/ workspace
- Each workspace has its own ESLint config and dependencies

1. **Update Documentation**
   - Update README.md if adding features
   - Update Copilot instructions if changing patterns
   - Add JSDoc comments for complex code

2. **Code Quality Checks**

   ```bash
   # Backend
   cd server
   yarn lint
   yarn format
   yarn test

   # Frontend
   cd client
   yarn lint
   yarn format
   ```

3. **Create Pull Request**
   - Use a clear, descriptive title
   - Follow the PR template
   - Link related issues
   - Request review from maintainers

4. **PR Review**
   - Address all review comments
   - Keep discussions professional
   - Update based on feedback

## 🎨 Code Style

### TypeScript

- Use strict type checking
- Avoid `any` types
- Use interfaces for object shapes
- Use type aliases for unions/primitives

### Naming Conventions

- Variables/Functions: `camelCase`
- Classes/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case.ts` or `PascalCase.tsx`

### Backend (NestJS)

```typescript
// ✅ Good
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}

// ❌ Bad
export class UsersService {
  private usersRepository: any;

  async findAll() {
    return this.usersRepository.find();
  }
}
```

### Frontend (Next.js)

```typescript
// ✅ Good
interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant, children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// ❌ Bad
export function Button(props: any) {
  return <button>{props.children}</button>;
}
```

## 📦 Adding Dependencies

Before adding a new dependency:

1. **Check if it's necessary**
   - Can it be implemented simply without a library?
   - Is there already a similar dependency?

2. **Evaluate the package**
   - Is it actively maintained?
   - Does it have good documentation?
   - What's the bundle size impact?
   - Does it have known security issues?

3. **Add to appropriate package.json**
   - `dependencies` - Runtime dependencies
   - `devDependencies` - Development tools

4. **Update documentation**
   - Explain why it was added
   - Document how to use it

## 🐛 Reporting Bugs

Create an issue with:

- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Error messages/screenshots
- Possible solution (if known)

## 💡 Feature Requests

Create an issue with:

- Clear description of the feature
- Use cases
- Why it benefits the template
- Proposed implementation (optional)
- Alternatives considered

## 🔒 Security Issues

**DO NOT** create public issues for security vulnerabilities. Instead:

- Email the maintainers directly
- Provide detailed information
- Allow time for a fix before disclosure

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the project
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## 🏗️ Project Structure

When adding new features, follow the established structure:

### Backend

```
src/modules/<feature>/
├── dto/
│   ├── create-<feature>.dto.ts
│   └── update-<feature>.dto.ts
├── entities/
│   └── <feature>.entity.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── <feature>.module.ts
├── <feature>.controller.spec.ts
└── <feature>.service.spec.ts
```

### Frontend

```
app/<feature>/
├── page.tsx
├── layout.tsx (if needed)
└── loading.tsx (if needed)

components/<feature>/
├── <Feature>List.tsx
├── <Feature>Item.tsx
└── <Feature>Form.tsx
```

## 🎓 Learning Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 📞 Questions?

- Create a discussion on GitHub
- Check existing issues and PRs
- Review the documentation

## 🙏 Thank You!

Every contribution, no matter how small, is valued and appreciated!

---

_This contributing guide is subject to change. Please check back regularly._
