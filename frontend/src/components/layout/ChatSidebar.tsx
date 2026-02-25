"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Conversation {
    id: string;
    participants: {
        id: string;
        name: string | null;
        image: string | null;
    }[];
    messages: {
        content: string;
        createdAt: Date;
    }[];
    updatedAt: Date;
}

interface ChatSidebarProps {
    conversations: Conversation[];
    currentUserId: string;
}

// Format date consistently on server and client
function formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

export function ChatSidebar({ conversations, currentUserId }: ChatSidebarProps) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full border-r bg-muted/10 w-full max-w-xs">
            <div className="p-4 border-b font-semibold">
                Messages
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Aucune conversation
                    </div>
                ) : (
                    conversations.map((conversation) => {
                        const otherParticipant = conversation.participants.find(
                            (p) => p.id !== currentUserId
                        ) || conversation.participants[0];

                        const lastMessage = conversation.messages[0];
                        const isActive = pathname === `/chat/${conversation.id}`;

                        return (
                            <Link
                                key={conversation.id}
                                href={`/chat/${conversation.id}`}
                                className={cn(
                                    "flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b last:border-0",
                                    isActive && "bg-muted"
                                )}
                            >
                                <Avatar>
                                    <AvatarImage src={otherParticipant?.image || ""} />
                                    <AvatarFallback>
                                        {otherParticipant?.name?.charAt(0).toUpperCase() || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-medium truncate">
                                            {otherParticipant?.name || "Utilisateur inconnu"}
                                        </span>
                                        {lastMessage && (
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatDate(lastMessage.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {lastMessage ? lastMessage.content : "Nouvelle conversation"}
                                    </p>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
