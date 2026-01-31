import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  Length,
} from 'class-validator';
import { IsValidToken, IsStrongPassword } from '../validators/auth.validators';

/**
 * DTO for resetting password
 * User provides reset token and new password
 */
export class ResetPasswordDto {
  /**
   * Password reset token from email
   */
  @ApiProperty({
    example: 'abc123def456ghi789',
    description: 'Password reset token received via email',
  })
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required' })
  @Length(32, 128, { message: 'Invalid reset token format' })
  @IsValidToken()
  token: string;

  /**
   * New password
   * Must contain: uppercase, lowercase, number, special character
   * Length: 8-100 characters
   */
  @ApiProperty({
    example: 'NewSecurePass123!',
    description:
      'New password (min 8 chars, must include uppercase, lowercase, number, and special character)',
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
  newPassword: string;
}
