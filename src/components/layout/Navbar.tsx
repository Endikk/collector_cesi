"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SecondaryNav } from "./SecondaryNav";
import { UtilityBar } from "./UtilityBar";

function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
            params.set("q", query);
        } else {
            params.delete("q");
        }
        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="flex-1 max-w-4xl flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
                <div className="flex-1 relative flex items-center">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Search className="h-4 w-4" />
                    </div>
                    <Input
                        type="search"
                        placeholder="Rechercher sur Collector"
                        className="w-full pl-10 pr-36 h-[42px] border-2 border-black/80 focus-visible:ring-0 rounded-full text-base"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="absolute right-0 h-full flex items-center pr-1 border-l border-border/50">
                        <Button type="button" variant="ghost" className="h-[38px] rounded-r-full text-xs font-normal text-muted-foreground px-4 hover:bg-transparent">
                            Toutes les catég... <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                    </div>
                </div>
                <Button type="submit" className="ml-3 h-[42px] px-10 rounded-full bg-[#3665f3] hover:bg-[#2b54d6] text-white font-semibold text-base shadow-none">
                    Rechercher
                </Button>
            </form>
            <Link href="#" className="text-[11px] text-muted-foreground hover:underline hidden lg:block whitespace-nowrap">
                Recherche approfondie
            </Link>
        </div>
    );
}

export default function NavBar() {
    return (
        <div className="flex flex-col bg-white">
            <UtilityBar />

            <div className="border-b">
                <div className="container flex h-[72px] items-center gap-6">
                    <Link href="/" className="flex items-center gap-1 font-bold text-3xl tracking-tighter flex-shrink-0 -mt-1">
                        <span className="text-[#e53238]">e</span>
                        <span className="text-[#0064d2]">b</span>
                        <span className="text-[#f5af02]">a</span>
                        <span className="text-[#86b817]">y</span>
                    </Link>

                    <div className="flex-1 hidden md:flex items-center">
                        <Button variant="ghost" className="mr-2 text-xs font-medium text-muted-foreground hover:text-foreground hidden xl:flex">
                            Explorer <br /> par catégorie <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>

                        <Suspense fallback={<div className="flex-1 h-10 bg-secondary/20 rounded-full" />}>
                            <SearchBar />
                        </Suspense>
                    </div>

                    <div className="md:hidden flex-1 flex justify-end">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/?focusSearch=true"><Search className="h-6 w-6" /></Link>
                        </Button>
                    </div>
                </div>
            </div>

            <SecondaryNav />
        </div>
    );
}
