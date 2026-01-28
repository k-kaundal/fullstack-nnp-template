# 🎯 Quick Reference Guide

## 🚀 Getting Started (First Time Setup)

```bash
# 1. Run the automated setup script
chmod +x setup.sh
./setup.sh

# 2. Start backend (Terminal 1)
cd server
yarn start:dev

# 3. Start frontend (Terminal 2)
cd client
yarn dev
```

## 📍 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:3001 | - |
| Swagger Docs | http://localhost:3001/api/docs | - |
| PostgreSQL | localhost:5432 | postgres / postgres |
| pgAdmin | http://localhost:5050 | admin@admin.com / admin |

## 🛠️ Common Commands

### Root Level
```bash
yarn install:all        # Install all dependencies
yarn db:start           # Start database
yarn db:stop            # Stop database
yarn db:reset           # Reset database
yarn dev:server         # Start backend
yarn dev:client         # Start frontend
yarn lint:server        # Lint backend
yarn lint:client        # Lint frontend
```

### Backend (server/)
```bash
yarn start:dev          # Development mode
yarn build              # Build for production
yarn test               # Run unit tests
yarn test:e2e           # Run E2E tests
yarn test:cov           # Test coverage
yarn lint               # Lint code
yarn format             # Format code
yarn migration:generate -- -n Name  # Generate migration
yarn migration:run      # Run migrations
yarn migration:revert   # Revert migration
```

### Frontend (client/)
```bash
yarn dev                # Development mode
yarn build              # Build for production
yarn start              # Start production server
yarn lint               # Lint code
yarn format             # Format code
```

## 📁 Project Structure

```
fullstack-nnp-template/
├── .github/
│   └── copilot-instructions.md    # AI coding standards
├── client/                         # Next.js frontend
│   ├── app/                       # App router
│   ├── components/                # React components
│   ├── lib/                       # Utilities & API client
│   └── public/                    # Static files
├── server/                        # NestJS backend
│   ├── src/
│   │   ├── common/               # Shared code
│   │   ├── config/               # Configuration
│   │   ├── modules/              # Feature modules
│   │   └── main.ts               # Entry point
│   └── test/                     # E2E tests
├── docker-compose.yml            # Database setup
├── setup.sh                      # Setup script
└── README.md                     # Main documentation
```

## 🔧 Creating a New Feature

### Backend Module
```bash
# Generate files
cd server
nest g module modules/posts
nest g controller modules/posts
nest g service modules/posts

# 1. Create entity (src/modules/posts/entities/post.entity.ts)
# 2. Create DTOs (src/modules/posts/dto/)
# 3. Implement service logic
# 4. Implement controller
# 5. Write tests
# 6. Add Swagger decorators
```

### Frontend Page
```bash
# 1. Create page (app/posts/page.tsx)
# 2. Add API methods (lib/api.ts)
# 3. Create components (components/posts/)
# 4. Style with Tailwind CSS
```

## 📝 Code Examples

### Backend Controller
```typescript
@Controller('posts')
@ApiTags('posts')
export class PostsController {
  @Post()
  @ApiOperation({ summary: 'Create post' })
  create(@Body() dto: CreatePostDto) {
    return this.service.create(dto);
  }
}
```

### Backend Service
```typescript
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private repo: Repository<Post>,
  ) {}

  async create(dto: CreatePostDto): Promise<Post> {
    const post = this.repo.create(dto);
    return this.repo.save(post);
  }
}
```

### DTO with Validation
```typescript
export class CreatePostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @ApiProperty()
  @IsString()
  content: string;
}
```

### Frontend Server Component
```typescript
export default async function PostsPage() {
  const posts = await apiClient.getPosts();
  return <div>{posts.map(post => ...)}</div>;
}
```

### Frontend Client Component
```typescript
'use client';

export function PostForm() {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await apiClient.createPost({ title });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 🧪 Testing

### Backend Unit Test
```typescript
describe('PostsService', () => {
  it('should create a post', async () => {
    const dto = { title: 'Test', content: 'Content' };
    const result = await service.create(dto);
    expect(result).toHaveProperty('id');
  });
});
```

### Run Tests
```bash
cd server
yarn test              # Unit tests
yarn test:watch        # Watch mode
yarn test:cov          # Coverage
yarn test:e2e          # E2E tests
```

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=fullstack_app
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## 📊 Database

### Start/Stop
```bash
docker-compose up -d       # Start
docker-compose down        # Stop
docker-compose down -v     # Stop and remove data
```

### Migrations
```bash
cd server
yarn migration:generate -- -n CreatePosts
yarn migration:run
yarn migration:revert
```

## 🎨 Code Standards

### Naming Conventions
- Variables/Functions: `camelCase`
- Classes/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case.ts` or `PascalCase.tsx`

### Commit Messages
```
feat(users): add email verification
fix(auth): resolve token issue
docs(readme): update setup steps
test(users): add service tests
refactor(api): improve error handling
```

## 🚨 Troubleshooting

### Database Connection Failed
```bash
# Restart Docker containers
docker-compose down
docker-compose up -d
```

### Port Already in Use
```bash
# Change PORT in .env (backend)
PORT=3002

# Or kill the process
lsof -ti:3001 | xargs kill -9
```

### Module Not Found
```bash
# Reinstall dependencies
cd server && yarn install
cd client && yarn install
```

### TypeScript Errors
```bash
# Clean build
rm -rf dist node_modules
yarn install
yarn build
```

## 📚 Resources

- [NestJS Docs](https://docs.nestjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeORM Docs](https://typeorm.io/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Swagger Docs](https://swagger.io/docs/)

## 🆘 Getting Help

1. Check the main [README.md](README.md)
2. Review [CONTRIBUTING.md](CONTRIBUTING.md)
3. Check [GitHub Issues](https://github.com/k-kaundal/fullstack-nnp-template/issues)
4. Read [Copilot Instructions](.github/copilot-instructions.md)

## ✅ Pre-commit Checklist

- [ ] Code is properly formatted (`yarn format`)
- [ ] No ESLint errors (`yarn lint`)
- [ ] All tests pass (`yarn test`)
- [ ] TypeScript compiles (`yarn build`)
- [ ] Environment variables are documented
- [ ] API documentation is updated
- [ ] Commit message follows conventions

---

**Happy coding! 🚀**
