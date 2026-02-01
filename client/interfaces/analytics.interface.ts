/**
 * Analytics interfaces for visitor tracking and statistics
 */

export interface AnalyticsOverview {
  totalVisitors: number;
  uniqueVisitors: number;
  todayVisitors: number;
  weekVisitors: number;
  monthVisitors: number;
  returningVisitors: number;
  newVisitors: number;
}

export interface CountryStats {
  country: string;
  countryCode: string;
  count: number;
}

export interface CityStats {
  city: string;
  country: string;
  count: number;
}

export interface PageStats {
  page: string;
  count: number;
}

export interface BrowserStats {
  browser: string;
  count: number;
}

export interface OSStats {
  os: string;
  count: number;
}

export interface DeviceStats {
  device: string;
  count: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  topCountries: CountryStats[];
  topCities: CityStats[];
  topPages: PageStats[];
  browserStats: BrowserStats[];
  osStats: OSStats[];
  deviceStats: DeviceStats[];
}

export interface VisitorLog {
  id: string;
  ipAddress: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  isp: string;
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  deviceVendor: string;
  deviceModel: string;
  page: string;
  referrer: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  sessionId: string;
  visitDuration: number;
  isReturningVisitor: boolean;
  visitedAt: string;
  createdAt: string;
  updatedAt: string;
}
