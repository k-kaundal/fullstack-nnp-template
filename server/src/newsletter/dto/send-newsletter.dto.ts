/**
 * Send Newsletter DTO
 * Validation for sending newsletters
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SendNewsletterDto {
  @ApiProperty({
    example: 'Monthly Updates - January 2026',
    description: 'Newsletter subject',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  subject: string;

  @ApiProperty({
    example: '<h1>Hello!</h1><p>Here are our latest updates...</p>',
    description: 'Newsletter HTML content',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;
}
