import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service de logging d'audit pour tracer toutes les actions sensibles
 *
 * Conforme aux exigences :
 * - RGPD (traçabilité des traitements)
 * - PCI-DSS (audit trail des transactions)
 * - SOC 2 (monitoring des accès)
 *
 * Usage :
 * ```typescript
 * await this.auditLog.log({
 *   userId: user.id,
 *   action: 'LOGIN',
 *   resource: 'USER',
 *   severity: 'INFO',
 *   ip: request.ip,
 * });
 * ```
 */

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'EMAIL_CHANGE'
  | 'ACCOUNT_CREATED'
  | 'ACCOUNT_DELETED'
  | 'ITEM_CREATED'
  | 'ITEM_UPDATED'
  | 'ITEM_DELETED'
  | 'ITEM_PUBLISHED'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'
  | 'TRANSACTION_CREATED'
  | 'ADMIN_ACCESS'
  | 'ADMIN_ACTION'
  | 'ROLE_CHANGED'
  | 'PERMISSION_CHANGED'
  | 'DATA_EXPORTED'
  | 'DATA_DELETED'
  | 'FRAUD_ALERT'
  | 'SUSPICIOUS_ACTIVITY'
  | 'API_ERROR'
  | 'SECURITY_EVENT';

export type AuditSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AuditEvent {
  userId?: string;
  action: AuditAction;
  resource?: string; // USER, ITEM, TRANSACTION, etc.
  resourceId?: string;
  severity: AuditSeverity;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  success?: boolean;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Enregistre un événement d'audit
   */
  async log(event: AuditEvent): Promise<void> {
    try {
      // Créer le log dans la base de données
      await this.prisma.auditLog.create({
        data: {
          userId: event.userId,
          action: event.action,
          resource: event.resource,
          resourceId: event.resourceId,
          severity: event.severity,
          ip: event.ip,
          userAgent: event.userAgent,
          metadata: event.metadata || {},
          success: event.success ?? true,
          timestamp: new Date(),
        },
      });

      // Log dans la console pour debugging
      this.logToConsole(event);

      // Si événement critique, envoyer alerte
      if (event.severity === 'CRITICAL') {
        await this.sendAlert(event);
      }
    } catch (error) {
      // Ne jamais bloquer l'application si le logging échoue
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Audit log failed:', errorMessage);
      // Fallback: log to file or external service
      this.logToConsole(event);
    }
  }

  /**
   * Enregistre une connexion réussie
   */
  async logLogin(userId: string, ip: string, userAgent: string) {
    await this.log({
      userId,
      action: 'LOGIN',
      resource: 'USER',
      severity: 'INFO',
      ip,
      userAgent,
      success: true,
    });
  }

  /**
   * Enregistre une tentative de connexion échouée
   */
  async logLoginFailed(
    email: string,
    ip: string,
    userAgent: string,
    reason: string,
  ) {
    await this.log({
      action: 'LOGIN_FAILED',
      resource: 'USER',
      severity: 'MEDIUM',
      ip,
      userAgent,
      metadata: { email, reason },
      success: false,
    });
  }

  /**
   * Enregistre un paiement
   */
  async logPayment(
    userId: string,
    transactionId: string,
    amount: number,
    success: boolean,
    ip: string,
  ) {
    await this.log({
      userId,
      action: success ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
      resource: 'TRANSACTION',
      resourceId: transactionId,
      severity: success ? 'HIGH' : 'MEDIUM',
      ip,
      metadata: { amount },
      success,
    });
  }

  /**
   * Enregistre une action admin
   */
  async logAdminAction(
    adminId: string,
    action: string,
    targetResource: string,
    targetId: string,
    ip: string,
  ) {
    await this.log({
      userId: adminId,
      action: 'ADMIN_ACTION',
      resource: targetResource,
      resourceId: targetId,
      severity: 'HIGH',
      ip,
      metadata: { adminAction: action },
    });
  }

  /**
   * Enregistre une alerte de fraude
   */
  async logFraudAlert(
    userId: string,
    itemId: string,
    reason: string,
    metadata: Record<string, any>,
  ) {
    await this.log({
      userId,
      action: 'FRAUD_ALERT',
      resource: 'ITEM',
      resourceId: itemId,
      severity: 'CRITICAL',
      metadata: { reason, ...metadata },
    });
  }

  /**
   * Enregistre un export de données (RGPD)
   */
  async logDataExport(userId: string, dataType: string, ip: string) {
    await this.log({
      userId,
      action: 'DATA_EXPORTED',
      resource: 'USER',
      resourceId: userId,
      severity: 'HIGH',
      ip,
      metadata: { dataType },
    });
  }

  /**
   * Recherche dans les logs d'audit
   */
  async search(filters: {
    userId?: string;
    action?: AuditAction;
    resource?: string;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    return this.prisma.auditLog.findMany({
      where: {
        userId: filters.userId,
        action: filters.action,
        resource: filters.resource,
        severity: filters.severity,
        timestamp: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
      },
      orderBy: { timestamp: 'desc' },
      take: filters.limit || 100,
    });
  }

  /**
   * Statistiques d'audit
   */
  async getStats(startDate: Date, endDate: Date) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        timestamp: { gte: startDate, lte: endDate },
      },
    });

    return {
      total: logs.length,
      byAction: this.groupBy(logs, 'action'),
      bySeverity: this.groupBy(logs, 'severity'),
      byResource: this.groupBy(logs, 'resource'),
      failedActions: logs.filter((l) => l.success === false).length,
      criticalEvents: logs.filter((l) => l.severity === 'CRITICAL').length,
    };
  }

  /**
   * Détecte les activités suspectes
   */
  async detectSuspiciousActivity(
    userId: string,
    timeWindowMinutes: number = 5,
  ) {
    const since = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    const recentLogs = await this.prisma.auditLog.findMany({
      where: {
        userId,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'desc' },
    });

    // Détecter patterns suspects
    const suspiciousPatterns = {
      rapidActions: recentLogs.length > 50, // Plus de 50 actions en 5 minutes
      multipleFailedLogins:
        recentLogs.filter((l) => l.action === 'LOGIN_FAILED').length > 3,
      multipleIPs: new Set(recentLogs.map((l) => l.ip)).size > 3, // Plus de 3 IPs différentes
      adminActionsAfterLogin: this.checkAdminActionsAfterLogin(recentLogs),
    };

    if (Object.values(suspiciousPatterns).some((v) => v === true)) {
      await this.log({
        userId,
        action: 'SUSPICIOUS_ACTIVITY',
        severity: 'CRITICAL',
        metadata: { patterns: suspiciousPatterns },
      });
    }

    return suspiciousPatterns;
  }

  // Helpers privés

  private logToConsole(event: AuditEvent) {
    const emoji = this.getSeverityEmoji(event.severity);
    const successIndicator = event.success === false ? '❌' : '✅';

    console.log(
      `${emoji} ${successIndicator} [AUDIT] ${event.action} | ` +
        `User: ${event.userId || 'N/A'} | ` +
        `Resource: ${event.resource || 'N/A'}/${event.resourceId || 'N/A'} | ` +
        `IP: ${event.ip || 'N/A'} | ` +
        `Severity: ${event.severity}`,
    );

    if (event.metadata && Object.keys(event.metadata).length > 0) {
      console.log(`   Metadata:`, event.metadata);
    }
  }

  private getSeverityEmoji(severity: AuditSeverity): string {
    const emojiMap = {
      INFO: 'ℹ️',
      LOW: '🟡',
      MEDIUM: '🟠',
      HIGH: '🔴',
      CRITICAL: '🚨',
    };
    return emojiMap[severity] || 'ℹ️';
  }

  private sendAlert(event: AuditEvent): Promise<void> {
    // TODO: Implémenter envoi d'alertes
    // - Email à l'équipe sécurité
    // - Slack notification
    // - PagerDuty si incident critique
    // - SMS si fraude détectée

    console.error(
      `🚨🚨🚨 CRITICAL SECURITY EVENT 🚨🚨🚨\n` +
        `Action: ${event.action}\n` +
        `User: ${event.userId}\n` +
        `Resource: ${event.resource}/${event.resourceId}\n` +
        `IP: ${event.ip}\n` +
        `Metadata: ${JSON.stringify(event.metadata)}`,
    );

    // Placeholder pour notification externe
    // await this.emailService.sendAlert(event);
    // await this.slackService.sendAlert(event);
    return Promise.resolve();
  }

  private groupBy(
    array: Record<string, unknown>[],
    key: string,
  ): Record<string, number> {
    return array.reduce<Record<string, number>>((acc, obj) => {
      const value = (obj[key] as string) || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private checkAdminActionsAfterLogin(
    logs: Record<string, unknown>[],
  ): boolean {
    // Vérifier si admin actions dans les 2 minutes après un login
    const loginIndex = logs.findIndex((l) => l.action === 'LOGIN');
    if (loginIndex === -1) return false;

    const loginTime = new Date(
      logs[loginIndex].timestamp as string | Date,
    ).getTime();
    const adminActions = logs.filter(
      (l) =>
        l.action === 'ADMIN_ACTION' &&
        new Date(l.timestamp as string | Date).getTime() - loginTime <
          2 * 60 * 1000,
    );

    return adminActions.length > 0;
  }
}
