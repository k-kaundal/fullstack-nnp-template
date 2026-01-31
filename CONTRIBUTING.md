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

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements

### Examples

```
feat(users): add email verification endpoint
fix(auth): resolve token refresh race condition
docs(readme): update installation instructions
test(users): add integration tests for user service
refactor(api): improve error handling consistency
```

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
