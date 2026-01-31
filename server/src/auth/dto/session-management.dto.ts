import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional } from 'class-validator';

/**
 * DTO for revoking a specific session
 */
export class RevokeSessionDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Session ID to revoke',
  })
  @IsUUID()
  sessionId: string;
}

/**
 * DTO for revoking all other sessions
 */
export class RevokeOtherSessionsDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Current session ID to keep active (optional)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  currentSessionId?: string;
}
