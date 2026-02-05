"use client";

import { cn } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageBubbleProps {
    content: string;
    isOwn: boolean;
    senderName: string;
    senderImage?: string | null;
    createdAt: Date;
}

export function MessageBubble({ content, isOwn, senderName, senderImage, createdAt }: MessageBubbleProps) {
    return (
        <div className={cn("flex w-full mb-4", isOwn ? "justify-end" : "justify-start")}>
            <div className={cn("flex max-w-[70%] gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
                <Avatar className="h-8 w-8">
                    <AvatarImage src={senderImage || ""} alt={senderName} />
                    <AvatarFallback>{senderName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className={cn(
                    "p-3 rounded-lg text-sm",
                    isOwn
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted rounded-tl-none"
                )}>
                    <p>{content}</p>
                    <span className="text-[10px] opacity-70 mt-1 block text-right">
                        {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
}
