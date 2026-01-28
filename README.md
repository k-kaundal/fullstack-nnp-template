# Fullstack NNP Template 🚀

**A production-ready fullstack template using NestJS + Next.js + PostgreSQL**

This template provides a solid foundation for building modern fullstack applications with best practices, proper validation, testing, and code standards built-in.

## 🎯 Features

### Backend (NestJS)
- ✅ **TypeScript** with strict type checking
- ✅ **NestJS** - Progressive Node.js framework
- ✅ **TypeORM** - Database ORM with migrations
- ✅ **PostgreSQL** - Robust relational database
- ✅ **Swagger** - Auto-generated API documentation
- ✅ **Class Validator** - DTO validation
- ✅ **Global Exception Filter** - Consistent error handling
- ✅ **Response Interceptor** - Standardized API responses
- ✅ **Environment Validation** - Type-safe configuration
- ✅ **Jest** - Unit and E2E testing
- ✅ **ESLint & Prettier** - Code quality and formatting

### Frontend (Next.js)
- ✅ **Next.js 16** - React framework with App Router
- ✅ **React 19** - Latest React features
- ✅ **TypeScript** - Type safety
- ✅ **Tailwind CSS** - Utility-first CSS
- ✅ **API Client** - Type-safe API integration
- ✅ **ESLint** - Code quality
- ✅ **Prettier** - Code formatting

### Infrastructure
- ✅ **Docker Compose** - PostgreSQL and pgAdmin setup
- ✅ **GitHub Copilot Instructions** - AI-assisted development
- ✅ **Git Hooks** - Pre-commit quality checks
- ✅ **Conventional Commits** - Standardized commit messages

## 📦 Project Structure

```
fullstack-nnp-template/
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities and API client
│   └── public/           # Static assets
│
├── server/                # NestJS backend
│   ├── src/
│   │   ├── common/       # Shared utilities
│   │   │   ├── filters/  # Exception filters
│   │   │   ├── interceptors/  # Response interceptors
│   │   │   └── pipes/    # Validation pipes
│   │   ├── config/       # Configuration files

│   │   │-- users/    # Example user module
│   │   │     ├── dto/         # Data Transfer Objects
│   │   │     ├── entities/    # TypeORM entities
│   │   │     ├── users.controller.ts
│   │   │     ├── users.service.ts
│   │   │     ├── users.module.ts
│   │   │     └── *.spec.ts    # Tests
│   │   └── main.ts       # Application entry point
│   └── test/             # E2E tests
│
├── .github/
│   └── copilot-instructions.md  # Copilot guidance
│
└── docker-compose.yml    # Database setup
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+
- **yarn** or **yarn**
- **Docker** (for PostgreSQL)

### 1. Clone the Repository
```bash
git clone <your-repo-url> my-new-project
cd my-new-project
```

### 2. Start Database
```bash
docker-compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- pgAdmin on `http://localhost:5050` (admin@admin.com / admin)

### 3. Setup Backend
```bash
cd server
yarn install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations (if any)
yarn migration:run

# Start development server
yarn start:dev
```

Backend will run on `http://localhost:3001`
Swagger docs: `http://localhost:3001/api/docs`

### 4. Setup Frontend
```bash
cd client
yarn install

# Copy and configure environment variables
cp .env.example .env.local

# Start development server
yarn dev
```

Frontend will run on `http://localhost:3000`

## 🛠️ Development

### Backend Commands
```bash
# Development
yarn start:dev          # Start with hot-reload
yarn start:debug        # Start in debug mode

# Building
yarn build              # Build for production
yarn start:prod         # Run production build

# Testing
yarn test               # Run unit tests
yarn test:watch         # Run tests in watch mode
yarn test:cov           # Run tests with coverage
yarn test:e2e           # Run E2E tests

# Code Quality
yarn lint               # Lint code
yarn format             # Format code with Prettier

# Database
yarn migration:generate -- -n MigrationName  # Generate migration
yarn migration:run      # Run migrations
yarn migration:revert   # Revert last migration
```

