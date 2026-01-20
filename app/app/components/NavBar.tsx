"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, PlusCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BlurFade from "@/components/magicui/blur-fade";

export default function NavBar() {
    const { data: session } = useSession();

    return (
        <BlurFade delay={0.1} className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                        Collector.shop
                    </span>
                </Link>

                <nav className="flex items-center gap-6">
                    {session ? (
                        <>
                            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                                <Link href="/">Catalogue</Link>
                            </Button>

                            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0">
                                <Link href="/sell" className="flex items-center gap-2">
                                    <PlusCircle size={16} />
                                    Vendre
                                </Link>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8 border border-border">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user?.email}`} />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{session.user?.name || "Utilisateur"}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {session.user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut()} className="text-red-500 focus:text-red-500">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Déconnexion</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Button asChild variant="ghost">
                                <Link href="/auth/login">Connexion</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/auth/register">Inscription</Link>
                            </Button>
                        </div>
                    )}
                </nav>
            </div>
        </BlurFade>
    );
}
