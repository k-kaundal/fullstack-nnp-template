import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { IsValidToken } from '../validators/auth.validators';

/**
 * DTO for email verification
 * User provides verification token from email
 */
export class VerifyEmailDto {
  /**
   * Email verification token
   */
  @ApiProperty({
    example: 'abc123def456ghi789',
    description: 'Email verification token received via email',
  })
  @IsString()
  @IsNotEmpty({ message: 'Verification token is required' })
  @Length(32, 128, { message: 'Invalid verification token format' })
  @IsValidToken()
  token: string;
}
