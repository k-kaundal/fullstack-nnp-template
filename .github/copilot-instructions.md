# GitHub Copilot Instructions for Fullstack NestJS + Next.js + PostgreSQL Template

## Project Overview
This is a production-ready fullstack template using:
- **Backend**: NestJS (Node.js framework)
- **Frontend**: Next.js 16 with React 19, TypeScript, and Tailwind CSS
- **Database**: PostgreSQL with TypeORM
- **Language**: TypeScript throughout

## Code Standards & Best Practices

### General Guidelines
- Always use TypeScript with strict type checking
- **CRITICAL: NEVER use `any` type - use `unknown`, proper types, union types, or generics**
- **NO `any` types allowed in ANY file - frontend, backend, interfaces, services, components**
- Follow functional programming principles where applicable
- Prefer async/await over callbacks or raw promises
- Use meaningful variable and function names (camelCase for variables/functions, PascalCase for classes/types)
- Keep functions small and focused on a single responsibility
- **Always add professional code comments and documentation**

### Client-Side Specific Rules
- **NEVER use console.log, console.error, console.warn in production code** (only in JSDoc examples)
- **NEVER use JavaScript alert(), confirm(), or prompt() dialogs**
- **ALWAYS use custom Modal, Alert, or Confirm components instead of native dialogs**
- **Use proper logging service or remove debug statements before committing**
- **All interfaces must be in `interfaces/` folder with `.interface.ts` extension**
- **All types must be in `types/` folder with `.types.ts` extension**
- **All enums must be in `enums/` folder with `.enum.ts` extension**
- **All services must be in `lib/api/` folder with `.service.ts` extension**
- **NEVER define interfaces inline in component files - always import from `/interfaces`**
- **NEVER define types inline in files - always import from `/types`**
- **NEVER define enums inline in files - always import from `/enums`**
- **Properly distinguish between Server Components and Client Components**
- **Use 'use client' directive ONLY when component needs interactivity (state, effects, event handlers)**
- **Prefer Server Components by default for better performance**

### ESLint Rules - MANDATORY
- **NO unused variables** - ESLint will error, must be fixed before commit
- **NO unused imports** - ESLint will error, must be fixed before commit
- **NO implicit any types** - ESLint will error, must use explicit types
- **NO console statements** - ESLint will error (no console.log, console.error, etc.)
- **NO debugger statements** - ESLint will error
- Prefix unused parameters with underscore (`_param`) if required by interface but not used
- Run `yarn lint` before every commit to catch errors
- Fix all ESLint errors - **zero tolerance policy**

### Code Documentation Standards
- **All classes, interfaces, types, and enums must have JSDoc comments**
- **All public methods and functions must have JSDoc comments**
- **Complex logic and algorithms must be explained with inline comments**
- Use JSDoc tags: `@param`, `@returns`, `@throws`, `@example`, `@description`
- Comments should explain "why" not "what" (code should be self-explanatory)
- Keep comments up-to-date with code changes
- Use TODO/FIXME comments for pending work

### Documentation File Storage Standards
- **Feature-specific documentation**: Store in the feature's folder (e.g., `src/cache/CACHE.md`, `src/auth/AUTH.md`)
- **Global/Project documentation**: Store in `docs/` folder at root level (e.g., `server/docs/CACHING.md`, `client/docs/STATE_MANAGEMENT.md`)
- **API documentation**: Auto-generated Swagger/OpenAPI at runtime
- **Architecture documentation**: Store in `docs/architecture/` folder
- **Setup/deployment guides**: Store in `docs/guides/` folder
- Use UPPERCASE for doc filenames (e.g., `CACHE_IMPLEMENTATION.md`, `API_GUIDE.md`)
- Always update README.md with links to important documentation
- Both `server/docs/` and `client/docs/` folders exist for respective documentation

**Example:**
```typescript
/**
 * Service for managing user operations
 * Handles CRUD operations for users with proper validation and error handling
 */
@Injectable()
export class UsersService {
  /**
   * Creates a new user in the database
   *
   * @param createUserDto - The user data to create
   * @param res - Express response object for sending HTTP response
   * @returns Promise<Response> - HTTP response with created user data
   *
   * @example
   * ```typescript
   * const response = await usersService.create({
   *   email: 'user@example.com',
   *   name: 'John Doe'
   * }, res);
   * ```
   */
  async create(createUserDto: CreateUserDto, res: Response): Promise<Response> {
    try {
      // Log operation start for debugging and monitoring
      this.logger.log(`Creating new user with email: ${createUserDto.email}`);

      // Check if user already exists to prevent duplicates
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      // Return error if user already exists
      if (existingUser) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.CONFLICT,
          message: 'User with this email already exists',
        });
      }

      // Create and save new user
      const user = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(user);

      this.logger.log(`User created successfully with ID: ${savedUser.id}`);

      // Return success response with user data and metadata
      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: savedUser,
        message: 'User created successfully',
        meta: {
          userId: savedUser.id,
          createdAt: savedUser.createdAt,
        },
      });
    } catch (error) {
      // Log error for debugging
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);

      // Return standardized error response
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to create user',
      });
    }
  }
}
```

### File Organization Standards - STRICT REQUIREMENTS
- **Interfaces**: ALL interfaces MUST be in `interfaces/` folder with `.interface.ts` extension
- **Types**: ALL type definitions MUST be in `types/` folder with `.types.ts` extension
- **Enums**: ALL enums MUST be in `enums/` folder with `.enum.ts` extension
- **NEVER define interfaces, types, or enums inline in component/service files**
- **ALWAYS import from centralized interface/type/enum files**
- Use barrel exports (index.ts) for each folder to simplify imports
- Update barrel exports immediately when adding new interfaces/types/enums
- Example structure:
  ```
  src/
    common/
      interfaces/
        api-response.interface.ts
        index.ts  # Export all interfaces
      types/
        response.types.ts
        index.ts  # Export all types
      enums/
        user-status.enum.ts
        index.ts  # Export all enums
  ```

### Code Organization Violations - FORBIDDEN
- ❌ Inline interface definitions in components: `interface ComponentProps { ... }`
- ❌ Inline type definitions: `type MyType = ...` (inside component files)
- ❌ Inline enum definitions: `enum Status { ... }` (inside component files)
- ❌ Duplicate interface definitions across files
- ✅ Always import: `import { ComponentProps } from '@/interfaces';`
- ✅ Centralized definitions in dedicated folders
- ✅ Single source of truth for all types/interfaces/enums

### Backend (NestJS) Standards


#### NestJS Code Patterns

**Controllers:**
- Keep controllers thin - only handle routing and delegation
- Always pass @Res() to service methods
- No try-catch blocks in controllers
- No business logic or response formatting in controllers
- Use proper HTTP methods and decorators
- Always use DTOs for request validation
- Use Swagger decorators for API documentation
- Use HttpStatus enum for status codes

