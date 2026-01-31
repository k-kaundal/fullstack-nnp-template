/**
 * Users Page - Admin
 * Full implementation with real API calls for CRUD operations and advanced search
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, Confirm, ViewDialog, EditDialog } from '@/components/ui';
import { User, UpdateUserDto, CreateUserDto } from '@/interfaces';
import { isSuccessResponse, toast } from '@/lib/utils';
import { TableConfig, ViewDialogConfig, EditDialogConfig } from '@/interfaces';
import { usersService } from '@/lib/api/index';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pageSizeOptions: [10, 25, 50, 100],
  });
  const [sort, setSort] = useState({
    column: 'createdAt',
    direction: 'desc' as 'asc' | 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // ViewDialog state
  const [viewDialogConfig, setViewDialogConfig] = useState<ViewDialogConfig>({
    isOpen: false,
    onClose: () => setViewDialogConfig((prev) => ({ ...prev, isOpen: false })),
    title: '',
    fields: [],
  });

  // EditDialog state
  const [editDialogConfig, setEditDialogConfig] = useState<EditDialogConfig>({
    isOpen: false,
    onClose: () => setEditDialogConfig((prev) => ({ ...prev, isOpen: false })),
    title: '',
    fields: [],
  });

  // CreateDialog state
  const [createDialogConfig, setCreateDialogConfig] = useState<EditDialogConfig>({
    isOpen: false,
    onClose: () => setCreateDialogConfig((prev) => ({ ...prev, isOpen: false })),
    title: '',
    fields: [],
  });

  // Confirm state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning' as 'info' | 'warning' | 'danger',
    onConfirm: () => {},
  });

  // Show confirmation
  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'info' | 'warning' | 'danger' = 'warning'
  ) => {
    setConfirmState({ isOpen: true, title, message, type, onConfirm });
  };

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Always use advanced search API for sorting/filtering support
      const response = await usersService.search({
        search: searchQuery || undefined,
        sortBy: sort.column as 'email' | 'firstName' | 'lastName' | 'createdAt' | 'isActive',
        sortOrder: sort.direction,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (isSuccessResponse<User[]>(response)) {
        setUsers(response.data);
        if (response.meta && typeof response.meta.total === 'number') {
          setPagination((prev) => ({
            ...prev,
            total: response.meta!.total as number,
          }));
        }
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sort.column, sort.direction, searchQuery]);

  // Fetch users on mount and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle sort
  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSort({ column, direction });
  };

  // Handle pagination
  const handlePagination = (page: number, limit: number) => {
    setPagination((prev) => ({ ...prev, page, limit }));
  };

  // Handle selection change
  const handleSelectionChange = (selectedIndices: number[]) => {
    setSelectedRows(selectedIndices);
  };

  // Handle view user
  const handleView = (user: User) => {
    setViewDialogConfig({
      isOpen: true,
      onClose: () => setViewDialogConfig((prev) => ({ ...prev, isOpen: false })),
      title: 'User Details',
      subtitle: `Viewing details for ${user.email}`,
      size: 'lg',
      sections: [
        {
          id: 'basic',
          title: 'Basic Information',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          ),
          fields: [
            {
              id: 'id',
              label: 'User ID',
              value: user.id,
              type: 'text',
              copyable: true,
              fullWidth: true,
            },
            {
              id: 'email',
              label: 'Email Address',
              value: user.email,
              type: 'email',
              copyable: true,
            },
            {
              id: 'firstName',
              label: 'First Name',
              value: user.firstName,
              type: 'text',
            },
            {
              id: 'lastName',
              label: 'Last Name',
              value: user.lastName,
              type: 'text',
            },
            {
              id: 'status',
              label: 'Account Status',
              value: user.isActive,
              type: 'boolean',
            },
          ],
        },
        {
          id: 'timestamps',
          title: 'Timestamps',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          fields: [
            {
              id: 'createdAt',
              label: 'Created At',
              value: user.createdAt,
              type: 'datetime',
            },
            {
              id: 'updatedAt',
              label: 'Last Updated',
              value: user.updatedAt,
              type: 'datetime',
            },
          ],
        },
      ],
      actions: [
        {
          id: 'edit',
          label: 'Edit User',
          variant: 'primary',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          ),
          onClick: () => {
            setViewDialogConfig((prev) => ({ ...prev, isOpen: false }));
            handleEdit(user);
          },
        },
        {
          id: 'delete',
          label: 'Delete User',
          variant: 'danger',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          ),
          onClick: () => {
            setViewDialogConfig((prev) => ({ ...prev, isOpen: false }));
            handleDelete(user);
          },
          disabled: user.isActive,
        },
        {
          id: 'close',
          label: 'Close',
          variant: 'secondary',
          onClick: () => setViewDialogConfig((prev) => ({ ...prev, isOpen: false })),
        },
      ],
    });
  };

  // Handle create user
  const handleCreate = () => {
    setCreateDialogConfig({
      isOpen: true,
      onClose: () => setCreateDialogConfig((prev) => ({ ...prev, isOpen: false })),
      title: 'Create New User',
      subtitle: 'Add a new user - temporary password will be generated and sent via email',
      size: 'lg',
      sections: [
        {
          id: 'basic',
          title: 'User Information',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          ),
          fields: [
            {
              id: 'email',
              name: 'email',
              label: 'Email Address',
              type: 'email',
              placeholder: 'user@example.com',
              validation: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              },
              helpText: 'User will receive login credentials at this email',
            },
            {
              id: 'firstName',
              name: 'firstName',
              label: 'First Name',
              type: 'text',
              placeholder: 'John',
              validation: {
                required: true,
                minLength: 2,
                maxLength: 50,
              },
            },
            {
              id: 'lastName',
              name: 'lastName',
              label: 'Last Name',
              type: 'text',
              placeholder: 'Doe',
              validation: {
                required: true,
                minLength: 2,
                maxLength: 50,
              },
            },
          ],
        },
      ],
      onSubmit: async (formData) => {
        // Prepare create data
        const createData: CreateUserDto = {
          email: formData.email as string,
          firstName: formData.firstName as string,
          lastName: formData.lastName as string,
        };

        const response = await usersService.create(createData);
        if (isSuccessResponse<User>(response)) {
          toast.success(
            `User ${response.data.email} created successfully. Temporary password sent via email.`
          );
          setCreateDialogConfig((prev) => ({ ...prev, isOpen: false }));
          fetchUsers(); // Refresh list
        } else {
          toast.error(response.message);
          throw new Error(response.message); // Keep dialog open on error
        }
      },
      actions: [
        {
          id: 'create',
          label: 'Create User',
          variant: 'primary',
          type: 'submit',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          ),
          onClick: () => {}, // Handled by onSubmit
        },
        {
          id: 'cancel',
          label: 'Cancel',
          variant: 'secondary',
          onClick: () => setCreateDialogConfig((prev) => ({ ...prev, isOpen: false })),
        },
      ],
    });
  };

  // Handle edit user (placeholder)
  const handleEdit = (user: User) => {
    setEditDialogConfig({
      isOpen: true,
      onClose: () => setEditDialogConfig((prev) => ({ ...prev, isOpen: false })),
      title: 'Edit User',
      subtitle: `Update details for ${user.email}`,
      size: 'lg',
      initialValues: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      },
      sections: [
        {
          id: 'basic',
          title: 'Basic Information',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          ),
          fields: [
            {
              id: 'email',
              name: 'email',
              label: 'Email Address',
              type: 'email',
              placeholder: 'user@example.com',
              validation: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              },
              helpText: 'User email address for login',
            },
            {
              id: 'firstName',
              name: 'firstName',
              label: 'First Name',
              type: 'text',
              placeholder: 'John',
              validation: {
                required: true,
                minLength: 2,
                maxLength: 50,
              },
            },
            {
              id: 'lastName',
              name: 'lastName',
              label: 'Last Name',
              type: 'text',
              placeholder: 'Doe',
              validation: {
                required: true,
                minLength: 2,
                maxLength: 50,
              },
            },
            {
              id: 'isActive',
              name: 'isActive',
              label: 'Account Status',
              type: 'checkbox',
              helpText: 'Enable or disable user account',
            },
          ],
        },
        {
          id: 'password',
          title: 'Change Password (Optional)',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          ),
          collapsible: true,
          defaultCollapsed: true,
          fields: [
            {
              id: 'password',
              name: 'password',
              label: 'New Password',
              type: 'password',
              placeholder: 'Leave empty to keep current password',
              validation: {
                minLength: 8,
                validate: (value: unknown) => {
                  if (!value) return true; // Optional field
                  const password = String(value);
                  if (password.length < 8) return 'Password must be at least 8 characters';
                  if (!/[A-Z]/.test(password))
                    return 'Password must contain at least one uppercase letter';
                  if (!/[a-z]/.test(password))
                    return 'Password must contain at least one lowercase letter';
                  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
                  return true;
                },
              },
              helpText: 'Must be at least 8 characters with uppercase, lowercase, and number',
              fullWidth: true,
            },
            {
              id: 'confirmPassword',
              name: 'confirmPassword',
              label: 'Confirm New Password',
              type: 'password',
              placeholder: 'Re-enter new password',
              fullWidth: true,
            },
          ],
        },
      ],
      onSubmit: async (formData) => {
        const password = formData.password ? String(formData.password).trim() : '';
        const confirmPassword = formData.confirmPassword
          ? String(formData.confirmPassword).trim()
          : '';

        // Validate password fields
        if (password || confirmPassword) {
          // If either field has a value, both must be filled
          if (!password) {
            toast.error('Please enter a new password');
            throw new Error('Password is required');
          }
          if (!confirmPassword) {
            toast.error('Please confirm your new password');
            throw new Error('Password confirmation is required');
          }
          // Check if passwords match
          if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            throw new Error('Passwords do not match');
          }
          // Validate password strength
          if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            throw new Error('Password too short');
          }
          if (!/[A-Z]/.test(password)) {
            toast.error('Password must contain at least one uppercase letter');
            throw new Error('Password validation failed');
          }
          if (!/[a-z]/.test(password)) {
            toast.error('Password must contain at least one lowercase letter');
            throw new Error('Password validation failed');
          }
          if (!/[0-9]/.test(password)) {
            toast.error('Password must contain at least one number');
            throw new Error('Password validation failed');
          }
        }

        // Prepare update data
        const updateData: UpdateUserDto = {
          email: formData.email as string,
          firstName: formData.firstName as string,
          lastName: formData.lastName as string,
          isActive: formData.isActive as boolean,
        };

        // Add password if changed
        if (password) {
          updateData.password = password;
        }

        const response = await usersService.update(user.id, updateData);
        if (isSuccessResponse<User>(response)) {
          toast.success(`User ${response.data.email} updated successfully`);
          setEditDialogConfig((prev) => ({ ...prev, isOpen: false }));
          fetchUsers(); // Refresh list
        } else {
          toast.error(response.message);
          throw new Error(response.message); // Keep dialog open on error
        }
      },
      actions: [
        {
          id: 'save',
          label: 'Save Changes',
          variant: 'primary',
          type: 'submit',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
          onClick: () => {}, // Handled by onSubmit
        },
        {
          id: 'cancel',
          label: 'Cancel',
          variant: 'secondary',
          onClick: () => setEditDialogConfig((prev) => ({ ...prev, isOpen: false })),
        },
      ],
    });
  };

  // Handle delete user
  const handleDelete = (user: User) => {
    showConfirm(
      'Delete User',
      `Are you sure you want to delete ${user.email}? This action cannot be undone.`,
      async () => {
        const response = await usersService.delete(user.id);
        if (isSuccessResponse(response)) {
          toast.success(`User ${user.email} deleted successfully`);
          fetchUsers(); // Refresh list
        } else {
          toast.error(response.message);
        }
      },
      'danger'
    );
  };

  // Handle bulk activate
  const handleBulkActivate = (selectedUsers: User[]) => {
    const userIds = selectedUsers.map((u) => u.id);
    showConfirm(
      'Activate Users',
      `Are you sure you want to activate ${selectedUsers.length} user(s)?`,
      async () => {
        const response = await usersService.bulkActivate(userIds);
        if (isSuccessResponse(response)) {
          toast.success(`${response.data.affected} user(s) activated successfully`);
          fetchUsers(); // Refresh list
          setSelectedRows([]); // Clear selection
        } else {
          toast.error(response.message);
        }
      },
      'info'
    );
  };

  // Handle bulk deactivate
  const handleBulkDeactivate = (selectedUsers: User[]) => {
    const userIds = selectedUsers.map((u) => u.id);
    showConfirm(
      'Deactivate Users',
      `Are you sure you want to deactivate ${selectedUsers.length} user(s)?`,
      async () => {
        const response = await usersService.bulkDeactivate(userIds);
        if (isSuccessResponse(response)) {
          toast.warning(`${response.data.affected} user(s) deactivated`);
          fetchUsers(); // Refresh list
          setSelectedRows([]); // Clear selection
        } else {
          toast.error(response.message);
        }
      },
      'warning'
    );
  };

  // Handle bulk delete
  const handleBulkDelete = (selectedUsers: User[]) => {
    const userIds = selectedUsers.map((u) => u.id);
    showConfirm(
      'Delete Users',
      `Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`,
      async () => {
        const response = await usersService.bulkDelete(userIds);
        if (isSuccessResponse(response)) {
          toast.success(`${response.data.affected} user(s) deleted successfully`);
          fetchUsers(); // Refresh list
          setSelectedRows([]); // Clear selection
        } else {
          toast.error(response.message);
        }
      },
      'danger'
    );
  };

  // Table configuration
  const tableConfig: TableConfig<User> = {
    columns: [
      {
        id: 'email',
        label: 'Email',
        sortable: true,
        width: '30%',
      },
      {
        id: 'firstName',
        label: 'First Name',
        sortable: true,
        hideOnMobile: true,
      },
      {
        id: 'lastName',
        label: 'Last Name',
        sortable: true,
        hideOnMobile: true,
      },
      {
        id: 'isActive',
        label: 'Status',
        sortable: true,
        align: 'center',
        render: (value) => {
          const isActive = value as boolean;
          return (
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        id: 'createdAt',
        label: 'Created',
        sortable: true,
        hideOnMobile: true,
        render: (value) => {
          const date = new Date(value as string);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        },
      },
    ],
    data: users,
    actions: [
      {
        id: 'view',
        label: 'View',
        iconOnly: true,
        icon: <ViewIcon />,
        onClick: (user) => handleView(user),
      },
      {
        id: 'edit',
        label: 'Edit',
        iconOnly: true,
        icon: <EditIcon />,
        onClick: (user) => handleEdit(user),
      },
      {
        id: 'delete',
        label: 'Delete',
        iconOnly: true,
        variant: 'danger',
        icon: <DeleteIcon />,
        onClick: (user) => handleDelete(user),
        disabled: (user) => user.isActive, // Can't delete active users
      },
    ],
    bulkActions: [
      {
        id: 'activate',
        label: 'Activate',
        variant: 'success',
        onClick: (selectedUsers) => handleBulkActivate(selectedUsers),
      },
      {
        id: 'deactivate',
        label: 'Deactivate',
        variant: 'warning',
        onClick: (selectedUsers) => handleBulkDeactivate(selectedUsers),
      },
      {
        id: 'delete',
        label: 'Delete',
        variant: 'danger',
        onClick: (selectedUsers) => handleBulkDelete(selectedUsers),
      },
    ],
    selectable: true,
    selectedRows,
    onSelectionChange: handleSelectionChange,
    searchable: true,
    searchPlaceholder: 'Search users...',
    onSearch: handleSearch,
    showRowNumbers: true,
    striped: true,
    hoverable: true,
    pagination,
    onPaginationChange: handlePagination,
    sort,
    onSortChange: handleSort,
    loading,
    emptyMessage: 'No users found',
    getRowKey: (user) => user.id,
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all users in the system</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover text-white rounded-lg transition-colors duration-200 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create User
        </button>
      </div>

      <Table config={tableConfig} />

      {/* Confirmation Dialog */}
      <Confirm
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        onConfirm={confirmState.onConfirm}
      />

      {/* View Dialog */}
      <ViewDialog config={viewDialogConfig} />

      {/* Edit Dialog */}
      <EditDialog config={editDialogConfig} />

      {/* Create Dialog */}
      <EditDialog config={createDialogConfig} />
    </div>
  );
}

// Icon Components
function ViewIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
