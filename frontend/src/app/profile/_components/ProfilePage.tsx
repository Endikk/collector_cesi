import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingBag, Package, Heart, Bell, Store, MessageCircle } from "lucide-react";

export async function ProfilePageContent() {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
            _count: {
                select: {
                    items: true,
                    sales: true,
                    purchases: true,
                    reviewsReceived: true,
                },
            },
        },
    });

    if (!user) {
        redirect("/auth/login");
    }

    const recentPurchases = await prisma.transaction.findMany({
        where: { buyerId: user.id },
        include: { item: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    const recentSales = await prisma.transaction.findMany({
        where: { sellerId: user.id },
        include: { item: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    const links = [
        { href: "/profile/sales", label: "Gérer mes ventes", icon: Package, color: "bg-blue-600 hover:bg-blue-700" },
        { href: "/profile/purchases", label: "Voir mes achats", icon: ShoppingBag, color: "bg-emerald-600 hover:bg-emerald-700" },
        { href: "/profile/interests", label: "Centres d'intérêt", icon: Heart, color: "bg-purple-600 hover:bg-purple-700" },
        { href: "/profile/notifications", label: "Notifications", icon: Bell, color: "bg-orange-600 hover:bg-orange-700" },
        { href: "/chat", label: "Messages", icon: MessageCircle, color: "bg-sky-600 hover:bg-sky-700" },
    ];

    return (
        <div className="container mx-auto py-10 max-w-3xl px-4">
            {/* Header Card */}
            <Card className="mb-8">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                            {user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-2xl">{user.name || "Utilisateur"}</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                                {user.role === "ADMIN" ? "Administrateur" : "Membre"}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Membre depuis {new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold">{user._count.items}</div>
                        <div className="text-sm text-muted-foreground">Objets</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold">{user._count.sales}</div>
                        <div className="text-sm text-muted-foreground">Ventes</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold">{user._count.purchases}</div>
                        <div className="text-sm text-muted-foreground">Achats</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold">{user._count.reviewsReceived}</div>
                        <div className="text-sm text-muted-foreground">Avis reçus</div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                {links.map((link) => (
                    <Button
                        key={link.href}
                        asChild
                        className={`${link.color} text-white h-auto py-3 flex-col gap-1`}
                    >
                        <Link href={link.href}>
                            <link.icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{link.label}</span>
                        </Link>
                    </Button>
                ))}
            </div>

            {/* Shop Link */}
            <div className="text-center mb-8">
                <Button variant="outline" asChild>
                    <Link href={`/shop/${user.id}`} className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        Voir ma boutique publique
                    </Link>
                </Button>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-emerald-500" />
                            Derniers Achats
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentPurchases.length > 0 ? (
                            <ul className="space-y-3">
                                {recentPurchases.map((p) => (
                                    <li key={p.id} className="border-b border-border/50 pb-2 last:border-0">
                                        <span className="font-medium">{p.item.title}</span>
                                        <div className="text-sm text-muted-foreground">
                                            {p.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                                            {" · "}
                                            {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Aucun achat récent.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-500" />
                            Dernières Ventes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentSales.length > 0 ? (
                            <ul className="space-y-3">
                                {recentSales.map((s) => (
                                    <li key={s.id} className="border-b border-border/50 pb-2 last:border-0">
                                        <span className="font-medium">{s.item.title}</span>
                                        <div className="text-sm text-muted-foreground">
                                            {s.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                                            {" · "}
                                            {new Date(s.createdAt).toLocaleDateString("fr-FR")}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Aucune vente récente.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
