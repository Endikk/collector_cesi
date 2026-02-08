'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, History } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PriceHistoryEntry {
  id: string;
  price: number;
  recordedAt: string;
}

interface PriceHistoryData {
  currentPrice: number;
  history: PriceHistoryEntry[];
}

interface PriceHistoryChartProps {
  itemId: string;
}

export function PriceHistoryChart({ itemId }: PriceHistoryChartProps) {
  const [data, setData] = useState<PriceHistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/items/${itemId}/price-history`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load price history:', error);
        setLoading(false);
      });
  }, [itemId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Chargement de l&apos;historique...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            Historique des prix
          </CardTitle>
          <CardDescription>
            Aucun changement de prix enregistré pour cet article
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Préparer les données pour le graphique (ordre chronologique)
  const chartData = [...data.history]
    .reverse()
    .map((entry) => ({
      date: format(new Date(entry.recordedAt), 'dd MMM', { locale: fr }),
      price: entry.price,
      fullDate: format(new Date(entry.recordedAt), 'PPpp', { locale: fr }),
    }));

  // Ajouter le prix actuel
  chartData.push({
    date: 'Actuel',
    price: data.currentPrice,
    fullDate: 'Prix actuel',
  });

  // Calculer les statistiques
  const oldestPrice = data.history[data.history.length - 1]?.price || data.currentPrice;
  const priceChange = data.currentPrice - oldestPrice;
  const priceChangePercent = ((priceChange / oldestPrice) * 100).toFixed(1);
  const isIncrease = priceChange > 0;

  const minPrice = Math.min(...chartData.map(d => d.price));
  const maxPrice = Math.max(...chartData.map(d => d.price));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="mr-2 h-5 w-5" />
          Historique des prix
        </CardTitle>
        <CardDescription>
          {data.history.length} changement(s) de prix enregistré(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Prix actuel</p>
            <p className="text-2xl font-bold">{data.currentPrice.toFixed(2)}€</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Prix min</p>
            <p className="text-2xl font-bold text-green-600">{minPrice.toFixed(2)}€</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Prix max</p>
            <p className="text-2xl font-bold text-red-600">{maxPrice.toFixed(2)}€</p>
          </div>
        </div>

        {/* Évolution globale */}
        {data.history.length > 0 && (
          <div className={`flex items-center justify-center p-3 mb-6 rounded-lg ${
            isIncrease ? 'bg-red-50' : 'bg-green-50'
          }`}>
            {isIncrease ? (
              <TrendingUp className="mr-2 h-5 w-5 text-red-500" />
            ) : (
              <TrendingDown className="mr-2 h-5 w-5 text-green-500" />
            )}
            <span className={`font-semibold ${isIncrease ? 'text-red-700' : 'text-green-700'}`}>
              {isIncrease ? '+' : ''}{priceChangePercent}% depuis le premier prix
            </span>
          </div>
        )}

        {/* Graphique */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[minPrice * 0.9, maxPrice * 1.1]}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip 
              formatter={(value: number | undefined) => value !== undefined ? [`${value.toFixed(2)}€`, 'Prix'] : ['N/A', 'Prix']}
              labelFormatter={(label, payload) => {
                const item = payload[0]?.payload;
                return item?.fullDate || label;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3665f3" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Liste de l'historique */}
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Détail des changements</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="text-sm font-medium">Prix actuel</span>
              <span className="font-bold text-blue-700">{data.currentPrice.toFixed(2)}€</span>
            </div>
            {data.history.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="text-sm text-muted-foreground">
                  {format(new Date(entry.recordedAt), 'PPp', { locale: fr })}
                </span>
                <span className="font-medium">{entry.price.toFixed(2)}€</span>
              </div>
            ))}
            {data.history.length > 5 && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                ... et {data.history.length - 5} autre(s) changement(s)
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
