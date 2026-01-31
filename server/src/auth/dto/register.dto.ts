import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import {
  IsNotDisposableEmail,
  IsStrongPassword,
  IsValidName,
} from '../validators/auth.validators';

/**
 * DTO for user registration
 * Validates all required fields for creating a new user account
 */
export class RegisterDto {
  /**
   * User's email address
   * Must be unique and valid email format
   */
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsNotDisposableEmail()
  email: string;

  /**
   * User's first name
   * Length: 2-50 characters
   */
  @ApiProperty({
    example: 'John',
    description: 'User first name',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @IsValidName()
  firstName: string;

  /**
   * User's last name
   * Length: 2-50 characters
   */
  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @IsValidName()
  lastName: string;

  /**
   * User's password
   * Must contain: uppercase, lowercase, number, special character
   * Length: 8-100 characters
   */
  @ApiProperty({
    example: 'SecurePass123!',
    description:
      'User password (min 8 chars, must include uppercase, lowercase, number, and special character)',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  @IsStrongPassword()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}
