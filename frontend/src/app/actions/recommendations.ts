'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchBackend } from '@/lib/backend-api';

export interface RecommendedItem {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  viewCount: number;
  createdAt: string;
  images: Array<{ id: string; url: string }>;
  category: {
    id: string;
    name: string;
  } | null;
  owner: {
    id: string;
    name: string;
  };
}

export async function getRecommendations(
  limit = 20
): Promise<RecommendedItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    // Return empty array if not authenticated
    return [];
  }

  return fetchBackend<RecommendedItem[]>(
    `/recommendations?limit=${limit}`,
    {
      headers: {
        'x-user-id': session.user.id,
      },
    }
  );
}
