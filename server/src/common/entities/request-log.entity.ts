import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Request Log Entity
 * Stores HTTP request logs for tracking and auditing
 * Automatically cleaned up after 24 hours
 */
@Entity('request_logs')
@Index(['createdAt']) // Index for efficient cleanup queries
@Index(['userId']) // Index for user-based queries
@Index(['method', 'path']) // Index for endpoint-based queries
export class RequestLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * HTTP method (GET, POST, PUT, DELETE, etc.)
   */
  @Column({ length: 10 })
  method: string;

  /**
   * Request path/URL
   */
  @Column({ length: 500 })
  path: string;

  /**
   * HTTP status code
   */
  @Column({ type: 'int' })
  statusCode: number;

  /**
   * Response time in milliseconds
   */
  @Column({ type: 'int' })
  responseTime: number;

  /**
   * User ID (if authenticated)
   */
  @Column({ length: 255, nullable: true })
  userId: string;

  /**
   * Client IP address
   */
  @Column({ length: 45, nullable: true })
  ipAddress: string;

  /**
   * User agent string
   */
  @Column({ length: 500, nullable: true })
  userAgent: string;

  /**
   * Request body (sanitized)
   */
  @Column({ type: 'text', nullable: true })
  requestBody: string;

  /**
   * Query parameters
   */
  @Column({ type: 'text', nullable: true })
  queryParams: string;

  /**
   * Error message (if request failed)
   */
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  /**
   * Request timestamp
   */
  @CreateDateColumn()
  createdAt: Date;
}
