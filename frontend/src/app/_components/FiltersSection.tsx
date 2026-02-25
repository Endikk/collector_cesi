"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro } from "lucide-react";

export function FiltersSection() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

    // Sync with URL params if they change externally (e.g. clear filters)
    useEffect(() => {
        const min = searchParams.get("minPrice") || "";
        const max = searchParams.get("maxPrice") || "";
        if (min !== minPrice) setMinPrice(min);
        if (max !== maxPrice) setMaxPrice(max);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]); // simpler dependency

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (minPrice) params.set("minPrice", minPrice);
        else params.delete("minPrice");

        if (maxPrice) params.set("maxPrice", maxPrice);
        else params.delete("maxPrice");

        router.push(`/?${params.toString()}`, { scroll: false });
    };

    const handleReset = () => {
        setMinPrice("");
        setMaxPrice("");
        const params = new URLSearchParams(searchParams.toString());
        params.delete("minPrice");
        params.delete("maxPrice");
        router.push(`/?${params.toString()}`, { scroll: false });
    };

    return (
        <Card className="h-fit sticky top-24">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Euro className="h-5 w-5 text-primary" />
                    Prix
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <label htmlFor="filter-min-price" className="sr-only">Prix minimum</label>
                        <Input
                            id="filter-min-price"
                            type="number"
                            min="0"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="pl-8"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" aria-hidden="true">€</span>
                    </div>
                    <span className="text-muted-foreground" aria-hidden="true">-</span>
                    <div className="relative flex-1">
                        <label htmlFor="filter-max-price" className="sr-only">Prix maximum</label>
                        <Input
                            id="filter-max-price"
                            type="number"
                            min="0"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="pl-8"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" aria-hidden="true">€</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button className="flex-1" onClick={handleApply}>
                        Filtrer
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
