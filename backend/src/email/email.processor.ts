import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
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

export type EmailJobData =
  | SendEmailJob
  | SendNewItemEmailJob
  | SendMatchingInterestEmailJob;

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(private emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    switch (job.name) {
      case 'send-email':
        await this.handleSendEmail(job as Job<SendEmailJob>);
        break;
      case 'send-new-item':
        await this.handleNewItemEmail(job as Job<SendNewItemEmailJob>);
        break;
      case 'send-matching-interest':
        await this.handleMatchingInterestEmail(
          job as Job<SendMatchingInterestEmailJob>,
        );
        break;
      default:
        console.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleSendEmail(job: Job<SendEmailJob>): Promise<void> {
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

  private async handleNewItemEmail(
    job: Job<SendNewItemEmailJob>,
  ): Promise<void> {
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

  private async handleMatchingInterestEmail(
    job: Job<SendMatchingInterestEmailJob>,
  ): Promise<void> {
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
