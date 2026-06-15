import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from '../email/email.service';

@Processor('marketing-queue')
export class MarketingCampaignProcessor {
    private readonly logger = new Logger(MarketingCampaignProcessor.name);

    constructor(private readonly emailService: EmailService) {}

    @Process('send-campaign-email')
    async handleSendEmail(
        job: Job<{
            email: string;
            fullName: string;
            subject: string;
            content: string;
        }>
    ) {
        const { email, fullName, subject, content } = job.data;
        this.logger.log(`Processing campaign email for customer: ${email}`);

        // Personalize the template variables if present
        let personalizedHtml = content || '';
        personalizedHtml = personalizedHtml
            .replace(/{{fullName}}/g, fullName)
            .replace(/{{name}}/g, fullName)
            .replace(/{{email}}/g, email);

        let personalizedSubject = subject || 'Thông báo từ Hệ thống thuê xe';
        personalizedSubject = personalizedSubject
            .replace(/{{fullName}}/g, fullName)
            .replace(/{{name}}/g, fullName);

        try {
            await this.emailService.sendEmail({
                to: email,
                subject: personalizedSubject,
                html: personalizedHtml,
            });
            this.logger.log(`Successfully sent campaign email to: ${email}`);
        } catch (error: any) {
            this.logger.error(`Failed to send campaign email to ${email}: ${error?.message || error}`);
            throw error;
        }
    }
}
