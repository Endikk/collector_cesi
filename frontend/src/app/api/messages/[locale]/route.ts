import { NextResponse } from 'next/server';
import type { Locale } from '@/lib/i18n/config';
import { i18n } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/get-messages';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;

  if (!i18n.locales.includes(locale)) {
    return NextResponse.json(
      { error: 'Invalid locale' },
      { status: 400 }
    );
  }

  try {
    const messages = await getMessages(locale);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to load messages:', error);
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 }
    );
  }
}
