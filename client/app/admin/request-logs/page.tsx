'use client';

import { useState, useEffect } from 'react';
import { requestLogsService } from '@/lib/api/request-logs.service';
import {
  RequestLog,
  RequestLogStatistics,
  CleanupStatistics,
} from '@/interfaces/request-log.interface';
import { isSuccessResponse } from '@/lib/utils';
import { toast } from '@/lib/utils';
import { LoadingSpinner, Pagination, Confirm } from '@/components/ui';

/**
 * Request Logs Admin Page
 * Displays HTTP request logs with statistics and cleanup controls
 */
export default function RequestLogsPage() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [statistics, setStatistics] = useState<RequestLogStatistics | null>(null);
  const [cleanupStats, setCleanupStats] = useState<CleanupStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [limit, setLimit] = useState(100);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchStatistics();
    fetchCleanupStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await requestLogsService.getRequestLogs(page, limit);
      if (isSuccessResponse<RequestLog[]>(response)) {
        setLogs(response.data);
        setTotal(Number(response.meta?.total || 0));
        setTotalPages(Number(response.meta?.total_pages || 1));
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('Failed to fetch request logs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await requestLogsService.getStatistics();
      if (isSuccessResponse<RequestLogStatistics>(response)) {
        setStatistics(response.data);
      }
    } catch {
      toast.error('Failed to fetch statistics');
    }
  };

  const fetchCleanupStats = async () => {
    try {
      const response = await requestLogsService.getCleanupStats();
      if (isSuccessResponse<CleanupStatistics>(response)) {
        setCleanupStats(response.data);
      }
    } catch {
      toast.error('Failed to fetch cleanup statistics');
    }
  };

  const handleTriggerCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const response = await requestLogsService.triggerCleanup(24);
      if (isSuccessResponse(response)) {
        toast.success(`Cleanup completed: ${response.data.deleted_count} logs deleted`);
        // Refresh all data after cleanup
        await Promise.all([fetchLogs(), fetchStatistics(), fetchCleanupStats()]);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('Failed to trigger cleanup');
    } finally {
      setIsCleaningUp(false);
      setConfirmOpen(false);
    }
  };

  const handleFilterByUser = async () => {
    if (!filterUserId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestLogsService.getUserRequestLogs(filterUserId, page, limit);
      if (isSuccessResponse<RequestLog[]>(response)) {
        setLogs(response.data);
        setTotal(Number(response.meta?.total || 0));
        setTotalPages(Number(response.meta?.total_pages || 1));
        toast.success(`Showing logs for user: ${filterUserId}`);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('Failed to fetch user logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilter = () => {
    setFilterUserId('');
    setPage(1);
    fetchLogs();
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 dark:text-green-400';
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600 dark:text-blue-400';
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'POST':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'PATCH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Request Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor HTTP request logs and performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchLogs();
              fetchStatistics();
              fetchCleanupStats();
              toast.success('Data refreshed');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={isCleaningUp}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {isCleaningUp ? 'Cleaning...' : 'Cleanup'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Total Requests
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {statistics.total.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-gray-600 dark:text-gray-400"
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
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Today&apos;s Requests
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {statistics.today.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
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
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Errors</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {statistics.errors.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {statistics.total > 0
                    ? (((statistics.total - statistics.errors) / statistics.total) * 100).toFixed(1)
                    : '0'}
                  %
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Response</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {statistics.averageResponseTime}ms
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cleanup Stats */}
      {cleanupStats && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-800 p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-500 p-2 rounded-lg">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Automatic Cleanup Schedule
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase">
                Retention Period
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {cleanupStats.retentionHours}h
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-delete after</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase">
                Next Cleanup
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {new Date(cleanupStats.nextCleanup).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(cleanupStats.nextCleanup).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase">
                Total Stored
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {cleanupStats.totalLogs.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time logs</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase">
                Today&apos;s Logs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {cleanupStats.todayLogs.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 24 hours</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by User ID
            </label>
            <input
              type="text"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              placeholder="Enter user ID..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Items per page
            </label>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>
          <button
            onClick={handleFilterByUser}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Filter
          </button>
          {filterUserId && (
            <button
              onClick={handleClearFilter}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No request logs found
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Path
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${getMethodColor(log.method)}`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate"
                      title={log.path}
                    >
                      {log.path}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${getStatusColor(log.statusCode)}`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.responseTime}ms
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate"
                      title={log.userId || ''}
                    >
                      {log.userId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.ipAddress || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && logs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-medium">{total}</span> results
              </p>
              <Pagination
                meta={{
                  total,
                  count: logs.length,
                  page,
                  limit,
                  total_pages: totalPages,
                  has_next: page < totalPages,
                  has_previous: page > 1,
                }}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Request Details
                </h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Method</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded mt-1 ${getMethodColor(selectedLog.method)}`}
                    >
                      {selectedLog.method}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status Code</p>
                    <p
                      className={`text-lg font-semibold mt-1 ${getStatusColor(selectedLog.statusCode)}`}
                    >
                      {selectedLog.statusCode}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Path</p>
                  <p className="text-lg font-mono text-gray-900 dark:text-white mt-1 break-all">
                    {selectedLog.path}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {selectedLog.responseTime}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Timestamp</p>
                    <p className="text-lg text-gray-900 dark:text-white mt-1">
                      {new Date(selectedLog.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">User ID</p>
                    <p className="text-lg font-mono text-gray-900 dark:text-white mt-1 break-all">
                      {selectedLog.userId || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">IP Address</p>
                    <p className="text-lg text-gray-900 dark:text-white mt-1">
                      {selectedLog.ipAddress || '-'}
                    </p>
                  </div>
                </div>

                {selectedLog.userAgent && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">User Agent</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1 break-all">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                )}

                {selectedLog.queryParams && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Query Parameters</p>
                    <pre className="text-sm text-gray-900 dark:text-white mt-1 bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto">
                      {JSON.stringify(JSON.parse(selectedLog.queryParams), null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.requestBody && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Request Body</p>
                    <pre className="text-sm text-gray-900 dark:text-white mt-1 bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto">
                      {JSON.stringify(JSON.parse(selectedLog.requestBody), null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.errorMessage && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Error Message</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                      {selectedLog.errorMessage}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cleanup Dialog */}
      <Confirm
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Old Logs"
        message="Are you sure you want to delete logs older than 24 hours? This action cannot be undone."
        type="danger"
        confirmText="Delete Logs"
        cancelText="Cancel"
        onConfirm={handleTriggerCleanup}
      />
    </div>
  );
}
