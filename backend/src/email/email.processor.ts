import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { EmailService } from '../email/email.service';

export interface SendEmailJob {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendNewItemEmailJob {
  userEmail: string;
  userName: string;
  itemTitle: string;
  itemUrl: string;
}

export interface SendMatchingInterestEmailJob {
  userEmail: string;
  userName: string;
  itemTitle: string;
  itemUrl: string;
  matchReason: string;
}

@Processor('email')
export class EmailProcessor {
  constructor(private emailService: EmailService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<SendEmailJob>) {
    const { to, subject, html, text } = job.data;
    console.log(`Processing email to ${to}: ${subject}`);

    try {
      await this.emailService.sendEmail({ to, subject, html, text });
      console.log(`✓ Email sent to ${to}`);
    } catch (error) {
      console.error(`✗ Failed to send email to ${to}:`, error);
      throw error; // Will trigger retry
    }
  }

  @Process('send-new-item')
  async handleNewItemEmail(job: Job<SendNewItemEmailJob>) {
    const { userEmail, userName, itemTitle, itemUrl } = job.data;
    console.log(`Processing new item email to ${userEmail}`);

    try {
      await this.emailService.sendNewItemNotification(
        userEmail,
        userName,
        itemTitle,
        itemUrl,
      );
      console.log(`✓ New item email sent to ${userEmail}`);
    } catch (error) {
      console.error(`✗ Failed to send new item email to ${userEmail}:`, error);
      throw error;
    }
  }

  @Process('send-matching-interest')
  async handleMatchingInterestEmail(job: Job<SendMatchingInterestEmailJob>) {
    const { userEmail, userName, itemTitle, itemUrl, matchReason } = job.data;
    console.log(`Processing matching interest email to ${userEmail}`);

    try {
      await this.emailService.sendMatchingInterestNotification(
        userEmail,
        userName,
        itemTitle,
        itemUrl,
        matchReason,
      );
      console.log(`✓ Matching interest email sent to ${userEmail}`);
    } catch (error) {
      console.error(
        `✗ Failed to send matching interest email to ${userEmail}:`,
        error,
      );
      throw error;
    }
  }
}
