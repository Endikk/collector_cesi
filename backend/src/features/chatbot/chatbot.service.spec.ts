import { ChatbotService } from './chatbot.service';

describe('ChatbotService', () => {
  let service: ChatbotService;

  beforeEach(() => {
    service = new ChatbotService();
  });

  describe('getName', () => {
    it('should return service name', () => {
      expect(service.getName()).toBe('ChatbotService');
    });
  });

  describe('getVersion', () => {
    it('should return version', () => {
      expect(service.getVersion()).toBe('1.0.0');
    });
  });

  describe('getMetadata', () => {
    it('should return feature metadata', () => {
      const metadata = service.getMetadata();
      expect(metadata.name).toBe('AI Chatbot');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.experimental).toBe(true);
      expect(metadata.enabled).toBe(false);
    });
  });

  describe('sendMessage', () => {
    it('should recognize search intent', async () => {
      const result = await service.sendMessage(
        'conv1',
        'Je recherche des figurines',
      );
      expect(result.intent).toBe('search');
      expect(result.response).toContain('trouver des articles');
      expect(result.suggestedActions).toContain('Voir les consoles');
    });

    it('should recognize order status intent', async () => {
      const result = await service.sendMessage(
        'conv1',
        'Où en est ma commande ?',
      );
      expect(result.intent).toBe('order_status');
    });

    it('should recognize shipping intent', async () => {
      const result = await service.sendMessage(
        'conv1',
        'Infos sur la livraison',
      );
      expect(result.intent).toBe('shipping');
    });

    it('should recognize authentication intent', async () => {
      const result = await service.sendMessage(
        'conv1',
        'Problème de connexion',
      );
      expect(result.intent).toBe('authentication');
    });

    it('should recognize recommendation intent', async () => {
      const result = await service.sendMessage(
        'conv1',
        'Je voudrais des suggestions',
      );
      expect(result.intent).toBe('recommendation');
    });

    it('should fallback to general intent', async () => {
      const result = await service.sendMessage('conv1', 'Hello!');
      expect(result.intent).toBe('general');
      expect(result.response).toContain('là pour vous aider');
    });

    it('should return conversationId in response', async () => {
      const result = await service.sendMessage('conv-42', 'Test');
      expect(result.conversationId).toBe('conv-42');
    });
  });

  describe('escalateToHuman', () => {
    it('should return an escalation ticket', () => {
      const result = service.escalateToHuman('conv1', 'User frustrated');
      expect(result).toHaveProperty('ticketId');
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('agent');
    });
  });
});
