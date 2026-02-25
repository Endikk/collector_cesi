'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchBackend } from '@/lib/backend-api';
import { revalidatePath } from 'next/cache';

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNewItem: boolean;
  emailMatchingInterest: boolean;
  emailMessages: boolean;
  emailTransactions: boolean;
  inAppNewItem: boolean;
  inAppMatchingInterest: boolean;
  inAppMessages: boolean;
  inAppTransactions: boolean;
}

export interface UpdatePreferencesData {
  emailNewItem?: boolean;
  emailMatchingInterest?: boolean;
  emailMessages?: boolean;
  emailTransactions?: boolean;
  inAppNewItem?: boolean;
  inAppMatchingInterest?: boolean;
  inAppMessages?: boolean;
  inAppTransactions?: boolean;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Non authentifié');
  }

  return fetchBackend<NotificationPreferences>(
    '/notification-preferences',
    {
      headers: {
        'x-user-id': session.user.id,
      },
    }
  );
}

export async function updateNotificationPreferences(
  data: UpdatePreferencesData
): Promise<NotificationPreferences> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Non authentifié');
  }

  const result = await fetchBackend<NotificationPreferences>(
    '/notification-preferences',
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': session.user.id,
      },
      body: JSON.stringify(data),
    }
  );

  revalidatePath('/profile/notifications');
  return result;
}
