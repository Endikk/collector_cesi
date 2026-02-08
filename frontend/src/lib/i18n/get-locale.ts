import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n, type Locale } from './config';
import { cookies, headers } from 'next/headers';

export async function getLocale(): Promise<Locale> {
  // 1. Check cookie
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale')?.value;
  if (localeCookie && i18n.locales.includes(localeCookie as Locale)) {
    return localeCookie as Locale;
  }

  // 2. Check Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  if (acceptLanguage) {
    try {
      const languages = new Negotiator({
        headers: { 'accept-language': acceptLanguage },
      }).languages();

      const locale = matchLocale(languages, [...i18n.locales], i18n.defaultLocale);
      return locale as Locale;
    } catch (error) {
      console.error('Error matching locale:', error);
    }
  }

  return i18n.defaultLocale;
}
