import { EmailService } from './email.service';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

import * as nodemailer from 'nodemailer';

describe('EmailService', () => {
  let service: EmailService;
  let mockSendMail: jest.Mock;

  beforeEach(() => {
    mockSendMail = (nodemailer.createTransport as jest.Mock)().sendMail;
    mockSendMail.mockClear();
    service = new EmailService();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-1' });

      const result = await service.sendEmail({
        to: 'user@test.com',
        subject: 'Test',
        html: '<p>Hello</p>',
      });

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      const result = await service.sendEmail({
        to: 'bad@test.com',
        subject: 'Fail',
        html: '<p>Fail</p>',
      });

      expect(result).toBe(false);
    });
  });

  describe('sendNewItemNotification', () => {
    it('should send new item notification email', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-2' });

      const result = await service.sendNewItemNotification(
        'user@test.com',
        'Alice',
        'Figurine DBZ',
        'https://collector.shop/items/123',
      );

      expect(result).toBe(true);
    });
  });

  describe('sendMatchingInterestNotification', () => {
    it('should send matching interest email', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-3' });

      const result = await service.sendMatchingInterestNotification(
        'user@test.com',
        'Bob',
        'Carte Pokemon',
        'https://collector.shop/items/456',
        'Catégorie: Cartes',
      );

      expect(result).toBe(true);
    });
  });
});
