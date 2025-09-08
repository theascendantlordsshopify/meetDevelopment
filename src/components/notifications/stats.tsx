'use client';

import { Mail, MessageSquare, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface NotificationOverview {
  total_templates: number;
  active_templates: number;
  notifications_sent_today: number;
  delivery_rate: number;
  recent_failures: number;
  email_delivery_rate?: number;
  sms_delivery_rate?: number;
  open_rate?: number;
  click_rate?: number;
}

interface NotificationStatsProps {
  overview: NotificationOverview | null;
}

export function NotificationStats({ overview }: NotificationStatsProps) {
  if (!overview) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No statistics available yet. Statistics will appear here once you start sending notifications.
      </div>
    );
  }

  const getDeliveryRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Delivery Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Delivery Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getDeliveryRateColor(overview.delivery_rate)}`}>
              {overview.delivery_rate}%
            </div>
            <Progress value={overview.delivery_rate} className="mt-2" />
          </CardContent>
        </Card>

        {overview.email_delivery_rate !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email Delivery</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getDeliveryRateColor(overview.email_delivery_rate)}`}>
                {overview.email_delivery_rate}%
              </div>
              <Progress value={overview.email_delivery_rate} className="mt-2" />
            </CardContent>
          </Card>
        )}

        {overview.sms_delivery_rate !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SMS Delivery</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getDeliveryRateColor(overview.sms_delivery_rate)}`}>
                {overview.sms_delivery_rate}%
              </div>
              <Progress value={overview.sms_delivery_rate} className="mt-2" />
            </CardContent>
          </Card>
        )}

        {overview.open_rate !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email Open Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {overview.open_rate}%
              </div>
              <Progress value={overview.open_rate} className="mt-2" />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{overview.notifications_sent_today}</div>
              <div className="text-sm text-muted-foreground">Notifications Today</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold">{overview.active_templates}</div>
              <div className="text-sm text-muted-foreground">Active Templates</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{overview.recent_failures}</div>
              <div className="text-sm text-muted-foreground">Recent Failures</div>
            </div>
          </div>

          {/* Health Status */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">System Health</span>
              <Badge variant={
                overview.delivery_rate >= 95 ? 'default' :
                overview.delivery_rate >= 85 ? 'secondary' : 'destructive'
              }>
                {overview.delivery_rate >= 95 ? 'Excellent' :
                 overview.delivery_rate >= 85 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
            
            {overview.delivery_rate < 85 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Consider reviewing your notification templates and delivery settings to improve performance.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Template Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Template Performance</CardTitle>
          <CardDescription>
            Performance metrics by template type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Template performance analytics coming soon. This will show delivery rates, 
            open rates, and usage statistics for each template type.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}