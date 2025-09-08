'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Settings, 
  Unlink,
  Calendar,
  Video,
  Webhook
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Integration {
  id: string;
  provider: string;
  provider_email: string;
  last_sync_at?: string;
  sync_errors: number;
  is_active: boolean;
  sync_enabled?: boolean;
  api_calls_today?: number;
  rate_limit_reset_at?: string;
}

interface IntegrationCardProps {
  integration: Integration;
  type: 'calendar' | 'video' | 'webhook';
  onSync?: (integration: Integration) => void;
  onSettings?: (integration: Integration) => void;
  onDisconnect?: (integration: Integration) => void;
  isLoading?: boolean;
}

export function IntegrationCard({
  integration,
  type,
  onSync,
  onSettings,
  onDisconnect,
  isLoading = false,
}: IntegrationCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const getProviderInfo = (provider: string) => {
    const providers = {
      google: { name: 'Google', color: 'bg-blue-500', icon: '🔵' },
      outlook: { name: 'Microsoft', color: 'bg-blue-600', icon: '🔷' },
      apple: { name: 'Apple', color: 'bg-gray-800', icon: '🍎' },
      zoom: { name: 'Zoom', color: 'bg-blue-500', icon: '📹' },
      google_meet: { name: 'Google Meet', color: 'bg-green-500', icon: '📞' },
      microsoft_teams: { name: 'Teams', color: 'bg-purple-500', icon: '👥' },
      webex: { name: 'Webex', color: 'bg-green-600', icon: '🎥' },
    };
    return providers[provider as keyof typeof providers] || { name: provider, color: 'bg-gray-500', icon: '🔗' };
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'calendar': return <Calendar className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'webhook': return <Webhook className="h-5 w-5" />;
    }
  };

  const getHealthStatus = () => {
    if (!integration.is_active) return { status: 'inactive', color: 'text-gray-500', icon: XCircle };
    if (integration.sync_errors > 0) return { status: 'error', color: 'text-red-500', icon: XCircle };
    return { status: 'healthy', color: 'text-green-500', icon: CheckCircle };
  };

  const handleSync = async () => {
    if (!onSync) return;
    
    setIsSyncing(true);
    try {
      await onSync(integration);
    } finally {
      setIsSyncing(false);
    }
  };

  const providerInfo = getProviderInfo(integration.provider);
  const health = getHealthStatus();
  const HealthIcon = health.icon;

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      !integration.is_active && 'opacity-60'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white', providerInfo.color)}>
              {getTypeIcon()}
            </div>
            <div>
              <CardTitle className="text-lg">{providerInfo.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{integration.provider_email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <HealthIcon className={cn('h-5 w-5', health.color)} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onSync && (
                  <DropdownMenuItem onClick={handleSync} disabled={isSyncing}>
                    <RefreshCw className={cn('h-4 w-4 mr-2', isSyncing && 'animate-spin')} />
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </DropdownMenuItem>
                )}
                {onSettings && (
                  <DropdownMenuItem onClick={() => onSettings(integration)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                )}
                {onDisconnect && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDisconnect(integration)}
                      className="text-destructive"
                    >
                      <Unlink className="h-4 w-4 mr-2" />
                      Disconnect
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={integration.is_active ? 'default' : 'secondary'}>
              {integration.is_active ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          {type === 'calendar' && integration.last_sync_at && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Sync</span>
              <span className="text-sm text-muted-foreground">
                {format(new Date(integration.last_sync_at), 'MMM d, h:mm a')}
              </span>
            </div>
          )}

          {type === 'video' && integration.api_calls_today !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Calls Today</span>
              <span className="text-sm text-muted-foreground">
                {integration.api_calls_today}/1000
              </span>
            </div>
          )}
        </div>

        {/* Error Information */}
        {integration.sync_errors > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {integration.sync_errors} sync error{integration.sync_errors > 1 ? 's' : ''} detected. 
              Check settings or try reconnecting.
            </AlertDescription>
          </Alert>
        )}

        {/* Sync Status for Calendar */}
        {type === 'calendar' && integration.sync_enabled !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span>Auto Sync</span>
            <Badge variant={integration.sync_enabled ? 'default' : 'secondary'}>
              {integration.sync_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}