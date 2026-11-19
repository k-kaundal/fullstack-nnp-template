import { redirect } from 'next/navigation';

/**
 * Newsletter section index — redirects to the subscribers dashboard.
 */
export default function NewsletterPage() {
  redirect('/admin/newsletter/subscribers');
}
