"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface CategoryChipsProps {
    categories: { id: string; name: string }[];
}

export function CategoryChips({ categories }: CategoryChipsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedCategories = searchParams.get("categories")?.split(",").filter(Boolean) || [];

    const toggleCategory = (catId: string) => {
        const current = new Set(selectedCategories);
        if (current.has(catId)) {
            current.delete(catId);
        } else {
            current.add(catId);
        }

        const params = new URLSearchParams(searchParams.toString());
        if (current.size > 0) {
            params.set("categories", Array.from(current).join(","));
        } else {
            params.delete("categories");
        }
        router.push(`/?${params.toString()}`, { scroll: false });
    };

    if (categories.length === 0) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 px-4 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-2">
                {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                        <Badge
                            key={cat.id}
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                                "cursor-pointer px-4 py-2 text-sm whitespace-nowrap transition-all",
                                isSelected
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-white/50 hover:bg-white border-primary/20"
                            )}
                            onClick={() => toggleCategory(cat.id)}
                        >
                            {cat.name}
                        </Badge>
                    );
                })}
            </div>
        </div>
    );
}
