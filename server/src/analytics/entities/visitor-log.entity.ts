import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Visitor log entity for tracking website visitors
 * Stores IP, location, device info, and page views
 */
@Entity('visitor_logs')
export class VisitorLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // IP and Location Information
  @Index()
  @Column()
  ipAddress: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  regionName: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  isp: string;

  // Device and Browser Information
  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  browser: string;

  @Column({ nullable: true })
  browserVersion: string;

  @Column({ nullable: true })
  os: string;

  @Column({ nullable: true })
  osVersion: string;

  @Column({ nullable: true })
  device: string; // mobile, tablet, desktop

  @Column({ nullable: true })
  deviceVendor: string;

  @Column({ nullable: true })
  deviceModel: string;

  // Page Information
  @Index()
  @Column()
  page: string;

  @Column({ nullable: true })
  referrer: string;

  @Column({ nullable: true })
  language: string;

  @Column({ type: 'int', default: 0 })
  screenWidth: number;

  @Column({ type: 'int', default: 0 })
  screenHeight: number;

  // Session Information
  @Column({ nullable: true })
  sessionId: string;

  @Column({ type: 'int', default: 0 })
  visitDuration: number; // in seconds

  @Column({ default: false })
  isReturningVisitor: boolean;

  // Timestamps
  @CreateDateColumn()
  @Index()
  visitedAt: Date;
}
