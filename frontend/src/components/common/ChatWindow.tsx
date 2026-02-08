"use client";

import { useEffect, useRef, useState } from "react";
import { sendMessage } from "@/lib/actions/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "./MessageBubble";
import { Send } from "lucide-react";

interface Message {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    sender: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

interface ChatWindowProps {
    conversationId: string;
    initialMessages: Message[];
    currentUserId: string;
    otherUserName: string;
}

export function ChatWindow({ conversationId, initialMessages, currentUserId, otherUserName }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;

        const content = newMessage;
        setNewMessage("");
        setIsLoading(true);

        try {
            // Optimistic update
            const tempId = Math.random().toString(36).substr(2, 9);
            const optimisticMessage: Message = {
                id: tempId,
                content,
                createdAt: new Date(),
                senderId: currentUserId,
                sender: {
                    id: currentUserId,
                    name: "Moi", // Placeholder, ideally get from session/props
                    image: null,
                },
            };

            setMessages((prev) => [...prev, optimisticMessage]);

            const result = await sendMessage(conversationId, content);

            if (result.success && result.data) {
                // Update with real message
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === tempId
                            ? {
                                id: result.data.id,
                                content: result.data.content,
                                createdAt: result.data.createdAt,
                                senderId: result.data.senderId,
                                sender: optimisticMessage.sender,
                            }
                            : msg
                    )
                );
            } else {
                // Revert on failure
                setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
                console.error("Failed to send message:", 'error' in result ? result.error : 'Unknown error');
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-h-full">
            {/* Header - fixed height */}
            <div className="p-4 border-b bg-card flex-shrink-0">
                <h2 className="font-semibold">{otherUserName}</h2>
            </div>

            {/* Messages area - scrollable */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <p>Aucun message. Dites bonjour !</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            content={message.content}
                            isOwn={message.senderId === currentUserId}
                            senderName={message.sender.name || "Utilisateur"}
                            senderImage={message.sender.image}
                            createdAt={message.createdAt}
                        />
                    ))
                )}
            </div>

            {/* Input area - fixed at bottom */}
            <div className="p-4 border-t bg-muted/20 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !newMessage.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
