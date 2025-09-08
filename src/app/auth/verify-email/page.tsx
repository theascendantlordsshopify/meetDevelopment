'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS, ROUTES } from '@/constants';
import { useAuth } from '@/lib/auth/auth-context';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resend'>('verifying');
  const [message, setMessage] = useState('Verifying your email address...');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('resend');
      setMessage('No verification token provided. You can request a new verification email below.');
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
      setStatus('success');
      setMessage('Your email has been verified successfully!');
      
      // Refresh user data to update verification status
      await refreshUser();
      
      // Redirect to dashboard after success
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.error || 'Failed to verify email. The token may be expired or invalid.');
    }
  };

  const resendVerification = async () => {
    try {
      setIsResending(true);
      await api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
        email: user?.email,
      });
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.error || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
      case 'resend':
        return <XCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verifying': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error':
      case 'resend': return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>

          <div>
            <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
              {status === 'verifying' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
              {status === 'resend' && 'Verification Required'}
            </h2>
            <p className="text-muted-foreground mt-2">{message}</p>
          </div>

          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your email has been verified successfully. You'll be redirected to your dashboard shortly.
              </AlertDescription>
            </Alert>
          )}

          {(status === 'error' || status === 'resend') && (
            <div className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  {status === 'error' 
                    ? 'The verification link may be expired or invalid. You can request a new one below.'
                    : 'Please verify your email address to complete your account setup.'
                  }
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Button 
                  onClick={resendVerification} 
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push(ROUTES.DASHBOARD)}
                  className="w-full"
                >
                  Continue to Dashboard
                </Button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <Button 
              onClick={() => router.push(ROUTES.DASHBOARD)}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}