"use client";

import { startConversation } from "@/lib/actions/chat";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ContactSellerButtonProps {
    sellerId: string;
}

export function ContactSellerButton({ sellerId }: ContactSellerButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleContact = async () => {
        setIsLoading(true);
        try {
            const result = await startConversation(sellerId);
            if (result.success && result.conversationId) {
                router.push(`/chat/${result.conversationId}`);
            } else {
                alert(result.message || "Erreur lors de la création de la conversation");
            }
        } catch (error) {
            console.error("Error contacting seller:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleContact} disabled={isLoading} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            {isLoading ? "Chargement..." : "Contacter le vendeur"}
        </Button>
    );
}
