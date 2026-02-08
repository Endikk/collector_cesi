"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchBackend } from "@/lib/backend-api";
import { revalidatePath } from "next/cache";

export async function createReview(transactionId: string, rating: number, comment?: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return { success: false, message: "Vous devez être connecté pour noter." };
    }

    try {
        const review = await fetchBackend("/reviews", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                rating,
                comment,
                authorId: session.user.id,
                transactionId,
            }),
        });

        revalidatePath("/profile/purchases");
        revalidatePath("/profile/sales");
        
        return { success: true, review };
    } catch (error) {
        console.error("Error creating review:", error);
        return { success: false, message: "Erreur lors de la création de l'avis." };
    }
}

export async function canReviewTransaction(transactionId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return { canReview: false, reason: "Non connecté" };
    }

    try {
        const result = await fetchBackend(`/reviews/can-review/${transactionId}?userId=${session.user.id}`);
        return result;
    } catch (error) {
        console.error("Error checking review eligibility:", error);
        return { canReview: false, reason: "Erreur" };
    }
}

export async function getReviewsForUser(userId: string) {
    try {
        const reviews = await fetchBackend(`/reviews/user/${userId}`);
        return reviews;
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}
