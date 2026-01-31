import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * TokenBlacklist entity for managing revoked JWT access tokens
 * Stores blacklisted tokens to prevent their use after logout
 */
@Entity('token_blacklist')
export class TokenBlacklist {
  /**
   * Unique identifier (UUID v4)
   * Auto-generated on creation
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The JWT token that has been blacklisted
   * Stored for validation during authentication
   */
  @Column({ unique: true })
  @Index()
  token: string;

  /**
   * User ID that this token belonged to
   * Used for tracking and cleanup
   */
  @Column()
  userId: string;

  /**
   * Expiry date of the original token
   * Used for automatic cleanup of expired blacklist entries
   */
  @Column()
  expiresAt: Date;

  /**
   * Reason for blacklisting (e.g., 'logout', 'password-change', 'security')
   * Used for auditing and debugging
   */
  @Column({ default: 'logout' })
  reason: string;

  /**
   * Timestamp when the token was blacklisted
   */
  @CreateDateColumn()
  createdAt: Date;
}
