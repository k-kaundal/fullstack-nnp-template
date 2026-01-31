import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Session } from './entities/session.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Session Service
 * Manages user sessions across multiple devices
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  /**
   * Create a new session for user login
   *
   * @param data - Session creation data
   * @returns Promise<Session> - Created session
   */
  async createSession(data: {
    userId: string;
    refreshToken: string;
    expiresAt: Date;
    deviceName?: string;
    deviceType?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<Session> {
    const session = this.sessionRepository.create({
      ...data,
      lastActivityAt: new Date(),
      isActive: true,
    });

    return this.sessionRepository.save(session);
  }

  /**
   * Find session by refresh token
   *
   * @param refreshToken - Refresh token to search for
   * @returns Promise<Session | null> - Found session or null
   */
  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.sessionRepository.findOne({
      where: { refreshToken, isActive: true },
      relations: ['user'],
    });
  }

  /**
   * Get all active sessions for a user
   *
   * @param userId - User ID
   * @returns Promise<Session[]> - List of active sessions
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { lastActivityAt: 'DESC' },
    });
  }

  /**
   * Update session last activity timestamp
   *
   * @param sessionId - Session ID
   * @returns Promise<void>
   */
  async updateLastActivity(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      lastActivityAt: new Date(),
    });
  }

  /**
   * Invalidate a specific session
   *
   * @param sessionId - Session ID to invalidate
   * @returns Promise<boolean> - True if session was invalidated
   */
  async invalidateSession(sessionId: string): Promise<boolean> {
    const result = await this.sessionRepository.update(sessionId, {
      isActive: false,
    });

    return result.affected !== undefined && result.affected > 0;
  }

  /**
   * Invalidate session by refresh token
   *
   * @param refreshToken - Refresh token
   * @returns Promise<boolean> - True if session was invalidated
   */
  async invalidateByRefreshToken(refreshToken: string): Promise<boolean> {
    const result = await this.sessionRepository.update(
      { refreshToken },
      { isActive: false },
    );

    return result.affected !== undefined && result.affected > 0;
  }

  /**
   * Invalidate all sessions for a user
   *
   * @param userId - User ID
   * @returns Promise<number> - Number of sessions invalidated
   */
  async invalidateAllUserSessions(userId: string): Promise<number> {
    const result = await this.sessionRepository.update(
      { userId, isActive: true },
      { isActive: false },
    );

    return result.affected || 0;
  }

  /**
   * Invalidate all sessions except current one
   *
   * @param userId - User ID
   * @param currentSessionId - Current session ID to keep active
   * @returns Promise<number> - Number of sessions invalidated
   */
  async invalidateOtherSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<number> {
    const sessions = await this.sessionRepository.find({
      where: { userId, isActive: true },
    });

    const sessionsToInvalidate = sessions.filter(
      (s) => s.id !== currentSessionId,
    );

    if (sessionsToInvalidate.length === 0) {
      return 0;
    }

    await this.sessionRepository.update(
      sessionsToInvalidate.map((s) => s.id),
      { isActive: false },
    );

    return sessionsToInvalidate.length;
  }

  /**
   * Clean up expired sessions (runs every day at 2 AM)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredSessions(): Promise<void> {
    this.logger.log('Starting cleanup of expired sessions');

    const result = await this.sessionRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    this.logger.log(`Cleaned up ${result.affected || 0} expired sessions`);
  }

  /**
   * Clean up inactive sessions (older than 30 days)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupInactiveSessions(): Promise<void> {
    this.logger.log('Starting cleanup of inactive sessions');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.sessionRepository.delete({
      isActive: false,
      updatedAt: LessThan(thirtyDaysAgo),
    });

    this.logger.log(`Cleaned up ${result.affected || 0} inactive sessions`);
  }
}
