/**
 * Advanced Table Component
 * Highly reusable table with sorting, pagination, search, and row actions
 */

'use client';

import { useState, useMemo } from 'react';
import { TableConfig, TableAction } from '@/interfaces';

interface TableProps<T> {
  config: TableConfig<T>;
}

/**
 * Advanced Table component with sorting, pagination, search, and actions
 *
 * @param props - Table configuration
 * @returns JSX Element
 */
export function Table<T>({ config }: TableProps<T>) {
  const {
    columns,
    data,
    actions = [],
    bulkActions = [],
    selectable = false,
    selectedRows = [],
    onSelectionChange,
    searchable = false,
    searchPlaceholder = 'Search...',
    onSearch,
    pagination,
    onPaginationChange,
    sort,
    onSortChange,
    loading = false,
    emptyMessage = 'No data available',
    emptyIcon,
    showRowNumbers = false,
    striped = false,
    bordered = false,
    hoverable = true,
    compact = false,
    rowClassName,
    onRowClick,
    getRowKey,
  } = config;

  const [searchQuery, setSearchQuery] = useState('');
  const [internalSelectedRows, setInternalSelectedRows] = useState<number[]>(selectedRows);

  // Use internal or controlled selection
  const currentSelectedRows = onSelectionChange ? selectedRows : internalSelectedRows;

  // Handle selection change
  const handleSelectionChange = (indices: number[]) => {
    if (onSelectionChange) {
      onSelectionChange(indices);
    } else {
      setInternalSelectedRows(indices);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  // Handle sort
  const handleSort = (column: string) => {
    if (!onSortChange) return;

    const newDirection = sort?.column === column && sort?.direction === 'asc' ? 'desc' : 'asc';
    onSortChange(column, newDirection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (currentSelectedRows.length === data.length) {
      handleSelectionChange([]);
    } else {
      handleSelectionChange(data.map((_, index) => index));
    }
  };

  // Handle row selection
  const handleRowSelect = (index: number) => {
    const newSelected = currentSelectedRows.includes(index)
      ? currentSelectedRows.filter((i) => i !== index)
      : [...currentSelectedRows, index];
    handleSelectionChange(newSelected);
  };

  // Get visible actions for a row
  const getVisibleActions = (row: T): TableAction<T>[] => {
    return actions.filter((action) => {
      if (typeof action.hidden === 'function') {
        return !action.hidden(row);
      }
      return !action.hidden;
    });
  };

  // Check if action is disabled for a row
  const isActionDisabled = (action: TableAction<T>, row: T): boolean => {
    if (typeof action.disabled === 'function') {
      return action.disabled(row);
    }
    return action.disabled || false;
  };

  // Get action button classes
  const getActionClasses = (variant: string = 'secondary', disabled: boolean = false) => {
    const baseClasses =
      'px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    if (disabled) {
      return `${baseClasses} bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500`;
    }

    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
      secondary:
        'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
      success:
        'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
      warning:
        'bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600',
      danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
    };

    return `${baseClasses} ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.secondary}`;
  };

  // Selected data
  const selectedData = useMemo(() => {
    return data.filter((_, index) => currentSelectedRows.includes(index));
  }, [data, currentSelectedRows]);

  // Has actions column
  const hasActionsColumn = actions.length > 0;

  return (
    <div className="w-full">
      {/* Header: Search and Bulk Actions */}
      {(searchable || (selectable && bulkActions.length > 0)) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {/* Search */}
          {searchable && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectable && bulkActions.length > 0 && currentSelectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentSelectedRows.length} selected
              </span>
              {bulkActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => action.onClick(selectedData, currentSelectedRows)}
                  disabled={action.disabled}
                  className={getActionClasses(action.variant, action.disabled)}
                >
                  {action.icon && <span className="inline-block mr-1">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div
        className={`overflow-x-auto ${bordered ? 'border border-gray-200 dark:border-gray-700 rounded-lg' : ''}`}
      >
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              {/* Selection Column */}
              {selectable && (
                <th className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} text-left`}>
                  <input
                    type="checkbox"
                    checked={currentSelectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </th>
              )}

              {/* Row Numbers Column */}
              {showRowNumbers && (
                <th
                  className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase`}
                >
                  #
                </th>
              )}

              {/* Data Columns */}
              {columns.map((column) => (
                <th
                  key={String(column.id)}
                  style={{ width: column.width }}
                  className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} text-${column.align || 'left'} text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase ${
                    column.hideOnMobile ? 'hidden md:table-cell' : ''
                  } ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none' : ''}`}
                  onClick={() => column.sortable && handleSort(String(column.id))}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="inline-block">
                        {sort?.column === column.id ? (
                          sort.direction === 'asc' ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )
                        ) : (
                          <SortIcon className="w-4 h-4 opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}

              {/* Actions Column */}
              {hasActionsColumn && (
                <th
                  className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase`}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (showRowNumbers ? 1 : 0) +
                    (hasActionsColumn ? 1 : 0)
                  }
                  className="px-4 py-8"
                >
                  <div className="flex items-center justify-center">
                    <LoadingSpinner />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (showRowNumbers ? 1 : 0) +
                    (hasActionsColumn ? 1 : 0)
                  }
                  className="px-4 py-12"
                >
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    {emptyIcon || <EmptyIcon className="w-16 h-16 mb-2 opacity-50" />}
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const isSelected = currentSelectedRows.includes(rowIndex);
                const rowKey = getRowKey ? getRowKey(row, rowIndex) : rowIndex;
                const customRowClass = rowClassName ? rowClassName(row, rowIndex) : '';
                const visibleActions = getVisibleActions(row);

                return (
                  <tr
                    key={rowKey}
                    className={`
                      ${striped && rowIndex % 2 === 1 ? 'bg-gray-50 dark:bg-gray-900/30' : ''}
                      ${hoverable ? 'hover:bg-gray-100 dark:hover:bg-gray-800/50' : ''}
                      ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      ${onRowClick ? 'cursor-pointer' : ''}
                      ${customRowClass}
                      transition-colors
                    `}
                    onClick={() => onRowClick && onRowClick(row, rowIndex)}
                  >
                    {/* Selection Cell */}
                    {selectable && (
                      <td
                        className={`${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(rowIndex)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                    )}

                    {/* Row Number Cell */}
                    {showRowNumbers && (
                      <td
                        className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} text-sm text-gray-500 dark:text-gray-400`}
                      >
                        {pagination
                          ? (pagination.page - 1) * pagination.limit + rowIndex + 1
                          : rowIndex + 1}
                      </td>
                    )}

                    {/* Data Cells */}
                    {columns.map((column) => {
                      const value = row[column.id as keyof T];
                      const cellContent = column.render
                        ? column.render(value, row, rowIndex)
                        : String(value ?? '');

                      return (
                        <td
                          key={String(column.id)}
                          className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} text-sm text-gray-900 dark:text-gray-100 text-${column.align || 'left'} ${
                            column.hideOnMobile ? 'hidden md:table-cell' : ''
                          }`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}

                    {/* Actions Cell */}
                    {hasActionsColumn && (
                      <td
                        className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} text-right`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          {visibleActions.map((action) => {
                            const disabled = isActionDisabled(action, row);
                            return action.iconOnly ? (
                              <button
                                key={action.id}
                                onClick={() => !disabled && action.onClick(row, rowIndex)}
                                disabled={disabled}
                                title={action.label}
                                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {action.icon}
                              </button>
                            ) : (
                              <button
                                key={action.id}
                                onClick={() => !disabled && action.onClick(row, rowIndex)}
                                disabled={disabled}
                                className={getActionClasses(action.variant, disabled)}
                              >
                                {action.icon && (
                                  <span className="inline-block mr-1">{action.icon}</span>
                                )}
                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && data.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
            <select
              value={pagination.limit}
              onChange={(e) =>
                onPaginationChange && onPaginationChange(1, parseInt(e.target.value))
              }
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(pagination.pageSizeOptions || [10, 25, 50, 100]).map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              of {pagination.total} results
            </span>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onPaginationChange && onPaginationChange(pagination.page - 1, pagination.limit)
              }
              disabled={pagination.page === 1}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>

            <button
              onClick={() =>
                onPaginationChange && onPaginationChange(pagination.page + 1, pagination.limit)
              }
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon Components
function SearchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function ChevronUpIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
}

function ChevronDownIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SortIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
      />
    </svg>
  );
}

function EmptyIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-blue-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
