'use client';

import { useEffect, useState } from 'react';
import { fetchBackend } from '@/lib/backend-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface AdminStats {
    users: number;
    items: number;
    transactions: number;
}

interface AdminUser {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);

    useEffect(() => {
        fetchBackend<AdminStats>('/admin/stats').then(setStats).catch(console.error);
        fetchBackend<AdminUser[]>('/admin/users').then(setUsers).catch(console.error);
    }, []);

    if (!stats) return <div className="p-8">Chargement du Dashboard Admin...</div>;

    return (
        <div className="container mx-auto py-10 space-y-8">
            <h1 className="text-3xl font-bold">Admin Backoffice</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader><CardTitle>Utilisateurs</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold">{stats.users}</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Objets en vente</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold">{stats.items}</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold">{stats.transactions}</CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Derniers Inscrits</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {users.map((u) => (
                            <li key={u.id} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <span className="font-semibold block">{u.name || 'Sans nom'}</span>
                                    <span className="text-sm text-gray-500">{u.email}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={async () => {
                                            if (confirm('Supprimer cet utilisateur ?')) {
                                                await fetchBackend(`/admin/users/${u.id}`, { method: 'DELETE' });
                                                setUsers(users.filter(user => user.id !== u.id));
                                            }
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
