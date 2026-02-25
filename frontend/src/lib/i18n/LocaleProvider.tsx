'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Locale } from './config';
import { i18n } from './config';
import type { Messages } from './get-messages';
import { getMessage } from './get-messages';

interface LocaleContextValue {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  children: React.ReactNode;
  locale: Locale;
  messages: Messages;
}

export function LocaleProvider({ children, locale: initialLocale, messages: initialMessages }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Messages>(initialMessages);

  const setLocale = useCallback(async (newLocale: Locale) => {
    if (!i18n.locales.includes(newLocale)) {
      console.error(`Invalid locale: ${newLocale}`);
      return;
    }

    // Set cookie
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Load new messages
    try {
      const response = await fetch(`/api/messages/${newLocale}`);
      if (response.ok) {
        const newMessages = await response.json();
        setMessages(newMessages);
        setLocaleState(newLocale);
        
        // Reload page to apply locale changes throughout the app
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return getMessage(messages, key, params);
    },
    [messages]
  );

  return (
    <LocaleContext.Provider value={{ locale, messages, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

export function useTranslations() {
  const { t } = useLocale();
  return t;
}