```typescript
import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as ApiResponseDecorator } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'User created successfully'
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.usersService.create(createUserDto, res);
  }
}
```

**Services:**
- Implement business logic here
- Use dependency injection
- **Always accept Response parameter from controllers**
- **Always wrap async operations in try-catch blocks**
- Use Logger for error tracking and operation logging
- **Use ApiResponse.error() instead of throwing exceptions for validation/business logic errors**
- **Use ApiResponse.error() in catch blocks for unexpected errors**
- Include meaningful metadata in responses

```typescript
import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponse } from '../common/utils/api-response.util';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, res: Response): Promise<Response> {
    try {
      this.logger.log(`Creating new user with email: ${createUserDto.email}`);

      // Check if user already exists - return error instead of throwing
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.CONFLICT,
          message: 'User with this email already exists',
        });
      }

      const user = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(user);

      this.logger.log(`User created successfully with ID: ${savedUser.id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: savedUser,
        message: 'User created successfully',
        meta: {
          userId: savedUser.id,
          createdAt: savedUser.createdAt,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);

      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to create user',
      });
    }
  }
}
```

**DTOs (Data Transfer Objects):**
- Use class-validator decorators for validation
- Add Swagger decorators for documentation
- Separate DTOs for create, update, and response

```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
```

**Entities:**
- Use TypeORM decorators
- Define relationships clearly
- Add timestamps (createdAt, updatedAt)
- Use UUID for primary keys

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Exception Handling:**
- Use custom exception classes from `../common/exceptions`
- Available exceptions: `NotFoundException`, `ConflictException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `InternalServerException`
- **Never throw exceptions in services - use ApiResponse.error() instead**
- Use HttpStatus enum for status codes
- All exceptions have `statusCode` and `message` properties

```typescript
import { HttpStatus } from '@nestjs/common';
import { NotFoundException, ConflictException } from '../common/exceptions';

// In services, return ApiResponse.error() instead of throwing
if (!user) {
  return ApiResponse.error(res, {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'User not found',
  });
}

if (existingUser) {
  return ApiResponse.error(res, {
    statusCode: HttpStatus.CONFLICT,
    message: 'Email already exists',
  });
}
```

### API Response Standards

**Always use the ApiResponse utility class:**
```typescript
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../../common/utils/api-response.util';

// Success response
return ApiResponse.success(res, {
  statusCode: HttpStatus.OK,
  data: result,
  message: 'Operation successful',
  meta: { total: 10, page: 1, has_next: true, has_previous: true, }, // Optional - use snake_case
});

// Error response (handled by exception filter)
return ApiResponse.error(res, {
  statusCode: HttpStatus.BAD_REQUEST,
  message: 'Validation failed',
  errors: validationErrors,
});
```

**Response Format:**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Users fetched successfully",
  "data": { ... },
  "meta": { "total": 10 },
  "timestamp": "2024-01-27T10:30:00.000Z",
  "path": "/api/v1/users"
}
```

**Key Response Rules:**
1. Always use `HttpStatus` enum for status codes
2. Return data directly without case conversion
3. Always use `@Res()` decorator in controller methods
4. Return type must be `Promise<Response>`
5. Include descriptive messages
6. **Use snake_case for all meta field names** (e.g., `user_id`, `has_next`, `total_pages`, `created_at`)
7. Add meaningful meta information (user_id, timestamps, counts, pagination flags)
8. Wrap all controller methods in try-catch blocks
9. Log operations and errors with Logger

**Meta Field Naming Convention:**
- Use snake_case: `has_next`, `has_previous`, `total_pages`, `user_id`, `created_at`
- NOT camelCase: ~~hasNext~~, ~~hasPrevious~~, ~~totalPages~~, ~~userId~~, ~~createdAt~~

### Swagger/OpenAPI Documentation Standards

**Always add comprehensive Swagger documentation to all controller endpoints:**

```typescript
import { ApiTags, ApiOperation, ApiResponse as ApiResponseDecorator, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user with email, first name, last name, and password.'
  })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'User has been successfully created.',
    schema: {
      example: {
        status: 'success',
        statusCode: 201,
        message: 'User created successfully',
        data: {
          id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          createdAt: '2026-01-27T10:23:22.983Z',
          updatedAt: '2026-01-27T10:23:22.983Z',
        },
        meta: {
          user_id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
          created_at: '2026-01-27T10:23:22.983Z',
        },
        timestamp: '2026-01-27T10:23:22.997Z',
        path: '/api/v1/users',
      },
    },
  })
  @ApiResponseDecorator({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Validation failed.',
    schema: {
      example: {
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        errors: ['Email is required'],
        timestamp: '2026-01-27T10:23:22.997Z',
        path: '/api/v1/users',
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response): Promise<Response> {
    return this.usersService.create(createUserDto, res);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users with pagination',
    description: 'Retrieves a paginated list of users.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Return all users with pagination.',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Users fetched successfully',
        data: [...],
        meta: {
          total: 25,
          count: 10,
          page: 2,
          limit: 10,
          total_pages: 3,
          has_next: true,
          has_previous: true,
        },
        timestamp: '2026-01-27T10:28:36.014Z',
        path: '/api/v1/users',
      },
    },
  })
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Res() res: Response
  ): Promise<Response> {
    return this.usersService.findAll(parseInt(page), parseInt(limit), res);
  }
}
```

**Swagger Documentation Rules:**
1. **@ApiTags()** - Group related endpoints (e.g., 'users', 'auth', 'posts')
2. **@ApiOperation()** - Add summary and detailed description for each endpoint
3. **@ApiResponseDecorator()** - Document ALL possible response status codes with examples
4. **@ApiParam()** - Document path parameters with name, description, and example
5. **@ApiQuery()** - Document query parameters with type, required flag, description, and example
6. **schema.example** - ALWAYS include realistic response examples matching actual API response format
7. Include both success and error response examples
8. Use snake_case in all meta fields within examples
9. Response examples must include: status, statusCode, message, data, meta (if applicable), timestamp, path
10. Error examples must show proper error structure with message and optional errors array

### Caching Standards

**NestJS Cache Manager:**
- Use `@nestjs/cache-manager` for caching
- Cache configuration in `config/cache.config.ts`
- Inject `CACHE_MANAGER` in services that need caching
- Always invalidate cache after create, update, delete operations

**Caching Best Practices:**
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  private readonly CACHE_PREFIX = 'user';
  private readonly CACHE_TTL = 60000; // 1 minute

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findOne(id: string): Promise<User> {
    // Check cache first
    const cacheKey = `${this.CACHE_PREFIX}_${id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    // Fetch from database
    const user = await this.repository.findOne({ where: { id } });

    // Store in cache
    await this.cacheManager.set(cacheKey, user, this.CACHE_TTL);

    return user;
  }

  async update(id: string, data: UpdateDto): Promise<User> {
    const updated = await this.repository.save({ id, ...data });

    // Invalidate cache after update
    await this.cacheManager.del(`${this.CACHE_PREFIX}_${id}`);
    await this.cacheManager.del(`${this.CACHE_PREFIX}_list`);

    return updated;
  }
}
```

**Cache Key Conventions:**
- Use descriptive prefixes: `user_`, `post_`, `comment_`
- Include entity ID: `user_123`, `post_456`
- Use list suffix for collections: `user_list`, `post_list`
- Include query parameters in key for filtered lists: `user_list_active`

**Cache Invalidation Rules:**
- Always invalidate cache after CREATE operations
- Always invalidate cache after UPDATE operations
- Always invalidate cache after DELETE operations
- Invalidate both individual item and list caches
- Log cache operations for debugging

### Frontend (Next.js) Standards

#### Theme System
- **Official Package**: Use `next-themes` for theme management (already installed)
- **Dark Mode**: Configured in `globals.css` using `@variant dark` for Tailwind v4
- **Theme Provider**: Wrap app with `<ThemeProvider>` in root layout
- **Theme Switcher**: Use `<ThemeSwitcher />` or `<CompactThemeSwitcher />` components
- **Color Variables**: All theme colors defined in `globals.css` with `--color-*` CSS variables
- **No Flash**: next-themes handles SSR properly with no flash on load

#### Sidebar Component Standards
- **Reusable Component**: Always use `<Sidebar config={sidebarConfig} />` from `@/components/ui`
- **Configuration**: Create sidebar configs in `constants/` folder with `.tsx` extension
- **Features**: Multi-level menus, icons, badges, collapsible, dark mode support
- **Interface**: Use `SidebarConfig` and `SidebarItem` interfaces from `@/interfaces`
- **Icons**: Use inline SVG or icon components as ReactNode
- **Navigation**: Sidebar auto-detects active routes using `usePathname()`
- **Customization**: All colors controlled via CSS variables in `globals.css`

#### Modal/Dialog/Alert Standards
- **NEVER use native alert(), confirm(), or prompt()** - These are forbidden in production code
- **Custom Components**: Use `<Modal>`, `<Alert>`, `<Confirm>` from `@/components/ui`
- **Modal**: General purpose dialog with customizable size, header, footer, content
- **Alert**: Notification dialog with icon, title, message (info/success/warning/error)
- **Confirm**: Confirmation dialog with cancel/confirm buttons (info/warning/danger)
- **Features**: Dark mode, ESC to close, overlay click, loading states, keyboard accessible
- **Interfaces**: Use `ModalConfig`, `AlertConfig`, `ConfirmConfig` from `@/interfaces`

#### Toast Notification Standards - MANDATORY
- **ALWAYS use toast for user feedback** - Toast notifications are the primary way to inform users about operations
- **NEVER use Alert component for success/error messages** - Use toast instead
- **NEVER use console.log for user feedback** - Use toast for visible user notifications
- **Toast Library**: Using **Sonner** - professional toast component with dark mode support
- **Import**: `import { toast } from '@/lib/utils';`
- **When to use Toast**:
  - ✅ Success feedback after CRUD operations (create, update, delete)
  - ✅ Error messages from API calls or validation
  - ✅ Warning messages before destructive actions
  - ✅ Info messages for user guidance
  - ✅ Loading states for async operations
  - ✅ Form submission feedback
  - ✅ API response notifications

**Toast Usage Patterns:**

```typescript
import { toast } from '@/lib/utils';

