import { Injectable } from '@nestjs/common';

export interface ValidationResult {
  isValid: boolean;
  status: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';
  validationNote: string;
  rejectionReason?: string;
  issues: string[];
}

@Injectable()
export class ItemValidationService {
  private readonly MIN_TITLE_LENGTH = 10;
  private readonly MIN_DESCRIPTION_LENGTH = 50;
  private readonly MIN_IMAGES = 2;
  private readonly MAX_PRICE = 100000;
  private readonly MIN_PRICE = 0.5;

  /**
   * Validation automatique d'un article
   */
  validateItem(item: {
    title: string;
    description: string;
    price: number;
    shippingCost?: number;
    images: { url: string }[];
    categoryId?: string;
  }): ValidationResult {
    const issues: string[] = [];

    // 1. Vérifier le titre
    if (!item.title || item.title.trim().length < this.MIN_TITLE_LENGTH) {
      issues.push(
        `Titre trop court (minimum ${this.MIN_TITLE_LENGTH} caractères)`,
      );
    }

    if (this.containsSuspiciousContent(item.title)) {
      issues.push('Titre contient du contenu suspect ou spam');
    }

    // 2. Vérifier la description
    if (
      !item.description ||
      item.description.trim().length < this.MIN_DESCRIPTION_LENGTH
    ) {
      issues.push(
        `Description trop courte (minimum ${this.MIN_DESCRIPTION_LENGTH} caractères)`,
      );
    }

    if (this.containsSuspiciousContent(item.description)) {
      issues.push('Description contient du contenu suspect ou spam');
    }

    // 3. Vérifier les photos
    if (!item.images || item.images.length < this.MIN_IMAGES) {
      issues.push(
        `Nombre de photos insuffisant (minimum ${this.MIN_IMAGES} photos)`,
      );
    }

    // Vérifier la qualité des URLs d'images
    if (item.images) {
      for (const image of item.images) {
        if (!this.isValidImageUrl(image.url)) {
          issues.push("Une ou plusieurs URLs d'images sont invalides");
          break;
        }
      }
    }

    // 4. Vérifier le prix
    if (item.price < this.MIN_PRICE) {
      issues.push(`Prix minimum : ${this.MIN_PRICE}€`);
    }

    if (item.price > this.MAX_PRICE) {
      issues.push(`Prix maximum : ${this.MAX_PRICE}€`);
    }

    if (!this.isPriceRealistic(item.price)) {
      issues.push('Prix semble inhabituel (nécessite vérification manuelle)');
    }

    // 5. Vérifier les frais de port
    if (item.shippingCost !== undefined) {
      if (item.shippingCost < 0) {
        issues.push('Les frais de port ne peuvent pas être négatifs');
      }
      if (item.shippingCost > 100) {
        issues.push(
          'Frais de port inhabituellement élevés (vérification manuelle requise)',
        );
      }
    }

    // 6. Vérifier la catégorie
    if (!item.categoryId) {
      issues.push('Catégorie obligatoire');
    }

    // Déterminer le statut de validation
    let status: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED' = 'APPROVED';
    let validationNote = '';
    let rejectionReason: string | undefined = undefined;

    if (issues.length === 0) {
      status = 'APPROVED';
      validationNote =
        'Article validé automatiquement - tous les critères sont respectés';
    } else if (this.hasBlockingIssues(issues)) {
      status = 'REJECTED';
      rejectionReason = issues.join('; ');
      validationNote = `Article rejeté automatiquement : ${rejectionReason}`;
    } else {
      status = 'PENDING_REVIEW';
      validationNote = `Vérification manuelle requise : ${issues.join('; ')}`;
    }

    return {
      isValid: status === 'APPROVED',
      status,
      validationNote,
      rejectionReason,
      issues,
    };
  }

  /**
   * Vérifier si les problèmes sont bloquants
   */
  private hasBlockingIssues(issues: string[]): boolean {
    const blockingKeywords = [
      'Titre trop court',
      'Description trop courte',
      'Nombre de photos insuffisant',
      'Prix minimum',
      'Prix maximum',
      'Catégorie obligatoire',
      'contenu suspect',
      'spam',
      'négatifs',
    ];

    return issues.some((issue) =>
      blockingKeywords.some((keyword) => issue.includes(keyword)),
    );
  }

  /**
   * Détecter du contenu suspect (spam, contenu interdit)
   */
  private containsSuspiciousContent(text: string): boolean {
    const suspiciousPatterns = [
      // Emails et téléphones
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
      /\b0[1-9](?:[\s.-]*\d{2}){4}\b/g,
      /\b(?:\+33|0033)[1-9](?:[\s.-]*\d{2}){4}\b/g,

      // URLs externes
      /(https?:\/\/[^\s]+)/gi,

      // Mots interdits
      /\b(contrefaçon|faux|fake|replica|copie)\b/gi,
      /\b(arme|drogue|stupéfiant)\b/gi,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(text));
  }

  /**
   * Vérifier si une URL d'image est valide
   */
  private isValidImageUrl(url: string): boolean {
    if (!url) return false;

    try {
      const urlObj = new URL(url);
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const path = urlObj.pathname.toLowerCase();

      return validExtensions.some((ext) => path.endsWith(ext));
    } catch {
      return false;
    }
  }

  /**
   * Vérifier si le prix est réaliste
   */
  private isPriceRealistic(price: number): boolean {
    // Détecter les prix suspects (trop de décimales, prix ronds suspects)
    const priceStr = price.toString();

    // Prix avec plus de 2 décimales
    if (priceStr.includes('.') && priceStr.split('.')[1].length > 2) {
      return false;
    }

    // Prix excessivement ronds qui pourraient être suspects (ex: 99999)
    if (price > 10000 && price % 1000 === 0) {
      return false;
    }

    return true;
  }

  /**
   * Re-valider un article après modification
   */
  revalidateItem(
    itemId: string,
    item: {
      title: string;
      description: string;
      price: number;
      shippingCost?: number;
      images: { url: string }[];
      categoryId?: string;
    },
  ): ValidationResult {
    // Même processus de validation
    return this.validateItem(item);
  }

  /**
   * Obtenir les règles de validation pour l'affichage frontend
   */
  getValidationRules() {
    return {
      title: {
        minLength: this.MIN_TITLE_LENGTH,
        required: true,
      },
      description: {
        minLength: this.MIN_DESCRIPTION_LENGTH,
        required: true,
      },
      images: {
        minCount: this.MIN_IMAGES,
        required: true,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      price: {
        min: this.MIN_PRICE,
        max: this.MAX_PRICE,
        required: true,
      },
      shippingCost: {
        min: 0,
        max: 100,
      },
      categoryId: {
        required: true,
      },
    };
  }
}
