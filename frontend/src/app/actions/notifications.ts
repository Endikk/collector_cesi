"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchBackend } from "@/lib/backend-api";
import { revalidatePath } from "next/cache";

export async function getNotifications(unreadOnly = false) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return { success: false, notifications: [] };
    }

    try {
        const notifications = await fetchBackend(
            `/notifications/user/${session.user.id}?unreadOnly=${unreadOnly}`
        );
        return { success: true, notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { success: false, notifications: [] };
    }
}

export async function getUnreadCount() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return { count: 0 };
    }

    try {
        const result = await fetchBackend(`/notifications/user/${session.user.id}/count`);
        return result;
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return { count: 0 };
    }
}

export async function markNotificationAsRead(notificationId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return { success: false };
    }

    try {
        await fetchBackend(`/notifications/${notificationId}/read`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: session.user.id }),
        });
        
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { success: false };
    }
}

export async function markAllNotificationsAsRead() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return { success: false };
    }

    try {
        await fetchBackend(`/notifications/user/${session.user.id}/read-all`, {
            method: "POST",
        });
        
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return { success: false };
    }
}

export async function deleteNotification(notificationId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return { success: false };
    }

    try {
        await fetchBackend(`/notifications/${notificationId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: session.user.id }),
        });
        
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error deleting notification:", error);
        return { success: false };
    }
}
