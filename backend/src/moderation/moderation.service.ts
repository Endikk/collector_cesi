import { Injectable } from '@nestjs/common';

export interface ModerationResult {
  flagged: boolean;
  reasons: string[];
  sanitizedContent?: string;
}

@Injectable()
export class ModerationService {
  private readonly emailPattern =
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;
  private readonly phonePatterns = [
    /\b0[1-9](?:[\s.-]*\d{2}){4}\b/g, // French format: 06 12 34 56 78
    /\b(?:\+33|0033)[1-9](?:[\s.-]*\d{2}){4}\b/g, // International format
    /\b\d{10,}\b/g, // Any 10+ digit number
  ];
  private readonly urlPattern = /(https?:\/\/[^\s]+)/gi;
  private readonly suspiciousKeywords = [
    'whatsapp',
    'telegram',
    'signal',
    'appel',
    'appeler',
    'contacte',
    'contactez',
    'hors site',
    'paypal',
    'virement',
    'espèces',
    'liquide',
    'cash',
    'western union',
    'mandat',
  ];

  /**
   * Modère le contenu d'un message pour détecter les infos personnelles
   */
  moderateContent(content: string): ModerationResult {
    const reasons: string[] = [];
    let flagged = false;
    let sanitizedContent = content;

    // Détecter les emails
    if (this.emailPattern.test(content)) {
      flagged = true;
      reasons.push('Email détecté');
      sanitizedContent = sanitizedContent.replace(
        this.emailPattern,
        '[EMAIL MASQUÉ]',
      );
    }

    // Détecter les numéros de téléphone
    for (const pattern of this.phonePatterns) {
      if (pattern.test(content)) {
        flagged = true;
        reasons.push('Numéro de téléphone détecté');
        sanitizedContent = sanitizedContent.replace(
          pattern,
          '[TÉLÉPHONE MASQUÉ]',
        );
      }
    }

    // Détecter les URLs (sauf liens collector.shop)
    const urls = content.match(this.urlPattern);
    if (urls) {
      const externalUrls = urls.filter(
        (url) => !url.includes('collector.shop'),
      );
      if (externalUrls.length > 0) {
        flagged = true;
        reasons.push('Lien externe détecté');
        externalUrls.forEach((url) => {
          sanitizedContent = sanitizedContent.replace(url, '[LIEN MASQUÉ]');
        });
      }
    }

    // Détecter les mots-clés suspects
    const lowerContent = content.toLowerCase();
    const foundKeywords = this.suspiciousKeywords.filter((keyword) =>
      lowerContent.includes(keyword),
    );
    if (foundKeywords.length > 0) {
      flagged = true;
      reasons.push(`Mots suspects: ${foundKeywords.join(', ')}`);
    }

    return {
      flagged,
      reasons,
      sanitizedContent: flagged ? sanitizedContent : undefined,
    };
  }

  /**
   * Valide si un message peut être envoyé
   */
  canSendMessage(content: string): { allowed: boolean; message?: string } {
    const result = this.moderateContent(content);

    if (result.flagged) {
      return {
        allowed: false,
        message: `Message bloqué : ${result.reasons.join(', ')}. Les échanges d'informations personnelles sont interdits. Tous les paiements doivent passer par Collector.shop.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Obtenir des suggestions de remplacement pour les URLs
   */
  getSanitizedMessage(content: string): string {
    const result = this.moderateContent(content);
    return result.sanitizedContent || content;
  }

  /**
   * Vérifier si un utilisateur tente souvent de contourner la modération
   */
  checkUserBehavior(
    userId: string,
    flaggedCount: number,
  ): { shouldWarn: boolean; shouldBan: boolean } {
    console.log(
      'Checking behavior for user:',
      userId,
      'flagged count:',
      flaggedCount,
    );
    // Seuil de warning : 3 tentatives
    const shouldWarn = flaggedCount >= 3 && flaggedCount < 10;
    // Seuil de ban : 10 tentatives
    const shouldBan = flaggedCount >= 10;

    return { shouldWarn, shouldBan };
  }
}
