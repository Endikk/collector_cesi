'use client';

import { useTranslations } from '@/lib/i18n/LocaleProvider';

interface SkipToContentProps {
  contentId?: string;
}

export function SkipToContent({ contentId = 'main-content' }: SkipToContentProps) {
  const t = useTranslations();

  return (
    <a
      href={`#${contentId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:top-0 focus:left-0"
    >
      {t('accessibility.skipToContent')}
    </a>
  );
}
