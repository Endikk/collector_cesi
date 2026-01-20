"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2 } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";

export default function SellPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);

    if (status === "loading") return (
        <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );

    if (!session) {
        router.push("/auth/login");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, price, imageUrl }),
            });

            if (res.ok) {
                router.push("/");
                router.refresh();
            } else {
                alert("Erreur lors de la création de l'annonce");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-10 px-4">
            <BlurFade delay={0.1}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent w-fit">
                            Vendre un objet
                        </CardTitle>
                        <CardDescription>
                            Remplissez les détails ci-dessous pour publier votre annonce.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Titre de l'objet</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    placeholder="Ex: Figurine Star Wars 1977"
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    placeholder="Détails sur l'état, l'année, provenance..."
                                    className="min-h-[120px] bg-background/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Prix (€)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image">Image URL (Optionnel)</Label>
                                    <div className="relative">
                                        <Input
                                            id="image"
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="pl-9 bg-background/50"
                                        />
                                        <ImagePlus className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            {imageUrl && (
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Publication...
                                    </>
                                ) : (
                                    "Publier l'annonce"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </BlurFade>
        </div>
    );
}
