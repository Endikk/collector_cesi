"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchBackend } from "@/lib/backend-api";
import { revalidatePath } from "next/cache";


export async function deleteItemAsAdmin(itemId: string) {
    try {
        const session = await getServerSession(authOptions);

        // Vérifier que l'utilisateur est admin
        if (session?.user?.role !== "ADMIN") {
            return { success: false, message: "Action non autorisée" };
        }

        await fetchBackend(`/admin/items/${itemId}`, {
            method: "DELETE",
            headers: {
                "x-user-role": session?.user?.role || "",
            },
        });

        revalidatePath("/items");
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting item:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Erreur lors de la suppression"
        };
    }
}
