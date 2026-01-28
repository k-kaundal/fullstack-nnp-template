/**
 * User Card Component
 * Displays user information in a card format
 */

import { UserCardProps } from '@/interfaces';

/**
 * UserCard component for displaying user details
 *
 * @param props - Component props
 * @returns JSX Element
 *
 * @example
 * ```tsx
 * <UserCard
 *   user={user}
 *   onEdit={(user) => handleEdit(user)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 * ```
 */
export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500 mt-2">
            Status:{' '}
            <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(user)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(user.id)}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
