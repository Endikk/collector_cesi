import { SellPage as SellPageComponent } from "@/app/sell/_components/SellPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SellPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/api/auth/signin?callbackUrl=/sell");
    }

    return <SellPageComponent />;
}
