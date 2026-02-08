"use client";

import { MessageSquare } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { startConversation } from "@/lib/actions/chat";

export function ChatPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const initiationRef = useRef(false);
    const userId = searchParams.get("userId");

    useEffect(() => {
        if (userId && !initiationRef.current) {
            initiationRef.current = true;
            // Use setTimeout to avoid synchronous setState warning
            setTimeout(() => setIsRedirecting(true), 0);

            startConversation(userId).then((result) => {
                if (result.success && result.conversationId) {
                    router.push(`/chat/${result.conversationId}`);
                } else {
                    setIsRedirecting(false);
                    initiationRef.current = false;
                    console.error("Failed to start conversation:", result.message);
                }
            });
        }
    }, [userId, router]);

    if (isRedirecting) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground p-8 text-center">
                <MessageSquare className="h-12 w-12 mb-4 opacity-20 animate-pulse" />
                <h2 className="text-xl font-semibold mb-2">Démarrage de la conversation...</h2>
                <p>Veuillez patienter.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground p-8 text-center">
            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
            <h2 className="text-xl font-semibold mb-2">Vos Messages</h2>
            <p>Sélectionnez une conversation dans la liste pour commencer à discuter.</p>
        </div>
    );
}