// ✅ SUCCESS - Use for successful operations
toast.success('User created successfully!');
toast.success('Settings saved!');

// ✅ ERROR - Use for errors and validation failures
toast.error('Failed to delete user');
toast.error('Email is required');
toast.error(response.message); // API error message

// ✅ WARNING - Use for important notices
toast.warning('This action cannot be undone');
toast.warning('Session will expire in 5 minutes');

// ✅ INFO - Use for informational messages
toast.info('New update available');
toast.info('Processing your request...');

// ✅ LOADING TOAST - Use for async operations with updates
const toastId = toast.loading('Creating user...');
// Later update the same toast:
toast.success('User created successfully!', { id: toastId });
// Or on error:
toast.error('Failed to create user', { id: toastId });

// ✅ PROMISE TOAST - Automatically handles loading → success/error
await toast.promise(
  createUser(data),
  {
    loading: 'Creating user...',
    success: 'User created successfully!',
    error: 'Failed to create user'
  }
);

// ✅ WITH OPTIONS - Custom duration, action buttons
toast.success('User deleted', {
  duration: 5000,
  action: {
    label: 'Undo',
    onClick: () => restoreUser()
  }
});
```

**Real-World Examples:**

```typescript
// ✅ CRUD Operations Pattern
const handleCreate = async (data: CreateUserDto) => {
  try {
    const response = await usersService.create(data);
    if (isSuccessResponse(response)) {
      toast.success('User created successfully!');
      router.push('/users');
    } else {
      toast.error(response.message);
    }
  } catch (error) {
    toast.error('An unexpected error occurred');
  }
};

// ✅ Form Validation Pattern
const handleSubmit = async (formData: FormData) => {
  if (!formData.email) {
    toast.error('Email is required');
    return;
  }
  if (!formData.password) {
    toast.error('Password is required');
    return;
  }

  // Continue with submission...
  await toast.promise(
    submitForm(formData),
    {
      loading: 'Submitting form...',
      success: 'Form submitted successfully!',
      error: 'Failed to submit form'
    }
  );
};

// ✅ Bulk Operations Pattern
const handleBulkDelete = async (userIds: string[]) => {
  const toastId = toast.loading(`Deleting ${userIds.length} users...`);

  try {
    const response = await usersService.bulkDelete(userIds);
    if (isSuccessResponse(response)) {
      toast.success(`${response.data.affected} users deleted`, { id: toastId });
    } else {
      toast.error(response.message, { id: toastId });
    }
  } catch (error) {
    toast.error('Failed to delete users', { id: toastId });
  }
};

// ✅ API Error Handling Pattern
import { showApiError } from '@/lib/utils';

try {
  await apiCall();
} catch (error) {
  showApiError(error); // Automatically parses and shows error message
}

// ✅ Validation Errors Pattern
import { showValidationErrors } from '@/lib/utils';

const errors = {
  email: 'Email is required',
  password: 'Password must be at least 8 characters'
};
showValidationErrors(errors);
// Shows: "Email is required, Password must be at least 8 characters"
```

**When to use Alert vs Toast:**
- ✅ **Use Toast**: Quick feedback, success/error messages, notifications, non-critical info
- ✅ **Use Alert Dialog**: Critical information that requires user acknowledgment
- ✅ **Use Confirm Dialog**: Destructive actions requiring explicit confirmation
- ❌ **Never use Alert for**: Success messages, form validation, API responses (use toast instead)

**Toast Best Practices:**
1. **Keep messages concise** - Short, clear, actionable
2. **Use appropriate severity** - Match toast type to message importance
3. **Provide context** - Include relevant details (user email, count, etc.)
4. **Handle all states** - Show loading, success, and error states
5. **Avoid overuse** - Don't show toast for every minor action
6. **Use promise toast** - For async operations, automatically handles states
7. **Update existing toasts** - Use toast ID to update loading → success/error
8. **Add actions when needed** - Provide undo button for reversible actions

**Toast Helper Functions:**

```typescript
import { toast, showApiError, showValidationErrors } from '@/lib/utils';

