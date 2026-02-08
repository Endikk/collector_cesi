export const i18n = {
  defaultLocale: 'fr',
  locales: ['fr', 'en', 'es', 'de'],
} as const;

export type Locale = (typeof i18n.locales)[number];

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
};

export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  de: '🇩🇪',
};
