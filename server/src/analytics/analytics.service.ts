import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Response, Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import { TrackVisitorDto } from './dto/track-visitor.dto';
import { VisitorLog } from './entities/visitor-log.entity';
import { ApiResponse } from '../common/utils/api-response.util';
import axios from 'axios';
import isIp from 'is-ip';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const UAParser = require('ua-parser-js');

/**
 * Service for tracking and analyzing website visitors
 * Tracks IP, location, device info, and provides analytics
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(VisitorLog)
    private readonly visitorLogRepository: Repository<VisitorLog>,
  ) {}

  /**
   * Track visitor with IP geolocation and device information
   */
  async trackVisitor(
    dto: TrackVisitorDto,
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      // Get IP address
      const ipAddress = this.getClientIp(req);

      // Parse user agent
      const uaParser = new UAParser(req.headers['user-agent'] as string);
      const uaResult = uaParser.getResult();

      // Get geolocation data
      const geoData = await this.getGeolocation(ipAddress);

      // Check if IP already exists in database (prevent duplicates)
      const existingIp = await this.visitorLogRepository.findOne({
        where: { ipAddress },
      });

      if (existingIp) {
        this.logger.log(
          `IP ${ipAddress} already tracked, skipping duplicate entry`,
        );
        return ApiResponse.success(res, {
          statusCode: HttpStatus.OK,
          message: 'Visitor already tracked',
          data: { alreadyTracked: true },
        });
      }

      // Check if returning visitor
      const existingVisit = await this.visitorLogRepository.findOne({
        where: { ipAddress, page: dto.page },
      });

      // Create visitor log
      const visitorLog = this.visitorLogRepository.create({
        ipAddress,
        page: dto.page,
        referrer: dto.referrer,
        language: dto.language,
        screenWidth: dto.screenWidth,
        screenHeight: dto.screenHeight,
        sessionId: dto.sessionId,
        visitDuration: dto.visitDuration || 0,
        userAgent: req.headers['user-agent'],
        isReturningVisitor: !!existingVisit,

        // Geolocation data
        country: geoData.country,
        countryCode: geoData.countryCode,
        region: geoData.region,
        regionName: geoData.regionName,
        city: geoData.city,
        latitude: geoData.lat,
        longitude: geoData.lon,
        timezone: geoData.timezone,
        isp: geoData.isp,

        // Device information
        browser: uaResult.browser.name,
        browserVersion: uaResult.browser.version,
        os: uaResult.os.name,
        osVersion: uaResult.os.version,
        device: uaResult.device.type || 'desktop',
        deviceVendor: uaResult.device.vendor,
        deviceModel: uaResult.device.model,
      });

      const saved = await this.visitorLogRepository.save(visitorLog);

      this.logger.log(
        `Visitor tracked: ${ipAddress} from ${geoData.city}, ${geoData.country} on ${dto.page}`,
      );

      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: { tracked: true, visitorId: saved.id },
        message: 'Visitor tracked successfully',
      });
    } catch (error) {
      this.logger.error(
        `Failed to track visitor: ${error.message}`,
        error.stack,
      );

      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to track visitor',
      });
    }
  }

  /**
   * Get analytics dashboard data
   */
  async getAnalytics(res: Response): Promise<Response> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Total visitors
      const totalVisitors = await this.visitorLogRepository.count();

      // Unique visitors (by IP)
      const uniqueVisitors = await this.visitorLogRepository
        .createQueryBuilder('visitor')
        .select('COUNT(DISTINCT visitor.ipAddress)', 'count')
        .getRawOne();

      // Today's visitors
      const todayVisitors = await this.visitorLogRepository.count({
        where: { visitedAt: Between(today, now) },
      });

      // This week's visitors
      const weekVisitors = await this.visitorLogRepository.count({
        where: { visitedAt: Between(weekAgo, now) },
      });

      // This month's visitors
      const monthVisitors = await this.visitorLogRepository.count({
        where: { visitedAt: Between(monthAgo, now) },
      });

      // Top countries
      const topCountries = await this.visitorLogRepository
        .createQueryBuilder('visitor')
        .select('visitor.country', 'country')
        .addSelect('visitor.countryCode', 'countryCode')
        .addSelect('COUNT(*)', 'count')
        .where('visitor.country IS NOT NULL')
        .groupBy('visitor.country')
        .addGroupBy('visitor.countryCode')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      // Top cities
      const topCities = await this.visitorLogRepository
        .createQueryBuilder('visitor')
        .select('visitor.city', 'city')
        .addSelect('visitor.country', 'country')
        .addSelect('COUNT(*)', 'count')
        .where('visitor.city IS NOT NULL')
        .groupBy('visitor.city')
        .addGroupBy('visitor.country')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      // Top pages
      const topPages = await this.visitorLogRepository
        .createQueryBuilder('visitor')
        .select('visitor.page', 'page')
        .addSelect('COUNT(*)', 'count')
        .groupBy('visitor.page')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      // Browser stats
      const browserStats = await this.visitorLogRepository
        .createQueryBuilder('visitor')
        .select('visitor.browser', 'browser')
        .addSelect('COUNT(*)', 'count')
        .where('visitor.browser IS NOT NULL')
        .groupBy('visitor.browser')
        .orderBy('count', 'DESC')
        .limit(5)
        .getRawMany();

      // OS stats
      const osStats = await this.visitorLogRepository
        .createQueryBuilder('visitor')
        .select('visitor.os', 'os')
        .addSelect('COUNT(*)', 'count')
        .where('visitor.os IS NOT NULL')
        .groupBy('visitor.os')
        .orderBy('count', 'DESC')
        .limit(5)
        .getRawMany();

      // Device type stats
      const deviceStats = await this.visitorLogRepository
        .createQueryBuilder('visitor')
        .select('visitor.device', 'device')
        .addSelect('COUNT(*)', 'count')
        .where('visitor.device IS NOT NULL')
        .groupBy('visitor.device')
        .orderBy('count', 'DESC')
        .getRawMany();

      // Returning vs new visitors
      const returningVisitors = await this.visitorLogRepository.count({
        where: { isReturningVisitor: true },
      });

      const analytics = {
        overview: {
          totalVisitors,
          uniqueVisitors: parseInt(uniqueVisitors.count),
          todayVisitors,
          weekVisitors,
          monthVisitors,
          returningVisitors,
          newVisitors: totalVisitors - returningVisitors,
        },
        topCountries,
        topCities,
        topPages,
        browserStats,
        osStats,
        deviceStats,
      };

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: analytics,
        message: 'Analytics fetched successfully',
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch analytics: ${error.message}`,
        error.stack,
      );

      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch analytics',
      });
    }
  }

  /**
   * Get recent visitors
   */
  async getRecentVisitors(limit: number, res: Response): Promise<Response> {
    try {
      const visitors = await this.visitorLogRepository.find({
        order: { visitedAt: 'DESC' },
        take: limit,
      });

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: visitors,
        message: 'Recent visitors fetched successfully',
        meta: { count: visitors.length },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch recent visitors: ${error.message}`,
        error.stack,
      );

      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch recent visitors',
      });
    }
  }

  /**
   * Get geolocation data from IP address using free API
   */
  private async getGeolocation(ip: string): Promise<{
    country: string;
    countryCode: string;
    region: string;
    regionName: string;
    city: string;
    lat: number | null;
    lon: number | null;
    timezone: string;
    isp: string;
  }> {
    try {
      // Validate and skip geolocation for localhost/private or invalid IPs
      if (!this.isSafePublicIp(ip)) {
        return {
          country: 'Local',
          countryCode: 'LOCAL',
          region: 'Local',
          regionName: 'Local',
          city: 'Local',
          lat: null,
          lon: null,
          timezone: 'UTC',
          isp: 'Local Network',
        };
      }

      // Use free IP geolocation API (ip-api.com)
      // No API key required, 45 requests/minute limit
      const response = await axios.get(`http://ip-api.com/json/${ip}`, {
        timeout: 5000,
      });

      if (response.data.status === 'success') {
        return {
          country: response.data.country,
          countryCode: response.data.countryCode,
          region: response.data.region,
          regionName: response.data.regionName,
          city: response.data.city,
          lat: response.data.lat,
          lon: response.data.lon,
          timezone: response.data.timezone,
          isp: response.data.isp,
        };
      }

      return this.getDefaultGeoData();
    } catch (error) {
      this.logger.warn(`Geolocation API failed: ${error.message}`);
      return this.getDefaultGeoData();
    }
  }

  /**
   * Check if IP is a valid, non-private, non-local address safe for external lookup
   */
  private isSafePublicIp(ip: string): string | false {
    if (!ip) {
      return false;
    }

    // Basic sanitation to prevent path injection
    if (ip.includes('/') || ip.includes('\\') || ip.includes(' ') || ip.includes('?') || ip.includes('#')) {
      return false;
    }

    // Must be a valid IP address (IPv4 or IPv6)
    if (!isIp(ip)) {
      return false;
    }

    // Normalize IPv6 localhost
    if (ip === '::1') {
      return false;
    }

    // IPv4 loopback and private ranges
    if (
      ip === '127.0.0.1' ||
      ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      ip.startsWith('172.16.') ||
      ip.startsWith('172.17.') ||
      ip.startsWith('172.18.') ||
      ip.startsWith('172.19.') ||
      ip.startsWith('172.20.') ||
      ip.startsWith('172.21.') ||
      ip.startsWith('172.22.') ||
      ip.startsWith('172.23.') ||
      ip.startsWith('172.24.') ||
      ip.startsWith('172.25.') ||
      ip.startsWith('172.26.') ||
      ip.startsWith('172.27.') ||
      ip.startsWith('172.28.') ||
      ip.startsWith('172.29.') ||
      ip.startsWith('172.30.') ||
      ip.startsWith('172.31.')
    ) {
      return false;
    }

    // Common IPv6 local/link-local/multicast prefixes
    if (
      ip.startsWith('fe80:') || // link-local
      ip.startsWith('fc00:') || // unique local
      ip.startsWith('fd00:') || // unique local
      ip.startsWith('::')       // unspecified/other local forms
    ) {
      return false;
    }

    return ip;
  }

  /**
   * Extract client IP address from request
   */
  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIp = req.headers['x-real-ip'] as string;
    if (realIp) {
      return realIp;
    }

    return req.ip || req.socket.remoteAddress || '0.0.0.0';
  }

  /**
   * Get default geolocation data when API fails
   */
  private getDefaultGeoData() {
    return {
      country: 'Unknown',
      countryCode: 'XX',
      region: 'Unknown',
      regionName: 'Unknown',
      city: 'Unknown',
      lat: null as number | null,
      lon: null as number | null,
      timezone: 'UTC',
      isp: 'Unknown',
    };
  }
}
