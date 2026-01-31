import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * RefreshToken entity for managing JWT refresh tokens
 * Stores refresh tokens with expiration and revocation capabilities
 */
@Entity('refresh_tokens')
export class RefreshToken {
  /**
   * Unique identifier (UUID v4)
   * Auto-generated on creation
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The refresh token string (hashed)
   * Stored securely and used to generate new access tokens
   */
  @Column({ unique: true })
  token: string;

  /**
   * User ID this refresh token belongs to
   */
  @Column()
  userId: string;

  /**
   * Expiry date for this refresh token
   * After this date, the token is invalid
   */
  @Column()
  expiresAt: Date;

  /**
   * Indicates if this token has been revoked
   * Revoked tokens cannot be used even if not expired
   */
  @Column({ default: false })
  isRevoked: boolean;

  /**
   * IP address of the client that created this token
   * Used for security tracking
   */
  @Column({ nullable: true })
  ipAddress: string;

  /**
   * User agent of the client that created this token
   * Used for device identification
   */
  @Column({ nullable: true })
  userAgent: string;

  /**
   * Timestamp when the token was created
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Relation to User entity
   * Many refresh tokens can belong to one user
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