// Automatically handles unknown error types
showApiError(error);

// Shows all validation errors in one toast
showValidationErrors({ email: 'Required', password: 'Too short' });

// Dismiss specific toast or all toasts
toast.dismiss(toastId);
toast.dismiss(); // Dismiss all
```

**Toast Configuration:**
- Position: top-right
- Duration: 4000ms (4 seconds)
- Auto-dismiss: Enabled
- Close button: Enabled
- Dark mode: Automatic
- Rich colors: Enabled (color-coded by type)

**Documentation**: See `client/docs/TOAST_SYSTEM.md` for complete guide



**Modal Usage Example:**
```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="My Modal"
  size="md"
>
  <p>Modal content here</p>
</Modal>
```

**Alert Usage Example:**
```tsx
import { Alert } from '@/components/ui';

<Alert
  isOpen={alertOpen}
  onClose={() => setAlertOpen(false)}
  title="Success"
  message="Operation completed successfully"
  type="success"
/>
```

**Confirm Usage Example:**
```tsx
import { Confirm } from '@/components/ui';

<Confirm
  isOpen={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  title="Delete User"
  message="Are you sure? This action cannot be undone."
  type="danger"
  onConfirm={async () => {
    await deleteUser();
  }}
/>
```

**Sidebar Usage Example:**
```tsx
import { Sidebar } from '@/components/ui';
import { adminSidebarConfig } from '@/constants/admin-sidebar';

<Sidebar config={adminSidebarConfig} />
```

**Sidebar Config Example:**
```tsx
// constants/my-sidebar.tsx
export const mySidebarConfig: SidebarConfig = {
  header: {
    title: 'My App',
    logo: <LogoComponent />
  },
  items: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: <DashboardIcon />,
      children: [ /* nested items */ ]
    }
  ]
};
```

#### Frontend File Structure - STRICT REQUIREMENTS
```
client/
  app/                          # Next.js App Router
    admin/                      # Admin pages (protected)
      layout.tsx                # Admin layout (professional sidebar, header)
      page.tsx                  # Admin dashboard
      users/                    # Users management (admin)
        page.tsx
        [id]/
          page.tsx
    (public)/                   # Public pages (route group)
      about/
        page.tsx
      contact/
        page.tsx
    layout.tsx                  # Root layout
    page.tsx                    # Home page (public)
    globals.css                 # Global styles + theme variables

  components/                   # Reusable components
    ui/                         # Generic UI components (buttons, inputs, modals, Sidebar)
      LoadingSpinner.tsx
      ErrorMessage.tsx
      Pagination.tsx
      Sidebar.tsx               # Professional reusable sidebar component
      index.ts                  # Barrel export
    user/                       # Feature-specific components
      UserCard.tsx
      UserForm.tsx
      index.ts

  lib/                          # Core library code
    api/                        # API client and services
      client.ts                 # Axios wrapper with interceptors
      users.service.ts          # Feature API services
      index.ts
    providers/                  # Context providers
      theme-provider.tsx        # Theme provider using next-themes
      index.ts
    utils/                      # Utility functions
      api-response.ts
      storage.ts
      validation.ts
      index.ts

  hooks/                        # Custom React hooks
    useUsers.ts
    useAuth.ts
    index.ts

  interfaces/                   # TypeScript interfaces
    user.interface.ts
    auth.interface.ts
    sidebar.interface.ts        # Sidebar navigation types
    index.ts                    # Barrel export

  types/                        # TypeScript type definitions
    api.types.ts
    index.ts                    # Barrel export

  enums/                        # TypeScript enums
    common.enum.ts
    index.ts                    # Barrel export

  constants/                    # Application constants
    common.ts
    admin-sidebar.tsx           # Admin sidebar navigation config (.tsx for JSX)
    index.ts                    # Barrel export

  docs/                         # Documentation
    CLIENT_ARCHITECTURE.md
```

#### Layout Architecture

**Admin Layout (`app/admin/layout.tsx`):**
- Wraps all admin pages automatically
- Includes sidebar navigation
- Includes admin header with logout
- Protected routes (requires authentication)
- Used for: Users management, Dashboard, Settings

**Public Layout (default `app/layout.tsx`):**
- Wraps all public pages
- Includes public navigation
- No authentication required
- Used for: Home, About, Contact, Login, Register

**Route Groups:**
- Use `(public)` folder for grouping public pages without affecting URL
- Use `admin` folder for admin pages (adds `/admin` to URL)

#### Next.js Code Patterns

**Server vs Client Components:**
- **Server Components (default)**: Data fetching, static content, no interactivity
- **Client Components ('use client')**: State management, event handlers, browser APIs, hooks
- Rule: Use Server Components unless you need client-side features

**Components:**
- Use functional components with TypeScript
- Prefer server components by default, use 'use client' only when needed
- Keep components small and reusable
- **Always define prop types as interfaces**
- **Add JSDoc comments to exported components**

```typescript
/**
 * Button component with variant support
 *
 * @param props - Component props
 * @returns JSX Element
 */
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

**API Client:**
- Use axios with custom wrapper class
- Centralize API calls in service classes
- **Always use proper TypeScript types - NO `any` types**
- Implement request/response interceptors
- Handle errors globally

```typescript
import { apiClient } from '@/lib/api';
import { User } from '@/interfaces';
import { ApiSuccessResponse, ApiErrorResponse } from '@/types';

export class UsersService {
  async getAll(page: number = 1, limit: number = 10): Promise<ApiSuccessResponse<User[]> | ApiErrorResponse> {
    return apiClient.get<User[]>('/users', { page, limit });
  }
}

export const usersService = new UsersService();
```

**Server Components:**
- Fetch data directly in server components
- Use async/await
- Handle loading and error states
- **Type API responses properly**

```typescript
import { usersService } from '@/lib/api';
import { isSuccessResponse } from '@/lib/utils';

export default async function UsersPage() {
  const response = await usersService.getAll(1, 10);

  if (!isSuccessResponse(response)) {
    return <ErrorMessage message={response.message} />;
  }

  return (
    <div>
      {response.data.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

**Client Components:**
- Use 'use client' directive at the top
- Manage state with useState/useReducer
- **Use custom hooks for complex logic and API calls**
- **Always type state and props**

```typescript
'use client';

import { useState } from 'react';
import { CreateUserDto } from '@/interfaces';

interface UserFormProps {
  onSubmit: (data: CreateUserDto) => Promise<void>;
}

