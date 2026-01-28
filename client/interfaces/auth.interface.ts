/**
 * Authentication related interfaces
 */

import { User } from './user.interface';

/**
 * Authentication context value
 * Used for managing auth state across the application
 */
export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

/**
 * Authentication response from backend
 */
export interface AuthResponse {
  user: User;
  token: string;
}
