'use client';

import { useEffect, useState } from 'react';
import { fetchBackend } from '@/lib/backend-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'next/navigation';

interface ShopItem {
    id: string;
    title: string;
    price: number;
    images: { url: string }[];
}

interface ShopReview {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    author: {
        name: string | null;
    };
}

interface Shop {
    name: string;
    bio: string | null;
    _count: {
        reviewsReceived: number;
        sales: number;
    };
    items: ShopItem[];
    reviewsReceived: ShopReview[];
}

export function ShopPage() {
    const { id } = useParams();
    const [shop, setShop] = useState<Shop | null>(null);

    useEffect(() => {
        if (id) {
            fetchBackend<Shop>(`/shops/${id}`).then(setShop).catch(console.error);
        }
    }, [id]);

    if (!shop) return <div className="p-8 text-center">Chargement de la boutique...</div>;

    return (
        <div className="container mx-auto py-10">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-10 rounded-xl mb-8">
                <h1 className="text-4xl font-bold mb-2">Boutique de {shop.name}</h1>
                <p className="opacity-90">{shop.bio || 'Aucune bio renseignée.'}</p>
                <div className="mt-4 flex gap-4">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">⭐ {shop._count.reviewsReceived || 0} avis</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">📦 {shop._count.sales || 0} ventes</span>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Articles en vente ({shop.items.length})</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {shop.items.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition">
                        <div className="aspect-square bg-gray-200 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {item.images[0] && <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />}
                        </div>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <p className="text-xl font-bold text-blue-600">{item.price} €</p>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {
                shop.reviewsReceived?.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6">Avis clients</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shop.reviewsReceived.map((review) => (
                                <Card key={review.id}>
                                    <CardHeader className="p-4 flex flex-row justify-between items-start">
                                        <div>
                                            <p className="font-bold">{review.author?.name || 'Utilisateur inconnu'}</p>
                                            <div className="text-yellow-500">{'★'.repeat(review.rating)}</div>
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-gray-600 italic">&quot;{review.comment}&quot;</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
