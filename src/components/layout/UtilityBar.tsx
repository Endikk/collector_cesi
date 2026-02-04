"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell, ShoppingCart, ChevronDown } from "lucide-react";

export function UtilityBar() {
    const { data: session } = useSession();

    return (
        <div className="w-full border-b bg-background text-[11px] md:text-xs">
            <div className="container flex items-center justify-between h-8 px-4">
                {/* Left Side */}
                <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <span className="text-foreground">Bonjour !</span>
                        {session ? (
                            <span className="font-semibold text-blue-600 cursor-pointer">{session.user?.name}</span>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-blue-600 hover:underline">Connectez-vous</Link>
                                <span>ou</span>
                                <Link href="/auth/register" className="text-blue-600 hover:underline">inscrivez-vous</Link>
                            </>
                        )}
                    </div>
                    <Link href="#" className="hover:underline hidden sm:block">Estimation Collector</Link>
                    <Link href="#" className="hover:underline hidden sm:block">Bons Plans</Link>
                    <Link href="#" className="hover:underline hidden sm:block">Aide</Link>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4 sm:gap-6 text-muted-foreground">
                    <Link href="/sell" className="hover:underline hover:text-foreground">Vendre</Link>
                    <div className="hidden sm:flex items-center gap-1 hover:text-foreground cursor-pointer">
                        <span>Objets suivis</span>
                        <ChevronDown className="h-3 w-3" />
                    </div>
                    <div className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                        <span>Mon Espace</span>
                        <ChevronDown className="h-3 w-3" />
                    </div>
                    <div className="flex items-center gap-4 text-foreground">
                        <button className="hover:text-muted-foreground transition-colors relative">
                            <Bell className="h-5 w-5" />
                        </button>
                        <button className="hover:text-muted-foreground transition-colors relative">
                            <ShoppingCart className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
