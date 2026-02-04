import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HomePageHero } from "@/components/pages/home/HomePageHero";
import { ProductCard } from "@/components/pages/home/ProductCard";
import { Search } from "lucide-react";

export const revalidate = 10;

async function getItems() {
  try {
    return await prisma.item.findMany({
      include: {
        owner: {
          select: { name: true },
        },
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const items = await getItems();
  const session = await getServerSession(authOptions);

  const BLUR_FADE_DELAY = 0.04;

  return (
    <div className="container mx-auto py-12 px-4">
      <HomePageHero />

      <div id="catalogue" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-mt-24">
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
          <div className="col-span-full py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">Aucun objet trouvé</h3>
            <p className="text-muted-foreground mt-2">Le catalogue est actuellement vide.</p>
          </div>
        )}
      </div>
    </div>
  );
}
