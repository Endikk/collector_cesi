'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  getUserInterests,
  createInterest,
  updateInterest,
  deleteInterest,
  getCategories,
  UserInterest,
  CreateInterestData,
  Category,
} from '@/app/actions/interests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';

export function InterestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInterest, setEditingInterest] = useState<UserInterest | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState<CreateInterestData>({
    keyword: '',
    minPrice: undefined,
    maxPrice: undefined,
    categoryId: undefined,
  });

  useEffect(() => {
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    loadData();
  }, [session, router]);

  const loadData = async () => {
    try {
      const [interestsData, categoriesData] = await Promise.all([
        getUserInterests(),
        getCategories(),
      ]);
      setInterests(interestsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (interest?: UserInterest) => {
    if (interest) {
      setEditingInterest(interest);
      setFormData({
        keyword: interest.keyword || '',
        minPrice: interest.minPrice,
        maxPrice: interest.maxPrice,
        categoryId: interest.categoryId || undefined,
      });
    } else {
      setEditingInterest(null);
      setFormData({
        keyword: '',
        minPrice: undefined,
        maxPrice: undefined,
        categoryId: undefined,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data: CreateInterestData = {
        keyword: formData.keyword || undefined,
        minPrice: formData.minPrice || undefined,
        maxPrice: formData.maxPrice || undefined,
        categoryId: formData.categoryId || undefined,
      };

      if (editingInterest) {
        await updateInterest(editingInterest.id, data);
      } else {
        await createInterest(data);
      }

      await loadData();
      setDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'intérêt');
    }
  };

  const handleDelete = async (interestId: string) => {
    if (!confirm('Supprimer cet intérêt ?')) return;

    try {
      await deleteInterest(interestId);
      await loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'intérêt');
    }
  };

  if (!session) return null;
  if (loading) {
    return (
      <div className="container mx-auto py-10 max-w-4xl">
        <p className="text-center">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mes Centres d&apos;Intérêt</h1>
          <p className="text-gray-500 mt-2">
            Configurez vos préférences pour recevoir des recommandations
            personnalisées
          </p>
        </div>
        <Link
          href="/profile"
          className="text-blue-600 hover:underline"
        >
          ← Retour au profil
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mes Intérêts ({interests.length})</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  Ajouter un intérêt
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingInterest
                      ? "Modifier l'intérêt"
                      : "Ajouter un intérêt"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="categoryId">Catégorie</Label>
                    <Select
                      value={formData.categoryId || ''}
                      onValueChange={(value) =>
                        setFormData({ ...formData, categoryId: value || undefined })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucune catégorie</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="keyword">Mot-clé</Label>
                    <Input
                      id="keyword"
                      type="text"
                      placeholder="ex: vintage, rare, collection..."
                      value={formData.keyword}
                      onChange={(e) =>
                        setFormData({ ...formData, keyword: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minPrice">Prix minimum (€)</Label>
                      <Input
                        id="minPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        value={formData.minPrice || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minPrice: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPrice">Prix maximum (€)</Label>
                      <Input
                        id="maxPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="1000"
                        value={formData.maxPrice || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxPrice: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingInterest ? 'Modifier' : 'Ajouter'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {interests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucun intérêt configuré. Ajoutez-en pour recevoir des
              recommandations personnalisées !
            </p>
          ) : (
            <div className="space-y-4">
              {interests.map((interest) => (
                <div
                  key={interest.id}
                  className="border rounded-lg p-4 flex items-start justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    {interest.category && (
                      <div className="text-sm font-semibold text-blue-600 mb-1">
                        {interest.category.name}
                      </div>
                    )}
                    {interest.keyword && (
                      <div className="text-gray-700 mb-1">
                        Mot-clé: <span className="font-medium">{interest.keyword}</span>
                      </div>
                    )}
                    {(interest.minPrice || interest.maxPrice) && (
                      <div className="text-sm text-gray-500">
                        Prix:{' '}
                        {interest.minPrice
                          ? `${interest.minPrice}€`
                          : '0€'}{' '}
                        -{' '}
                        {interest.maxPrice
                          ? `${interest.maxPrice}€`
                          : '∞'}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(interest)}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(interest.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Conseils</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            • <strong>Catégories:</strong> Recevez des recommandations basées
            sur vos catégories préférées
          </p>
          <p>
            • <strong>Mots-clés:</strong> Recherchez des objets spécifiques
            (ex: &quot;vintage&quot;, &quot;rare&quot;)
          </p>
          <p>
            • <strong>Prix:</strong> Définissez votre budget pour chaque intérêt
          </p>
          <p>
            • Vous pouvez combiner plusieurs critères par intérêt
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
