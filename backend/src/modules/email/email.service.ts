import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Email Service Wrapper
 * 
 * Setup guide:
 * 1. Install nodemailer: npm install nodemailer @types/nodemailer
 * 2. Set environment variables:
 *    - EMAIL_HOST=smtp.gmail.com
 *    - EMAIL_PORT=587
 *    - EMAIL_USER=your-email@gmail.com
 *    - EMAIL_PASS=your-app-password
 *    - EMAIL_FROM=noreply@rentalsystem.com
 * 
 * Or use SendGrid:
 * 1. Install: npm install @sendgrid/mail
 * 2. Set: SENDGRID_API_KEY=your-api-key
 */
@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private nodemailer: any = null;
    private sendgrid: any = null;
    private isConfigured = false;

    constructor(private configService: ConfigService) {
        this.initialize();
    }

    private async initialize() {
        // Try to initialize Nodemailer
        try {
            const nodemailerModule = await import('nodemailer');
            this.nodemailer = nodemailerModule.default;
            
            const emailHost = this.configService.get<string>('EMAIL_HOST');
            const emailUser = this.configService.get<string>('EMAIL_USER');
            const emailPass = this.configService.get<string>('EMAIL_PASS');

            if (emailHost && emailUser && emailPass) {
                this.isConfigured = true;
                this.logger.log('Email service initialized with Nodemailer');
            }
        } catch (err) {
            this.logger.warn('Nodemailer not installed. Run: npm install nodemailer @types/nodemailer');
        }

        // Try to initialize SendGrid
        try {
            const sendgridModule = await import('@sendgrid/mail');
            this.sendgrid = sendgridModule.default;
            
            const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
            if (apiKey) {
                this.sendgrid.setApiKey(apiKey);
                this.isConfigured = true;
                this.logger.log('Email service initialized with SendGrid');
            }
        } catch (err) {
            this.logger.warn('SendGrid not installed. Run: npm install @sendgrid/mail');
        }

        if (!this.isConfigured) {
            this.logger.warn('Email service not configured. Emails will be logged to console only.');
        }
    }

    /**
     * Send email
     */
    async sendEmail(options: {
        to: string | string[];
        subject: string;
        text?: string;
        html?: string;
        from?: string;
    }): Promise<boolean> {
        const { to, subject, text, html, from } = options;
        const fromEmail = from || this.configService.get<string>('EMAIL_FROM') || 'noreply@rentalsystem.com';

        // If not configured, just log
        if (!this.isConfigured) {
            this.logger.log(`[EMAIL] To: ${Array.isArray(to) ? to.join(', ') : to}`);
            this.logger.log(`[EMAIL] Subject: ${subject}`);
            this.logger.log(`[EMAIL] Body: ${text || html || 'No content'}`);
            return true; // Return true to not break flow
        }

        try {
            // Try SendGrid first (preferred)
            if (this.sendgrid) {
                await this.sendgrid.send({
                    to: Array.isArray(to) ? to : [to],
                    from: fromEmail,
                    subject,
                    text,
                    html
                });
                this.logger.log(`Email sent via SendGrid to ${Array.isArray(to) ? to.join(', ') : to}`);
                return true;
            }

            // Fallback to Nodemailer
            if (this.nodemailer) {
                const transporter = this.nodemailer.createTransport({
                    host: this.configService.get<string>('EMAIL_HOST'),
                    port: this.configService.get<number>('EMAIL_PORT') || 587,
                    secure: false,
                    auth: {
                        user: this.configService.get<string>('EMAIL_USER'),
                        pass: this.configService.get<string>('EMAIL_PASS')
                    }
                });

                await transporter.sendMail({
                    from: fromEmail,
                    to: Array.isArray(to) ? to.join(', ') : to,
                    subject,
                    text,
                    html
                });

                this.logger.log(`Email sent via Nodemailer to ${Array.isArray(to) ? to.join(', ') : to}`);
                return true;
            }

            return false;
        } catch (error: any) {
            this.logger.error(`Failed to send email: ${error.message}`, error.stack);
            return false;
        }
    }

    /**
     * Send OTP email
     */
    async sendOtpEmail(email: string, otp: string): Promise<boolean> {
        return this.sendEmail({
            to: email,
            subject: 'Mã OTP đặt lại mật khẩu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1e40af;">Đặt lại mật khẩu</h2>
                    <p>Mã OTP của bạn là:</p>
                    <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>Mã này có hiệu lực trong 10 phút.</p>
                    <p style="color: #6b7280; font-size: 12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                </div>
            `
        });
    }

    /**
     * Send notification email
     */
    async sendNotificationEmail(email: string, title: string, message: string): Promise<boolean> {
        return this.sendEmail({
            to: email,
            subject: title,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1e40af;">${title}</h2>
                    <p>${message}</p>
                </div>
            `
        });
    }
}
