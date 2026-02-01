/**
 * Subscribe Newsletter DTO
 * Validation for newsletter subscription
 */

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SubscribeNewsletterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address to subscribe',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'First name (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;
}
