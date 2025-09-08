'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS, ROUTES } from '@/constants';
import toast from 'react-hot-toast';

export default function IntegrationsCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your connection...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Check for OAuth errors
      if (error) {
        setStatus('error');
        setMessage(`OAuth error: ${error}`);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Missing authorization code or state parameter');
        return;
      }

      // Retrieve stored OAuth state
      const storedState = sessionStorage.getItem('oauth_state');
      const provider = sessionStorage.getItem('oauth_provider');
      const integrationType = sessionStorage.getItem('oauth_type');

      if (!storedState || !provider || !integrationType) {
        setStatus('error');
        setMessage('OAuth session expired. Please try connecting again.');
        return;
      }

      if (state !== storedState) {
        setStatus('error');
        setMessage('Invalid OAuth state. Possible security issue.');
        return;
      }

      // Complete OAuth flow
      const response = await api.post(API_ENDPOINTS.INTEGRATIONS.OAUTH_CALLBACK, {
        provider,
        integration_type: integrationType,
        code,
        state,
      });

      // Clean up session storage
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_provider');
      sessionStorage.removeItem('oauth_type');

      setStatus('success');
      setMessage(`${provider} ${integrationType} connected successfully!`);

      // Redirect after success
      setTimeout(() => {
        router.push(ROUTES.INTEGRATIONS);
      }, 2000);

    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error.error || 'Failed to complete connection');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Integration Setup</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>

          <div>
            <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
              {status === 'processing' && 'Connecting...'}
              {status === 'success' && 'Connected!'}
              {status === 'error' && 'Connection Failed'}
            </h2>
            <p className="text-muted-foreground mt-2">{message}</p>
          </div>

          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your integration is now active. You'll be redirected to the integrations page shortly.
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Something went wrong during the connection process. Please try again.
                </AlertDescription>
              </Alert>
              <div className="flex space-x-2">
                <Button onClick={() => router.push(ROUTES.INTEGRATIONS)} className="flex-1">
                  Back to Integrations
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {status === 'processing' && (
            <p className="text-sm text-muted-foreground">
              Please wait while we complete your integration setup...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}