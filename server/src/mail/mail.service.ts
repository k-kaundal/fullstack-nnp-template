import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

/**
 * Mail service for sending emails
 * Uses nodemailer with SMTP configuration
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: this.configService.get<boolean>('mail.secure'),
      auth: {
        user: this.configService.get<string>('mail.auth.user'),
        pass: this.configService.get<string>('mail.auth.pass'),
      },
    });
  }

  /**
   * Sends welcome email with temporary credentials
   *
   * @param to - Recipient email address
   * @param firstName - User's first name
   * @param email - User's email (login username)
   * @param tempPassword - Temporary password
   */
  async sendWelcomeEmail(
    to: string,
    firstName: string,
    email: string,
    tempPassword: string,
  ): Promise<void> {
    try {
      const clientUrl =
        this.configService.get<string>('CORS_ORIGIN') ||
        'http://localhost:3000';

      const mailOptions = {
        from: this.configService.get<string>('mail.from'),
        to,
        subject: 'Welcome! Your Account Credentials',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .credential-row { display: flex; justify-content: space-between; margin: 10px 0; }
              .label { font-weight: bold; color: #667eea; }
              .value { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to Our Platform!</h1>
              </div>
              <div class="content">
                <p>Hi <strong>${firstName}</strong>,</p>

                <p>Your account has been successfully created! Below are your login credentials:</p>

                <div class="credentials">
                  <div class="credential-row">
                    <span class="label">Email:</span>
                    <span class="value">${email}</span>
                  </div>
                  <div class="credential-row">
                    <span class="label">Temporary Password:</span>
                    <span class="value">${tempPassword}</span>
                  </div>
                </div>

                <div class="warning">
                  <strong>⚠️ Important Security Notice:</strong>
                  <ul>
                    <li>This is a <strong>temporary password</strong></li>
                    <li>Please change it immediately after your first login</li>
                    <li>Do not share your credentials with anyone</li>
                    <li>Keep your password secure and confidential</li>
                  </ul>
                </div>

                <center>
                  <a href="${clientUrl}/auth/login" class="button">Login Now</a>
                </center>

                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

                <p>Best regards,<br><strong>The Team</strong></p>
              </div>

              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${to}:`,
        error.message,
      );
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  /**
   * Sends email verification link
   *
   * @param to - Recipient email address
   * @param firstName - User's first name
   * @param verificationToken - Email verification token
   */
  async sendEmailVerification(
    to: string,
    firstName: string,
    verificationToken: string,
  ): Promise<void> {
    try {
      const clientUrl =
        this.configService.get<string>('CORS_ORIGIN') ||
        'http://localhost:3000';
      const verificationUrl = `${clientUrl}/auth/verify-email?token=${verificationToken}`;

      const mailOptions = {
        from: this.configService.get<string>('mail.from'),
        to,
        subject: 'Verify Your Email Address',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📧 Verify Your Email</h1>
              </div>
              <div class="content">
                <p>Hi <strong>${firstName}</strong>,</p>

                <p>Thank you for registering! Please verify your email address to complete your registration and access all features.</p>

                <center>
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </center>

                <p>Or copy and paste this link into your browser:</p>
                <p style="background: #f0f0f0; padding: 10px; border-radius: 4px; word-break: break-all;">${verificationUrl}</p>

                <div class="warning">
                  <strong>⚠️ Important:</strong>
                  <ul>
                    <li>This verification link will expire in <strong>24 hours</strong></li>
                    <li>If you didn't create an account, please ignore this email</li>
                    <li>For security, never share this link with anyone</li>
                  </ul>
                </div>

                <p>If you have any questions, please contact our support team.</p>

                <p>Best regards,<br><strong>The Team</strong></p>
              </div>

              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email verification sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${to}:`,
        error.message,
      );
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  /**
   * Sends password reset link
   *
   * @param to - Recipient email address
   * @param firstName - User's first name
   * @param resetToken - Password reset token
   */
  async sendPasswordReset(
    to: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    try {
      const clientUrl =
        this.configService.get<string>('CORS_ORIGIN') ||
        'http://localhost:3000';
      const resetUrl = `${clientUrl}/auth/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: this.configService.get<string>('mail.from'),
        to,
        subject: 'Reset Your Password',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .alert { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; color: #721c24; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔒 Reset Your Password</h1>
              </div>
              <div class="content">
                <p>Hi <strong>${firstName}</strong>,</p>

                <p>We received a request to reset your password. Click the button below to create a new password:</p>

                <center>
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </center>

                <p>Or copy and paste this link into your browser:</p>
                <p style="background: #f0f0f0; padding: 10px; border-radius: 4px; word-break: break-all;">${resetUrl}</p>

                <div class="warning">
                  <strong>⚠️ Important:</strong>
                  <ul>
                    <li>This password reset link will expire in <strong>1 hour</strong></li>
                    <li>For security, this link can only be used once</li>
                    <li>Your password will not change until you create a new one</li>
                  </ul>
                </div>

                <div class="alert">
                  <strong>🛡️ Security Notice:</strong>
                  <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged. Consider changing your password if you think your account may be compromised.</p>
                </div>

                <p>If you have any questions or concerns, please contact our support team immediately.</p>

                <p>Best regards,<br><strong>The Team</strong></p>
              </div>

              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${to}:`,
        error.message,
      );
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  /**
   * Verifies SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection failed:', error.message);
      return false;
    }
  }

  /**
   * Send generic email
   * @param options - Email options (to, subject, text, html)
   */
  async sendEmail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('mail.from'),
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}:`,
        error.message,
      );
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
