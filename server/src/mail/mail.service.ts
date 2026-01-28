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
                  <a href="http://localhost:3000/login" class="button">Login Now</a>
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
}
