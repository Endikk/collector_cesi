"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function RachatBanner() {
    return (
        <section className="bg-green-500 rounded-2xl p-6 md:p-12 mb-12 relative overflow-hidden text-white">
            {/* Background Pattern/Image placeholder */}
            <div className="absolute inset-0 z-0">
                {/* Could add a background image here */}
            </div>

            <div className="relative z-10 max-w-2xl">
                <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-2xl tracking-tighter">
                            <span className="text-foreground">Collector</span>
                            <span className="font-light text-muted-foreground ml-1">vendeur</span>
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-foreground/90">
                        Donnez une seconde vie à vos objets
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-lg mb-4">
                        Vendez vos pépites à d&apos;autres passionnés. Une commission réduite de seulement 5% sur vos ventes.
                    </p>
                    <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold px-6">
                        <Link href="/sell">Commencer à vendre</Link>
                    </Button>
                </div>
            </div>

            {/* Phone Images Mockup - Right Side */}
            <div className="absolute right-0 bottom-0 h-full w-1/3 hidden lg:block">
                {/* Placeholder for phones */}
            </div>
        </section>
    );
}
