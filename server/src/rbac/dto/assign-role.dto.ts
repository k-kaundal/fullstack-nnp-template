import { IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for assigning roles to a user
 */
export class AssignRoleDto {
  @ApiProperty({
    example: ['role-uuid-1', 'role-uuid-2'],
    description: 'Role IDs to assign to user',
  })
  @IsArray()
  @IsNotEmpty()
  roleIds: string[];
}
