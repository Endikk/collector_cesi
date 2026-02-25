'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Image as ImageIcon, FileText, DollarSign, Package } from 'lucide-react';

interface ValidationRules {
  title: {
    minLength: number;
    required: boolean;
  };
  description: {
    minLength: number;
    required: boolean;
  };
  images: {
    minCount: number;
    required: boolean;
    formats: string[];
  };
  price: {
    min: number;
    max: number;
    required: boolean;
  };
  shippingCost: {
    min: number;
    max: number;
  };
  categoryId: {
    required: boolean;
  };
}

export default function ValidationRulesCard() {
  const [rules, setRules] = useState<ValidationRules | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/validation/rules')
      .then((res) => res.json())
      .then((data) => {
        setRules(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load validation rules:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Chargement des règles...</p>
        </CardContent>
      </Card>
    );
  }

  if (!rules) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
          Règles de Validation
        </CardTitle>
        <CardDescription>
          Votre article doit respecter ces critères pour être publié automatiquement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Les articles qui ne respectent pas tous les critères seront mis en attente de vérification manuelle ou rejetés automatiquement.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Titre */}
          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Titre</h4>
                {rules.title.required && (
                  <Badge variant="destructive" className="text-xs">
                    Obligatoire
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Minimum {rules.title.minLength} caractères
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Soyez précis et descriptif
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Description</h4>
                {rules.description.required && (
                  <Badge variant="destructive" className="text-xs">
                    Obligatoire
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Minimum {rules.description.minLength} caractères
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Décrivez l&apos;état, l&apos;historique et les défauts éventuels
              </p>
            </div>
          </div>

          {/* Photos */}
          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <ImageIcon className="h-5 w-5 text-purple-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Photos</h4>
                {rules.images.required && (
                  <Badge variant="destructive" className="text-xs">
                    Obligatoire
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Minimum {rules.images.minCount} photos
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Formats acceptés : {rules.images.formats.join(', ')}
              </p>
            </div>
          </div>

          {/* Prix */}
          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Prix</h4>
                {rules.price.required && (
                  <Badge variant="destructive" className="text-xs">
                    Obligatoire
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Entre {rules.price.min}€ et {rules.price.max.toLocaleString()}€
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Soyez réaliste et cohérent avec le marché
              </p>
            </div>
          </div>

          {/* Frais de port */}
          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <Package className="h-5 w-5 text-orange-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Frais de port</h4>
                <Badge variant="secondary" className="text-xs">
                  Recommandé
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Entre {rules.shippingCost.min}€ et {rules.shippingCost.max}€
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Indiquez les frais de port réels
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-2 flex items-center">
            <XCircle className="mr-2 h-4 w-4 text-red-500" />
            Contenu interdit
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Emails et numéros de téléphone</li>
            <li>• Liens externes (URLs)</li>
            <li>• Contrefaçons, copies, replicas</li>
            <li>• Articles interdits (armes, drogues, etc.)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
