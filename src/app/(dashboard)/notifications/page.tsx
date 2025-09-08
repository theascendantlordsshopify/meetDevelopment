'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Bell, BarChart3, Settings, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { NotificationTemplateCard } from '@/components/notifications/template-card';
import { NotificationLogTable } from '@/components/notifications/log-table';
import { NotificationStats } from '@/components/notifications/stats';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface NotificationTemplate {
  id: string;
  name: string;
  template_type: string;
  notification_type: string;
  subject?: string;
  message: string;
  is_active: boolean;
  is_default: boolean;
  usage_count?: number;
  last_used?: string;
}

interface NotificationLog {
  id: string;
  notification_type: string;
  recipient_email: string;
  recipient_phone?: string;
  subject: string;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  template?: {
    name: string;
    template_type: string;
  };
}

interface NotificationOverview {
  total_templates: number;
  active_templates: number;
  notifications_sent_today: number;
  delivery_rate: number;
  recent_failures: number;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<NotificationOverview | null>(null);
  const [recentTemplates, setRecentTemplates] = useState<NotificationTemplate[]>([]);
  const [recentLogs, setRecentLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotificationOverview();
  }, []);

  const fetchNotificationOverview = async () => {
    try {
      setIsLoading(true);
      const [statsRes, templatesRes, logsRes] = await Promise.all([
        api.get('/api/v1/notifications/stats/'),
        api.get('/api/v1/notifications/templates/?limit=5'),
        api.get('/api/v1/notifications/logs/?limit=10'),
      ]);

      setOverview(statsRes.data.data);
      setRecentTemplates(templatesRes.data.data || []);
      setRecentLogs(logsRes.data.data || []);
    } catch (error: any) {
      toast.error(error.error || 'Failed to load notifications overview');
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-2">
              Manage your automated communication and notification preferences
            </p>
          </div>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href="/notifications/preferences">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Link>
            </Button>
            <Button asChild>
              <Link href="/notifications/templates">
                <Mail className="h-4 w-4 mr-2" />
                Manage Templates
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.total_templates}</div>
              <p className="text-xs text-muted-foreground">
                {overview.active_templates} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.notifications_sent_today}</div>
              <p className="text-xs text-muted-foreground">
                notifications sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.delivery_rate}%</div>
              <p className="text-xs text-muted-foreground">
                successful delivery
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Failures</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overview.recent_failures}</div>
              <p className="text-xs text-muted-foreground">
                in last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Failures Alert */}
      {overview && overview.recent_failures > 0 && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {overview.recent_failures} notification{overview.recent_failures > 1 ? 's' : ''} failed 
            to deliver in the last 24 hours. 
            <Link href="/notifications/history" className="underline ml-1">
              View details
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Notification Templates</h2>
              <p className="text-muted-foreground">
                Customize your automated communication templates
              </p>
            </div>
            <Button asChild>
              <Link href="/notifications/templates/new">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Link>
            </Button>
          </div>

          {recentTemplates.length === 0 ? (
            <Alert>
              <AlertDescription>
                No templates created yet. Create your first template to customize your automated communications.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTemplates.map((template) => (
                <NotificationTemplateCard
                  key={template.id}
                  template={template}
                  onEdit={(t) => window.location.href = `/notifications/templates/${t.id}/edit`}
                  onTest={(t) => toast.info('Test functionality coming soon')}
                  onDelete={(t) => toast.info('Delete functionality coming soon')}
                />
              ))}
            </div>
          )}

          <div className="text-center">
            <Button asChild variant="outline">
              <Link href="/notifications/templates">
                View All Templates
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Recent Activity</h2>
              <p className="text-muted-foreground">
                Latest notification delivery activity
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/notifications/history">
                View Full History
              </Link>
            </Button>
          </div>

          <NotificationLogTable
            logs={recentLogs}
            onResend={(log) => toast.info('Resend functionality coming soon')}
            showPagination={false}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Notification Analytics</h2>
            <p className="text-muted-foreground">
              Performance metrics and delivery insights
            </p>
          </div>

          <NotificationStats overview={overview} />
        </TabsContent>
      </Tabs>
    </div>
  );
}