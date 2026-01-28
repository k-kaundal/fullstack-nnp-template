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

#### Test Types
The backend includes two types of tests:
1. **Unit Tests** - Test individual services and controllers in isolation
2. **E2E Tests** - Test the full application flow including database operations

#### Running Tests
```bash
cd server

# Unit tests (fast, isolated)
yarn test                    # Run all unit tests
yarn test:watch              # Run in watch mode
yarn test:cov                # Generate coverage report

# E2E tests (full application testing)
yarn test:e2e                # Run E2E tests (requires test_db)
yarn test:e2e:setup          # Setup test database and run E2E tests
```

#### Test Setup and Configuration

**E2E Test Setup:**
The E2E tests require a test database. The setup process:
1. Creates a PostgreSQL database named `test_db`
2. Configures test environment variables
3. Applies global prefix `/api/v1` to match production
4. Enables database synchronization for test environment
5. Runs all tests against real database

**Setup Script:**
```bash
# Setup test database (one-time setup)
cd server
./test/setup-test-db.sh
```

**Environment Variables for Testing:**
Test environment variables are configured in `test/setup-e2e.ts`:
- `NODE_ENV=test`
- `DATABASE_NAME=test_db`
- Database auto-synchronization enabled
- Mail service configured with test credentials

#### Writing Unit Tests

**Service Test Example:**
```typescript
// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Response } from 'express';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    // Mock Response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      req: { url: '/users' } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!'
      };
      const mockUser = {
        id: '123',
        ...createDto,
        isActive: true
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockUser as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUser as any);

      await service.create(createDto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({ id: '123' }),
        }),
      );
    });

    it('should return error if email already exists', async () => {
      const createDto = { email: 'test@example.com' };
      const existingUser = { id: '123', ...createDto };

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingUser as any);

      await service.create(createDto as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
    });
  });
});
```

**Controller Test Example:**
```typescript
// src/users/users.controller.spec.ts
describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      req: { url: '/users' } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should call service.create with correct parameters', async () => {
    const createDto = { email: 'test@example.com' };
    await controller.create(createDto as any, mockResponse as Response);
    expect(service.create).toHaveBeenCalledWith(createDto, mockResponse);
  });
});
```

#### Writing E2E Tests

**E2E Test Example:**
```typescript
// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('API E2E Tests', () => {
  let app: INestApplication;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same configuration as main.ts
    app.setGlobalPrefix('api/v1', { exclude: ['/'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'SecurePass123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'success');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).not.toHaveProperty('password');
          createdUserId = res.body.data.id;
        });
    });
  });
});
```

#### Test Standards and Best Practices

**Mandatory Requirements:**
- ✅ Every controller MUST have a `.controller.spec.ts` file
- ✅ Every service MUST have a `.service.spec.ts` file
- ✅ Test coverage should be >80%
- ✅ All tests must pass before committing
- ✅ Update tests when modifying services/controllers

**Best Practices:**
1. **Mock External Dependencies** - Database, HTTP requests, file system
2. **Test Both Success and Error Cases** - Cover all code paths
3. **Use Descriptive Test Names** - Clear what is being tested
4. **Keep Tests Isolated** - No shared state between tests
5. **Test Edge Cases** - Boundary conditions, null values, empty arrays
6. **Use Test Setup/Teardown** - beforeEach, afterEach, beforeAll, afterAll

**API Response Format to Test:**
```typescript
// Success Response Structure
{
  status: 'success',
  statusCode: 200,
  message: 'Operation successful',
  data: { /* your data */ },
  meta: {
    user_id: 'uuid',           // snake_case for meta fields
    created_at: '2026-01-28',
    total_pages: 5,
    has_next: true
  },
  timestamp: '2026-01-28T10:00:00.000Z',
  path: '/api/v1/users'
}

// Error Response Structure
{
  status: 'error',
  statusCode: 400,
  message: 'Validation failed',
  errors: ['Email is required'],
  timestamp: '2026-01-28T10:00:00.000Z',
  path: '/api/v1/users'
}
```

**Important Notes:**
- ⚠️ Password field must NEVER be returned in responses
- ⚠️ All meta fields use snake_case (user_id, created_at, total_pages)
- ⚠️ E2E tests use real database (test_db)
- ⚠️ Unit tests mock all external dependencies
- ⚠️ Mail service errors in tests are expected (SMTP not configured)

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