### Frontend Commands
```bash
# Development
yarn dev                # Start development server
yarn build              # Build for production
yarn start              # Start production server

# Code Quality
yarn lint               # Lint code
yarn format             # Format code with Prettier
```

## 📝 Creating a New Feature

### Backend (NestJS)

1. **Generate a new module:**
```bash
cd server
nest g module modules/posts
nest g controller modules/posts
nest g service modules/posts
```

2. **Create the entity:**
```typescript
// src/modules/posts/entities/post.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

3. **Create DTOs with validation:**
```typescript
// src/modules/posts/dto/create-post.dto.ts
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}
```

4. **Write tests:**
```typescript
// src/modules/posts/posts.service.spec.ts
describe('PostsService', () => {
  it('should create a post', async () => {
    // Your test
  });
});
```

### Frontend (Next.js)

1. **Add API client methods:**
```typescript
// lib/api.ts
async getPosts(): Promise<Post[]> {
  const response = await this.request<Post[]>('/posts');
  return response.data;
}
```

2. **Create a page:**
```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await apiClient.getPosts();
  return <div>{/* Render posts */}</div>;
}
```

## 🔒 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=fullstack_app
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:3001/api/docs`
- **JSON Schema**: `http://localhost:3001/api/docs-json`

## 🧪 Testing

### Backend Testing
```bash
cd server

# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Coverage report
yarn test:cov
```

### Writing Tests
```typescript
// Example service test
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should create a user', async () => {
    // Test implementation
  });
});
```

## 🎨 Code Style Guide

### General Rules
- Use **TypeScript** for all code
- Follow **functional programming** principles
- Keep functions **small and focused**
- Use **meaningful names** (camelCase for variables, PascalCase for classes)
- Add **JSDoc comments** for complex logic
- **No `any` types** - use proper typing

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat(users): add user registration endpoint
fix(auth): resolve token expiration issue
docs(readme): update installation steps
test(users): add unit tests for user service
refactor(api): improve error handling
```

## 🔍 Code Quality Checks

### Pre-commit Hooks
The template includes Husky for running checks before commits:
- ESLint validation
- Prettier formatting
- TypeScript compilation
- Unit tests

### Manual Checks
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

## 📖 Best Practices

### Backend
1. **Always use DTOs** for request validation
2. **Add Swagger decorators** to all endpoints
3. **Handle errors** with proper HTTP exceptions
4. **Use dependency injection** throughout
5. **Write tests** for all services and controllers
6. **Use transactions** for multi-step database operations
7. **Log important operations** with appropriate log levels

### Frontend
1. **Prefer Server Components** unless interactivity needed
2. **Use the API client** for all backend communication
3. **Type all props** and API responses
4. **Handle loading and error states**
5. **Keep components small** and reusable
6. **Use Tailwind CSS** for styling
7. **Avoid inline styles** when possible

### Database
1. **Always use migrations** - never modify entities directly in production
2. **Name migrations descriptively**
3. **Use UUID** for primary keys
4. **Add indexes** for frequently queried fields
5. **Use proper relationships** (OneToMany, ManyToOne, etc.)

## 🚢 Deployment

### Backend
```bash
cd server
yarn build
NODE_ENV=production yarn start:prod
```

### Frontend
```bash
cd client
yarn build
yarn start
```

### Docker (Coming Soon)
Production Docker configurations will be added in future updates.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

[MIT License](LICENSE)

## 🆘 Support

- Create an issue for bug reports
- Start a discussion for feature requests
- Check [GitHub Copilot Instructions](.github/copilot-instructions.md) for AI-assisted development

## 🎓 Learn More

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Happy Coding! 🎉**

*Built with ❤️ using NestJS, Next.js, and PostgreSQL*
