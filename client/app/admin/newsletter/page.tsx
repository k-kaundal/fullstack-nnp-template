/**
 * Newsletter Dashboard - Redirects to Subscribers Page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewsletterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/newsletter/subscribers');
  }, [router]);

  return null;
}