export function UserForm({ onSubmit }: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Custom Hooks:**
- Create hooks for reusable logic
- **Return typed objects, never use `any`**
- Use useCallback for functions
- Handle loading, error, and data states

```typescript
import { useState, useCallback } from 'react';
import { User } from '@/interfaces';
import { usersService } from '@/lib/api';
import { isSuccessResponse } from '@/lib/utils';

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: (page: number, limit: number) => Promise<void>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (page: number, limit: number) => {
    setIsLoading(true);
    const response = await usersService.getAll(page, limit);

    if (isSuccessResponse<User[]>(response)) {
      setUsers(response.data);
    } else {
      setError(response.message);
    }

    setIsLoading(false);
  }, []);

  return { users, isLoading, error, fetchUsers };
}
```

### Database (PostgreSQL + TypeORM)

**Migrations:**
- Always use migrations for schema changes
- Never modify entities directly in production
- Name migrations descriptively

**Queries:**
- Use TypeORM QueryBuilder for complex queries
- Avoid N+1 queries - use eager loading or joins
- Add indexes for frequently queried fields

### Testing Standards - MANDATORY

**CRITICAL: Write tests for EVERY controller and service**
- Test files must be co-located with source files (`.spec.ts` extension)
- Every controller MUST have a corresponding `.controller.spec.ts` file
- Every service MUST have a corresponding `.service.spec.ts` file
- Tests must be written BEFORE or IMMEDIATELY AFTER implementation
- Never commit code without accompanying tests
- **ALWAYS update test files when modifying services or controllers**
- **Run tests after every change to verify nothing is broken**

**Test Setup and Configuration:**

**E2E Tests Setup:**
E2E tests run against a real test database with the following setup:
1. Creates PostgreSQL database: `test_db`
2. Applies global prefix: `app.setGlobalPrefix('api/v1', { exclude: ['/'] })`
3. Enables database synchronization for test environment
4. Uses same validation pipes and filters as production
5. Runs full application flow including database operations

**Setup Script:**
```bash
cd server
./test/setup-test-db.sh  # Creates test_db
yarn test:e2e:setup       # Setup database and run E2E tests
```

**Environment Configuration:**
Test environment variables in `test/setup-e2e.ts`:
- `NODE_ENV=test`
- `DATABASE_NAME=test_db`
- `DATABASE_HOST=localhost`
- Auto-synchronization enabled for test database
- Mail service configured with test credentials

**When Modifying Existing Code:**
1. **Before making changes**: Run `yarn test` to ensure all tests pass
2. **Make your changes** to controllers, services, DTOs, or entities
3. **Immediately update** corresponding test files to reflect changes:
   - Add new test cases for new methods
   - Update mock data if DTOs/entities changed
   - Update assertions if response format changed
   - Update method signatures if parameters changed
4. **Run tests again**: `yarn test` to verify all tests still pass
5. **Check coverage**: `yarn test:cov` to ensure coverage remains >80%

**Common Test Updates Needed:**
- **DTO changes**: Update mock data in tests with new required fields
- **Response format changes**: Update assertions to match new meta fields (use snake_case)
- **Method signature changes**: Update function calls with new parameters
- **New validations**: Add test cases for new validation rules
- **Pagination changes**: Update findAll tests with page/limit parameters
- **Repository methods**: Add new mocked methods (e.g., `findAndCount`)

**Unit Test Requirements:**
- Test all public methods in services and controllers
- Mock external dependencies (repositories, other services, HTTP requests)
- Test both success and error cases
- Test edge cases and boundary conditions
- Use descriptive test names that explain what is being tested
- Aim for >80% code coverage
- Use Jest testing framework

**Controller Test Pattern:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    // Mock Response object
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
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should call service.create with correct parameters', async () => {
      const createDto = { email: 'test@example.com', firstName: 'John', lastName: 'Doe' };

      await controller.create(createDto, mockResponse as Response);

      expect(service.create).toHaveBeenCalledWith(createDto, mockResponse);
    });
  });
});
```

**Service Test Pattern:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

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
            find: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createDto = { email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
      const mockUser = { id: '123', ...createDto, isActive: true, createdAt: new Date(), updatedAt: new Date() };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockUser as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUser as any);

      await service.create(createDto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.not.objectContaining({ password: expect.anything() }),
        }),
      );
    });

    it('should return error if email already exists', async () => {
      const createDto = { email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
      const existingUser = { id: '123', ...createDto };

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingUser as any);

      await service.create(createDto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('already exists'),
        }),
      );
    });
  });
});
```

**E2E Test Requirements:**
- Test critical user flows end-to-end
- Use realistic test data
- Test error cases and validation
- Clean up test data after each test
- E2E tests go in `test/` directory at root

**E2E Test Pattern:**
```typescript
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
          expect(res.body.meta).toHaveProperty('user_id');
          expect(res.body.meta).toHaveProperty('created_at');
          createdUserId = res.body.data.id;
        });
    });
  });
});
```

**API Response Testing Standards:**
```typescript
// Success Response Structure to Test
{
  status: 'success',
  statusCode: 200,
  message: 'Operation successful',
  data: { /* your data */ },
  meta: {
    user_id: 'uuid',           // ✅ snake_case for ALL meta fields
    created_at: '2026-01-28',
    updated_at: '2026-01-28',
    total_pages: 5,
    has_next: true,
    has_previous: false
  },
  timestamp: '2026-01-28T10:00:00.000Z',
  path: '/api/v1/users'
}

// Error Response Structure to Test
{
  status: 'error',
  statusCode: 400,
  message: 'Validation failed',
  errors: ['Email is required'],
  timestamp: '2026-01-28T10:00:00.000Z',
  path: '/api/v1/users'
}
```

**Running Tests:**
```bash
yarn test              # Run all unit tests
yarn test:watch        # Run tests in watch mode
yarn test:cov          # Run tests with coverage report
yarn test:e2e          # Run end-to-end tests (requires test_db)
yarn test:e2e:setup    # Setup test database and run E2E tests
```

**Test Best Practices:**
1. **Mock External Dependencies** - Database, HTTP, file system
2. **Test Both Success and Error Cases** - Cover all code paths
3. **Use Descriptive Test Names** - Clear what is being tested
4. **Keep Tests Isolated** - No shared state between tests
5. **Test Edge Cases** - Boundary conditions, null values, empty arrays
6. **Use Test Setup/Teardown** - beforeEach, afterEach, beforeAll, afterAll
7. **Verify Security** - Password never in responses, proper error handling
8. **Check Meta Fields** - All use snake_case convention

**Critical Test Checks:**
- ✅ Password field NEVER returned in responses
- ✅ All meta fields use snake_case (user_id, created_at, total_pages)
- ✅ Proper HTTP status codes (201 Created, 409 Conflict, 404 Not Found)
- ✅ Error messages are user-friendly and descriptive
- ✅ Validation errors properly caught and returned
- ✅ Global prefix `/api/v1` applied in E2E tests
- Test error cases

