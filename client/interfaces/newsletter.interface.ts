/**
 * Newsletter Subscriber Interface
 */

export interface NewsletterSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
  updatedAt: string;
}

/**
 * Newsletter Subscription DTO
 */
export interface SubscribeNewsletterDto {
  email: string;
  firstName?: string;
  lastName?: string;
  [key: string]: string | undefined;
}

/**
 * Send Newsletter DTO
 */
export interface SendNewsletterDto {
  subject: string;
  content: string;
  [key: string]: string;
}

/**
 * Newsletter Statistics
 */
export interface NewsletterStatistics {
  total: number;
  active: number;
  inactive: number;
  todaySubscribed: number;
}
