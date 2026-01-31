# Database Features Guide

## Table of Contents
1. [Migrations](#migrations)
2. [Database Seeding](#database-seeding)
3. [Query Performance & Logging](#query-performance--logging)
4. [Data Sanitization & Security](#data-sanitization--security)
5. [Validation Decorators](#validation-decorators)
6. [Best Practices](#best-practices)

---

## Migrations

TypeORM migrations help manage database schema changes over time in a controlled, versioned manner.

### Migration Scripts

Four bash scripts are available in `server/scripts/`:

#### 1. Generate Migration (Auto-detect changes)
```bash
cd server
./scripts/generate-migration.sh AddUserRoles
```
- Compares current entities with database schema
- Auto-generates migration with UP and DOWN methods
- Named with timestamp: `1706310000000-AddUserRoles.ts`

#### 2. Create Empty Migration
```bash
cd server
./scripts/create-migration.sh AddCustomIndexes
```
- Creates empty migration template
- For custom SQL or complex changes
- You write the UP and DOWN logic

#### 3. Run Migrations
```bash
cd server
./scripts/run-migrations.sh
```
- Interactive script
- Shows pending migrations
- Confirms before running
- Executes all pending migrations

#### 4. Rollback Migration
```bash
cd server
./scripts/rollback-migration.sh
```
- Interactive script with safety prompts
- Reverts the last executed migration
- **Warning**: Data loss possible, use carefully

### Migration File Structure

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRoles1706310000000 implements MigrationInterface {
  name = 'AddUserRoles1706310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Forward migration (apply changes)
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "role" VARCHAR(50) DEFAULT 'user'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse migration (undo changes)
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "role"
    `);
  }
}
```

### Migration Best Practices

1. **Always create migrations for schema changes** - Never modify database manually
2. **Test rollback** - Ensure DOWN migration works before deploying
3. **Keep migrations small** - One logical change per migration
4. **Never modify old migrations** - Create new ones to fix issues
5. **Backup before rollback** - Rollback can cause data loss

### Common Migration Patterns

**Add Column:**
```typescript
await queryRunner.query(`
  ALTER TABLE "users" ADD COLUMN "phone" VARCHAR(20) NULL
`);
```

**Create Index:**
```typescript
await queryRunner.query(`
  CREATE INDEX "idx_users_email" ON "users" ("email")
`);
```

**Add Foreign Key:**
```typescript
await queryRunner.query(`
  ALTER TABLE "posts"
  ADD CONSTRAINT "fk_posts_user"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE
`);
```

---

## Database Seeding

Seeders populate the database with initial or test data for development and testing.

### Seeder Architecture

**Location**: `server/src/database/seeders/`

**Components:**
- `seeder.interface.ts` - Base interface for all seeders
- `seeder.service.ts` - Orchestrates all seeders
- `seeder.module.ts` - NestJS module
- `seed.cli.ts` - CLI for running seeders
- `users.seeder.ts` - Example users seeder

### Using the Seeder CLI

**Run all seeders:**
```bash
cd server
yarn seed
```

**Rollback all seeders:**
```bash
yarn seed:rollback
```

**Clear entire database:**
```bash
yarn seed:clear
```

### Creating Custom Seeders

**1. Create seeder file** (`posts.seeder.ts`):
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Seeder } from './seeder.interface';

@Injectable()
export class PostsSeeder implements Seeder {
  private readonly logger = new Logger(PostsSeeder.name);

  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Seeding posts...');

    const users = await this.usersRepository.find();
    if (users.length === 0) {
      this.logger.warn('No users found. Run users seeder first.');
      return;
    }

    const posts = [
      {
        title: 'First Post',
        content: 'This is the first post',
        author: users[0],
      },
      {
        title: 'Second Post',
        content: 'This is the second post',
        author: users[1],
      },
    ];

    for (const postData of posts) {
      const existing = await this.postsRepository.findOne({
        where: { title: postData.title },
      });

      if (!existing) {
        await this.postsRepository.save(postData);
        this.logger.log(`Created post: ${postData.title}`);
      }
    }

    this.logger.log('Posts seeded successfully');
  }

  async rollback(): Promise<void> {
    this.logger.log('Rolling back posts...');
    await this.postsRepository.delete({});
    this.logger.log('Posts rolled back successfully');
  }
}
```

**2. Register in SeederModule:**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { UsersSeeder } from './users.seeder';
import { PostsSeeder } from './posts.seeder';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post])],
  providers: [SeederService, UsersSeeder, PostsSeeder],
  exports: [SeederService],
})
export class SeederModule {}
```

**3. Add to SeederService:**
```typescript
constructor(
  private readonly usersSeeder: UsersSeeder,
  private readonly postsSeeder: PostsSeeder,
) {
  this.seeders = [this.usersSeeder, this.postsSeeder];
}
```

### Seeder Best Practices

1. **Check for existing data** - Don't create duplicates
2. **Handle dependencies** - Run dependent seeders in correct order
3. **Use transactions** - Rollback on error
4. **Log operations** - Provide visibility into seeding process
5. **Make idempotent** - Can run multiple times safely

---

## Query Performance & Logging

### Custom Database Logger

**Location**: `server/src/config/database-logger.config.ts`

**Features:**
- Logs all queries in development
- Detects slow queries (>100ms threshold)
- Provides optimization suggestions
- Colorized console output

**Automatic Integration:**
Enabled in development mode via `app.module.ts`:

```typescript
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    // ...other config
    logger: isProduction ? undefined : new DatabaseLogger(),
  }),
})
```

### Slow Query Alerts

**Example output:**
```
⚠️  SLOW QUERY (234ms):
SELECT * FROM "users" WHERE name LIKE '%john%'

💡 Optimization suggestions:
- Consider adding WHERE clause for better filtering
- Avoid SELECT *, specify required columns
- Add LIMIT clause to restrict result set
```

### Query Logging Best Practices

1. **Index frequently queried columns**
```typescript
@Entity('users')
export class User {
  @Index()
  @Column()
  email: string;

  @Index()
  @Column()
  firstName: string;
}
```

2. **Avoid N+1 queries - use eager loading**
```typescript
// ❌ BAD - N+1 query problem
const users = await userRepository.find();
for (const user of users) {
  const posts = await postRepository.find({ where: { userId: user.id } });
}

// ✅ GOOD - Single query with relation
const users = await userRepository.find({ relations: ['posts'] });
```

3. **Select only needed columns**
```typescript
// ❌ BAD - Fetches all columns
const users = await userRepository.find();

// ✅ GOOD - Only fetch required columns
const users = await userRepository.find({
  select: ['id', 'email', 'firstName'],
});
```

4. **Use pagination for large datasets**
```typescript
const [users, total] = await userRepository.findAndCount({
  skip: (page - 1) * limit,
  take: limit,
});
```

---

## Data Sanitization & Security

### Sanitization Middleware

**Location**: `server/src/common/middleware/sanitization.middleware.ts`

**Features:**
- XSS prevention (removes `<script>`, `<iframe>`, event handlers)
- SQL injection prevention (removes SQL keywords)
- JavaScript protocol removal (`javascript:`, `data:`)
- Recursive sanitization of nested objects/arrays

**Automatic Integration:**
Applied globally in `main.ts`:

```typescript
app.use(new SanitizationMiddleware().use);
```

### What Gets Sanitized

**XSS Patterns Removed:**
- `<script>` tags
- `<iframe>`, `<object>`, `<embed>` tags
- Event handlers (`onclick`, `onerror`, etc.)
- JavaScript protocols (`javascript:`, `data:`)

**SQL Injection Patterns Removed:**
- SQL keywords (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `DROP`)
- SQL comments (`--`, `/* */`)
- SQL operators (`UNION`, `JOIN`, `EXEC`)

**Example:**
```typescript
// Input
const userInput = {
  name: 'John<script>alert("xss")</script>',
  email: 'test@example.com"; DROP TABLE users;--',
};

// After sanitization
{
  name: 'John',
  email: 'test@example.com TABLE users',
}
```

### Security Best Practices

1. **Always use parameterized queries** - Let TypeORM handle escaping
2. **Validate input at DTO level** - Use class-validator decorators
3. **Sanitize before database operations** - Middleware handles this
4. **Never trust user input** - Always validate and sanitize
5. **Use HTTPS in production** - Protect data in transit

---

## Validation Decorators

**Location**: `server/src/common/decorators/validation.decorators.ts`

### Available Custom Validators

#### 1. `@IsStrongPassword()`
Requires 8+ characters, uppercase, lowercase, number, and special character.

```typescript
import { IsStrongPassword } from '../common/decorators/validation.decorators';

export class CreateUserDto {
  @IsStrongPassword()
  password: string;
}
```

#### 2. `@NoSqlInjection()`
Prevents SQL injection patterns.

```typescript
import { NoSqlInjection } from '../common/decorators/validation.decorators';

export class SearchDto {
  @NoSqlInjection()
  @IsString()
  query: string;
}
```

#### 3. `@NoXss()`
Prevents XSS attack patterns.

```typescript
import { NoXss } from '../common/decorators/validation.decorators';

export class CommentDto {
  @NoXss()
  @IsString()
  content: string;
}
```

#### 4. `@SafeString()`
Combines `@NoSqlInjection` and `@NoXss`.

```typescript
import { SafeString } from '../common/decorators/validation.decorators';

export class UpdateUserDto {
  @SafeString()
  @IsOptional()
  bio?: string;
}
```

#### 5. `@IsValidUUID()`
Validates UUID v4 format.

```typescript
import { IsValidUUID } from '../common/decorators/validation.decorators';

export class FindUserDto {
  @IsValidUUID()
  id: string;
}
```

#### 6. `@IsAlphanumericWithSpaces()`
Allows only alphanumeric characters and spaces.

```typescript
import { IsAlphanumericWithSpaces } from '../common/decorators/validation.decorators';

export class CreateUserDto {
  @IsAlphanumericWithSpaces()
  @MinLength(2)
  firstName: string;
}
```

### Combining Validators

```typescript
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import {
  IsStrongPassword,
  SafeString,
  NoXss,
} from '../common/decorators/validation.decorators';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @SafeString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @NoXss()
  @IsOptional()
  @MaxLength(500)
  bio?: string;
}
```

---

## Best Practices

### Database Performance

1. **Use indexes strategically**
   - Index foreign keys
   - Index columns used in WHERE clauses
   - Index columns used in ORDER BY
   - Don't over-index (slows INSERT/UPDATE)

2. **Optimize queries**
   - Select only needed columns
   - Use pagination for large datasets
   - Avoid N+1 queries (use eager loading)
   - Use query caching when appropriate

3. **Monitor query performance**
   - Check DatabaseLogger output for slow queries
   - Use EXPLAIN ANALYZE for complex queries
   - Profile queries in production

### Data Integrity

1. **Use migrations for schema changes** - Never modify database manually
2. **Add foreign key constraints** - Maintain referential integrity
3. **Add NOT NULL constraints** - Prevent invalid data
4. **Add unique constraints** - Prevent duplicates
5. **Add check constraints** - Enforce business rules

### Security

1. **Validate all input** - Use DTOs with class-validator
2. **Sanitize user input** - Middleware handles this automatically
3. **Use parameterized queries** - TypeORM handles this
4. **Hash passwords** - Use bcrypt with proper salt rounds
5. **Implement rate limiting** - Prevent abuse
6. **Use HTTPS in production** - Encrypt data in transit
7. **Keep dependencies updated** - Security patches

### Development Workflow

1. **Local Development:**
   ```bash
   # Run seeders to populate database
   yarn seed

   # Make entity changes
   # Generate migration
   ./scripts/generate-migration.sh MyChanges

   # Run migration
   ./scripts/run-migrations.sh

   # Test rollback (optional)
   ./scripts/rollback-migration.sh
   ```

2. **Testing:**
   ```bash
   # Clear database
   yarn seed:clear

   # Run seeders
   yarn seed

   # Run tests
   yarn test
   yarn test:e2e
   ```

3. **Production Deployment:**
   ```bash
   # Run migrations on production database
   yarn migration:run

   # Never run seeders in production
   # Never enable DATABASE_SYNC in production
   ```

### Monitoring

1. **Check DatabaseLogger output** - Look for slow queries
2. **Monitor database size** - Plan for scaling
3. **Track query patterns** - Identify optimization opportunities
4. **Set up alerts** - For slow queries or errors
5. **Regular backups** - Protect against data loss

---

## Common Issues & Solutions

### Issue: Migration generation fails
**Solution**: Ensure entities are properly configured and `synchronize: false` in production

### Issue: Seeder creates duplicates
**Solution**: Check for existing records before creating (see seeder examples)

### Issue: Slow queries in production
**Solution**: Add indexes, optimize queries, use caching

### Issue: XSS attack detected
**Solution**: Sanitization middleware handles this automatically, ensure it's enabled

### Issue: Migration rollback fails
**Solution**: Check DOWN method logic, ensure reversibility, may need to create new migration

---

## Additional Resources

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [Class Validator Documentation](https://github.com/typestack/class-validator)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