### Environment Variables

**Backend (.env):**
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key
CACHE_TTL=60000
CACHE_MAX_ITEMS=100
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Frontend Code Quality Standards

**TypeScript - NEVER Use `any` Types:**
- **CRITICAL: NEVER EVER use `any` type in any code - frontend, backend, interfaces, components, services**
- **This is a MANDATORY rule - no exceptions**
- Use proper types, interfaces, union types, or generics instead
- Use `unknown` for truly unknown types, then use type guards
- All function parameters and return values must be typed
- All state variables must be typed
- All event handlers must have proper types

```typescript
// ❌ NEVER DO THIS - ABSOLUTELY FORBIDDEN
function fetchData(): Promise<any> { ... }
const [data, setData] = useState<any>();
const handler = (value: any) => { ... };

// ✅ ALWAYS DO THIS - USE PROPER TYPES
function fetchData<T>(): Promise<ApiSuccessResponse<T> | ApiErrorResponse> { ... }
const [data, setData] = useState<User[]>([]);
const handler = (value: string | string[] | Date) => { ... };
```

**Type Guards:**
Use type guards for runtime type checking:

```typescript
import { isSuccessResponse, isErrorResponse } from '@/lib/utils';

const response = await apiClient.get<User[]>('/users');
if (isSuccessResponse<User[]>(response)) {
  console.log(response.data); // TypeScript knows this is User[]
} else {
  console.error(response.message); // TypeScript knows this is error
}
```

**Error Handling:**
- Always handle errors in API calls
- Display user-friendly error messages
- Use ErrorMessage component for consistent UI

```typescript
try {
  const response = await usersService.getAll(1, 10);
  if (isSuccessResponse<User[]>(response)) {
    setUsers(response.data);
  } else {
    setError(response.message);
  }
} catch (error) {
  setError('An unexpected error occurred');
}
```

**Frontend Code Quality Standards:**
- **CRITICAL: NEVER use console.log, console.error, console.warn in production code**
- Remove all debugging console statements before committing
- Use proper error handling and user-facing error messages instead
- **All interfaces MUST be in `interfaces/` folder with `.interface.ts` suffix**
- **All services MUST be in `lib/api/` folder with `.service.ts` suffix**
- **Server Components (default)**: No 'use client', for data fetching and static content
- **Client Components ('use client')**: Only when using state, effects, or event handlers
- ESLint must pass with 0 errors and 0 warnings
- TypeScript strict mode - NO `any` types allowed
- Use barrel exports (index.ts) for all folders
- Add JSDoc comments to all exported functions and components

**Component Organization:**
- UI components: Generic, reusable (buttons, inputs, modals, sidebar)
- Feature components: Specific to a feature (UserCard, PostForm)
- Always use TypeScript interfaces for props
- Add JSDoc comments for exported components
- **Sidebar Component**: Use the reusable `<Sidebar />` component from `@/components/ui` for all admin/dashboard layouts

**State Management:**
- Use `useState` for local component state
- Use custom hooks for shared logic and API calls
- Keep state close to where it's used
- Avoid prop drilling (use Context API for deeply nested state)

**Barrel Exports:**, `Sidebar.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useUsers.ts`, `useAuth.ts`)
- Utilities: camelCase (e.g., `api-response.ts`, `validation.ts`)
- Types/Interfaces: PascalCase with `.interface.ts` or `.types.ts` suffix
- Constants: UPPER_SNAKE_CASE in `constants/` folder, use `.tsx` if contains JSX
**File Naming:**
- Components: PascalCase (e.g., `UserCard.tsx`, `LoadingSpinner.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useUsers.ts`, `useAuth.ts`)
- Utilities: camelCase (e.g., `api-response.ts`, `validation.ts`)
- Types/Interfaces: PascalCase with `.interface.ts` or `.types.ts` suffix
- Constants: UPPER_SNAKE_CASE in `constants/` folder
- Enums: PascalCase with `.enum.ts` suffix

### Git Commit Standards

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Example: `feat(users): add user registration endpoint`

### ESLint & Code Quality Standards

**ALWAYS run ESLint before committing:**
- Run `yarn lint` to check for errors and warnings
- Fix all ESLint errors - **no errors allowed**
- Address all ESLint warnings when possible
- Use `yarn lint --fix` to auto-fix formatting issues
- ESLint config is in `eslint.config.mjs` for frontend and `.eslintrc.js` for backend
- Never disable ESLint rules without valid justification and team approval

**Common ESLint rules to follow:**
- No unused variables or imports
- Consistent code formatting (handled by Prettier)
- Proper TypeScript types (no `any` unless explicitly allowed)
- Follow naming conventions (camelCase, PascalCase)
- Avoid console.log (use Logger in backend, proper logging in frontend)

### Testing Standards - MANDATORY

**CRITICAL: Write tests for EVERY controller and service**
- Test files must be co-located with source files (`.spec.ts` extension)
- Every controller MUST have a corresponding `.controller.spec.ts` file
- Every service MUST have a corresponding `.service.spec.ts` file
- Tests must be written BEFORE or IMMEDIATELY AFTER implementation
- Never commit code without accompanying tests
- **ALWAYS update test files when modifying services or controllers**
- **Run tests after every change to verify nothing is broken**

**When Modifying Existing Code:**
1. **Before making changes**: Run `yarn test` to ensure all tests pass
2. **Make your changes** to controllers, services, DTOs, or entities
3. **Immediately update** corresponding test files to reflect changes:
   - Add new test cases for new methods
   - Update mock data if DTOs/entities changed
   - Update assertions if response format changed
   - Update method signatures if parameters changed
4. **Run tests again**: `yarn test` to verify all tests still pass
5. **Check coverage**: `yarn test:cov` to ensure coverage remains >80%

**Common Test Updates Needed:**
- **DTO changes**: Update mock data in tests with new required fields
- **Response format changes**: Update assertions to match new meta fields (use snake_case)
- **Method signature changes**: Update function calls with new parameters
- **New validations**: Add test cases for new validation rules
- **Pagination changes**: Update findAll tests with page/limit parameters
- **Repository methods**: Add new mocked methods (e.g., `findAndCount`)

**Unit Test Requirements:**
- Test all public methods in services and controllers
- Mock external dependencies (repositories, other services, HTTP requests)
- Test both success and error cases
- Test edge cases and boundary conditions
- Use descriptive test names that explain what is being tested
- Aim for >80% code coverage
- Use Jest testing framework

