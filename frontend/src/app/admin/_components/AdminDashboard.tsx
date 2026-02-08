'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Users, Package, TrendingUp, FolderTree, AlertCircle, MessageSquare } from 'lucide-react';
import {
    getAdminStats,
    getAdminUsers,
    deleteUser,
    getAdminCategories,
    createCategory,
    deleteCategory,
    getAdminItems,
    deleteItem,
    getAdminMessages,
    getAdminConversations,
    deleteMessage,
    deleteConversation,
} from '@/app/actions/admin';

interface AdminStats {
    users: number;
    items: number;
    transactions: number;
    categories: number;
    totalCommission: number;
}

interface AdminUser {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    _count: {
        items: number;
        sales: number;
        purchases: number;
    };
}

interface Category {
    id: string;
    name: string;
    _count: {
        items: number;
    };
}

interface AdminItem {
    id: string;
    title: string;
    price: number;
    status: string;
    published: boolean;
    createdAt: string;
    owner: {
        id: string;
        name: string | null;
        email: string;
    };
    category: {
        name: string;
    } | null;
    images: { url: string }[];
}

interface AdminMessage {
    id: string;
    content: string;
    createdAt: string;
    sender: {
        id: string;
        name: string | null;
        email: string;
    };
    conversation: {
        id: string;
        participants: {
            id: string;
            name: string | null;
            email: string;
        }[];
    };
}

interface AdminConversation {
    id: string;
    createdAt: string;
    updatedAt: string;
    participants: {
        id: string;
        name: string | null;
        email: string;
    }[];
    messages: {
        content: string;
        createdAt: string;
    }[];
    _count: {
        messages: number;
    };
}

