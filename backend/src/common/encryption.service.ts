import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Service de chiffrement pour les données sensibles (emails, adresses, etc.)
 * Utilise AES-256-GCM (Authenticated Encryption)
 *
 * ⚠️ IMPORTANT : La clé de chiffrement doit être stockée dans une variable d'environnement
 * et JAMAIS committée dans le code source.
 *
 * Génération de la clé (une seule fois) :
 * ```bash
 * node -e "console.log(crypto.randomBytes(32).toString('hex'))"
 * ```
 * Puis ajouter dans .env :
 * ENCRYPTION_KEY=<clé générée>
 */
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const keyHex = process.env.ENCRYPTION_KEY;

    if (!keyHex) {
      throw new Error(
        '❌ ENCRYPTION_KEY missing in environment variables. ' +
          'Generate one with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"',
      );
    }

    if (keyHex.length !== 64) {
      // 32 bytes = 64 hex chars
      throw new Error('❌ ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }

    this.key = Buffer.from(keyHex, 'hex');
  }

  /**
   * Chiffre une chaîne de caractères
   *
   * @param plaintext - Texte en clair à chiffrer
   * @returns Texte chiffré (format : iv + authTag + encrypted en hex)
   *
   * @example
   * const encrypted = this.encryption.encrypt('user@example.com');
   * // Returns: "a3f5b9...c8d2e1" (hex string)
   */
  encrypt(plaintext: string): string {
    if (!plaintext) {
      return plaintext;
    }

    try {
      // Generate random IV (Initialization Vector) pour chaque encryption
      const iv = crypto.randomBytes(16);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      // Encrypt
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag (GCM mode)
      const authTag = cipher.getAuthTag();

      // Return: iv (32 hex) + authTag (32 hex) + encrypted (variable length)
      return iv.toString('hex') + authTag.toString('hex') + encrypted;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Encryption failed:', errorMessage);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Déchiffre une chaîne chiffrée
   *
   * @param ciphertext - Texte chiffré (format : iv + authTag + encrypted en hex)
   * @returns Texte en clair
   *
   * @example
   * const decrypted = this.encryption.decrypt('a3f5b9...c8d2e1');
   * // Returns: "user@example.com"
   */
  decrypt(ciphertext: string): string {
    if (!ciphertext) {
      return ciphertext;
    }

    try {
      // Extract components
      const iv = Buffer.from(ciphertext.slice(0, 32), 'hex'); // 16 bytes = 32 hex chars
      const authTag = Buffer.from(ciphertext.slice(32, 64), 'hex'); // 16 bytes = 32 hex chars
      const encrypted = ciphertext.slice(64);

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Decryption failed:', errorMessage);
      throw new Error('Decryption failed or data corrupted');
    }
  }

  /**
   * Hash une chaîne (one-way, non réversible)
   * Utile pour les IDs anonymisés, checksums, etc.
   *
   * @param data - Données à hasher
   * @returns Hash SHA-256 en hex
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Génère un token aléatoire sécurisé
   * Utile pour reset tokens, API keys, etc.
   *
   * @param length - Longueur en bytes (défaut: 32)
   * @returns Token en hex
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Compare deux chaînes de manière constant-time
   * Prévient les timing attacks
   *
   * @param a - Première chaîne
   * @param b - Deuxième chaîne
   * @returns true si identiques
   */
  constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    return crypto.timingSafeEqual(bufA, bufB);
  }
}
