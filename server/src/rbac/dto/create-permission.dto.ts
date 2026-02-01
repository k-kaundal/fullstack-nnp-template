import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new permission
 */
export class CreatePermissionDto {
  @ApiProperty({ example: 'users:create', description: 'Permission name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Can create users',
    description: 'Permission description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'users', description: 'Resource name' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ example: 'create', description: 'Action name' })
  @IsString()
  @IsNotEmpty()
  action: string;
}
