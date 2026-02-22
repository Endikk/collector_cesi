'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchBackend } from '@/lib/backend-api';
import { revalidatePath } from 'next/cache';

export interface UserInterest {
  id: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface CreateInterestData {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
  return fetchBackend<Category[]>('/items/categories');
}

export async function getUserInterests(): Promise<UserInterest[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Non authentifié');
  }

  return fetchBackend<UserInterest[]>(
    `/interests/user/${session.user.id}`,
    {
      headers: {
        'x-user-id': session.user.id,
      },
    }
  );
}

export async function createInterest(data: CreateInterestData): Promise<UserInterest> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Non authentifié');
  }

  const result = await fetchBackend<UserInterest>('/interests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': session.user.id,
    },
    body: JSON.stringify(data),
  });

  revalidatePath('/profile/interests');
  return result;
}

export async function updateInterest(
  interestId: string,
  data: CreateInterestData
): Promise<UserInterest> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Non authentifié');
  }

  const result = await fetchBackend<UserInterest>(`/interests/${interestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': session.user.id,
    },
    body: JSON.stringify(data),
  });

  revalidatePath('/profile/interests');
  return result;
}

export async function deleteInterest(interestId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Non authentifié');
  }

  await fetchBackend(`/interests/${interestId}`, {
    method: 'DELETE',
    headers: {
      'x-user-id': session.user.id,
    },
  });

  revalidatePath('/profile/interests');
}
