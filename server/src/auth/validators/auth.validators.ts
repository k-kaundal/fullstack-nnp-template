/**
 * Custom Validators for Authentication
 * Provides additional validation logic beyond class-validator decorators
 */

import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Email domain blacklist validator
 * Prevents registration with disposable/temporary email providers
 */
@ValidatorConstraint({ name: 'IsNotDisposableEmail', async: false })
export class IsNotDisposableEmailConstraint implements ValidatorConstraintInterface {
  private disposableDomains = [
    'tempmail.com',
    'throwaway.email',
    'guerrillamail.com',
    '10minutemail.com',
    'mailinator.com',
    'trashmail.com',
    'maildrop.cc',
    'temp-mail.org',
  ];

  validate(email: string) {
    if (!email) return false;

    const domain = email.split('@')[1]?.toLowerCase();
    return !this.disposableDomains.includes(domain);
  }

  defaultMessage() {
    return 'Disposable email addresses are not allowed';
  }
}

/**
 * Decorator to validate email is not from disposable provider
 *
 * @param validationOptions - Validation options
 * @returns PropertyDecorator
 *
 * @example
 * ```typescript
 * @IsNotDisposableEmail()
 * email: string;
 * ```
 */
export function IsNotDisposableEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotDisposableEmailConstraint,
    });
  };
}

/**
 * Password strength validator
 * Ensures password meets security requirements
 */
@ValidatorConstraint({ name: 'IsStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string) {
    if (!password) return false;

    // Check minimum length
    if (password.length < 8) return false;

    // Check maximum length
    if (password.length > 100) return false;

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) return false;

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) return false;

    // Check for number
    if (!/\d/.test(password)) return false;

    // Check for special character
    if (!/[@$!%*?&]/.test(password)) return false;

    // Check for common weak passwords
    const weakPasswords = [
      'password',
      '12345678',
      'qwerty',
      'abc123',
      'password123',
      'admin123',
      'letmein',
      'welcome',
      'monkey123',
      'dragon123',
    ];

    if (weakPasswords.includes(password.toLowerCase())) {
      return false;
    }

    return true;
  }

  defaultMessage(): string {
    return 'Password must be 8-100 characters long and contain at least one uppercase letter, one lowercase letter, one number, one special character (@$!%*?&), and cannot be a common weak password';
  }
}

/**
 * Decorator to validate password strength
 *
 * @param validationOptions - Validation options
 * @returns PropertyDecorator
 *
 * @example
 * ```typescript
 * @IsStrongPassword()
 * password: string;
 * ```
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

/**
 * Name validator
 * Ensures names contain only valid characters
 */
@ValidatorConstraint({ name: 'IsValidName', async: false })
export class IsValidNameConstraint implements ValidatorConstraintInterface {
  validate(name: string) {
    if (!name) return false;

    // Allow letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z]+([\s\-'][a-zA-Z]+)*$/;
    return nameRegex.test(name);
  }

  defaultMessage(): string {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes, and must start with a letter';
  }
}

/**
 * Decorator to validate name format
 *
 * @param validationOptions - Validation options
 * @returns PropertyDecorator
 *
 * @example
 * ```typescript
 * @IsValidName()
 * firstName: string;
 * ```
 */
export function IsValidName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidNameConstraint,
    });
  };
}

/**
 * Token format validator
 * Ensures token is alphanumeric
 */
@ValidatorConstraint({ name: 'IsValidToken', async: false })
export class IsValidTokenConstraint implements ValidatorConstraintInterface {
  validate(token: string) {
    if (!token) return false;

    // Token should be alphanumeric (hex format from crypto.randomBytes)
    const tokenRegex = /^[a-f0-9]+$/i;
    return tokenRegex.test(token);
  }

  defaultMessage(): string {
    return 'Invalid token format';
  }
}

/**
 * Decorator to validate token format
 *
 * @param validationOptions - Validation options
 * @returns PropertyDecorator
 *
 * @example
 * ```typescript
 * @IsValidToken()
 * token: string;
 * ```
 */
export function IsValidToken(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidTokenConstraint,
    });
  };
}
