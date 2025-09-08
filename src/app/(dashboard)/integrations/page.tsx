'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Video, Webhook, Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { IntegrationCard } from '@/components/integrations/integration-card';
import { OAuthConnector } from '@/components/integrations/oauth-connector';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import toast from 'react-hot-toast';

interface CalendarIntegration {
  id: string;
  provider: string;
  provider_email: string;
  last_sync_at?: string;
  sync_errors: number;
  is_active: boolean;
  sync_enabled: boolean;
}

interface VideoIntegration {
  id: string;
  provider: string;
  provider_email: string;
  api_calls_today: number;
  rate_limit_reset_at?: string;
  is_active: boolean;
  auto_generate_links: boolean;
}

interface WebhookIntegration {
  id: string;
  name: string;
  webhook_url: string;
  events: string[];
  is_active: boolean;
  last_delivery_at?: string;
  delivery_success_rate: number;
}

interface IntegrationHealth {
  overall_status: 'healthy' | 'warning' | 'error';
  calendar_integrations: number;
  video_integrations: number;
  webhook_integrations: number;
  recent_errors: number;
  sync_health_score: number;
}

type ConnectingProvider = {
  provider: 'google' | 'outlook' | 'zoom' | 'microsoft_teams';
  type: 'calendar' | 'video';
} | null;

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [calendarIntegrations, setCalendarIntegrations] = useState<CalendarIntegration[]>([]);
  const [videoIntegrations, setVideoIntegrations] = useState<VideoIntegration[]>([]);
  const [webhookIntegrations, setWebhookIntegrations] = useState<WebhookIntegration[]>([]);
  const [health, setHealth] = useState<IntegrationHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<ConnectingProvider>(null);

  useEffect(() => {
    fetchIntegrations();
    fetchHealth();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const [calendarRes, videoRes, webhookRes] = await Promise.all([
        api.get(API_ENDPOINTS.INTEGRATIONS.CALENDAR),
        api.get(API_ENDPOINTS.INTEGRATIONS.VIDEO),
        api.get(API_ENDPOINTS.INTEGRATIONS.WEBHOOKS),
      ]);

      setCalendarIntegrations(calendarRes.data.data || []);
      setVideoIntegrations(videoRes.data.data || []);
      setWebhookIntegrations(webhookRes.data.data || []);
    } catch (error: any) {
      toast.error(error.error || 'Failed to load integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.INTEGRATIONS.HEALTH);
      setHealth(response.data.data);
    } catch (error: any) {
      console.error('Failed to load integration health:', error);
    }
  };

  const handleSyncCalendar = async (integration: CalendarIntegration) => {
    try {
      await api.post(`${API_ENDPOINTS.INTEGRATIONS.CALENDAR}${integration.id}/refresh/`);
      toast.success('Calendar sync initiated');
      fetchIntegrations(); // Refresh data
    } catch (error: any) {
      toast.error(error.error || 'Failed to sync calendar');
    }
  };

  const handleDisconnectIntegration = async (integration: any, type: 'calendar' | 'video' | 'webhook') => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;

    try {
      const endpoint = type === 'calendar' ? API_ENDPOINTS.INTEGRATIONS.CALENDAR :
                     type === 'video' ? API_ENDPOINTS.INTEGRATIONS.VIDEO :
                     API_ENDPOINTS.INTEGRATIONS.WEBHOOKS;
      
      await api.delete(`${endpoint}${integration.id}/`);
      toast.success('Integration disconnected successfully');
      fetchIntegrations();
      fetchHealth();
    } catch (error: any) {
      toast.error(error.error || 'Failed to disconnect integration');
    }
  };

  const handleConnectSuccess = () => {
    setConnectingProvider(null);
    fetchIntegrations();
    fetchHealth();
    toast.success('Integration connected successfully!');
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      </div>
    );
  }

  if (connectingProvider) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <OAuthConnector
          provider={connectingProvider.provider}
          integrationType={connectingProvider.type}
          onSuccess={handleConnectSuccess}
          onCancel={() => setConnectingProvider(null)}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your favorite tools to streamline your scheduling workflow
        </p>
      </div>

      {/* Health Overview */}
      {health && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Integration Health</span>
              <Badge variant={
                health.overall_status === 'healthy' ? 'default' :
                health.overall_status === 'warning' ? 'secondary' : 'destructive'
              }>
                {health.overall_status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{health.calendar_integrations}</div>
                <div className="text-sm text-muted-foreground">Calendar</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{health.video_integrations}</div>
                <div className="text-sm text-muted-foreground">Video</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{health.webhook_integrations}</div>
                <div className="text-sm text-muted-foreground">Webhooks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{health.sync_health_score}%</div>
                <div className="text-sm text-muted-foreground">Sync Health</div>
              </div>
            </div>

            {health.recent_errors > 0 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {health.recent_errors} integration error{health.recent_errors > 1 ? 's' : ''} in the last 24 hours. 
                  Check individual integrations for details.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Calendar Integrations */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Calendar Integrations</h2>
              <p className="text-muted-foreground">
                Sync your calendars to automatically block busy times
              </p>
            </div>
            <Button onClick={() => setConnectingProvider({ provider: 'google', type: 'calendar' })}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Calendar
            </Button>
          </div>

          {calendarIntegrations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Calendar Connected</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your calendar to automatically sync busy times and create events for bookings.
                </p>
                <div className="flex justify-center space-x-2">
                  <Button onClick={() => setConnectingProvider({ provider: 'google', type: 'calendar' })}>
                    Connect Google Calendar
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setConnectingProvider({ provider: 'outlook', type: 'calendar' })}
                  >
                    Connect Outlook
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calendarIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  type="calendar"
                  onSync={handleSyncCalendar}
                  onDisconnect={(int) => handleDisconnectIntegration(int, 'calendar')}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Video Integrations */}
        <TabsContent value="video" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Video Integrations</h2>
              <p className="text-muted-foreground">
                Automatically generate meeting links for video calls
              </p>
            </div>
            <Button onClick={() => setConnectingProvider({ provider: 'zoom', type: 'video' })}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Video Service
            </Button>
          </div>

          {videoIntegrations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Video Service Connected</h3>
                <p className="text-muted-foreground mb-4">
                  Connect a video service to automatically generate meeting links for your bookings.
                </p>
                <div className="flex justify-center space-x-2">
                  <Button onClick={() => setConnectingProvider({ provider: 'zoom', type: 'video' })}>
                    Connect Zoom
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setConnectingProvider({ provider: 'google', type: 'video' })}
                  >
                    Connect Google Meet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videoIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  type="video"
                  onDisconnect={(int) => handleDisconnectIntegration(int, 'video')}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Webhook Integrations */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Webhook Integrations</h2>
              <p className="text-muted-foreground">
                Send booking data to external services via webhooks
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </div>

          {webhookIntegrations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Webhooks Configured</h3>
                <p className="text-muted-foreground mb-4">
                  Create webhooks to send booking data to your external systems and tools.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {webhookIntegrations.map((webhook) => (
                <Card key={webhook.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{webhook.name}</h3>
                        <p className="text-sm text-muted-foreground">{webhook.webhook_url}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                            {webhook.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {webhook.events.length} event{webhook.events.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{webhook.delivery_success_rate}%</div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}