import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for updating an existing user
 * Extends CreateUserDto with all fields optional plus additional isActive field
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  /**
   * User's active status - determines if user account is enabled
   * @example true
   */
  @ApiProperty({
    example: true,
    description: 'User active status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
