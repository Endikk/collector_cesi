import type { Locale } from './config';

export type Messages = {
  [key: string]: string | Messages;
};

const messageCache: Partial<Record<Locale, Messages>> = {};

export async function getMessages(locale: Locale): Promise<Messages> {
  // Return cached messages if available
  if (messageCache[locale]) {
    return messageCache[locale]!;
  }

  try {
    const messages = await import(`../../../messages/${locale}.json`);
    messageCache[locale] = messages.default;
    return messages.default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    // Fallback to French (default)
    if (locale !== 'fr') {
      return getMessages('fr');
    }
    throw error;
  }
}

export function getMessage(
  messages: Messages,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split('.');
  let value: string | Messages = messages;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if not found
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Replace params like {count} with actual values
  if (params) {
    return Object.entries(params).reduce(
      (acc, [paramKey, paramValue]) =>
        acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue)),
      value
    );
  }

  return value;
}
