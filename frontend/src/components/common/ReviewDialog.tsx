"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { createReview } from "@/app/actions/reviews";
import { useRouter } from "next/navigation";

interface ReviewDialogProps {
    transactionId: string;
    otherPartyName: string;
    type: "sale" | "purchase";
}

export function ReviewDialog({ transactionId, otherPartyName, type }: ReviewDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.warning("Veuillez sélectionner une note");
            return;
        }

        setSubmitting(true);
        const result = await createReview(transactionId, rating, comment);
        
        if (result.success) {
            setOpen(false);
            router.refresh();
        } else {
            toast.error(result.message || "Erreur lors de la notation");
        }
        setSubmitting(false);
    };

    const roleText = type === "purchase" ? "vendeur" : "acheteur";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Noter
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Noter {roleText}</DialogTitle>
                    <DialogDescription>
                        Donnez votre avis sur votre expérience avec {otherPartyName}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-medium">Votre note</p>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${
                                            star <= (hoveredRating || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm text-muted-foreground">
                                {rating} étoile{rating > 1 ? "s" : ""}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="comment" className="text-sm font-medium">
                            Commentaire (optionnel)
                        </label>
                        <Textarea
                            id="comment"
                            placeholder="Partagez votre expérience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                        className="w-full"
                    >
                        {submitting ? "Envoi..." : "Soumettre l'avis"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
