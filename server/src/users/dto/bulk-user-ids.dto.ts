import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for bulk user operations
 */
export class BulkUserIdsDto {
  @ApiProperty({
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    description: 'Array of user UUIDs',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
