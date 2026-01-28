'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  EditDialogConfig,
  EditField,
  EditSection,
  EditAction,
} from '@/interfaces/edit-dialog.interface';
import { toast } from '@/lib/utils';

/**
 * Icon Components
 */
const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * EditDialog Component
 * Professional form dialog with validation, sections, and theme support
 *
 * @param config - Dialog configuration
 * @returns JSX Element
 */
export function EditDialog({ config }: { config: EditDialogConfig }) {
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
    closeOnOverlayClick = false,
    closeOnEscape = true,
    className = '',
    loading = false,
    onSubmit,
    onChange,
    footer,
    initialValues = {},
  } = config;

  const dialogRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
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
  const [submitting, setSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form data from fields/sections
  useEffect(() => {
    if (isOpen && !isInitialized) {
      const defaultValues: Record<string, unknown> = { ...initialValues };

      // Get default values from flat fields
      fields?.forEach((field) => {
        if (field.defaultValue !== undefined && !(field.id in defaultValues)) {
          defaultValues[field.id] = field.defaultValue;
        }
      });

      // Get default values from sections
      sections?.forEach((section) => {
        section.fields.forEach((field) => {
          if (field.defaultValue !== undefined && !(field.id in defaultValues)) {
            defaultValues[field.id] = field.defaultValue;
          }
        });
      });

      setFormData(defaultValues);
      setErrors({});
      setTouched({});
      setIsInitialized(true);
    }

    // Reset initialization flag when dialog closes
    if (!isOpen) {
      setIsInitialized(false);
    }
  }, [isOpen, isInitialized, fields, sections, initialValues]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEscape, onClose]);

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

  // Validate single field - moved before early return
  const validateField = useCallback((field: EditField, value: unknown): string | null => {
    const validation = field.validation;
    if (!validation) return null;

    // Required validation
    if (validation.required) {
      const isEmpty = value === '' || value === null || value === undefined;
      if (isEmpty) {
        return typeof validation.required === 'string'
          ? validation.required
          : `${field.label} is required`;
      }
    }

    // Type-specific validations
    if (typeof value === 'string') {
      // Min length
      if (validation.minLength) {
        const minLength =
          typeof validation.minLength === 'number'
            ? validation.minLength
            : validation.minLength.value;
        const message =
          typeof validation.minLength === 'object'
            ? validation.minLength.message
            : `${field.label} must be at least ${minLength} characters`;

        if (value.length < minLength) return message;
      }

      // Max length
      if (validation.maxLength) {
        const maxLength =
          typeof validation.maxLength === 'number'
            ? validation.maxLength
            : validation.maxLength.value;
        const message =
          typeof validation.maxLength === 'object'
            ? validation.maxLength.message
            : `${field.label} must be at most ${maxLength} characters`;

        if (value.length > maxLength) return message;
      }

      // Pattern validation
      if (validation.pattern) {
        const pattern =
          validation.pattern instanceof RegExp ? validation.pattern : validation.pattern.value;
        const message =
          validation.pattern instanceof RegExp
            ? `${field.label} format is invalid`
            : validation.pattern.message;

        if (!pattern.test(value)) return message;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      // Min value
      if (validation.min !== undefined) {
        const min = typeof validation.min === 'number' ? validation.min : validation.min.value;
        const message =
          typeof validation.min === 'object'
            ? validation.min.message
            : `${field.label} must be at least ${min}`;

        if (value < min) return message;
      }

      // Max value
      if (validation.max !== undefined) {
        const max = typeof validation.max === 'number' ? validation.max : validation.max.value;
        const message =
          typeof validation.max === 'object'
            ? validation.max.message
            : `${field.label} must be at most ${max}`;

        if (value > max) return message;
      }
    }

    // Custom validation
    if (validation.validate) {
      const result = validation.validate(value);
      if (typeof result === 'string') return result;
      if (result === false) return `${field.label} is invalid`;
    }

    return null;
  }, []);

  // Handle field change
  const handleFieldChange = useCallback(
    (field: EditField, value: unknown) => {
      setFormData((prev) => {
        const newData = { ...prev, [field.id]: value };

        // Call onChange callback if provided
        if (onChange) {
          onChange(field.id, value, newData);
        }

        return newData;
      });

      // Validate if field has been touched
      if (touched[field.id]) {
        const error = validateField(field, value);
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (error) {
            newErrors[field.id] = error;
          } else {
            delete newErrors[field.id];
          }
          return newErrors;
        });
      }
    },
    [touched, onChange, validateField]
  );

  // Handle field blur
  const handleFieldBlur = useCallback(
    (field: EditField) => {
      setTouched((prev) => ({ ...prev, [field.id]: true }));

      const value = formData[field.id];
      const error = validateField(field, value);

      setErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[field.id] = error;
        } else {
          delete newErrors[field.id];
        }
        return newErrors;
      });
    },
    [formData, validateField]
  );

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    const allFields = [...(fields || []), ...(sections?.flatMap((s) => s.fields) || [])];

    const newErrors: Record<string, string> = {};
    let isValid = true;

    allFields.forEach((field) => {
      if (field.hidden) return;

      const value = formData[field.id];
      const error = validateField(field, value);

      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    // Mark all fields as touched
    const allTouched = allFields.reduce(
      (acc, field) => {
        acc[field.id] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
    setTouched(allTouched);

    return isValid;
  }, [fields, sections, formData, validateField]);

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

  // Handle form submit
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateAll()) return;

    setSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      // Error is handled by parent component
      // Just show generic message if not already shown
      if (error instanceof Error && !error.message.includes('validation')) {
        toast.error('An error occurred while submitting the form');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Render input field
  const renderInput = (field: EditField): React.ReactNode => {
    if (field.hidden) return null;
    if (field.render) {
      return field.render(
        field,
        formData[field.id],
        (value) => handleFieldChange(field, value),
        errors[field.id]
      );
    }

    const value = formData[field.id];
    const error = errors[field.id];
    const hasError = !!error && touched[field.id];

    const baseInputClasses = `
      w-full px-4 py-2.5 rounded-lg border transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-1
      disabled:opacity-50 disabled:cursor-not-allowed
      ${
        hasError
          ? 'border-danger dark:border-danger-dark focus:ring-danger/50'
          : 'border-border dark:border-border-dark focus:ring-primary/50'
      }
      bg-background dark:bg-muted-dark
      text-foreground dark:text-foreground-dark
      placeholder:text-gray-400 dark:placeholder:text-gray-500
    `;

    // Text inputs
    if (
      [
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'date',
        'datetime-local',
        'time',
      ].includes(field.type)
    ) {
      return (
        <input
          type={field.type}
          id={field.id}
          name={field.name}
          value={(value as string) || ''}
          onChange={(e) => {
            const newValue = field.type === 'number' ? parseFloat(e.target.value) : e.target.value;
            handleFieldChange(field, newValue);
          }}
          onBlur={() => handleFieldBlur(field)}
          placeholder={field.placeholder}
          disabled={field.disabled || loading}
          readOnly={field.readOnly}
          min={field.min}
          max={field.max}
          step={field.step}
          className={baseInputClasses}
        />
      );
    }

    // Textarea
    if (field.type === 'textarea') {
      return (
        <textarea
          id={field.id}
          name={field.name}
          value={(value as string) || ''}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          onBlur={() => handleFieldBlur(field)}
          placeholder={field.placeholder}
          disabled={field.disabled || loading}
          readOnly={field.readOnly}
          rows={field.rows || 4}
          className={`${baseInputClasses} resize-y`}
        />
      );
    }

    // Select
    if (field.type === 'select') {
      return (
        <select
          id={field.id}
          name={field.name}
          value={(value as string) || ''}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          onBlur={() => handleFieldBlur(field)}
          disabled={field.disabled || loading}
          className={baseInputClasses}
        >
          {!field.validation?.required && <option value="">Select...</option>}
          {field.options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    // Checkbox
    if (field.type === 'checkbox') {
      return (
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            id={field.id}
            name={field.name}
            checked={(value as boolean) || false}
            onChange={(e) => handleFieldChange(field, e.target.checked)}
            onBlur={() => handleFieldBlur(field)}
            disabled={field.disabled || loading}
            className="w-5 h-5 rounded border-border dark:border-border-dark text-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 transition-all cursor-pointer"
          />
          <span className="text-sm font-medium text-foreground dark:text-foreground-dark group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
            {field.label}
          </span>
        </label>
      );
    }

    // Radio
    if (field.type === 'radio') {
      return (
        <div className="space-y-3">
          {field.options?.map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name={field.name}
                value={option.value}
                checked={value === option.value}
                onChange={() => handleFieldChange(field, option.value)}
                onBlur={() => handleFieldBlur(field)}
                disabled={field.disabled || option.disabled || loading}
                className="w-5 h-5 border-border dark:border-border-dark text-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 transition-all cursor-pointer"
              />
              <span className="text-sm font-medium text-foreground dark:text-foreground-dark group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      );
    }

    // File
    if (field.type === 'file') {
      return (
        <input
          type="file"
          id={field.id}
          name={field.name}
          onChange={(e) => handleFieldChange(field, e.target.files)}
          onBlur={() => handleFieldBlur(field)}
          disabled={field.disabled || loading}
          accept={field.accept}
          multiple={field.multiple}
          className={`${baseInputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer`}
        />
      );
    }

    return null;
  };

  // Render single field
  const renderField = (field: EditField) => {
    if (field.hidden) return null;

    const error = errors[field.id];
    const hasError = !!error && touched[field.id];

    // Checkbox fields have different layout
    if (field.type === 'checkbox') {
      return (
        <div
          key={field.id}
          className={`${field.fullWidth ? 'col-span-2' : ''} ${field.className || ''}`}
        >
          {renderInput(field)}
          {hasError && (
            <p className="mt-1.5 text-sm text-danger dark:text-danger-dark flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          )}
          {field.helpText && !hasError && (
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
          )}
        </div>
      );
    }

    return (
      <div
        key={field.id}
        className={`${field.fullWidth ? 'col-span-2' : ''} ${field.className || ''}`}
      >
        <label
          htmlFor={field.id}
          className="block text-sm font-semibold text-foreground dark:text-foreground-dark mb-2"
        >
          {field.label}
          {field.validation?.required && (
            <span className="text-danger dark:text-danger-dark ml-1">*</span>
          )}
        </label>

        <div className="relative">
          {field.prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {field.prefix}
            </div>
          )}

          <div className={field.prefix ? 'pl-10' : ''}>{renderInput(field)}</div>

          {field.suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {field.suffix}
            </div>
          )}
        </div>

        {hasError && (
          <p className="mt-1.5 text-sm text-danger dark:text-danger-dark flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {field.helpText && !hasError && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
        )}
      </div>
    );
  };

  // Render section
  const renderSection = (section: EditSection) => {
    const isCollapsed = collapsedSections[section.id];

    return (
      <div
        key={section.id}
        className="bg-background dark:bg-muted-dark rounded-xl border border-border dark:border-border-dark overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div
          className={`flex items-center justify-between p-5 bg-muted dark:bg-gray-800/50 ${
            section.collapsible ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800' : ''
          } transition-colors duration-200`}
          onClick={() => section.collapsible && toggleSection(section.id)}
        >
          <div className="flex items-center gap-3">
            {section.icon && (
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary-dark/20 flex items-center justify-center text-primary dark:text-primary-dark">
                {section.icon}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-foreground dark:text-foreground-dark flex items-center gap-2">
                {section.title}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark">
                  {section.fields.length}
                </span>
              </h3>
              {section.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {section.description}
                </p>
              )}
            </div>
          </div>
          {section.collapsible && (
            <button className="shrink-0 w-8 h-8 rounded-lg bg-background dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center transition-all duration-200 hover:scale-110">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {section.fields.map((field) => renderField(field))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render action button
  const renderAction = (action: EditAction) => {
    const variantClasses = {
      primary: 'bg-linear-to-r from-primary to-primary-hover text-white shadow-lg hover:shadow-xl',
      secondary:
        'bg-muted hover:bg-gray-300 text-foreground dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground-dark shadow-md hover:shadow-lg',
      success: 'bg-linear-to-r from-success to-success-hover text-white shadow-lg hover:shadow-xl',
      danger: 'bg-linear-to-r from-danger to-danger-hover text-white shadow-lg hover:shadow-xl',
      warning: 'bg-linear-to-r from-warning to-warning-hover text-white shadow-lg hover:shadow-xl',
    };

    const isLoading = action.loading || submitting;

    return (
      <button
        key={action.id}
        type={action.type || 'button'}
        onClick={(e) => {
          e.preventDefault();
          if (action.type === 'submit') {
            handleSubmit();
          } else {
            action.onClick(formData);
          }
        }}
        disabled={action.disabled || isLoading || loading}
        className={`
          px-6 py-2.5 rounded-lg font-semibold text-sm
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2 justify-center min-w-25
          ${variantClasses[action.variant || 'primary']}
        `}
      >
        {isLoading ? (
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

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-dialog-overlay dark:bg-dialog-overlay-dark backdrop-blur-sm transition-all duration-300"
        onClick={handleOverlayClick}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 animate-in zoom-in-95 duration-300">
        <div
          ref={dialogRef}
          className={`relative bg-background dark:bg-background-dark rounded-2xl shadow-2xl w-full ${sizeClasses[size]} ${className} transform transition-all border border-border dark:border-border-dark`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative overflow-hidden rounded-t-2xl">
            <div className="absolute inset-0 bg-linear-to-br from-dialog-header-gradient-from via-dialog-header-gradient-via to-dialog-header-gradient-to dark:from-dialog-header-gradient-from-dark dark:via-dialog-header-gradient-via-dark dark:to-dialog-header-gradient-to-dark" />

            <div className="relative flex items-start justify-between p-6 border-b border-border/50 dark:border-border-dark/50 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-primary to-primary-hover dark:from-primary-dark dark:to-primary-dark-hover flex items-center justify-center shadow-lg text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground dark:text-foreground-dark">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  type="button"
                  className="shrink-0 w-10 h-10 rounded-xl bg-muted hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex items-center justify-center group"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <LoadingSpinner />
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                  </div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400 mt-4 font-medium">
                    Loading form...
                  </span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Flat fields */}
                  {fields && fields.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {fields.map((field) => renderField(field))}
                    </div>
                  )}

                  {/* Sections */}
                  {sections && sections.length > 0 && (
                    <div className="space-y-4">
                      {sections.map((section) => renderSection(section))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {(actions || footer) && (
              <div className="relative overflow-hidden rounded-b-2xl">
                <div className="absolute inset-0 bg-linear-to-r from-muted via-background to-muted dark:from-gray-800/50 dark:via-gray-900/30 dark:to-gray-800/50" />

                <div className="relative flex items-center justify-end gap-3 p-6 border-t border-border dark:border-border-dark">
                  {footer || <>{actions && actions.map((action) => renderAction(action))}</>}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
