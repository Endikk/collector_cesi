'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getRecommendations, RecommendedItem } from '@/app/actions/recommendations';
import { ProductCard } from './ProductCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Club } from 'lucide-react';
import Link from 'next/link';

export function RecommendationsSection() {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(() => !!session?.user?.id);

  useEffect(() => {
    let mounted = true;

    if (!session?.user?.id) {
      return;
    }

    getRecommendations(12)
      .then((data) => {
        if (mounted) setRecommendations(data);
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [session]);

  // Don't show anything if not authenticated
  if (!session?.user?.id) {
    return null;
  }

  // Don't show loading state, just hide this section until ready
  if (loading) {
    return null;
  }

  // Don't show if no recommendations
  if (recommendations.length === 0) {
    return (
      <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Club className="h-6 w-6 text-purple-600" />
              <CardTitle className="text-xl">Recommandations personnalisées</CardTitle>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Configurez vos{' '}
            <Link href="/profile/interests" className="text-purple-600 hover:underline font-semibold">
              centres d&apos;intérêt
            </Link>{' '}
            pour recevoir des recommandations personnalisées !
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Club className="h-6 w-6 text-purple-600" />
            <CardTitle className="text-xl">Pour vous</CardTitle>
          </div>
          <Link
            href="/profile/interests"
            className="text-sm text-purple-600 hover:underline"
          >
            Gérer mes intérêts →
          </Link>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Objets sélectionnés en fonction de vos centres d&apos;intérêt
        </p>
      </CardHeader>
      <div className="px-6 pb-6">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
          {recommendations.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-64">
              <ProductCard
                item={{
                  ...item,
                  ownerId: item.owner.id,
                  owner: { name: item.owner.name || 'Anonyme' },
                }}
                delay={0}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
