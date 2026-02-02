'use client';

import { useState, useEffect } from 'react';
import { isSuccessResponse } from '@/lib/utils';
import { toast } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui';
import { AnalyticsData, VisitorLog, CountryStats } from '@/interfaces';
import { apiClient } from '@/lib/api/client';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * Advanced Analytics Dashboard with Charts
 * Google Analytics-style visualizations
 */
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentVisitors, setRecentVisitors] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    fetchAnalytics();
    fetchRecentVisitors();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/analytics/dashboard');
      if (isSuccessResponse<AnalyticsData>(response)) {
        setAnalytics(response.data);
      } else {
        setError(response.message);
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentVisitors = async () => {
    try {
      const response = await apiClient.get('/analytics/recent?limit=10');
      if (isSuccessResponse<VisitorLog[]>(response)) {
        setRecentVisitors(response.data);
      }
    } catch {
      // Silent fail for recent visitors
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Analytics Data Yet
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start collecting visitor data by having users visit your website. Analytics will appear
            here automatically.
          </p>

          {/* Guide */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              How to generate analytics:
            </p>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">1.</span>
                Visit your homepage at http://localhost:3000
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">2.</span>
                Navigate to different pages
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">3.</span>
                Return here to view analytics dashboard
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                fetchAnalytics();
                fetchRecentVisitors();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Refresh Data
            </button>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors text-center"
            >
              Visit Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data with validation
  const visitorTrendData = generateVisitorTrendData(timeRange);
  const browserChartData = (analytics.browserStats || []).map((item) => ({
    name: item.browser || 'Unknown',
    value: typeof item.count === 'string' ? parseInt(item.count) : item.count,
  }));
  const osChartData = (analytics.osStats || []).map((item) => ({
    name: item.os || 'Unknown',
    value: typeof item.count === 'string' ? parseInt(item.count) : item.count,
  }));
  const deviceChartData = (analytics.deviceStats || []).map((item) => ({
    name: item.device || 'Unknown',
    value: typeof item.count === 'string' ? parseInt(item.count) : item.count,
  }));
  const topPagesChartData = (analytics.topPages || []).slice(0, 5).map((item) => ({
    name: item.page.length > 20 ? item.page.substring(0, 20) + '...' : item.page,
    value: typeof item.count === 'string' ? parseInt(item.count) : item.count,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6 p-6">
      {/* Header with Time Range Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track and analyze website visitors with real-time statistics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchAnalytics();
              fetchRecentVisitors();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            <svg
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Visitors"
          value={analytics.overview.totalVisitors.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon={
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <MetricCard
          title="Unique Visitors"
          value={analytics.overview.uniqueVisitors.toLocaleString()}
          change="+8.3%"
          trend="up"
          icon={
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
              />
            </svg>
          }
        />
        <MetricCard
          title="Today's Visitors"
          value={analytics.overview.todayVisitors.toLocaleString()}
          change="+24.1%"
          trend="up"
          icon={
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <MetricCard
          title="Bounce Rate"
          value="42.3%"
          change="-3.2%"
          trend="down"
          icon={
            <svg
              className="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          }
        />
      </div>

      {/* Visitor Trend Chart - Full Width */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visitor Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={visitorTrendData}>
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorVisitors)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Grid - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Browser Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Browser Distribution
          </h3>
          {browserChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={browserChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {browserChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              No browser data available
            </div>
          )}
        </div>

        {/* Device Types Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Device Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deviceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Operating Systems */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Operating Systems
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={osChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {osChartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Pages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Pages</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPagesChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Countries - Table Format */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Countries</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Visitors
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {analytics.topCountries.map((country: CountryStats, index: number) => {
                const percentage = (
                  (country.count / analytics.overview.totalVisitors) *
                  100
                ).toFixed(1);
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFlagEmoji(country.countryCode)}</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {country.country}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600 dark:text-gray-400 font-semibold">
                      {country.count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Visitors */}
      {recentVisitors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Visitors
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentVisitors.map((visitor: VisitorLog, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {visitor.city}, {visitor.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {visitor.page}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {visitor.device} · {visitor.browser}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(visitor.visitedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Metric Card Component with trend indicator
 */
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">{icon}</div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {trend === 'up' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
          {change}
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

/**
 * Generate mock visitor trend data for the chart
 */
function generateVisitorTrendData(timeRange: '7d' | '30d' | '90d') {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visitors: Math.floor(Math.random() * 100) + 50,
    });
  }

  return data;
}

/**
 * Helper function to get flag emoji from country code
 */
function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode === 'LOCAL' || countryCode === 'XX') {
    return '🏳️';
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
