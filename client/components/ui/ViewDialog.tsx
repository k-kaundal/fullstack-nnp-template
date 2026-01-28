/**
 * ViewDialog Component
 * Advanced dialog for displaying entity details with structured fields
 * Supports sections, custom rendering, status badges, and copyable fields
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { ViewDialogConfig, ViewField, ViewSection, ViewFieldValue, ViewAction } from '@/interfaces';

// Icon Components
function CloseIcon() {
  return (
    <svg
      className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-green-600 dark:text-green-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * ViewDialog component for displaying detailed entity information
 *
 * @param config - ViewDialog configuration
 * @returns JSX Element
 *
 * @example
 * ```tsx
 * <ViewDialog
 *   config={{
 *     isOpen: true,
 *     onClose: () => {},
 *     title: "User Details",
 *     fields: [
 *       { id: 'email', label: 'Email', value: user.email, type: 'email' },
 *       { id: 'status', label: 'Status', value: user.isActive, type: 'boolean' }
 *     ]
 *   }}
 * />
 * ```
 */
export function ViewDialog({ config }: { config: ViewDialogConfig }) {
  const {
    isOpen,
    onClose,
    title,
    subtitle,
    fields,
    sections,
    actions,
    size = 'lg',
    showCloseButton = true,
    className = '',
    loading = false,
    footer,
  } = config;

  const dialogRef = useRef<HTMLDivElement>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    // Initialize collapsed sections on mount
    if (sections) {
      const initialState: Record<string, boolean> = {};
      sections.forEach((section) => {
        if (section.collapsible && section.defaultCollapsed) {
          initialState[section.id] = true;
        }
      });
      return initialState;
    }
    return {};
  });
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Toggle section collapse
  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Copy field value
  const copyToClipboard = async (fieldId: string, value: ViewFieldValue) => {
    if (typeof value === 'string' || typeof value === 'number') {
      await navigator.clipboard.writeText(String(value));
      setCopiedFields((prev) => ({ ...prev, [fieldId]: true }));
      setTimeout(() => {
        setCopiedFields((prev) => ({ ...prev, [fieldId]: false }));
      }, 2000);
    }
  };

  // Render field value based on type
  const renderFieldValue = (field: ViewField): React.ReactNode => {
    if (field.hidden) return null;
    if (field.render) return field.render(field.value);

    const { value, type } = field;

    // Null/undefined
    if (value === null || value === undefined) {
      return <span className="text-gray-400 dark:text-gray-600 italic">Not set</span>;
    }

    // Custom render
    if (type === 'custom') {
      return <>{value}</>;
    }

    // Email
    if (type === 'email' && typeof value === 'string') {
      return (
        <a
          href={`mailto:${value}`}
          className="text-(--color-dialog-link) dark:text-(--color-dialog-link-dark) hover:text-(--color-dialog-link-hover) dark:hover:text-(--color-dialog-link-hover-dark) hover:underline font-medium inline-flex items-center gap-1 group"
        >
          <svg
            className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {value}
        </a>
      );
    }

    // Link
    if (type === 'link' && typeof value === 'string') {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-(--color-dialog-link) dark:text-(--color-dialog-link-dark) hover:text-(--color-dialog-link-hover) dark:hover:text-(--color-dialog-link-hover-dark) hover:underline font-medium inline-flex items-center gap-1 group"
        >
          {value}
          <svg
            className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      );
    }

    // Date
    if (type === 'date' && (value instanceof Date || typeof value === 'string')) {
      const date = value instanceof Date ? value : new Date(value);
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
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
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      );
    }

    // DateTime
    if (type === 'datetime' && (value instanceof Date || typeof value === 'string')) {
      const date = value instanceof Date ? value : new Date(value);
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      );
    }

    // Boolean/Status
    if (type === 'boolean' || type === 'status') {
      const isActive = Boolean(value);
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${
            isActive
              ? 'bg-linear-to-r from-(--color-dialog-status-active-from) to-(--color-dialog-status-active-to) text-white'
              : 'bg-linear-to-r from-(--color-dialog-status-inactive-from) to-(--color-dialog-status-inactive-to) text-white'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-white/80'}`}
          />
          {isActive ? 'Active' : 'Inactive'}
        </span>
      );
    }

    // Badge
    if (type === 'badge' && typeof value === 'string') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400" />
          {value}
        </span>
      );
    }

    // Default text
    return (
      <span className="font-medium text-(--color-dialog-field-value) dark:text-(--color-dialog-field-value-dark)">
        {String(value)}
      </span>
    );
  };

  // Render single field
  const renderField = (field: ViewField) => {
    if (field.hidden) return null;

    return (
      <div
        key={field.id}
        className={`group ${field.fullWidth ? 'col-span-2' : ''} ${field.className || ''}`}
      >
        <dt className="text-xs font-semibold uppercase tracking-wider text-(--color-dialog-field-label) dark:text-(--color-dialog-field-label-dark) mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-(--color-dialog-field-bullet)" />
          {field.label}
        </dt>
        <dd className="text-sm text-(--color-dialog-field-value) dark:text-(--color-dialog-field-value-dark) flex items-center gap-2 pl-3.5">
          <div className="flex-1">{renderFieldValue(field)}</div>
          {field.copyable && (
            <button
              onClick={() => copyToClipboard(field.id, field.value)}
              className="shrink-0 p-1.5 rounded-lg bg-(--color-dialog-copy-bg) hover:bg-(--color-dialog-copy-bg-hover) dark:bg-(--color-dialog-copy-bg-dark) dark:hover:bg-(--color-dialog-copy-bg-hover-dark) text-(--color-dialog-copy-text) hover:text-(--color-dialog-copy-text-hover) dark:text-(--color-dialog-copy-text-dark) dark:hover:text-(--color-dialog-copy-text-hover-dark) transition-all duration-200 opacity-0 group-hover:opacity-100"
              title="Copy to clipboard"
            >
              {copiedFields[field.id] ? <CheckIcon /> : <CopyIcon />}
            </button>
          )}
        </dd>
      </div>
    );
  };

  // Render section
  const renderSection = (section: ViewSection) => {
    const isCollapsed = collapsedSections[section.id];

    return (
      <div
        key={section.id}
        className="bg-(--color-dialog-section-bg) dark:bg-(--color-dialog-section-bg-dark) rounded-xl border border-(--color-dialog-border) dark:border-(--color-dialog-border-dark) overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div
          className={`flex items-center justify-between p-5 bg-linear-to-r from-(--color-dialog-section-gradient-from) to-(--color-dialog-section-gradient-to) dark:from-(--color-dialog-section-gradient-from-dark) dark:to-(--color-dialog-section-gradient-to-dark) ${
            section.collapsible ? 'cursor-pointer hover:from-gray-100 dark:hover:from-gray-800' : ''
          } transition-colors duration-200`}
          onClick={() => section.collapsible && toggleSection(section.id)}
        >
          <div className="flex items-center gap-3">
            {section.icon && (
              <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-(--color-dialog-section-icon-bg-from) to-(--color-dialog-section-icon-bg-to) dark:from-(--color-dialog-section-icon-bg-from-dark) dark:to-(--color-dialog-section-icon-bg-to-dark) flex items-center justify-center text-(--color-dialog-section-icon-text) dark:text-(--color-dialog-section-icon-text-dark)">
                {section.icon}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {section.title}
                {!section.collapsible && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {section.fields.length}
                  </span>
                )}
              </h3>
              {section.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {section.description}
                </p>
              )}
            </div>
          </div>
          {section.collapsible && (
            <button className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center transition-all duration-200 hover:scale-110">
              <div
                className={`transform transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
              >
                <ChevronDownIcon />
              </div>
            </button>
          )}
        </div>
        {!isCollapsed && (
          <div className="p-6 pt-4 animate-in slide-in-from-top-2 duration-300">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {section.fields.map((field) => renderField(field))}
            </dl>
          </div>
        )}
      </div>
    );
  };

  // Render action button
  const renderAction = (action: ViewAction) => {
    const variantClasses = {
      primary:
        'bg-linear-to-r from-(--color-dialog-btn-primary-from) to-(--color-dialog-btn-primary-to) hover:from-(--color-dialog-btn-primary-hover-from) hover:to-(--color-dialog-btn-primary-hover-to) text-white shadow-lg shadow-(--color-dialog-btn-primary-shadow) hover:shadow-xl',
      secondary:
        'bg-(--color-dialog-btn-secondary-bg) hover:bg-(--color-dialog-btn-secondary-bg-hover) text-(--color-dialog-btn-secondary-text) dark:bg-(--color-dialog-btn-secondary-bg-dark) dark:hover:bg-(--color-dialog-btn-secondary-bg-hover-dark) dark:text-(--color-dialog-btn-secondary-text-dark) shadow-md hover:shadow-lg',
      success:
        'bg-linear-to-r from-(--color-dialog-btn-success-from) to-(--color-dialog-btn-success-to) hover:from-(--color-dialog-btn-success-hover-from) hover:to-(--color-dialog-btn-success-hover-to) text-white shadow-lg shadow-(--color-dialog-btn-success-shadow) hover:shadow-xl',
      danger:
        'bg-linear-to-r from-(--color-dialog-btn-danger-from) to-(--color-dialog-btn-danger-to) hover:from-(--color-dialog-btn-danger-hover-from) hover:to-(--color-dialog-btn-danger-hover-to) text-white shadow-lg shadow-(--color-dialog-btn-danger-shadow) hover:shadow-xl',
      warning:
        'bg-linear-to-r from-(--color-dialog-btn-warning-from) to-(--color-dialog-btn-warning-to) hover:from-(--color-dialog-btn-warning-hover-from) hover:to-(--color-dialog-btn-warning-hover-to) text-white shadow-lg shadow-(--color-dialog-btn-warning-shadow) hover:shadow-xl',
    };

    return (
      <button
        key={action.id}
        onClick={action.onClick}
        disabled={action.disabled || action.loading}
        className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 active:scale-95 ${
          variantClasses[action.variant || 'primary']
        }`}
      >
        {action.loading ? (
          <>
            <LoadingSpinner />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {action.icon && <span className="shrink-0">{action.icon}</span>}
            {action.label}
          </>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
      {/* Overlay with blur effect */}
      <div
        className="fixed inset-0 bg-(--color-dialog-overlay) dark:bg-(--color-dialog-overlay-dark) backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      {/* Dialog with scale animation */}
      <div className="flex min-h-full items-center justify-center p-4 animate-in zoom-in-95 duration-300">
        <div
          ref={dialogRef}
          className={`relative bg-(--color-dialog-bg) dark:bg-(--color-dialog-bg-dark) rounded-2xl shadow-2xl w-full ${sizeClasses[size]} ${className} transform transition-all border border-(--color-dialog-border) dark:border-(--color-dialog-border-dark)`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient header with glassmorphism effect */}
          <div className="relative overflow-hidden rounded-t-2xl">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-linear-to-br from-(--color-dialog-header-gradient-from) via-(--color-dialog-header-gradient-via) to-(--color-dialog-header-gradient-to) dark:from-(--color-dialog-header-gradient-from-dark) dark:via-(--color-dialog-header-gradient-via-dark) dark:to-(--color-dialog-header-gradient-to-dark)" />

            {/* Header content */}
            <div className="relative flex items-start justify-between p-6 border-b border-(--color-dialog-border)/50 dark:border-(--color-dialog-border-dark)/50 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                {/* Decorative icon circle */}
                <div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-(--color-dialog-icon-gradient-from) to-(--color-dialog-icon-gradient-to) dark:from-(--color-dialog-icon-gradient-from-dark) dark:to-(--color-dialog-icon-gradient-to-dark) flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                </div>

                <div>
                  <h2 className="text-2xl font-bold bg-linear-to-r from-(--color-dialog-title-gradient-from) via-(--color-dialog-title-gradient-via) to-(--color-dialog-title-gradient-to) dark:from-(--color-dialog-title-gradient-from-dark) dark:via-(--color-dialog-title-gradient-via-dark) dark:to-(--color-dialog-title-gradient-to-dark) bg-clip-text text-transparent">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-(--color-dialog-field-bullet)" />
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="shrink-0 w-10 h-10 rounded-xl bg-(--color-dialog-close-bg) hover:bg-(--color-dialog-close-bg-hover) dark:bg-(--color-dialog-close-bg-dark) dark:hover:bg-(--color-dialog-close-bg-hover-dark) text-(--color-dialog-close-text) hover:text-(--color-dialog-close-text-hover) dark:text-(--color-dialog-close-text-dark) dark:hover:text-(--color-dialog-close-text-hover-dark) transition-all duration-200 flex items-center justify-center group"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>

          {/* Content with custom scrollbar */}
          <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <LoadingSpinner />
                  {/* Pulsing ring effect */}
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
                </div>
                <span className="ml-2 text-gray-600 dark:text-gray-400 mt-4 font-medium">
                  Loading details...
                </span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Flat fields with card style */}
                {fields && fields.length > 0 && (
                  <div className="bg-linear-to-br from-(--color-dialog-card-gradient-from) to-(--color-dialog-card-gradient-to) dark:from-(--color-dialog-card-gradient-from-dark) dark:to-(--color-dialog-card-gradient-to-dark) rounded-xl p-6 border border-(--color-dialog-border) dark:border-(--color-dialog-border-dark)">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {fields.map((field) => renderField(field))}
                    </dl>
                  </div>
                )}

                {/* Sections with enhanced design */}
                {sections && sections.length > 0 && (
                  <div className="space-y-4">
                    {sections.map((section) => renderSection(section))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with gradient */}
          {(actions || footer) && (
            <div className="relative overflow-hidden rounded-b-2xl">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-linear-to-r from-(--color-dialog-footer-gradient-from) via-(--color-dialog-footer-gradient-via) to-(--color-dialog-footer-gradient-to) dark:from-(--color-dialog-footer-gradient-from-dark) dark:via-(--color-dialog-footer-gradient-via-dark) dark:to-(--color-dialog-footer-gradient-to-dark)" />

              <div className="relative flex items-center justify-end gap-3 p-6 border-t border-(--color-dialog-border) dark:border-(--color-dialog-border-dark)">
                {footer || <>{actions && actions.map((action) => renderAction(action))}</>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
