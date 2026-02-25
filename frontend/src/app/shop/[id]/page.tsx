import { ShopPage as ShopPageComponent } from "@/app/shop/[id]/_components/ShopPage";

export const dynamic = 'force-dynamic';

export default function ShopPage({ params }: { params: Promise<{ id: string }> }) {
    return <ShopPageComponent params={params} />;
}