**Controller Test Pattern:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    // Mock Response object
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
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should call service.create with correct parameters', async () => {
      const createDto = { email: 'test@example.com', firstName: 'John', lastName: 'Doe' };

      await controller.create(createDto, mockResponse as Response);

      expect(service.create).toHaveBeenCalledWith(createDto, mockResponse);
    });
  });
});
```

**Service Test Pattern:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

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
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createDto = { email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
      const mockUser = { id: '123', ...createDto, isActive: true, createdAt: new Date(), updatedAt: new Date() };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockUser as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUser as any);

      await service.create(createDto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: mockUser,
        }),
      );
    });

    it('should return error if email already exists', async () => {
      const createDto = { email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
      const existingUser = { id: '123', ...createDto };

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingUser as any);

      await service.create(createDto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('already exists'),
        }),
      );
    });
  });
});
```

**E2E Test Requirements:**
- Test critical user flows end-to-end
- Use realistic test data
- Test error cases and validation
- Clean up test data after each test
- E2E tests go in `test/` directory at root

**Running Tests:**
```bash
yarn test              # Run all unit tests
yarn test:watch        # Run tests in watch mode
yarn test:cov          # Run tests with coverage report
yarn test:e2e          # Run end-to-end tests
```

### Backend File Structure - STRICT REQUIREMENTS

**Current Structure (MUST be followed):**
```
server/
  src/
    <feature>/
      dto/              # Data Transfer Objects
      entities/         # TypeORM entities
      interfaces/       # Feature-specific interfaces
      types/            # Feature-specific types
      enums/            # Feature-specific enums
      <feature>.controller.ts
      <feature>.service.ts
      <feature>.module.ts
      <feature>.controller.spec.ts  # REQUIRED
      <feature>.service.spec.ts     # REQUIRED
    common/               # Shared/common code
      decorators/         # Custom decorators
      filters/            # Exception filters
      guards/             # Auth guards
      interceptors/       # Response interceptors
      pipes/              # Validation pipes
      interfaces/         # Shared interfaces (with index.ts barrel export)
      types/              # Shared types (with index.ts barrel export)
      enums/              # Shared enums (with index.ts barrel export)
      exceptions/         # Custom exception classes
      utils/              # Utility functions (with index.ts barrel export)
    config/               # Configuration files
    users/                # Users feature module
      dto/
      entities/
      users.controller.ts
      users.service.ts
      users.module.ts
      users.controller.spec.ts  # REQUIRED
      users.service.spec.ts     # REQUIRED
    app.controller.ts
    app.service.ts
    app.module.ts
    app.controller.spec.ts      # REQUIRED
    main.ts
  test/                   # E2E tests
    app.e2e-spec.ts
```

**File Naming Conventions:**
- Controllers: `<name>.controller.ts` with spec `<name>.controller.spec.ts`
- Services: `<name>.service.ts` with spec `<name>.service.spec.ts`
- Modules: `<name>.module.ts`
- DTOs: `<action>-<entity>.dto.ts` (e.g., `create-user.dto.ts`)
- Entities: `<entity>.entity.ts`
- Interfaces: `<name>.interface.ts` (in interfaces/ folder)
- Types: `<name>.types.ts` (in types/ folder)
- Enums: `<name>.enum.ts` (in enums/ folder)
- Utils: `<name>.util.ts` (in utils/ folder)

### ESLint & Code Quality Standards - MANDATORY

**ALWAYS run ESLint before committing:**
```bash
yarn lint          # Check for errors
yarn lint --fix    # Auto-fix formatting issues
```

**ESLint Rules (all set to ERROR):**
- `@typescript-eslint/no-unused-vars` - No unused variables or function parameters
- `@typescript-eslint/no-explicit-any` - No `any` type usage
- `no-console` - No console.log, console.error, console.warn
- `no-debugger` - No debugger statements
- `react-hooks/rules-of-hooks` - Hooks must follow React rules
- `react-hooks/exhaustive-deps` - useEffect dependencies must be complete

**How to Fix Common ESLint Errors:**

1. **Unused Variables/Imports:**
   ```typescript
   // ❌ BAD - unused import
   import { User, Post } from '@/interfaces';  // Post not used

   // ✅ GOOD - remove unused import
   import { User } from '@/interfaces';
   ```

2. **Unused Function Parameters (required by interface):**
   ```typescript
   // ❌ BAD - param required but not used
   function handleClick(event: React.MouseEvent) {
     doSomething();
   }

   // ✅ GOOD - prefix with underscore
   function handleClick(_event: React.MouseEvent) {
     doSomething();
   }
   ```

3. **Implicit Any Type:**
   ```typescript
   // ❌ BAD - implicit any
   items.map(item => item.name)

   // ✅ GOOD - explicit type
   items.map((item: User) => item.name)
   // OR use type inference from array
   const items: User[] = [];
   items.map(item => item.name)  // TypeScript knows item is User
   ```

4. **Console Statements:**
   ```typescript
   // ❌ BAD - console in production
   console.log('Debug:', data);

   // ✅ GOOD - use proper error handling or remove
   // For backend: use Logger
   this.logger.log('Processing data');
   // For frontend: remove or use proper error service
   ```

**Zero Tolerance Policy:**
- **NO ESLint errors allowed in commits**
- **NO ESLint warnings should accumulate**
- Fix errors immediately, don't disable rules
- Never use `// eslint-disable` without team approval

### Code Review Checklist

Before committing:
- [ ] **All tests pass (`yarn test`)**
- [ ] **ESLint check passes with NO errors (`yarn lint`)**
- [ ] **NO unused variables or imports**
- [ ] **NO console.log or debugger statements**
- [ ] **NO inline interface/type/enum definitions**
- [ ] **All interfaces in `/interfaces` folder**
- [ ] **All types in `/types` folder**
- [ ] **All enums in `/enums` folder**
- [ ] **Test coverage is >80% for new code**
- [ ] **Every new controller has corresponding `.controller.spec.ts`**
- [ ] **Every new service has corresponding `.service.spec.ts`**
- [ ] **Test files updated if service/controller methods changed**
- [ ] **Mock data updated if DTOs/entities changed**
- [ ] **Test assertions updated if response format changed**
- [ ] Code is properly formatted (Prettier)
- [ ] Types are properly defined (no `any` types)
- [ ] All classes, methods, and complex logic have JSDoc comments
- [ ] Inline comments explain "why" not "what"
- [ ] DTOs have proper validation decorators
- [ ] API endpoints have comprehensive Swagger documentation with examples
- [ ] Swagger examples use snake_case for meta fields
- [ ] Error handling is implemented with try-catch and ApiResponse
- [ ] Sensitive data is not logged or exposed
- [ ] Environment variables are used for configuration
- [ ] Files are organized in correct folders (interfaces/, types/, enums/)
- [ ] Barrel exports (index.ts) are updated for new shared code

## Available UI Components Reference

### Core UI Components (`@/components/ui`)

#### 1. **Toast Notifications** (Primary feedback method)
```typescript
import { toast } from '@/lib/utils';

toast.success('Operation successful');
toast.error('Operation failed');
toast.warning('Warning message');
toast.info('Information message');
toast.loading('Processing...');
toast.promise(apiCall(), {
  loading: 'Loading...',
  success: 'Done!',
  error: 'Failed!'
});
```

