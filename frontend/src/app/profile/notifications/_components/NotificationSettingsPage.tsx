'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences,
} from '@/app/actions/notification-preferences';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Bell, Mail, MessageSquare, ShoppingCart, Sparkles } from 'lucide-react';

interface SwitchProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function Switch({ id, checked, onCheckedChange }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? 'bg-blue-600' : 'bg-gray-300'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}

export function NotificationSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    loadPreferences();
  }, [session, router]);

  const loadPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [field]: value });
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      await updateNotificationPreferences({
        emailNewItem: preferences.emailNewItem,
        emailMatchingInterest: preferences.emailMatchingInterest,
        emailMessages: preferences.emailMessages,
        emailTransactions: preferences.emailTransactions,
        inAppNewItem: preferences.inAppNewItem,
        inAppMatchingInterest: preferences.inAppMatchingInterest,
        inAppMessages: preferences.inAppMessages,
        inAppTransactions: preferences.inAppTransactions,
      });
      alert('Préférences sauvegardées avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des préférences');
    } finally {
      setSaving(false);
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

  if (!preferences) {
    return (
      <div className="container mx-auto py-10 max-w-4xl">
        <p className="text-center text-red-600">
          Erreur lors du chargement des préférences
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Préférences de Notifications
          </h1>
          <p className="text-gray-500 mt-2">
            Configurez comment vous souhaitez être notifié
          </p>
        </div>
        <Link href="/profile" className="text-blue-600 hover:underline">
          ← Retour au profil
        </Link>
      </div>

      <div className="space-y-6">
        {/* Nouveaux articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Nouveaux articles
            </CardTitle>
            <CardDescription>
              Recevez des notifications pour tous les nouveaux articles publiés sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="inAppNewItem" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications dans l&apos;application
              </Label>
              <Switch
                id="inAppNewItem"
                checked={preferences.inAppNewItem}
                onCheckedChange={(val) => handleToggle('inAppNewItem', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNewItem" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Notifications par email
              </Label>
              <Switch
                id="emailNewItem"
                checked={preferences.emailNewItem}
                onCheckedChange={(val) => handleToggle('emailNewItem', val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Articles correspondant aux intérêts */}
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Articles correspondant à vos intérêts
            </CardTitle>
            <CardDescription>
              Recevez des alertes pour les articles qui correspondent à vos{' '}
              <Link href="/profile/interests" className="text-purple-600 hover:underline font-semibold">
                centres d&apos;intérêt
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="inAppMatchingInterest" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications dans l&apos;application
              </Label>
              <Switch
                id="inAppMatchingInterest"
                checked={preferences.inAppMatchingInterest}
                onCheckedChange={(val) => handleToggle('inAppMatchingInterest', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="emailMatchingInterest" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Notifications par email
              </Label>
              <Switch
                id="emailMatchingInterest"
                checked={preferences.emailMatchingInterest}
                onCheckedChange={(val) => handleToggle('emailMatchingInterest', val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Messages
            </CardTitle>
            <CardDescription>
              Notifications pour les nouveaux messages dans vos conversations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="inAppMessages" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications dans l&apos;application
              </Label>
              <Switch
                id="inAppMessages"
                checked={preferences.inAppMessages}
                onCheckedChange={(val) => handleToggle('inAppMessages', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="emailMessages" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Notifications par email
              </Label>
              <Switch
                id="emailMessages"
                checked={preferences.emailMessages}
                onCheckedChange={(val) => handleToggle('emailMessages', val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
              Transactions
            </CardTitle>
            <CardDescription>
              Notifications pour vos achats et ventes (paiements, livraisons, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="inAppTransactions" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications dans l&apos;application
              </Label>
              <Switch
                id="inAppTransactions"
                checked={preferences.inAppTransactions}
                onCheckedChange={(val) => handleToggle('inAppTransactions', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="emailTransactions" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Notifications par email
              </Label>
              <Switch
                id="emailTransactions"
                checked={preferences.emailTransactions}
                onCheckedChange={(val) => handleToggle('emailTransactions', val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push('/profile')}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
          </Button>
        </div>
      </div>
    </div>
  );
}
