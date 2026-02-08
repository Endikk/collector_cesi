"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, AlertCircle } from "lucide-react";
import BlurFade from "@/components/ui/blur-fade";
import { createItem, getCategories, State } from "@/lib/actions/items";
import { useFormStatus } from "react-dom";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Publication...
                </>
            ) : (
                "Publier l'annonce"
            )}
        </Button>
    );
}

export function SellPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [imageUrl, setImageUrl] = useState("");

    // Server Action State
    const initialState: State = { message: null, errors: {} };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - generic type issue in some next versions
    const [state, dispatch] = useActionState(createItem, initialState);

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    useEffect(() => {
        if (state.success) {
            router.push("/");
            router.refresh();
        }
    }, [state.success, router]);

    if (status === "loading") return (
        <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );

    // This is a fallback, but the page should already redirect on the server side
    if (!session) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

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
                        <form action={dispatch} className="space-y-6">
                            {state.message && !state.success && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    <p>{state.message}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="title">Titre de l&apos;objet</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="Ex: Figurine Star Wars 1977"
                                    required
                                    className="bg-background/50"
                                    aria-describedby="title-error"
                                />
                                {state.errors?.title && (
                                    <p id="title-error" className="text-sm text-red-500">
                                        {state.errors.title.join(", ")}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Catégorie</Label>
                                <Select name="categoryId" required>
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue placeholder="Sélectionner une catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {state.errors?.categoryId && (
                                    <p className="text-sm text-red-500">
                                        {state.errors.categoryId.join(", ")}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (min. 20 caractères)</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Détails sur l'état, l'année, provenance..."
                                    required
                                    className="min-h-[120px] bg-background/50"
                                />
                                {state.errors?.description && (
                                    <p className="text-sm text-red-500">
                                        {state.errors.description.join(", ")}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Prix (€)</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        required
                                        className="bg-background/50"
                                    />
                                    {state.errors?.price && (
                                        <p className="text-sm text-red-500">
                                            {state.errors.price.join(", ")}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="imageUrl">Image URL (Optionnel)</Label>
                                    <div className="relative">
                                        <Input
                                            id="imageUrl"
                                            name="imageUrl"
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="pl-9 bg-background/50"
                                        />
                                        <ImagePlus className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                    {state.errors?.imageUrl && (
                                        <p className="text-sm text-red-500">
                                            {state.errors.imageUrl.join(", ")}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {imageUrl && (
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                </div>
                            )}

                            <SubmitButton />
                        </form>
                    </CardContent>
                </Card>
            </BlurFade>
        </div>
    );
}
