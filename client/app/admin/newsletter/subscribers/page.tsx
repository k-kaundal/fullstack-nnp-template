/**
 * Newsletter Subscribers List Page
 * Advanced subscriber management with search, filter, and bulk actions
 */

'use client';

import { useState, useEffect } from 'react';
import { NewsletterSubscriber, NewsletterStatistics } from '@/interfaces';
import { newsletterService } from '@/lib/api/newsletter.service';
import { isSuccessResponse, toast } from '@/lib/utils';
import { LoadingSpinner, Confirm } from '@/components/ui';

const formatDate = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString();
  } catch {
    return '-';
  }
};

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [statistics, setStatistics] = useState<NewsletterStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => async () => {});

  useEffect(() => {
    fetchSubscribers();
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, statusFilter]);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const response = await newsletterService.getAll(page, limit);
      if (isSuccessResponse<NewsletterSubscriber[]>(response)) {
        let filtered = response.data;

        // Apply search filter
        if (searchQuery) {
          filtered = filtered.filter(
            (sub) =>
              sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              sub.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              sub.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
          filtered = filtered.filter((sub) =>
            statusFilter === 'active' ? sub.isActive : !sub.isActive
          );
        }

        setSubscribers(filtered);
        setTotalPages(Number(response.meta?.total_pages) || 1);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('Failed to fetch subscribers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await newsletterService.getStatistics();
      if (isSuccessResponse<NewsletterStatistics>(response)) {
        setStatistics(response.data);
      }
    } catch {
      // Silent fail
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === subscribers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subscribers.map((sub) => sub.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDelete = (subscriber: NewsletterSubscriber) => {
    setConfirmAction(() => async () => {
      const toastId = toast.loading('Deleting subscriber...');
      try {
        const response = await newsletterService.delete(subscriber.id);
        if (isSuccessResponse(response)) {
          toast.success('Subscriber deleted successfully', { id: toastId });
          fetchSubscribers();
          fetchStatistics();
        } else {
          toast.error(response.message, { id: toastId });
        }
      } catch {
        toast.error('Failed to delete subscriber', { id: toastId });
      }
    });
    setConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warning('No subscribers selected');
      return;
    }

    setConfirmAction(() => async () => {
      const toastId = toast.loading(`Deleting ${selectedIds.length} subscribers...`);
      let deleted = 0;
      let failed = 0;

      for (const id of selectedIds) {
        try {
          const response = await newsletterService.delete(id);
          if (isSuccessResponse(response)) {
            deleted++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }

      if (failed === 0) {
        toast.success(`${deleted} subscribers deleted successfully`, { id: toastId });
      } else {
        toast.warning(`${deleted} deleted, ${failed} failed`, { id: toastId });
      }

      setSelectedIds([]);
      fetchSubscribers();
      fetchStatistics();
    });
    setConfirmOpen(true);
  };

  const handleExport = () => {
    const csv = [
      ['Email', 'First Name', 'Last Name', 'Status', 'Subscribed At', 'Unsubscribed At'],
      ...subscribers.map((sub) => [
        sub.email,
        sub.firstName || '',
        sub.lastName || '',
        sub.isActive ? 'Active' : 'Inactive',
        formatDate(sub.subscribedAt),
        formatDate(sub.unsubscribedAt),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Subscribers exported successfully');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Newsletter Subscribers
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your newsletter subscribers and view statistics
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total Subscribers
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {statistics.total}
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Active
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {statistics.active}
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Inactive
                </div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {statistics.inactive}
                </div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
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
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Today
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {statistics.todaySubscribed}
                </div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
            >
              Export CSV
            </button>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete ({selectedIds.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No subscribers found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first subscriber'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === subscribers.length && subscribers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Subscribed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {subscribers.map((subscriber) => (
                    <tr
                      key={subscriber.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(subscriber.id)}
                          onChange={() => handleSelect(subscriber.id)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {subscriber.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {subscriber.firstName || subscriber.lastName
                          ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {subscriber.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <span className="w-1.5 h-1.5 mr-1.5 bg-green-400 rounded-full"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            <span className="w-1.5 h-1.5 mr-1.5 bg-red-400 rounded-full"></span>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(subscriber.subscribedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(subscriber)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation */}
      <Confirm
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={
          selectedIds.length > 1 ? `Delete ${selectedIds.length} Subscribers` : 'Delete Subscriber'
        }
        message={
          selectedIds.length > 1
            ? `Are you sure you want to delete ${selectedIds.length} subscribers? This action cannot be undone.`
            : 'Are you sure you want to delete this subscriber? This action cannot be undone.'
        }
        type="danger"
        onConfirm={async () => {
          await confirmAction();
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
