"use client";

import Link from "next/link";

const categories = [
    { name: "Enregistré", href: "#" },
    { name: "Art & Collections", href: "/?categories=Art%20%26%20Déco" },
    { name: "Auto & Moto", href: "/?categories=Véhicules" },
    { name: "High-Tech", href: "/?categories=High-Tech" },
    { name: "Maison & Jardin", href: "/?categories=Maison" },
    { name: "Jouets & Jeux", href: "/?categories=Jeux%20%26%20Jouets" },
    { name: "Culture & Loisirs", href: "/?categories=Livres%20%26%20Musique" },
    { name: "Mode", href: "/?categories=Vêtements" },
    { name: "PME & Artisans", href: "#" },
    { name: "Reconditionné", href: "#" },
    { name: "Seconde main", href: "#" },
];

export function SecondaryNav() {
    return (
        <div className="w-full border-b bg-background shadow-sm overflow-x-auto">
            <div className="container flex items-center h-10 text-[13px] text-muted-foreground whitespace-nowrap">
                <div className="flex items-center gap-6 px-4">
                    <Link href="/" className="font-semibold text-foreground hover:underline">
                        Collector Live
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