export function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<AdminItem[]>([]);
    const [messages, setMessages] = useState<AdminMessage[]>([]);
    const [conversations, setConversations] = useState<AdminConversation[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }

        if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        if (status === 'authenticated') {
            let mounted = true;
            const load = async () => {
                setLoading(true);
                const [statsResult, usersResult, categoriesResult, itemsResult, messagesResult, conversationsResult] = await Promise.all([
                    getAdminStats(),
                    getAdminUsers(),
                    getAdminCategories(),
                    getAdminItems(),
                    getAdminMessages(),
                    getAdminConversations(),
                ]);

                if (mounted) {
                    if (statsResult.success) setStats(statsResult.stats as AdminStats);
                    if (usersResult.success) setUsers(usersResult.users as AdminUser[]);
                    if (categoriesResult.success) setCategories(categoriesResult.categories as Category[]);
                    if (itemsResult.success) setItems(itemsResult.items as AdminItem[]);
                    if (messagesResult.success) setMessages(messagesResult.messages as AdminMessage[]);
                    if (conversationsResult.success) setConversations(conversationsResult.conversations as AdminConversation[]);
                    setLoading(false);
                }
            };
            load();
            return () => { mounted = false; };
        }
    }, [status, session, router]);

    const loadData = async () => {
        setLoading(true);
        const [statsResult, usersResult, categoriesResult, itemsResult, messagesResult, conversationsResult] = await Promise.all([
            getAdminStats(),
            getAdminUsers(),
            getAdminCategories(),
            getAdminItems(),
            getAdminMessages(),
            getAdminConversations(),
        ]);

        if (statsResult.success) setStats(statsResult.stats as AdminStats);
        if (usersResult.success) setUsers(usersResult.users as AdminUser[]);
        if (categoriesResult.success) setCategories(categoriesResult.categories as Category[]);
        if (itemsResult.success) setItems(itemsResult.items as AdminItem[]);
        if (messagesResult.success) setMessages(messagesResult.messages as AdminMessage[]);
        if (conversationsResult.success) setConversations(conversationsResult.conversations as AdminConversation[]);
        setLoading(false);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
        const result = await deleteUser(userId);
        if (result.success) {
            setUsers(users.filter(u => u.id !== userId));
        } else {
            alert(result.message);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        const result = await createCategory(newCategoryName.trim());
        if (result.success) {
            setNewCategoryName('');
            loadData();
        } else {
            alert(result.message);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return;
        const result = await deleteCategory(categoryId);
        if (result.success) {
            setCategories(categories.filter(c => c.id !== categoryId));
        } else {
            alert(result.message);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
        const result = await deleteItem(itemId);
        if (result.success) {
            setItems(items.filter(i => i.id !== itemId));
        } else {
            alert(result.message);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;
        const result = await deleteMessage(messageId);
        if (result.success) {
            setMessages(messages.filter(m => m.id !== messageId));
        } else {
            alert(result.message);
        }
    };

    const handleDeleteConversation = async (conversationId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette conversation et tous ses messages ?")) return;
        const result = await deleteConversation(conversationId);
        if (result.success) {
            setConversations(conversations.filter(c => c.id !== conversationId));
        } else {
            alert(result.message);
        }
    };

    if (loading || status === 'loading') {
        return <div className="p-8">Chargement du Dashboard Admin...</div>;
    }

    if (!stats) {
        return <div className="p-8">Erreur de chargement</div>;
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Back Office Administrateur</h1>
                <Button variant="outline" onClick={() => router.push('/')}>
                    Retour au site
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Articles</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.items}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.transactions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Catégories</CardTitle>
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.categories}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Commissions</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.totalCommission.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Management Tabs */}
            <Tabs defaultValue="categories" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="categories">Catégories</TabsTrigger>
                    <TabsTrigger value="items">Articles</TabsTrigger>
                    <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                    <TabsTrigger value="moderation">Modération Chat</TabsTrigger>
                </TabsList>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion des Catégories</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Les catégories ne peuvent être créées que par les administrateurs
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Nom de la nouvelle catégorie"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                                />
                                <Button onClick={handleCreateCategory}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Créer
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div>
                                            <span className="font-medium">{category.name}</span>
                                            <span className="text-sm text-muted-foreground ml-2">
                                                ({category._count.items} article{category._count.items > 1 ? 's' : ''})
                                            </span>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteCategory(category.id)}
                                            disabled={category._count.items > 0}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Items Tab */}
                <TabsContent value="items" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion des Articles</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Supprimez les articles ne respectant pas la charte de la plateforme
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-3 border rounded-lg"
                                    >
                                        {item.images[0] && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={item.images[0].url}
                                                alt={item.title}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{item.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                {' • '}
                                                {item.owner.name || item.owner.email}
                                                {' • '}
                                                {item.category?.name || 'Sans catégorie'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                                item.status === 'SOLD' ? 'bg-gray-100 text-gray-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {item.status}
                                            </span>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion des Utilisateurs</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Supprimez les vendeurs ne respectant pas la charte de la plateforme
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{user.name || 'Sans nom'}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${
                                                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {user._count.items} article{user._count.items > 1 ? 's' : ''} •{' '}
                                                {user._count.sales} vente{user._count.sales > 1 ? 's' : ''} •{' '}
                                                {user._count.purchases} achat{user._count.purchases > 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={user.role === 'ADMIN'}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Moderation Tab */}
                <TabsContent value="moderation" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Modération du Chat
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Surveillez les conversations et supprimez les messages inappropriés
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Conversations Section */}
                            <div>
                                <h3 className="font-semibold mb-3">Conversations ({conversations.length})</h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {conversations.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">Aucune conversation</p>
                                    ) : (
                                        conversations.map((conversation) => (
                                            <div
                                                key={conversation.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {conversation.participants.map((participant, idx) => (
                                                            <span key={participant.id} className="text-sm font-medium">
                                                                {participant.name || participant.email}
                                                                {idx < conversation.participants.length - 1 && ' ↔ '}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {conversation._count.messages} message{conversation._count.messages > 1 ? 's' : ''} •{' '}
                                                        Dernière activité: {new Date(conversation.updatedAt).toLocaleDateString('fr-FR')}
                                                    </div>
                                                    {conversation.messages[0] && (
                                                        <div className="text-xs text-muted-foreground mt-1 truncate">
                                                            Dernier: &quot;{conversation.messages[0].content}&quot;
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteConversation(conversation.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Recent Messages Section */}
                            <div>
                                <h3 className="font-semibold mb-3">Messages récents ({messages.length})</h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {messages.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">Aucun message</p>
                                    ) : (
                                        messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className="p-3 border rounded-lg hover:bg-muted/50"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-sm">
                                                                {message.sender.name || message.sender.email}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(message.createdAt).toLocaleDateString('fr-FR', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm break-words">{message.content}</p>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Conversation avec:{' '}
                                                            {message.conversation.participants
                                                                .filter(p => p.id !== message.sender.id)
                                                                .map(p => p.name || p.email)
                                                                .join(', ')}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteMessage(message.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                                <div className="flex gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                    <div className="text-sm text-amber-800">
                                        <p className="font-semibold mb-1">Modération responsable</p>
                                        <p>
                                            Supprimez uniquement les messages qui violent la charte de la plateforme :
                                            contenu inapproprié, harcèlement, fraude, spam, etc.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
