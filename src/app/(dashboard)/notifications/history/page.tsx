'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NotificationLogTable } from '@/components/notifications/log-table';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { type NotificationFilterData } from '@/lib/validations/notifications';
import toast from 'react-hot-toast';

interface NotificationLog {
  id: string;
  notification_type: string;
  recipient_email: string;
  recipient_phone?: string;
  subject: string;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  retry_count: number;
  template?: {
    name: string;
    template_type: string;
  };
}

export default function NotificationHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<NotificationFilterData>({
    notification_type: 'all',
    status: 'all',
    start_date: undefined,
    end_date: undefined,
    template_type: undefined,
    search: undefined,
  });

  useEffect(() => {
    fetchNotificationLogs();
  }, [filters]);

  const fetchNotificationLogs = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (filters.notification_type !== 'all') params.append('notification_type', filters.notification_type);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.template_type) params.append('template_type', filters.template_type);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`${API_ENDPOINTS.NOTIFICATIONS.LOGS}?${params}`);
      setLogs(response.data.data || []);
    } catch (error: any) {
      toast.error(error.error || 'Failed to load notification history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendNotification = async (log: NotificationLog) => {
    try {
      await api.post(API_ENDPOINTS.NOTIFICATIONS.LOG_RESEND(log.id));
      toast.success('Notification resent successfully');
      fetchNotificationLogs(); // Refresh the list
    } catch (error: any) {
      toast.error(error.error || 'Failed to resend notification');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.notification_type !== 'all') params.append('notification_type', filters.notification_type);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.template_type) params.append('template_type', filters.template_type);
      if (filters.search) params.append('search', filters.search);

      await api.download(`${API_ENDPOINTS.NOTIFICATIONS.LOGS}export/?${params}`, 'notification-history.csv');
      toast.success('Notification history exported successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to export notification history');
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.notification_type !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.start_date) count++;
    if (filters.end_date) count++;
    if (filters.template_type) count++;
    if (filters.search) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/notifications')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notifications
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notification History</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your notification delivery history
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={fetchNotificationLogs}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={filters.search || ''}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
                
                {activeFilterCount > 0 && (
                  <Badge variant="secondary">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Select
                  value={filters.notification_type}
                  onValueChange={(value: any) => setFilters({ ...filters, notification_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Select
                  value={filters.status}
                  onValueChange={(value: any) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="opened">Opened</SelectItem>
                    <SelectItem value="clicked">Clicked</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Input
                  type="date"
                  value={filters.start_date || ''}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  placeholder="Start date"
                />
              </div>

              <div className="space-y-2">
                <Input
                  type="date"
                  value={filters.end_date || ''}
                  onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  placeholder="End date"
                />
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({
                    notification_type: 'all',
                    status: 'all',
                    start_date: undefined,
                    end_date: undefined,
                    template_type: undefined,
                    search: undefined,
                  })}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Logs */}
      <NotificationLogTable
        logs={logs}
        onResend={handleResendNotification}
        isLoading={isLoading}
      />
    </div>
  );
}