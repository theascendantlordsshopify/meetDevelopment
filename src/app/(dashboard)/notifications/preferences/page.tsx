'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Mail, MessageSquare, Clock, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationPreferencesForm } from '@/components/notifications/preferences-form';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { type NotificationPreferenceData } from '@/lib/validations/notifications';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/v1/notifications/preferences/');
      setPreferences(response.data.data);
    } catch (error: any) {
      toast.error(error.error || 'Failed to load notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePreferences = async (data: NotificationPreferenceData) => {
    try {
      const response = await api.put('/api/v1/notifications/preferences/', data);
      setPreferences(response.data.data);
      toast.success('Notification preferences updated successfully');
    } catch (error: any) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground mt-2">
            Configure how and when you receive notifications
          </p>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Notifications</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {preferences ? Object.entries(preferences).filter(([key, value]) => 
                key.includes('_email') && value === true
              ).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">types enabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Notifications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {preferences ? Object.entries(preferences).filter(([key, value]) => 
                key.includes('_sms') && value === true
              ).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">types enabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reminder Timing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {preferences?.reminder_minutes_before || 60}m
            </div>
            <p className="text-xs text-muted-foreground">before meetings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Do Not Disturb</CardTitle>
            <Moon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {preferences?.dnd_enabled ? 'ON' : 'OFF'}
            </div>
            <p className="text-xs text-muted-foreground">
              {preferences?.dnd_enabled 
                ? `${preferences.dnd_start_time} - ${preferences.dnd_end_time}`
                : 'disabled'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {preferences && (
        <NotificationPreferencesForm
          initialData={preferences}
          onSubmit={handleUpdatePreferences}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}