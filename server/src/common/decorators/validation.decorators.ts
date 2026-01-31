/**
 * Common Validation Decorators
 * Reusable validation decorators for DTOs
 */

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Strong Password Validator
 * Requires: 8+ chars, uppercase, lowercase, number, special char
 */
@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string, _args: ValidationArguments): boolean {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character';
  }
}

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
 * No SQL Injection Validator
 * Prevents common SQL injection patterns
 */
@ValidatorConstraint({ name: 'noSqlInjection', async: false })
export class NoSqlInjectionConstraint implements ValidatorConstraintInterface {
  validate(value: string, _args: ValidationArguments): boolean {
    if (typeof value !== 'string') return true;

    const sqlInjectionPatterns = [
      /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/gi,
      /(\bEXEC\b|\bEXECUTE\b|\bUNION\b|\bJOIN\b)/gi,
      /(--|;|\/\*|\*\/)/g,
      /'(\s|$|;)/g,
    ];

    return !sqlInjectionPatterns.some((pattern) => pattern.test(value));
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Input contains potentially malicious SQL patterns';
  }
}

export function NoSqlInjection(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: NoSqlInjectionConstraint,
    });
  };
}

/**
 * No XSS Validator
 * Prevents XSS attacks
 */
@ValidatorConstraint({ name: 'noXss', async: false })
export class NoXssConstraint implements ValidatorConstraintInterface {
  validate(value: string, _args: ValidationArguments): boolean {
    if (typeof value !== 'string') return true;

    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /\bon\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
    ];

    return !xssPatterns.some((pattern) => pattern.test(value));
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Input contains potentially malicious XSS patterns';
  }
}

export function NoXss(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: NoXssConstraint,
    });
  };
}

/**
 * Safe String Validator
 * Combines NoSqlInjection and NoXss
 */
export function SafeString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    NoSqlInjection(validationOptions)(object, propertyName);
    NoXss(validationOptions)(object, propertyName);
  };
}

/**
 * Valid UUID Validator
 * Validates UUID v4 format
 */
@ValidatorConstraint({ name: 'isValidUUID', async: false })
export class IsValidUUIDConstraint implements ValidatorConstraintInterface {
  validate(value: string, _args: ValidationArguments): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Invalid UUID format';
  }
}

export function IsValidUUID(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidUUIDConstraint,
    });
  };
}

/**
 * Alphanumeric with Spaces Validator
 * Allows only alphanumeric characters and spaces
 */
@ValidatorConstraint({ name: 'isAlphanumericWithSpaces', async: false })
export class IsAlphanumericWithSpacesConstraint implements ValidatorConstraintInterface {
  validate(value: string, _args: ValidationArguments): boolean {
    const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;
    return alphanumericRegex.test(value);
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Only alphanumeric characters and spaces are allowed';
  }
}

export function IsAlphanumericWithSpaces(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAlphanumericWithSpacesConstraint,
    });
  };
}
