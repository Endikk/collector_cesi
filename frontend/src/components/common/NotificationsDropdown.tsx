"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Trash2, MessageCircle, ShoppingBag, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "@/app/actions/notifications";
import { useRouter } from "next/navigation";

interface Notification {
    id: string;
    type: string;
    read: boolean;
    data?: string;
    createdAt: Date;
}

export function NotificationsDropdown() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadNotifications = async () => {
        setLoading(true);
        const result = await getNotifications(false);
        if (result.success) {
            setNotifications(result.notifications as Notification[]);
            setUnreadCount((result.notifications as Notification[]).filter((n: Notification) => !n.read).length);
        }
        setLoading(false);
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            const result = await getNotifications(false);
            if (result.success && mounted) {
                setNotifications(result.notifications as Notification[]);
                setUnreadCount((result.notifications as Notification[]).filter((n: Notification) => !n.read).length);
            }
            if (mounted) setLoading(false);
        };
        load();
        return () => { mounted = false; };
    }, []);

    const handleMarkAsRead = async (notificationId: string) => {
        await markNotificationAsRead(notificationId);
        loadNotifications();
    };

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead();
        loadNotifications();
    };

    const handleDelete = async (notificationId: string) => {
        await deleteNotification(notificationId);
        loadNotifications();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "NEW_MESSAGE":
                return <MessageCircle className="h-4 w-4 text-blue-500" />;
            case "ITEM_SOLD":
                return <ShoppingBag className="h-4 w-4 text-green-500" />;
            case "ITEM_PURCHASED":
                return <Package className="h-4 w-4 text-purple-500" />;
            case "NEW_REVIEW":
                return <Star className="h-4 w-4 text-yellow-500" />;
            case "NEW_ITEM":
                return <Package className="h-4 w-4 text-blue-500" />;
            case "MATCHING_INTEREST":
                return <Star className="h-4 w-4 text-purple-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const getNotificationText = (notification: Notification) => {
        let parsedData: Record<string, unknown> | null = null;
        if (notification.data) {
            try {
                parsedData = JSON.parse(notification.data);
            } catch {
                // Ignore parse error
            }
        }

        switch (notification.type) {
            case "NEW_MESSAGE":
                return "Vous avez reçu un nouveau message";
            case "ITEM_SOLD":
                return "Votre objet a été vendu !";
            case "ITEM_PURCHASED":
                return "Votre achat a été confirmé";
            case "NEW_REVIEW":
                return "Vous avez reçu un nouvel avis";
            case "NEW_ITEM":
                return parsedData?.itemTitle 
                    ? `Nouvel article : ${parsedData.itemTitle}`
                    : "Nouvel article publié";
            case "MATCHING_INTEREST":
                return parsedData?.itemTitle 
                    ? `✨ ${parsedData.itemTitle} correspond à vos intérêts`
                    : "Nouvel article correspondant à vos intérêts";
            default:
                return "Nouvelle notification";
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }

        // Navigate based on notification type
        let parsedData: Record<string, unknown> | null = null;
        if (notification.data) {
            try {
                parsedData = JSON.parse(notification.data);
            } catch {
                // Ignore parse error
            }
        }

        if ((notification.type === "NEW_ITEM" || notification.type === "MATCHING_INTEREST") && parsedData?.itemId) {
            router.push(`/items/${parsedData.itemId}`);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative hover:text-muted-foreground transition-colors" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs h-7"
                        >
                            Tout marquer lu
                        </Button>
                    )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Chargement...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            Aucune notification
                        </div>
                    ) : (
                        <div className="py-1">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`px-4 py-3 hover:bg-muted/50 cursor-pointer border-b last:border-0 ${
                                        !notification.read ? "bg-blue-50/50" : ""
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">
                                                {getNotificationText(notification)}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(notification.createdAt).toLocaleDateString("fr-FR", {
                                                    day: "numeric",
                                                    month: "short",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            {!notification.read && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification.id);
                                                    }}
                                                    className="p-1 hover:bg-blue-100 rounded"
                                                    title="Marquer comme lu"
                                                >
                                                    <Check className="h-3 w-3 text-blue-600" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notification.id);
                                                }}
                                                className="p-1 hover:bg-red-100 rounded"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-3 w-3 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

