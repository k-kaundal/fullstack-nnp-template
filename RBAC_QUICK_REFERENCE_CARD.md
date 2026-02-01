# RBAC Quick Reference Card 🚀

## Frontend Usage

### Check User Roles

```typescript
import { hasRole, isAdmin, hasAnyRole } from '@/lib/utils';
import { useAuthContext } from '@/lib/providers';

const { user } = useAuthContext();

// Single role check
if (hasRole(user, 'Admin')) {
}

// Multiple roles (ANY)
if (hasAnyRole(user, ['Admin', 'Moderator'])) {
}

// Convenience functions
if (isAdmin(user)) {
}
if (isModerator(user)) {
}
```

### Conditional Rendering

```typescript
{isAdmin(user) && <AdminButton />}

{hasAnyRole(user, ['Admin', 'Moderator']) && (
  <ModerateButton />
)}
```

### Admin UI Navigation

```typescript
// Role Management
<Link href="/admin/roles">Manage Roles</Link>

// Create Role
<Link href="/admin/roles/create">Create Role</Link>
```

### Assign Roles to User

```typescript
import { AssignRolesDialog } from '@/components/admin';

<AssignRolesDialog
  isOpen={open}
  onClose={() => setOpen(false)}
  userId={user.id}
  userEmail={user.email}
  currentRoles={user.roles || []}
  onSuccess={() => refetch()}
/>
```

### API Service Calls

```typescript
import { rolesService, usersService } from '@/lib/api';

// Get all roles
const roles = await rolesService.getAll(1, 100);

// Create role
const newRole = await rolesService.create({
  name: 'Content Manager',
  description: 'Manages content',
  permissionIds: ['perm-1', 'perm-2'],
  isSystemRole: false,
});

// Assign roles to user
await usersService.assignRoles(userId, [roleId1, roleId2]);

// Get user's roles
const userRoles = await usersService.getUserRoles(userId);

// Remove role from user
await usersService.removeRole(userId, roleId);
```

---

## Backend Usage

### Protect Controller with Roles

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  @Post()
  @Roles('Admin', 'Editor') // Admin OR Editor
  async create(@Body() dto: CreatePostDto) {}

  @Delete(':id')
  @Roles('Admin') // Admin only
  async remove(@Param('id') id: string) {}
}
```

### Protect with Permissions

```typescript
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';

@Controller('posts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PostsController {
  @Post()
  @RequirePermissions('posts:create') // Needs this permission
  async create(@Body() dto: CreatePostDto) {}

  @Delete(':id')
  @RequirePermissions('posts:delete') // Needs this permission
  async remove(@Param('id') id: string) {}
}
```

### Get Current User with Roles

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/auth.interface';

@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: JwtPayload) {
  // user.roles contains role names: ['Admin', 'Moderator']
  return { userId: user.sub, email: user.email, roles: user.roles };
}
```

### Create Role Programmatically

```typescript
const role = await this.rolesService.create(
  {
    name: 'Content Manager',
    description: 'Manages content',
    permissionIds: [permission1.id, permission2.id],
    isSystemRole: false,
  },
  res,
);
```

### Assign Roles to User

```typescript
const result = await this.usersService.assignRoles(
  userId,
  [roleId1, roleId2],
  res,
);
```

---

## Default Roles & Permissions

### Default Roles (4)

| Role          | Description        | Permissions        |
| ------------- | ------------------ | ------------------ |
| **Admin**     | Full system access | All 20 permissions |
| **Moderator** | Content moderation | 10 permissions     |
| **Editor**    | Content management | 8 permissions      |
| **User**      | Basic access       | 2 permissions      |

### Default Permissions (20)

**Users:**

- users:create
- users:read
- users:update
- users:delete

**Roles:**

- roles:create
- roles:read
- roles:update
- roles:delete

**Permissions:**

- permissions:create
- permissions:read

**Posts:**

- posts:create
- posts:read
- posts:update
- posts:delete
- posts:publish

**Comments:**

- comments:create
- comments:read
- comments:update
- comments:delete
- comments:moderate

---

## API Endpoints

### Roles Management

```bash
# Get all roles (Admin/Moderator)
GET /api/v1/roles?page=1&limit=10

# Get role by ID (Admin/Moderator)
GET /api/v1/roles/:id

# Create role (Admin only)
POST /api/v1/roles
{
  "name": "Content Manager",
  "description": "Manages content",
  "permissionIds": ["uuid-1", "uuid-2"],
  "isSystemRole": false
}

# Update role (Admin only)
PUT /api/v1/roles/:id
{
  "name": "Senior Editor",
  "description": "Updated description",
  "permissionIds": ["uuid-1", "uuid-2", "uuid-3"]
}

# Delete role (Admin only)
DELETE /api/v1/roles/:id
```

