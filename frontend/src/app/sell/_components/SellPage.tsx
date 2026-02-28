"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, AlertCircle, X, Info } from "lucide-react";
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
    const [imageBase64, setImageBase64] = useState("");
    const [imageFileName, setImageFileName] = useState("");
    const [priceValue, setPriceValue] = useState("");

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
                                    value={priceValue}
                                    onChange={(e) => setPriceValue(e.target.value)}
                                />
                                {state.errors?.price && (
                                    <p className="text-sm text-red-500">
                                        {state.errors.price.join(", ")}
                                    </p>
                                )}
                                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 p-3 rounded-md text-sm">
                                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                                    <div>
                                        <p>Collector prélève une commission de 5% sur chaque vente.</p>
                                        {priceValue && parseFloat(priceValue) > 0 && (
                                            <p className="font-medium mt-1">
                                                Pour un prix de {parseFloat(priceValue).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}, vous recevrez{' '}
                                                {(parseFloat(priceValue) * 0.95).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} après commission.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Image file upload */}
                            <div className="space-y-2">
                                <Label>Photo (Optionnel)</Label>
                                {/* Hidden field carrying base64 value to the server action */}
                                <input type="hidden" name="imageUrl" value={imageBase64} />

                                {imageBase64 ? (
                                    <div className="relative">
                                        <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imageBase64}
                                                alt="Aperçu de l'image"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-muted-foreground truncate max-w-[calc(100%-3rem)]">
                                                {imageFileName}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => { setImageBase64(""); setImageFileName(""); }}
                                                className="p-1 rounded hover:bg-muted"
                                                aria-label="Supprimer l'image"
                                            >
                                                <X className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="imageFile"
                                        className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-border bg-background/50 cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">Cliquez pour ajouter une photo</span>
                                        <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP — max 5 Mo</span>
                                        <input
                                            id="imageFile"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            className="sr-only"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                if (file.size > 5 * 1024 * 1024) {
                                                    alert("L'image ne doit pas dépasser 5 Mo.");
                                                    return;
                                                }
                                                setImageFileName(file.name);
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    setImageBase64(ev.target?.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }}
                                        />
                                    </label>
                                )}
                                {state.errors?.imageUrl && (
                                    <p className="text-sm text-red-500">
                                        {state.errors.imageUrl.join(", ")}
                                    </p>
                                )}
                            </div>

                            <SubmitButton />
                        </form>
                    </CardContent>
                </Card>
            </BlurFade>
        </div>
    );
}
