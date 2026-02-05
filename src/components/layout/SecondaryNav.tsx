"use client";

import Link from "next/link";

const categories = [
    { name: "Enregistré", href: "/profile/purchases" },
    { name: "Art & Collections", href: "/?categories=Art%20%26%20Collections" },
    { name: "Auto & Moto", href: "/?categories=Auto%20%26%20Moto" },
    { name: "High-Tech", href: "/?categories=High-Tech" },
    { name: "Maison & Jardin", href: "/?categories=Maison%20%26%20Jardin" },
    { name: "Jouets & Jeux", href: "/?categories=Jouets%20%26%20Jeux" },
    { name: "Culture & Loisirs", href: "/?categories=Culture%20%26%20Loisirs" },
    { name: "Mode", href: "/?categories=Mode" },
    { name: "Seconde main", href: "/" },
];

export function SecondaryNav() {
    return (
        <div className="w-full border-b bg-background shadow-sm overflow-x-auto">
            <div className="container flex items-center h-10 text-[13px] text-muted-foreground whitespace-nowrap">
                <div className="flex items-center gap-6 px-4">
                    <Link href="/" className="font-semibold text-foreground hover:underline">
                        Accueil
                    </Link>
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            href={cat.href}
                            className="hover:underline hover:text-primary transition-colors"
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
