'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Store, Edit, Trash2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface Shop {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  createdAt: string;
  items: unknown[];
  _count: {
    items: number;
  };
}

export default function MyShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingShop, setEditingShop] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
  });

  const loadShops = async () => {
    try {
      const response = await fetch('/api/shops/my-shops');
      if (response.ok) {
        const data = await response.json();
        setShops(data);
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos boutiques',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom de la boutique est obligatoire',
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = editingShop
        ? `/api/shops/${editingShop}`
        : '/api/shops';
      const method = editingShop ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: editingShop
            ? 'Boutique mise à jour'
            : 'Boutique créée avec succès',
        });
        setFormData({ name: '', description: '', logo: '' });
        setIsCreating(false);
        setEditingShop(null);
        loadShops();
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la boutique',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (shop: Shop) => {
    setFormData({
      name: shop.name,
      description: shop.description || '',
      logo: shop.logo || '',
    });
    setEditingShop(shop.id);
    setIsCreating(true);
  };

  const handleDelete = async (shopId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/shops/${shopId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Boutique supprimée',
        });
        loadShops();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de supprimer la boutique',
        variant: 'destructive',
      });
    }
  };

  const cancelEdit = () => {
    setFormData({ name: '', description: '', logo: '' });
    setIsCreating(false);
    setEditingShop(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Boutiques</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos boutiques virtuelles et organisez vos articles
          </p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Créer une boutique
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingShop ? 'Modifier la boutique' : 'Nouvelle boutique'}
            </CardTitle>
            <CardDescription>
              Créez une boutique virtuelle pour organiser vos articles
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nom de la boutique <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ma Collection Vintage"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre boutique et les types d'articles que vous vendez"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">URL du logo</Label>
                <Input
                  id="logo"
                  type="url"
                  placeholder="https://example.com/logo.jpg"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Annuler
              </Button>
              <Button type="submit">
                {editingShop ? 'Mettre à jour' : 'Créer la boutique'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {shops.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucune boutique pour le moment
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Créez votre première boutique pour commencer à vendre
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer ma première boutique
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <Card key={shop.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {shop.logo && (
                      <div className="relative h-12 w-12 rounded-lg mb-2">
                        <Image
                          src={shop.logo}
                          alt={shop.name}
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                    <CardTitle className="text-xl">{shop.name}</CardTitle>
                    {shop.description && (
                      <CardDescription className="mt-2">
                        {shop.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Package className="mr-2 h-4 w-4" />
                  <span>{shop._count.items} article(s)</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(shop)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(shop.id)}
                  disabled={shop._count.items > 0}
                  title={
                    shop._count.items > 0
                      ? 'Supprimez d\'abord tous les articles'
                      : 'Supprimer la boutique'
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
