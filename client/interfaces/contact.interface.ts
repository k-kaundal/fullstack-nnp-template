/**
 * Contact interface
 */
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create contact DTO
 */
export interface CreateContactDto {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  [key: string]: string | undefined;
}

/**
 * Update contact DTO
 */
export interface UpdateContactDto {
  status?: 'new' | 'read' | 'replied' | 'archived';
  [key: string]: string | undefined;
}

/**
 * Contact statistics
 */
export interface ContactStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  today: number;
}
