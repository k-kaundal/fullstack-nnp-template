# 🚀 RBAC Quick Reference - Cheat Sheet

## Admin Operations

### Create Custom Role

```bash
POST /api/v1/roles
Authorization: Bearer {ADMIN_JWT}
Content-Type: application/json

{
  "name": "Product Manager",
  "description": "Manages products",
  "permissionIds": ["perm-uuid-1", "perm-uuid-2"],
  "isSystemRole": false
}
```

### Create Permission

```bash
POST /api/v1/permissions
Authorization: Bearer {ADMIN_JWT}

{
  "name": "products:manage",
  "description": "Full product access",
  "resource": "products",
  "action": "manage"
}
```

### Assign Roles to User

```bash
POST /api/v1/users/{userId}/roles
Authorization: Bearer {ADMIN_JWT}

{
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}
```

### List All Roles

```bash
GET /api/v1/roles?page=1&limit=10
Authorization: Bearer {ADMIN_JWT}
```

### List All Permissions

```bash
GET /api/v1/permissions
Authorization: Bearer {ADMIN_JWT}
```

## Frontend Usage

### Import Services

```typescript
import { rolesService, permissionsService, usersService } from '@/lib/api';
import { isSuccessResponse } from '@/lib/utils';
```

### Create Role

```typescript
const response = await rolesService.create({
  name: 'Content Manager',
  description: 'Manages all content',
  permissionIds: ['perm-1', 'perm-2'],
});

if (isSuccessResponse(response)) {
  toast.success('Role created!');
}
```

### Get All Permissions

```typescript
const response = await permissionsService.getAll();
if (isSuccessResponse(response)) {
  const permissions = response.data;
}
```

### Assign Roles

```typescript
await usersService.assignRoles('user-uuid', [
  'admin-role-uuid',
  'editor-role-uuid',
]);
```

## Protecting Endpoints

### By Role

```typescript
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  @Post()
  @Roles('Admin', 'Product Manager')
  create() {}

  @Get()
  @Roles('Admin', 'Product Manager', 'User')
  findAll() {}
}
```

### By Permission

```typescript
@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
  @Post(':id/approve')
  @RequirePermissions('orders:approve')
  approve() {}
}
```

## Permission Naming

Pattern: `{resource}:{action}`

```
users:create       - Create users
users:read         - View users
users:update       - Update users
users:delete       - Delete users
posts:publish      - Publish posts
orders:approve     - Approve orders
reports:export     - Export reports
products:manage    - Full product access
```

## Default Roles

```
Admin      - 20 permissions (full access)
User       - 4 permissions (basic)
Moderator  - 8 permissions (content)
Editor     - 4 permissions (content)
```

## Testing Flow

```bash
# 1. Login as admin
curl -X POST http://localhost:3001/api/v1/auth/login \
  -d '{"email":"admin@example.com","password":"Admin@123"}'

# 2. Save token
export TOKEN="your-jwt-token"

# 3. Create role
curl -X POST http://localhost:3001/api/v1/roles \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Role","permissionIds":["..."]}'

# 4. Assign to user
curl -X POST http://localhost:3001/api/v1/users/USER_ID/roles \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"roleIds":["role-id"]}'
```

## Common Operations

| Operation         | Endpoint                              | Method | Access           |
| ----------------- | ------------------------------------- | ------ | ---------------- |
| Create role       | `/api/v1/roles`                       | POST   | Admin            |
| List roles        | `/api/v1/roles`                       | GET    | Admin, Moderator |
| Update role       | `/api/v1/roles/:id`                   | PUT    | Admin            |
| Delete role       | `/api/v1/roles/:id`                   | DELETE | Admin            |
| Create permission | `/api/v1/permissions`                 | POST   | Admin            |
| List permissions  | `/api/v1/permissions`                 | GET    | Admin, Moderator |
| Assign roles      | `/api/v1/users/:userId/roles`         | POST   | Admin            |
| Get user roles    | `/api/v1/users/:userId/roles`         | GET    | Admin, Moderator |
| Remove role       | `/api/v1/users/:userId/roles/:roleId` | DELETE | Admin            |

## Response Codes

- **200 OK** - Success
- **201 Created** - Resource created
- **400 Bad Request** - Validation error
- **401 Unauthorized** - No JWT or invalid
- **403 Forbidden** - Lacks required role/permission
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Resource already exists

## Key Files

### Backend

- `server/src/rbac/` - RBAC module
- `server/src/rbac/guards/` - Role/permission guards
- `server/src/rbac/decorators/` - @Roles(), @RequirePermissions()

### Frontend

- `client/lib/api/roles.service.ts` - Roles API
- `client/lib/api/permissions.service.ts` - Permissions API
- `client/interfaces/rbac.interface.ts` - TypeScript types

### Documentation

- `server/docs/ADMIN_ROLE_MANAGEMENT.md` ⭐ **START HERE**
- `server/docs/RBAC_INTEGRATION_GUIDE.md` - How it works
- `server/docs/RBAC_VISUAL_GUIDE.md` - Architecture diagrams
- `RBAC_SYSTEM_COMPLETE.md` - Complete summary

## Need Help?

See [ADMIN_ROLE_MANAGEMENT.md](./ADMIN_ROLE_MANAGEMENT.md) for:

- Complete API reference
- Real-world examples
- Frontend UI examples
- Step-by-step guides

🎉 **Your RBAC system is production-ready!**
