'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { fetchBackend } from '@/lib/backend-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface Transaction {
    id: string;
    amount: number;
    createdAt: string;
    item: {
        title: string;
    };
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
    _count: {
        items: number;
        sales: number;
    };
    purchases: Transaction[];
    sales: Transaction[];
}

export function ProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (session?.user?.id) {
            fetchBackend<UserProfile>(`/users/${session.user.id}/profile`)
                .then(setProfile)
                .catch(console.error);
        }
    }, [session]);

    if (!session) return <div className="p-8 text-center"><Link href="/api/auth/signin" className="underline">Connectez-vous</Link> pour voir votre profil.</div>;
    if (!profile) return <div className="p-8 text-center">Chargement du profil...</div>;

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={profile.image} />
                        <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{profile.name}</CardTitle>
                        <p className="text-gray-500">{profile.email}</p>
                        <p className="text-sm text-blue-600 font-semibold">{profile.role}</p>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold">{profile._count.items}</div>
                        <div className="text-sm text-gray-500">Objets publiés</div>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold">{profile._count.sales}</div>
                        <div className="text-sm text-gray-500">Ventes réalisées</div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4 justify-center mt-6">
                <Link href="/profile/sales" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Gérer mes ventes
                </Link>
                <Link href="/profile/purchases" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                    Voir mes achats
                </Link>
            </div>

            <div className="mt-8 text-center">
                <Link href={`/shop/${profile.id}`} className="text-blue-500 hover:underline">
                    Voir ma boutique publique
                </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Derniers Achats</CardTitle></CardHeader>
                    <CardContent>
                        {profile.purchases?.length > 0 ? (
                            <ul className="space-y-4">
                                {profile.purchases.map((p) => (
                                    <li key={p.id} className="border-b pb-2">
                                        <span className="font-semibold">{p.item.title}</span>
                                        <div className="text-sm text-gray-500">{p.amount} € - {new Date(p.createdAt).toLocaleDateString()}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-gray-500">Aucun achat récent.</p>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Dernières Ventes</CardTitle></CardHeader>
                    <CardContent>
                        {profile.sales?.length > 0 ? (
                            <ul className="space-y-4">
                                {profile.sales.map((s) => (
                                    <li key={s.id} className="border-b pb-2">
                                        <span className="font-semibold">{s.item.title}</span>
                                        <div className="text-sm text-gray-500">{s.amount} € - {new Date(s.createdAt).toLocaleDateString()}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-gray-500">Aucune vente récente.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
