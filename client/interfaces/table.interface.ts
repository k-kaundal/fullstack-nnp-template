/**
 * Advanced Table Component Interfaces
 * TypeScript interfaces for the reusable Table component
 */

import { ReactNode } from 'react';

/**
 * Table column definition
 */
export interface TableColumn<T> {
  /** Column ID (must match data key) */
  id: keyof T | string;
  /** Column header label */
  label: string;
  /** Column width (e.g., '200px', '20%', 'auto') */
  width?: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Custom render function for cell content */
  render?: (value: unknown, row: T, index: number) => ReactNode;
  /** Align content (left, center, right) */
  align?: 'left' | 'center' | 'right';
  /** Hide on mobile */
  hideOnMobile?: boolean;
}

/**
 * Table action button
 */
export interface TableAction<T> {
  /** Action ID */
  id: string;
  /** Action label */
  label: string;
  /** Action icon */
  icon?: ReactNode;
  /** Action handler */
  onClick: (row: T, index: number) => void;
  /** Action variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Show as icon only (no label) */
  iconOnly?: boolean;
  /** Disabled state */
  disabled?: boolean | ((row: T) => boolean);
  /** Hidden state */
  hidden?: boolean | ((row: T) => boolean);
}

/**
 * Table bulk action
 */
export interface TableBulkAction<T> {
  /** Action ID */
  id: string;
  /** Action label */
  label: string;
  /** Action icon */
  icon?: ReactNode;
  /** Action handler */
  onClick: (selectedRows: T[], selectedIndices: number[]) => void;
  /** Action variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Table sort configuration
 */
export interface TableSort {
  /** Column ID to sort by */
  column: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Table pagination configuration
 */
export interface TablePagination {
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total items */
  total: number;
  /** Available page size options */
  pageSizeOptions?: number[];
}

/**
 * Advanced Table configuration
 */
export interface TableConfig<T> {
  /** Table columns */
  columns: TableColumn<T>[];
  /** Table data */
  data: T[];
  /** Row actions */
  actions?: TableAction<T>[];
  /** Bulk actions (requires selectable) */
  bulkActions?: TableBulkAction<T>[];
  /** Enable row selection */
  selectable?: boolean;
  /** Selected row indices */
  selectedRows?: number[];
  /** Selection change handler */
  onSelectionChange?: (selectedIndices: number[]) => void;
  /** Enable search */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Search handler */
  onSearch?: (query: string) => void;
  /** Enable pagination */
  pagination?: TablePagination;
  /** Pagination change handler */
  onPaginationChange?: (page: number, limit: number) => void;
  /** Sort configuration */
  sort?: TableSort;
  /** Sort change handler */
  onSortChange?: (column: string, direction: 'asc' | 'desc') => void;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state icon */
  emptyIcon?: ReactNode;
  /** Show row numbers */
  showRowNumbers?: boolean;
  /** Striped rows */
  striped?: boolean;
  /** Bordered table */
  bordered?: boolean;
  /** Hover effect on rows */
  hoverable?: boolean;
  /** Compact mode (smaller padding) */
  compact?: boolean;
  /** Custom row className */
  rowClassName?: (row: T, index: number) => string;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Unique key extractor */
  getRowKey?: (row: T, index: number) => string | number;
}