#### 2. **Modal** - General purpose dialog
```typescript
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md" // sm, md, lg, xl, full
>
  <p>Modal content</p>
</Modal>
```

#### 3. **Alert** - Information dialog (use sparingly)
```typescript
import { Alert } from '@/components/ui';

<Alert
  isOpen={alertOpen}
  onClose={() => setAlertOpen(false)}
  title="Alert Title"
  message="Alert message"
  type="success" // info, success, warning, error
/>
```
**Note**: Prefer toast for most user feedback

#### 4. **Confirm** - Confirmation dialog for destructive actions
```typescript
import { Confirm } from '@/components/ui';

<Confirm
  isOpen={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  title="Delete User"
  message="Are you sure? This cannot be undone."
  type="danger" // info, warning, danger
  onConfirm={async () => {
    await deleteUser();
  }}
/>
```

#### 5. **Sidebar** - Navigation sidebar
```typescript
import { Sidebar } from '@/components/ui';
import { adminSidebarConfig } from '@/constants/admin-sidebar';

<Sidebar config={adminSidebarConfig} />
```

#### 6. **Header** - Application header
```typescript
import { Header } from '@/components/ui';
import { adminHeaderConfig } from '@/constants/admin-header';

<Header config={adminHeaderConfig} />
```

#### 7. **Table** - Data table with sorting, pagination, selection
```typescript
import { Table } from '@/components/ui';
import { TableConfig } from '@/interfaces';

const tableConfig: TableConfig<User> = {
  columns: [
    { id: 'email', label: 'Email', sortable: true },
    { id: 'name', label: 'Name', sortable: true }
  ],
  data: users,
  loading: isLoading,
  pagination: { page: 1, limit: 10, total: 100 },
  onSort: handleSort,
  onPagination: handlePagination,
  actions: {
    view: (user) => handleView(user),
    edit: (user) => handleEdit(user),
    delete: (user) => handleDelete(user)
  }
};

<Table config={tableConfig} />
```

#### 8. **ViewDialog** - Display data in formatted dialog
```typescript
import { ViewDialog } from '@/components/ui';
import { ViewDialogConfig } from '@/interfaces';

const config: ViewDialogConfig = {
  isOpen: true,
  onClose: () => setIsOpen(false),
  title: 'User Details',
  sections: [
    {
      id: 'basic',
      title: 'Basic Info',
      fields: [
        { id: 'email', label: 'Email', value: user.email, type: 'email' },
        { id: 'name', label: 'Name', value: user.name, type: 'text' }
      ]
    }
  ]
};

<ViewDialog config={config} />
```

#### 9. **EditDialog** - Form dialog for creating/updating
```typescript
import { EditDialog } from '@/components/ui';
import { EditDialogConfig } from '@/interfaces';

const config: EditDialogConfig = {
  isOpen: true,
  onClose: () => setIsOpen(false),
  title: 'Edit User',
  sections: [
    {
      id: 'basic',
      title: 'Basic Info',
      fields: [
        {
          id: 'email',
          label: 'Email',
          type: 'email',
          validation: { required: true }
        },
        {
          id: 'name',
          label: 'Name',
          type: 'text',
          validation: { required: true, minLength: 2 }
        }
      ]
    }
  ],
  onSubmit: async (data) => {
    await updateUser(data);
    toast.success('User updated!');
  }
};

<EditDialog config={config} />
```

#### 10. **ThemeSwitcher** - Toggle light/dark mode
```typescript
import { ThemeSwitcher, CompactThemeSwitcher } from '@/components/ui';

<ThemeSwitcher /> // Full version with icon
<CompactThemeSwitcher /> // Compact version
```

#### 11. **LoadingSpinner** - Loading indicator
```typescript
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner size="sm" /> // sm, md, lg
```

#### 12. **ErrorMessage** - Error display component
```typescript
import { ErrorMessage } from '@/components/ui';

<ErrorMessage message="Something went wrong" />
```

#### 13. **Pagination** - Pagination controls
```typescript
import { Pagination } from '@/components/ui';

<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

### Component Usage Guidelines

1. **Always import from barrel exports**:
   ```typescript
   import { Modal, Alert, Confirm, toast } from '@/components/ui';
   import { toast } from '@/lib/utils';
   ```

2. **Use toast for most user feedback**:
   - ✅ Success/error messages
   - ✅ Form validation errors
   - ✅ API responses
   - ✅ Quick notifications

3. **Use Alert/Confirm for critical actions**:
   - ✅ Destructive operations (delete, deactivate)
   - ✅ Important warnings requiring acknowledgment
   - ✅ Confirmation before irreversible actions

4. **All components support dark mode automatically**

5. **All dialog components are accessible**:
   - ESC key to close
   - Overlay click to close (configurable)
   - Keyboard navigation
   - Focus trapping

## AI Assistance Guidelines

When generating code:
1. **ALWAYS run ESLint check (`yarn lint`) before completing the task**
2. **ALWAYS write test files (.spec.ts) for every controller and service**
3. Always include proper TypeScript types (never use `any`)
4. **Frontend: Use proper types, interfaces, generics - NEVER use `any`**
5. **Frontend: Use type guards (isSuccessResponse, isErrorResponse) for API responses**
6. **Frontend: ALWAYS use toast for user feedback, not console.log or Alert**
7. **Add professional JSDoc comments to all classes, interfaces, types, enums, and public methods**
7. **Add inline comments to explain complex logic and business decisions**
8. Organize interfaces in `interfaces/` folder with `.interface.ts` extension
9. Organize types in `types/` folder with `.types.ts` extension
10. Organize enums in `enums/` folder with `.enum.ts` extension
11. Add validation decorators to DTOs (backend)
12. Include error handling with try-catch and ApiResponse.error() (backend)
13. **Frontend: Handle errors in try-catch blocks and display user-friendly messages**
14. **Write tests alongside implementation (test-first or test-immediately approach)**
15. Add Swagger documentation for APIs (backend)
16. Follow the strict file structure outlined above
17. Use dependency injection in NestJS (backend)
18. Prefer server components in Next.js unless interactivity is needed (frontend)
19. **Frontend: Use custom hooks for API calls and complex state logic**
20. Use Tailwind CSS for styling (frontend)
21. Keep security in mind (validate inputs, sanitize data, use parameterized queries)
22. **Ensure test coverage is >80% for all new code**
23. **Update barrel exports (index.ts) when adding new shared code**
24. **Frontend: Always use barrel exports for cleaner imports**

## Common Commands

**Backend:**
```bash
yarn start:dev      # Start development server
yarn test          # Run tests
yarn test:cov      # Run tests with coverage
yarn lint          # Lint code
yarn format        # Format code
```

**Frontend:**
```bash
yarn dev           # Start development server
yarn build         # Build for production
yarn lint          # Lint code
```

**Database:**
```bash
yarn migration:generate -- -n MigrationName
yarn migration:run
```
