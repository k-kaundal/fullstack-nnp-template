import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for triggering manual log cleanup
 */
export class TriggerCleanupDto {
  @ApiProperty({
    description: 'Hours threshold for deleting old logs',
    example: 24,
    default: 24,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  hours?: number;
}