### Permissions Management

```bash
# Get all permissions (Admin/Moderator)
GET /api/v1/permissions

# Create permission (Admin only)
POST /api/v1/permissions
{
  "name": "posts:archive",
  "description": "Archive old posts",
  "resource": "posts",
  "action": "archive"
}
```

### User Role Assignment

```bash
# Assign roles to user (Admin only)
POST /api/v1/users/:userId/roles
{
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}

# Get user's roles (Admin/Moderator)
GET /api/v1/users/:userId/roles

# Remove role from user (Admin only)
DELETE /api/v1/users/:userId/roles/:roleId
```

---

## Common Patterns

### Pattern 1: Admin-Only Feature

```typescript
// Frontend
if (!isAdmin(user)) return null;

return <AdminPanel />;

// Backend
@Post('sensitive-action')
@Roles('Admin')
async sensitiveAction() { }
```

### Pattern 2: Multiple Role Access

```typescript
// Frontend
if (!hasAnyRole(user, ['Admin', 'Moderator'])) {
  return <p>Access denied</p>;
}

// Backend
@Get('moderation')
@Roles('Admin', 'Moderator')
async getModerationQueue() { }
```

### Pattern 3: Permission-Based Access

```typescript
// Backend only (fine-grained control)
@Delete(':id')
@RequirePermissions('posts:delete')
async deletePost(@Param('id') id: string) { }
```

### Pattern 4: Dynamic Role Loading

```typescript
// Frontend - Load user with roles
const { user } = useAuthContext(); // Contains roles

// Backend - JWT already includes roles
const user = await this.jwtStrategy.validate(token);
// user.roles = [{ name: 'Admin', permissions: [...] }]
```

---

## Troubleshooting

### Issue: User roles not showing in frontend

**Solution:**

```typescript
// Check JWT payload includes roles
const token = getStorageItem<string>(StorageKey.ACCESS_TOKEN);
const decoded = jwtDecode(token);
console.log(decoded.roles); // Should show roles array

// Verify User interface has roles field
const user: User = {
  // ... other fields
  roles: [{ id: '...', name: 'Admin' }], // ✅ Must exist
};
```

### Issue: 403 Forbidden on protected endpoint

**Solution:**

```typescript
// 1. Verify user has required role
const { user } = useAuthContext();
console.log(hasRole(user, 'Admin'));

// 2. Check token is valid and includes roles
const token = getStorageItem<string>(StorageKey.ACCESS_TOKEN);

// 3. Verify backend guard is applied
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
```

### Issue: Role not found after creation

**Solution:**

```typescript
// Backend caches roles - invalidate cache after creation
await this.cacheManager.del('roles_list');
await this.cacheManager.del(`role_${id}`);

// Or configure cache TTL shorter
CACHE_TTL=30000  # 30 seconds
```

---

## Security Best Practices

1. ✅ **Always use guards on controllers**
   - JwtAuthGuard for authentication
   - RolesGuard for role-based access
   - PermissionsGuard for permission-based access

2. ✅ **Never trust frontend role checks alone**
   - Frontend checks are for UI only
   - Backend ALWAYS validates with database

3. ✅ **Protect system roles**
   - System roles cannot be deleted
   - isSystemRole flag prevents modification

4. ✅ **Aggregate permissions from all roles**
   - User with multiple roles gets ALL permissions
   - No permission conflicts

5. ✅ **Use specific permissions for sensitive operations**
   - Use @RequirePermissions for delete/update operations
   - More granular than role-based checks

---

## Need Help?

**Documentation:**

- Full Guide: `RBAC_COMPLETE_IMPLEMENTATION.md`
- Backend: `server/docs/RBAC_INTEGRATION_GUIDE.md`
- Admin Guide: `server/docs/ADMIN_ROLE_MANAGEMENT.md`
- Quick Ref: `RBAC_QUICK_REFERENCE.md`

**Swagger API Docs:**

```
http://localhost:3001/api
```

**Test API:**

```bash
# Seed default roles
cd server && yarn seed

# Check roles
curl http://localhost:3001/api/v1/roles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Quick Reference Complete! 🎉**

Save this card for quick access to all RBAC features.
