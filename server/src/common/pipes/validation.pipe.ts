import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Type,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * Custom validation pipe for validating DTOs using class-validator
 * Automatically validates incoming request data against DTO constraints
 */
@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  /**
   * Transforms and validates incoming data
   *
   * @param value - The incoming data to validate
   * @param metatype - Metadata about the expected type
   * @returns Validated and transformed data
   * @throws BadRequestException if validation fails
   */
  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    // Skip validation if no metatype or if type doesn't need validation
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Transform plain object to class instance
    const object = plainToInstance(metatype, value);

    // Validate the object against class-validator decorators
    const errors = await validate(object);

    // If validation errors exist, format and throw BadRequestException
    if (errors.length > 0) {
      const messages = errors.map((error) => {
        return {
          property: error.property,
          constraints: error.constraints,
        };
      });

      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      });
    }

    return object;
  }

  /**
   * Determines if a type should be validated
   *
   * @param metatype - The type to check
   * @returns true if type should be validated, false otherwise
   */
  private toValidate(metatype: Type<unknown>): boolean {
    // Skip validation for primitive types
    const types: Type<unknown>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
