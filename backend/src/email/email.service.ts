import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    // Configure nodemailer transporter
    // In production, use actual SMTP credentials from environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: process.env.SMTP_SECURE === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
      // For development with mailhog/mailpit
      ignoreTLS: process.env.NODE_ENV === 'development',
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from:
          process.env.EMAIL_FROM ||
          '"Collector Platform" <noreply@collector.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      });
      console.log(`Email sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendNewItemNotification(
    userEmail: string,
    userName: string,
    itemTitle: string,
    itemUrl: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Nouvel article publié !</h2>
        <p>Bonjour ${userName},</p>
        <p>Un nouvel article a été mis en ligne sur la plateforme :</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #2563eb;">${itemTitle}</h3>
        </div>
        <p>
          <a href="${itemUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Voir l'article
          </a>
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #666; font-size: 12px;">
          Vous recevez cet email car vous avez activé les notifications pour les nouveaux articles.
          <br />
          <a href="${process.env.FRONTEND_URL}/profile/notifications" style="color: #2563eb;">Gérer mes préférences de notifications</a>
        </p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Nouvel article : ${itemTitle}`,
      html,
    });
  }

  async sendMatchingInterestNotification(
    userEmail: string,
    userName: string,
    itemTitle: string,
    itemUrl: string,
    matchReason: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">✨ Article correspondant à vos intérêts !</h2>
        <p>Bonjour ${userName},</p>
        <p>Un nouvel article correspondant à vos centres d'intérêt a été publié :</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #7c3aed;">${itemTitle}</h3>
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>Correspondance :</strong> ${matchReason}
          </p>
        </div>
        <p>
          <a href="${itemUrl}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Voir l'article
          </a>
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #666; font-size: 12px;">
          Vous recevez cet email car vous avez activé les notifications pour les articles correspondant à vos intérêts.
          <br />
          <a href="${process.env.FRONTEND_URL}/profile/interests" style="color: #7c3aed;">Gérer mes centres d'intérêt</a>
          |
          <a href="${process.env.FRONTEND_URL}/profile/notifications" style="color: #7c3aed;">Gérer mes préférences de notifications</a>
        </p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `✨ ${itemTitle} - Correspond à vos intérêts`,
      html,
    });
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
