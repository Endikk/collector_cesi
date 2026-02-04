import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProductCard } from "@/components/pages/home/ProductCard";
import { FiltersSection } from "@/components/pages/home/FiltersSection";
import { RachatBanner } from "@/components/pages/home/RachatBanner";
import { HeroCarousel } from "@/components/pages/home/HeroCarousel";
import { Search } from "lucide-react";
import { Prisma } from "@prisma/client";

export const revalidate = 0; // Dynamic for search

async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

async function getItems(filters: {
  query?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
}) {
  const where: Prisma.ItemWhereInput = {
    published: true,
    status: "AVAILABLE",
  };

  if (filters.query) {
    where.OR = [
      { title: { contains: filters.query, mode: "insensitive" } },
      { description: { contains: filters.query, mode: "insensitive" } },
    ];
  }

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    where.categoryId = { in: filters.categoryIds };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  try {
    return await prisma.item.findMany({
      where,
      include: {
        owner: {
          select: { name: true },
        },
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch items:", error);
    return [];
  }
}

interface HomeProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Home({ searchParams }: HomeProps) {
  // Parse search params
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const categoriesParam = typeof searchParams.categories === "string" ? searchParams.categories : undefined;
  const categoryIds = categoriesParam ? categoriesParam.split(",") : undefined;
  const minPrice = typeof searchParams.minPrice === "string" ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === "string" ? parseFloat(searchParams.maxPrice) : undefined;

  const [items, categories] = await Promise.all([
    getItems({ query: q, categoryIds, minPrice, maxPrice }),
    getCategories(),
  ]);

  const session = await getServerSession(authOptions);

  const BLUR_FADE_DELAY = 0.04;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 1. Commercial Banner */}
      <RachatBanner />

      {/* 2. Live Events / Hero Carousel */}
      <HeroCarousel items={items} />

      {/* 3. Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <FiltersSection />
        </aside>

        <div className="flex-1 space-y-6">
          <div id="catalogue" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 scroll-mt-24">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {items.map((item: any, idx: any) => (
              <ProductCard
                key={item.id}
                item={item}
                delay={BLUR_FADE_DELAY * 2 + idx * 0.05}
                currentUserId={session?.user?.id}
              />
            ))}

            {items.length === 0 && (
              <div className="col-span-full py-20 text-center bg-muted/30 rounded-xl border-dashed border-2">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">Aucun objet trouvé</h3>
                <p className="text-muted-foreground mt-2">Essayez de modifier vos filtres de recherche.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
