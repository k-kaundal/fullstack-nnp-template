/**
 * Send Newsletter Page
 * Compose and send newsletters to active subscribers
 */

'use client';

import { useState, useEffect } from 'react';
import { SendNewsletterDto, NewsletterStatistics } from '@/interfaces';
import { newsletterService } from '@/lib/api/newsletter.service';
import { isSuccessResponse, toast } from '@/lib/utils';
import { LoadingSpinner, Confirm } from '@/components/ui';

export default function SendNewsletterPage() {
  const [statistics, setStatistics] = useState<NewsletterStatistics | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newsletterData, setNewsletterData] = useState<SendNewsletterDto>({
    subject: '',
    content: '',
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

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

  const handleSendNewsletter = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newsletterData.subject || !newsletterData.content) {
      toast.error('Subject and content are required');
      return;
    }

    if (!statistics || statistics.active === 0) {
      toast.error('No active subscribers to send newsletter');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    setIsSending(true);
    const toastId = toast.loading(
      `Sending newsletter to ${statistics?.active || 0} subscribers...`
    );

    try {
      const response = await newsletterService.sendNewsletter(newsletterData);
      if (isSuccessResponse(response)) {
        const sent = (response.meta as { sent?: number; failed?: number })?.sent || 0;
        const failed = (response.meta as { sent?: number; failed?: number })?.failed || 0;

        toast.success(
          `Newsletter sent successfully! ${sent} delivered${failed > 0 ? `, ${failed} failed` : ''}`,
          { id: toastId, duration: 6000 }
        );

        setNewsletterData({ subject: '', content: '' });
      } else {
        toast.error(response.message, { id: toastId });
      }
    } catch {
      toast.error('Failed to send newsletter', { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  const insertTemplate = (template: string) => {
    const templates = {
      welcome: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to Our Newsletter!</h1>
  </div>
  <div style="padding: 40px 20px; background: #f7fafc;">
    <h2 style="color: #2d3748; margin-bottom: 20px;">Hello Subscriber,</h2>
    <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
      Thank you for subscribing to our newsletter. We're excited to have you on board!
    </p>
    <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
      You'll receive regular updates about our latest news, features, and exclusive content.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Get Started
      </a>
    </div>
  </div>
  <div style="background: #2d3748; padding: 20px; text-align: center; color: #a0aec0; font-size: 14px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
  </div>
</div>`,
      update: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #2d3748; padding: 30px 20px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Monthly Updates</h1>
    <p style="color: #a0aec0; margin: 10px 0 0 0;">February 2026</p>
  </div>
  <div style="padding: 40px 20px; background: white;">
    <h2 style="color: #2d3748; margin-bottom: 20px;">What's New This Month</h2>
    <div style="margin-bottom: 30px;">
      <h3 style="color: #667eea; margin-bottom: 10px;">🚀 New Feature Launch</h3>
      <p style="color: #4a5568; line-height: 1.6;">
        We've released an exciting new feature that will transform the way you work.
      </p>
    </div>
    <div style="margin-bottom: 30px;">
      <h3 style="color: #667eea; margin-bottom: 10px;">📊 Performance Improvements</h3>
      <p style="color: #4a5568; line-height: 1.6;">
        Our platform is now 50% faster with improved reliability.
      </p>
    </div>
    <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
      <p style="color: #718096; font-size: 14px; margin: 0;">
        Stay tuned for more updates next month!
      </p>
    </div>
  </div>
</div>`,
      announcement: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #f56565; padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 32px;">📢 Important Announcement</h1>
  </div>
  <div style="padding: 40px 20px; background: #fffaf0; border-left: 4px solid #f56565;">
    <h2 style="color: #742a2a; margin-bottom: 20px;">Attention Required</h2>
    <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
      We have an important update that requires your attention.
    </p>
    <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
      [Your announcement details here]
    </p>
    <div style="background: #fed7d7; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="color: #742a2a; margin: 0; font-weight: bold;">
        ⚠️ Action required by: [Date]
      </p>
    </div>
  </div>
</div>`,
    };
    setNewsletterData({
      ...newsletterData,
      content: templates[template as keyof typeof templates],
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Send Newsletter</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compose and send newsletters to your active subscribers
        </p>
      </div>
      {/* Subscriber Info */}
      {statistics && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {statistics.active} Active Subscribers
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Your newsletter will be sent to all active subscribers
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compose Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Compose Newsletter
              </h2>
            </div>

            <form onSubmit={handleSendNewsletter} className="p-6 space-y-6">
              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Subject Line *
                </label>
                <input
                  type="text"
                  id="subject"
                  value={newsletterData.subject}
                  onChange={(e) =>
                    setNewsletterData({ ...newsletterData, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-lg"
                  placeholder="Monthly Updates - February 2026"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email Content (HTML) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </button>
                </div>
                <textarea
                  id="content"
                  value={newsletterData.content}
                  onChange={(e) =>
                    setNewsletterData({ ...newsletterData, content: e.target.value })
                  }
                  rows={16}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="<h1>Hello!</h1><p>Your newsletter content here...</p>"
                  required
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Use HTML to format your newsletter. You can use templates from the sidebar.
                </p>
              </div>

              {/* Preview */}
              {showPreview && newsletterData.content && (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Email Preview
                  </h3>
                  <div
                    className="bg-white p-4 rounded"
                    dangerouslySetInnerHTML={{ __html: newsletterData.content }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSending || !statistics || statistics.active === 0}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Sending...
                    </span>
                  ) : (
                    `Send to ${statistics?.active || 0} Subscribers`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Templates Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Email Templates
            </h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => insertTemplate('welcome')}
                className="w-full text-left p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Welcome Email</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      New subscriber greeting
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => insertTemplate('update')}
                className="w-full text-left p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded group-hover:bg-green-200 dark:group-hover:bg-green-900/50">
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Monthly Update</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Regular news digest
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => insertTemplate('announcement')}
                className="w-full text-left p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded group-hover:bg-red-200 dark:group-hover:bg-red-900/50">
                    <svg
                      className="w-5 h-5 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Announcement</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Important notice</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">💡 Tips</h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Keep subject lines under 50 characters</li>
                <li>• Use responsive HTML templates</li>
                <li>• Test preview before sending</li>
                <li>• Include unsubscribe link</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Confirm Dialog */}
      <Confirm
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Send Newsletter"
        message={`Send newsletter to ${statistics ? statistics.active : 0} active subscribers?\n\nThis action cannot be undone.`}
        type="danger"
        onConfirm={handleConfirmSend}
        confirmText="Send Newsletter"
        cancelText="Cancel"
      />{' '}
    </div>
  );
}
