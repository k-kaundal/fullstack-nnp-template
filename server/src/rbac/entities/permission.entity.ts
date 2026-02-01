import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';

/**
 * Permission Entity
 * Defines granular permissions that can be assigned to roles
 */
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column()
  resource: string; // e.g., 'users', 'posts', 'settings'

  @Column()
  action: string; // e.g., 'create', 'read', 'update', 'delete'

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
