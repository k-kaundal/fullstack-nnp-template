'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { contactService } from '@/lib/api/contact.service';
import { Contact } from '@/interfaces';
import { isSuccessResponse } from '@/lib/utils';
import { toast } from '@/lib/utils';
import { Confirm } from '@/components/ui';

/**
 * Contact Detail Page
 * View single contact submission
 */
export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchContact = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await contactService.getById(params.id);

      if (isSuccessResponse<Contact>(response)) {
        setContact(response.data);
      } else {
        toast.error(response.message);
        router.push('/admin/contact');
      }
    } catch {
      toast.error('Failed to fetch contact');
      router.push('/admin/contact');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  const handleStatusChange = async (newStatus: string) => {
    if (!contact) return;

    const response = await contactService.updateStatus(contact.id, {
      status: newStatus as Contact['status'],
    });

    if (isSuccessResponse(response)) {
      toast.success('Status updated successfully');
      fetchContact();
    } else {
      toast.error(response.message);
    }
  };

  const handleDelete = async () => {
    if (!contact) return;

    const response = await contactService.delete(contact.id);

    if (isSuccessResponse(response)) {
      toast.success('Contact deleted successfully');
      router.push('/admin/contact');
    } else {
      toast.error(response.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!contact) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'read':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'replied':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Contacts
        </button>

        <div className="flex items-center gap-2">
          <select
            value={contact.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(contact.status)}`}
          >
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Contact Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">{contact.subject}</h1>
          <p className="text-blue-100">
            Received on {new Date(contact.createdAt).toLocaleDateString()} at{' '}
            {new Date(contact.createdAt).toLocaleTimeString()}
          </p>
        </div>

        {/* Contact Information */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Name
              </label>
              <p className="text-gray-900 dark:text-white">{contact.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Email
              </label>
              <a
                href={`mailto:${contact.email}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {contact.email}
              </a>
            </div>

            {contact.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Phone
                </label>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {contact.phone}
                </a>
              </div>
            )}

            {contact.ipAddress && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  IP Address
                </label>
                <p className="text-gray-900 dark:text-white font-mono text-sm">
                  {contact.ipAddress}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Message</h2>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
              {contact.message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Reply via Email
            </a>

            <button
              onClick={() => handleStatusChange('replied')}
              disabled={contact.status === 'replied'}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark as Replied
            </button>

            <button
              onClick={() => handleStatusChange('archived')}
              disabled={contact.status === 'archived'}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Archive
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Confirm
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete Contact"
        message="Are you sure you want to delete this contact? This action cannot be undone."
        type="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
