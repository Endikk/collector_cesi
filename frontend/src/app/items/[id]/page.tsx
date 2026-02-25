import { ItemPage as ItemPageComponent } from "@/app/items/[id]/_components/ItemPage";

export default function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    return <ItemPageComponent params={params} />;
}
