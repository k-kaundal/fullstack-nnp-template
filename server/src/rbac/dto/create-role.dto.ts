import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new role
 */
export class CreateRoleDto {
  @ApiProperty({ example: 'Editor', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Can edit content', description: 'Role description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: ['perm-uuid-1', 'perm-uuid-2'],
    description: 'Permission IDs to assign',
    required: false,
  })
  @IsArray()
  @IsOptional()
  permissionIds?: string[];

  @ApiProperty({
    example: false,
    description: 'System role (cannot be deleted)',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isSystemRole?: boolean;
}
