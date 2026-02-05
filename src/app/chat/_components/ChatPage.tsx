import { MessageSquare } from "lucide-react";

export function ChatPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
            <h2 className="text-xl font-semibold mb-2">Vos Messages</h2>
            <p>Sélectionnez une conversation dans la liste pour commencer à discuter.</p>
        </div>
    );
}
