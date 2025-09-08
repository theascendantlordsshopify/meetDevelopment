'use client';

import { useState } from 'react';
import { ExternalLink, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import toast from 'react-hot-toast';

interface OAuthConnectorProps {
  provider: 'google' | 'outlook' | 'zoom' | 'microsoft_teams';
  integrationType: 'calendar' | 'video';
  onSuccess: () => void;
  onCancel: () => void;
}

const PROVIDER_INFO = {
  google: {
    name: 'Google',
    calendar: {
      title: 'Google Calendar',
      description: 'Sync your Google Calendar to automatically block busy times and create calendar events for bookings.',
      permissions: [
        'Read your calendar events',
        'Create calendar events for bookings',
        'Update and delete booking-related events',
      ],
      benefits: [
        'Automatic busy time blocking',
        'Calendar events created for all bookings',
        'Two-way synchronization',
        'Real-time availability updates',
      ],
    },
    video: {
      title: 'Google Meet',
      description: 'Automatically generate Google Meet links for your video call bookings.',
      permissions: [
        'Create Google Meet conferences',
        'Manage meeting settings',
      ],
      benefits: [
        'Automatic meeting link generation',
        'Integrated with Google Calendar',
        'Professional meeting experience',
      ],
    },
  },
  outlook: {
    name: 'Microsoft',
    calendar: {
      title: 'Microsoft Outlook',
      description: 'Connect your Outlook calendar for seamless scheduling and availability management.',
      permissions: [
        'Read your calendar events',
        'Create calendar events for bookings',
        'Update and delete booking-related events',
      ],
      benefits: [
        'Outlook calendar synchronization',
        'Automatic busy time detection',
        'Professional calendar integration',
      ],
    },
    video: {
      title: 'Microsoft Teams',
      description: 'Generate Microsoft Teams meeting links for your video conferences.',
      permissions: [
        'Create Teams meetings',
        'Manage meeting settings',
      ],
      benefits: [
        'Teams meeting link generation',
        'Enterprise-grade video conferencing',
        'Integrated with Outlook calendar',
      ],
    },
  },
  zoom: {
    name: 'Zoom',
    calendar: {
      title: 'Zoom',
      description: 'This provider is not available for calendar integration.',
      permissions: [],
      benefits: [],
    },
    video: {
      title: 'Zoom',
      description: 'Connect your Zoom account to automatically create meeting rooms for video calls.',
      permissions: [
        'Create Zoom meetings',
        'Manage meeting settings',
        'Access meeting details',
      ],
      benefits: [
        'Automatic Zoom meeting creation',
        'Customizable meeting settings',
        'Waiting room and security features',
        'Recording capabilities',
      ],
    },
  },
  microsoft_teams: {
    name: 'Microsoft Teams',
    calendar: {
      title: 'Microsoft Teams',
      description: 'This provider is not available for calendar integration.',
      permissions: [],
      benefits: [],
    },
    video: {
      title: 'Microsoft Teams',
      description: 'Generate Microsoft Teams meeting links for your video conferences.',
      permissions: [
        'Create Teams meetings',
        'Manage meeting settings',
      ],
      benefits: [
        'Teams meeting link generation',
        'Enterprise-grade video conferencing',
        'Integrated with Outlook calendar',
      ],
    },
  },
};

export function OAuthConnector({ provider, integrationType, onSuccess, onCancel }: OAuthConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const providerConfig = PROVIDER_INFO[provider][integrationType];

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      // Initiate OAuth flow
      const response = await api.post(API_ENDPOINTS.INTEGRATIONS.OAUTH_INITIATE, {
        provider,
        integration_type: integrationType,
        redirect_uri: `${window.location.origin}/integrations/callback`,
      });

      const { authorization_url, state } = response.data.data;
      
      // Store state for validation
      sessionStorage.setItem('oauth_state', state);
      sessionStorage.setItem('oauth_provider', provider);
      sessionStorage.setItem('oauth_type', integrationType);
      
      // Redirect to provider OAuth
      window.location.href = authorization_url;
    } catch (error: any) {
      toast.error(error.error || 'Failed to initiate connection');
      setIsConnecting(false);
    }
  };

  if (providerConfig.permissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{providerConfig.title}</CardTitle>
          <CardDescription>{providerConfig.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              This integration is not available yet. Please choose a different provider.
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={onCancel} className="w-full mt-4">
            Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Connect {providerConfig.title}</span>
          <Badge variant="outline">{integrationType}</Badge>
        </CardTitle>
        <CardDescription>{providerConfig.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benefits */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>What you'll get:</span>
          </h3>
          <ul className="space-y-2">
            {providerConfig.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Permissions */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <span>Permissions required:</span>
          </h3>
          <ul className="space-y-2">
            {providerConfig.permissions.map((permission, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <span>{permission}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your data is secure. We only access the minimum permissions required for functionality. 
            You can disconnect at any time from your integrations page.
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex-1"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect {providerConfig.title}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isConnecting}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}