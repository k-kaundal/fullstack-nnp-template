/**
 * JWT Payload interface
 * Defines the structure of data stored in JWT tokens
 */
export interface JwtPayload {
  /**
   * User ID
   */
  sub: string;

  /**
   * User email
   */
  email: string;

  /**
   * Token issued at timestamp
   */
  iat?: number;

  /**
   * Token expiration timestamp
   */
  exp?: number;

  /**
   * Allow additional properties for JWT payload
   */
  [key: string]: unknown;
}

/**
 * Authentication response interface
 * Structure returned after successful login/register
 */
export interface AuthResponse {
  /**
   * JWT access token
   * Short-lived token for API authentication
   */
  accessToken: string;

  /**
   * JWT refresh token
   * Long-lived token for obtaining new access tokens
   */
  refreshToken: string;

  /**
   * User information
   */
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
    isActive: boolean;
  };
}

/**
 * Request with authenticated user
 * Extended Express Request with user information from JWT
 */
export interface RequestWithUser extends Request {
  user: JwtPayload;
}
