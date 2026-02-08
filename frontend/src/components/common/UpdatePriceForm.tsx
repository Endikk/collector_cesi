'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DollarSign, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FraudAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  message: string;
}

interface PriceValidationResult {
  success: boolean;
  fraudAlerts?: FraudAlert[];
  requiresReview?: boolean;
  message?: string;
}

interface UpdatePriceFormProps {
  itemId: string;
  currentPrice: number;
  onPriceUpdated?: () => void;
}

export function UpdatePriceForm({ itemId, currentPrice, onPriceUpdated }: UpdatePriceFormProps) {
  const [price, setPrice] = useState(currentPrice);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceValidationResult | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (price === currentPrice) {
      toast({
        title: 'Aucun changement',
        description: 'Le prix est identique au prix actuel',
        variant: 'default',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/items/${itemId}/price`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du prix');
      }

      const data = await response.json();
      setResult(data);

      if (data.requiresReview) {
        toast({
          title: '⚠️ Révision requise',
          description: 'Changement de prix détecté comme suspect. Une vérification manuelle peut être nécessaire.',
          variant: 'destructive',
        });
      } else if (data.fraudAlerts && data.fraudAlerts.length > 0) {
        toast({
          title: '⚠️ Alertes détectées',
          description: `${data.fraudAlerts.length} alerte(s) générée(s) pour ce changement de prix`,
          variant: 'default',
        });
      } else {
        toast({
          title: '✅ Prix mis à jour',
          description: 'Le prix a été mis à jour avec succès',
        });
      }

      if (onPriceUpdated) {
        onPriceUpdated();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Impossible de mettre \u00e0 jour le prix';
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const priceChange = price - currentPrice;
  const priceChangePercent = currentPrice > 0 ? ((priceChange / currentPrice) * 100).toFixed(1) : 0;
  const isIncrease = priceChange > 0;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4" />;
      case 'MEDIUM':
      case 'LOW':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5" />
          Modifier le prix
        </CardTitle>
        <CardDescription>
          Prix actuel : <span className="font-bold">{currentPrice.toFixed(2)}€</span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Nouveau prix (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              required
            />
          </div>

          {price !== currentPrice && (
            <Alert className={isIncrease ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <div className="flex items-center">
                {isIncrease ? (
                  <TrendingUp className="h-4 w-4 text-red-500 mr-2" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500 mr-2" />
                )}
                <AlertDescription>
                  <span className={`font-semibold ${isIncrease ? 'text-red-700' : 'text-green-700'}`}>
                    {isIncrease ? '+' : ''}{priceChange.toFixed(2)}€ ({isIncrease ? '+' : ''}{priceChangePercent}%)
                  </span>
                </AlertDescription>
              </div>
            </Alert>
          )}

          {result && (
            <div className="space-y-3 mt-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Prix mis à jour avec succès
                </AlertDescription>
              </Alert>

              {result.fraudAlerts && result.fraudAlerts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Alertes de sécurité détectées :</h4>
                  {result.fraudAlerts.map((alert: FraudAlert, index: number) => (
                    <Alert key={index} className={getSeverityColor(alert.severity)}>
                      <div className="flex items-start">
                        {getSeverityIcon(alert.severity)}
                        <div className="ml-2 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              {alert.severity}
                            </Badge>
                          </div>
                          <AlertDescription className="text-sm">
                            {alert.message}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}

              {result.requiresReview && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Révision manuelle requise</strong>
                    <p className="text-sm mt-1">
                      Ce changement de prix a été signalé pour vérification par notre équipe.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setPrice(currentPrice);
              setResult(null);
            }}
          >
            Réinitialiser
          </Button>
          <Button type="submit" disabled={loading || price === currentPrice}>
            {loading ? 'Mise à jour...' : 'Mettre à jour le prix'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
