import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

/**
 * DTO for updating contact status
 */
export class UpdateContactDto {
  @ApiProperty({
    example: 'read',
    enum: ['new', 'read', 'replied', 'archived'],
    required: false,
  })
  @IsEnum(['new', 'read', 'replied', 'archived'])
  @IsOptional()
  status?: string;
}
