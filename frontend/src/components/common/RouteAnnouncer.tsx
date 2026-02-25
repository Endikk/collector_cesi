'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { announceToScreenReader } from '@/lib/accessibility';
import { useTranslations } from '@/lib/i18n/LocaleProvider';

/**
 * Announces route changes to screen readers
 */
export function RouteAnnouncer() {
  const pathname = usePathname();
  const t = useTranslations();
  
  useEffect(() => {
    // Get page title or fallback to pathname
    const pageTitle = document.title || pathname;
    announceToScreenReader(`${t('accessibility.loading')} ${pageTitle}`, 'polite');
  }, [pathname, t]);
  
  return null;
}
