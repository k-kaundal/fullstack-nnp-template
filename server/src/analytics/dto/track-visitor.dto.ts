import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

/**
 * DTO for tracking visitor analytics
 */
export class TrackVisitorDto {
  @ApiProperty({ example: '/about', description: 'Page URL' })
  @IsString()
  page: string;

  @ApiProperty({ example: 'https://google.com', required: false })
  @IsString()
  @IsOptional()
  referrer?: string;

  @ApiProperty({ example: 'en-US', required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ example: 1920, required: false })
  @IsNumber()
  @IsOptional()
  screenWidth?: number;

  @ApiProperty({ example: 1080, required: false })
  @IsNumber()
  @IsOptional()
  screenHeight?: number;

  @ApiProperty({ example: 'session-uuid', required: false })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({
    example: 120,
    required: false,
    description: 'Visit duration in seconds',
  })
  @IsNumber()
  @IsOptional()
  visitDuration?: number;
}
