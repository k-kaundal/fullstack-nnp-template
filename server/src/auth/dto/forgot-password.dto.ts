import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsNotDisposableEmail } from '../validators/auth.validators';

/**
 * DTO for requesting password reset
 * User provides email to receive password reset link
 */
export class ForgotPasswordDto {
  /**
   * User's email address to send password reset link
   */
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address for password reset',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsNotDisposableEmail()
  email: string;
}
