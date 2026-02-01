/**
 * Professional User Management Page
 * Full CRUD operations with statistics, filtering, bulk actions
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, CreateUserDto, UpdateUserDto } from '@/interfaces';
import { isSuccessResponse, toast } from '@/lib/utils';
import { LoadingSpinner, Pagination, Confirm, ViewDialog, EditDialog } from '@/components/ui';
import { ViewDialogConfig, EditDialogConfig } from '@/interfaces';
import { usersService } from '@/lib/api/users.service';
import { AssignRolesDialog } from '@/components/admin/AssignRolesDialog';

/**
 * Safely format date to locale string
 */
const formatDate = (
  dateString: string | Date | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString(undefined, options);
  } catch {
    return '-';
  }
};

interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  todayRegistered: number;
}

export default function UsersPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status') as 'active' | 'inactive' | null;

  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    statusParam || 'all'
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => async () => {});
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    type: 'warning' | 'danger';
  }>({
    title: '',
    message: '',
    type: 'warning',
  });
  const [viewDialogConfig, setViewDialogConfig] = useState<ViewDialogConfig | null>(null);
  const [editDialogConfig, setEditDialogConfig] = useState<EditDialogConfig | null>(null);
  const [assignRolesDialogOpen, setAssignRolesDialogOpen] = useState(false);
  const [selectedUserForRoles, setSelectedUserForRoles] = useState<User | null>(null);

  // Update statusFilter when URL query parameter changes
  useEffect(() => {
    if (statusParam) {
      setStatusFilter(statusParam);
    } else {
      setStatusFilter('all');
    }
  }, [statusParam]);

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchQuery, statusFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await usersService.search({
        search: searchQuery || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        page,
        limit,
      });

      if (isSuccessResponse<User[]>(response)) {
        setUsers(response.data);
        setTotal(Number(response.meta?.total || 0));
        setTotalPages(Number(response.meta?.total_pages || 1));
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      // Fetch statistics from dedicated API endpoint
      const response = await usersService.getStatistics();
      if (isSuccessResponse(response)) {
        setStatistics({
          total: response.data.total,
          active: response.data.active,
          inactive: response.data.inactive,
          todayRegistered: response.data.todayRegistered,
        });
      }
    } catch {
      // Silent fail for statistics
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPage(1);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const handleViewUser = (user: User) => {
    setViewDialogConfig({
      isOpen: true,
      onClose: () => setViewDialogConfig(null),
      title: 'User Details',
      subtitle: user.email,
      sections: [
        {
          id: 'basic',
          title: 'Basic Information',
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
          id: 'assign-roles',
          label: 'Assign Roles',
          variant: 'primary',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          ),
          onClick: () => {
            setViewDialogConfig(null);
            handleAssignRoles(user);
          },
        },
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
            setViewDialogConfig(null);
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
            setViewDialogConfig(null);
            handleDelete(user);
          },
          disabled: user.isActive,
        },
        {
          id: 'close',
          label: 'Close',
          variant: 'secondary',
          onClick: () => setViewDialogConfig(null),
        },
      ],
    });
  };

  // Handle edit user
  const handleEdit = (user: User) => {
    setEditDialogConfig({
      isOpen: true,
      onClose: () => setEditDialogConfig(null),
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
            throw new Error('Password is required'); // NOSONAR - Validation error message
          }
          if (!confirmPassword) {
            toast.error('Please confirm your new password');
            throw new Error('Password confirmation is required'); // NOSONAR - Validation error message
          }
          // Check if passwords match
          if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            throw new Error('Passwords do not match'); // NOSONAR - Validation error message
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
          setEditDialogConfig(null);
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
          onClick: () => setEditDialogConfig(null),
        },
      ],
    });
  };

  // Handle assign roles to user
  const handleAssignRoles = (user: User) => {
    setSelectedUserForRoles(user);
    setAssignRolesDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setConfirmConfig({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.email}? This action cannot be undone.`,
      type: 'danger',
    });
    setConfirmAction(() => async () => {
      const response = await usersService.delete(user.id);
      if (isSuccessResponse(response)) {
        toast.success('User deleted successfully');
        fetchUsers();
        fetchStatistics();
      } else {
        toast.error(response.message);
      }
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  const handleCreateUser = () => {
    setEditDialogConfig({
      isOpen: true,
      onClose: () => setEditDialogConfig(null),
      title: 'Create New User',
      subtitle: 'Add a new user to the system',
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
            {
              id: 'password',
              name: 'password',
              label: 'Password',
              type: 'password',
              placeholder: 'Enter secure password',
              validation: {
                required: true,
                minLength: 8,
                validate: (value: unknown) => {
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
            },
          ],
        },
      ],
      onSubmit: async (data) => {
        const response = await usersService.create(data as unknown as CreateUserDto);
        if (isSuccessResponse<User>(response)) {
          toast.success(`User ${response.data.email} created successfully`);
          setEditDialogConfig(null);
          fetchUsers();
          fetchStatistics();
        } else {
          toast.error(response.message);
        }
      },
    });
  };

  const handleToggleStatus = async (user: User) => {
    const response = await usersService.update(user.id, { isActive: !user.isActive });
    if (isSuccessResponse(response)) {
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
      fetchStatistics();
    } else {
      toast.error(response.message);
    }
  };

  const handleBulkActivate = () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to activate');
      return;
    }

    setConfirmConfig({
      title: 'Activate Users',
      message: `Are you sure you want to activate ${selectedUsers.length} user(s)?`,
      type: 'warning',
    });
    setConfirmAction(() => async () => {
      const response = await usersService.bulkActivate(selectedUsers);
      if (isSuccessResponse(response)) {
        toast.success(`${response.data.affected} users activated`);
        setSelectedUsers([]);
        fetchUsers();
        fetchStatistics();
      } else {
        toast.error(response.message);
      }
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  const handleBulkDeactivate = () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to deactivate');
      return;
    }

    setConfirmConfig({
      title: 'Deactivate Users',
      message: `Are you sure you want to deactivate ${selectedUsers.length} user(s)?`,
      type: 'warning',
    });
    setConfirmAction(() => async () => {
      const response = await usersService.bulkDeactivate(selectedUsers);
      if (isSuccessResponse(response)) {
        toast.success(`${response.data.affected} users deactivated`);
        setSelectedUsers([]);
        fetchUsers();
        fetchStatistics();
      } else {
        toast.error(response.message);
      }
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to delete');
      return;
    }

    setConfirmConfig({
      title: 'Delete Users',
      message: `Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`,
      type: 'danger',
    });
    setConfirmAction(() => async () => {
      const response = await usersService.bulkDelete(selectedUsers);
      if (isSuccessResponse(response)) {
        toast.success(`${response.data.affected} users deleted`);
        setSelectedUsers([]);
        fetchUsers();
        fetchStatistics();
      } else {
        toast.error(response.message);
      }
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchUsers();
              fetchStatistics();
              toast.success('Data refreshed');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
          <button
            onClick={handleCreateUser}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create User
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {statistics.total.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {statistics.active.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Inactive Users
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {statistics.inactive.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Registered Today
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {statistics.todayRegistered.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Bulk Actions */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        {/* Search and Filters */}
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === 'Enter' && handleSearch()
              }
              placeholder="Search by email or name..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
              }
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Items per page
            </label>
            <select
              value={limit}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={handleClearSearch}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex gap-3 items-center flex-wrap p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedUsers.length} user(s) selected
            </span>
            <button
              onClick={handleBulkActivate}
              className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Activate
            </button>
            <button
              onClick={handleBulkDeactivate}
              className="px-4 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Deactivate
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="px-4 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">No users found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName || ''}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                        } transition-colors cursor-pointer`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(user.createdAt, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleAssignRoles(user)}
                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                        title="Assign Roles"
                      >
                        Roles
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-medium">{total}</span> results
              </p>
              <Pagination
                meta={{
                  total,
                  count: users.length,
                  page,
                  limit,
                  total_pages: totalPages,
                  has_next: page < totalPages,
                  has_previous: page > 1,
                }}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {viewDialogConfig && <ViewDialog config={viewDialogConfig} />}
      {editDialogConfig && <EditDialog config={editDialogConfig} />}

      {/* Confirm Dialog */}
      <Confirm
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmAction}
      />

      {/* Assign Roles Dialog */}
      {selectedUserForRoles && (
        <AssignRolesDialog
          isOpen={assignRolesDialogOpen}
          onClose={() => {
            setAssignRolesDialogOpen(false);
            setSelectedUserForRoles(null);
          }}
          userId={selectedUserForRoles.id}
          userEmail={selectedUserForRoles.email}
          currentRoles={selectedUserForRoles.roles || []}
          onSuccess={() => {
            fetchUsers(); // Refresh user list
            fetchStatistics(); // Refresh statistics
          }}
        />
      )}
    </div>
  );
}
