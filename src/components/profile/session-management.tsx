'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Monitor, Smartphone, Tablet, MapPin, Clock, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import toast from 'react-hot-toast';

interface UserSession {
  id: string;
  device_type: string;
  device_name: string;
  browser_name: string;
  browser_version: string;
  os_name: string;
  os_version: string;
  ip_address: string;
  location: string;
  is_current: boolean;
  created_at: string;
  last_activity: string;
}

export function SessionManagement() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/v1/users/sessions/');
      setSessions(response.data.data || []);
    } catch (error: any) {
      toast.error(error.error || 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      setRevokingSession(sessionId);
      await api.post(`/api/v1/users/sessions/${sessionId}/revoke/`);
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Session revoked successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to revoke session');
    } finally {
      setRevokingSession(null);
    }
  };

  const revokeAllSessions = async () => {
    try {
      setRevokingAll(true);
      await api.post('/api/v1/users/sessions/revoke-all/');
      // Keep only current session
      setSessions(sessions.filter(s => s.is_current));
      toast.success('All other sessions revoked successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to revoke sessions');
    } finally {
      setRevokingAll(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy at h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="spinner w-6 h-6" />
        <span className="ml-2">Loading sessions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Active Sessions</span>
              </CardTitle>
              <CardDescription>
                Manage your active login sessions across different devices
              </CardDescription>
            </div>
            {sessions.filter(s => !s.is_current).length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Revoke All Others
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Revoke All Other Sessions</DialogTitle>
                    <DialogDescription>
                      This will log you out of all other devices and browsers. Your current session will remain active.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      onClick={revokeAllSessions}
                      disabled={revokingAll}
                    >
                      {revokingAll ? 'Revoking...' : 'Revoke All Others'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <Alert>
              <AlertDescription>
                No active sessions found.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className={session.is_current ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {getDeviceIcon(session.device_type)}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">
                              {session.device_name || `${session.os_name} Device`}
                            </h4>
                            {session.is_current && (
                              <Badge variant="default" className="text-xs">
                                Current Session
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-4">
                              <span>{session.browser_name} {session.browser_version}</span>
                              <span>{session.os_name} {session.os_version}</span>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{session.location || session.ip_address}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>Last active {formatRelativeTime(session.last_activity)}</span>
                              </div>
                            </div>
                            
                            <div className="text-xs">
                              Created {formatDateTime(session.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {!session.is_current && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Revoke Session</DialogTitle>
                              <DialogDescription>
                                This will log out this device/browser. The user will need to log in again.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="destructive"
                                onClick={() => revokeSession(session.id)}
                                disabled={revokingSession === session.id}
                              >
                                {revokingSession === session.id ? 'Revoking...' : 'Revoke Session'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security tip:</strong> Regularly review your active sessions and revoke any that you don't recognize. 
          If you see suspicious activity, change your password immediately.
        </AlertDescription>
      </Alert>
    </div>
  );
}