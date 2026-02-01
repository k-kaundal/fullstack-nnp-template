/**
 * Express Request type augmentation
 * Extends Express Request interface with custom properties
 */

declare namespace Express {
  export interface Request {
    /**
     * Correlation ID for request tracking
     */
    correlationId?: string;
  }
}
