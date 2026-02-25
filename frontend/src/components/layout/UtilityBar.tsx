"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { NotificationsDropdown } from "@/components/common/NotificationsDropdown";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

export function UtilityBar() {
    const { data: session } = useSession();
    const t = useTranslations();

    return (
        <div className="w-full border-b bg-background text-[11px] md:text-xs">
            <div className="container flex items-center justify-between h-8 px-4">
                {/* Left Side */}
                <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                        {session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1 focus:outline-none">
                                    <span className="text-foreground">{t('utilityBar.hello')}</span>
                                    <span className="font-bold text-foreground cursor-pointer flex items-center gap-1">
                                        {session.user?.name}
                                        <ChevronDown className="h-3 w-3" />
                                    </span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[280px] p-4 font-normal">
                                    <div className="flex gap-3 mb-4">
                                        <Avatar className="h-12 w-12 cursor-pointer">
                                            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                                            <AvatarFallback className="bg-gray-200 text-gray-500">
                                                {session.user?.name?.charAt(0).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col justify-center">
                                            <span className="font-bold text-base text-[#3665f3] hover:underline cursor-pointer">
                                                {session.user?.name}
                                            </span>
                                        </div>
                                    </div>

                                    <Link href="/profile" className="block py-1.5 hover:underline hover:text-[#3665f3] transition-colors">
                                        {t('utilityBar.myProfile')}
                                    </Link>

                                    {session.user?.role === 'ADMIN' && (
                                        <Link href="/admin" className="block py-1.5 hover:underline hover:text-[#3665f3] transition-colors font-semibold text-purple-600">
                                            🔐 {t('utilityBar.adminBackoffice')}
                                        </Link>
                                    )}

                                    <DropdownMenuSeparator className="my-2" />

                                    <button
                                        onClick={() => signOut()}
                                        className="text-left w-full hover:underline hover:text-[#3665f3] transition-colors"
                                    >
                                        {t('utilityBar.signOut')}
                                    </button>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <span className="text-foreground">{t('utilityBar.hello')} !</span>
                                <Link href="/auth/login" className="text-blue-600 hover:underline ml-1">{t('utilityBar.signIn')}</Link>
                                <span className="mx-1">{t('utilityBar.or')}</span>
                                <Link href="/auth/register" className="text-blue-600 hover:underline">{t('utilityBar.signUp')}</Link>
                            </>
                        )}
                    </div>
                    <Link href="/sell" className="hover:underline hidden sm:block">{t('utilityBar.listItem')}</Link>
                    <Link href="#" className="hover:underline hidden sm:block">{t('utilityBar.deals')}</Link>
                    <Link href="/chat/" className="hover:underline hidden sm:block">{t('utilityBar.chat')}</Link>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4 sm:gap-6 text-muted-foreground">
                    <Link href="/sell" className="hover:underline hover:text-foreground">{t('nav.sell')}</Link>
                    <Link href="/profile/purchases" className="hidden sm:flex items-center gap-1 hover:text-foreground cursor-pointer">
                        <span>{t('utilityBar.purchases')}</span>
                        <ChevronDown className="h-3 w-3" />
                    </Link>
                    <Link href="/profile" className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                        <span>{t('utilityBar.mySpace')}</span>
                        <ChevronDown className="h-3 w-3" />
                    </Link>
                    <div className="flex items-center gap-4 text-foreground">
                        {session && <NotificationsDropdown />}
                        <button className="hover:text-muted-foreground transition-colors relative">
                            <ShoppingCart className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
