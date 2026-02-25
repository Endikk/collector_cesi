"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchBackend } from "@/lib/backend-api";
import { revalidatePath } from "next/cache";

export async function checkAdminRole() {
    const session = await getServerSession(authOptions);
    return session?.user?.role === "ADMIN";
}

// Users
export async function getAdminUsers() {
    try {
        const session = await getServerSession(authOptions);
        const users = await fetchBackend("/admin/users", {
            headers: {
                "x-user-role": session?.user?.role || "",
            },
        });
        return { success: true, users };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, users: [] };
    }
}

export async function deleteUser(userId: string) {
    try {
        const session = await getServerSession(authOptions);
        await fetchBackend(`/admin/users/${userId}`, {
            method: "DELETE",
            headers: {
                "x-user-role": session?.user?.role || "",
            },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, message: "Erreur lors de la suppression" };
    }
}

// Categories
export async function getAdminCategories() {
    try {
        const session = await getServerSession(authOptions);
        const categories = await fetchBackend("/admin/categories", {
            headers: {
                "x-user-role": session?.user?.role || "",
            },
        });
        return { success: true, categories };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { success: false, categories: [] };
    }
}

export async function createCategory(name: string) {
    try {
        const session = await getServerSession(authOptions);
        const category = await fetchBackend("/admin/categories", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-user-role": session?.user?.role || "",
            },
            body: JSON.stringify({ name }),
        });
        revalidatePath("/admin");
        return { success: true, category };
    } catch (error) {
        console.error("Error creating category:", error);
        return { success: false, message: "Erreur lors de la création" };
    }
}

export async function deleteCategory(categoryId: string) {
    try {
        const session = await getServerSession(authOptions);
        await fetchBackend(`/admin/categories/${categoryId}`, {
            method: "DELETE",
            headers: {
                "x-user-role": session?.user?.role || "",
            },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { success: false, message: "Erreur lors de la suppression" };
    }
}

// Items
export async function getAdminItems() {
    try {
        const session = await getServerSession(authOptions);
        const items = await fetchBackend("/admin/items", {
            headers: {
                "x-user-role": session?.user?.role || "",
            },
        });
        return { success: true, items };
    } catch (error) {
        console.error("Error fetching items:", error);
        return { success: false, items: [] };
    }
}

export async function deleteItem(itemId: string) {
    try {
        const session = await getServerSession(authOptions);
        await fetchBackend(`/admin/items/${itemId}`, {
            method: "DELETE",
            headers: {
                "x-user-role": session?.user?.role || "",
            },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting item:", error);
        return { success: false, message: "Erreur lors de la suppression" };
    }
}

// Stats
export async function getAdminStats() {
    try {
        const session = await getServerSession(authOptions);
        const stats = await fetchBackend("/admin/stats", {
            headers: {
                "x-user-role": session?.user?.role || "",
            },
        });
        return { success: true, stats };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return { success: false, stats: null };
    }
}

// Chat Moderation
export async function getAdminMessages() {
    try {
        const session = await getServerSession(authOptions);
        const messages = await fetchBackend("/admin/messages", {
            headers: {
                "x-user-role": session?.user?.role || "",
            },
        });
        return { success: true, messages };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { success: false, messages: [] };
    }
}

export async function getAdminConversations() {
    try {
        const session = await getServerSession(authOptions);
        const conversations = await fetchBackend("/admin/conversations", {
            headers: {
                "x-user-role": session?.user?.role || "",
            },
        });
        return { success: true, conversations };
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return { success: false, conversations: [] };
    }
}

export async function deleteMessage(messageId: string) {
    try {
        const session = await getServerSession(authOptions);
        await fetchBackend(`/admin/messages/${messageId}`, {
            method: "DELETE",
            headers: {
                "x-user-role": session?.user?.role || "",
            },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting message:", error);
        return { success: false, message: "Erreur lors de la suppression" };
    }
}

export async function deleteConversation(conversationId: string) {
    try {
        const session = await getServerSession(authOptions);
        await fetchBackend(`/admin/conversations/${conversationId}`, {
            method: "DELETE",
            headers: {
                "x-user-role": session?.user?.role || "",
            },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return { success: false, message: "Erreur lors de la suppression" };
    }
}

