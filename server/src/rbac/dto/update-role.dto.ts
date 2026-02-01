import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

/**
 * DTO for updating a role
 */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
