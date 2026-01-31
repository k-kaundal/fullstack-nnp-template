import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO for refresh token request
 * Used to obtain a new access token using a valid refresh token
 */
export class RefreshTokenDto {
  /**
   * The refresh token issued during login
   */
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Valid refresh token',
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  @MinLength(10, { message: 'Invalid refresh token format' })
  refreshToken: string;
}
