/**
 * Pagination Component
 * Displays pagination controls with page numbers
 */

import { PaginationProps } from '@/interfaces';

/**
 * Pagination component for navigating pages
 *
 * @param props - Component props
 * @returns JSX Element
 *
 * @example
 * ```tsx
 * <Pagination
 *   meta={paginationMeta}
 *   onPageChange={(page) => fetchUsers(page, 10)}
 * />
 * ```
 */
export function Pagination({ meta, onPageChange, className = '' }: PaginationProps) {
  const { page, total_pages, has_next, has_previous } = meta;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-gray-700">
        Page {page} of {total_pages}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!has_previous}
          className="px-4 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next}
          className="px-4 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
