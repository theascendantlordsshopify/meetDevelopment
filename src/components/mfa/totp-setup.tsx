'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { totpVerificationSchema, type TotpVerificationData } from '@/lib/validations/mfa';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import toast from 'react-hot-toast';

interface TotpSetupProps {
  onSuccess: (backupCodes: string[]) => void;
  onCancel: () => void;
}

interface MfaSetupResponse {
  qr_code: string;
  secret: string;
  backup_codes: string[];
}

export function TotpSetup({ onSuccess, onCancel }: TotpSetupProps) {
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TotpVerificationData>({
    resolver: zodResolver(totpVerificationSchema),
  });

  const initializeSetup = async () => {
    try {
      setIsLoading(true);
      const response = await api.post<MfaSetupResponse>(API_ENDPOINTS.MFA.SETUP, {
        method: 'totp',
      });
      setSetupData(response.data.data!);
    } catch (error: any) {
      toast.error(error.error || 'Failed to initialize MFA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: TotpVerificationData) => {
    try {
      const response = await api.post(API_ENDPOINTS.MFA.VERIFY, {
        method: 'totp',
        token: data.token,
      });
      
      toast.success('TOTP authentication enabled successfully!');
      onSuccess(setupData?.backup_codes || []);
    } catch (error: any) {
      toast.error(error.error || 'Invalid verification code');
    }
  };

  const copySecret = async () => {
    if (setupData?.secret) {
      await navigator.clipboard.writeText(setupData.secret);
      setSecretCopied(true);
      toast.success('Secret copied to clipboard');
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  if (!setupData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set up Authenticator App</CardTitle>
          <CardDescription>
            Use an authenticator app like Google Authenticator, Authy, or 1Password to generate verification codes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={initializeSetup} disabled={isLoading} className="w-full">
            {isLoading ? 'Setting up...' : 'Start Setup'}
          </Button>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up Authenticator App</CardTitle>
        <CardDescription>
          Scan the QR code with your authenticator app, then enter the verification code.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg border">
            <QRCodeSVG value={setupData.qr_code} size={200} />
          </div>
        </div>

        {/* Manual Entry */}
        <div className="space-y-2">
          <Label>Can't scan? Enter this code manually:</Label>
          <div className="flex items-center space-x-2">
            <Input
              value={setupData.secret}
              readOnly
              type={showSecret ? 'text' : 'password'}
              className="font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copySecret}
            >
              {secretCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Verification */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Enter verification code</Label>
            <Input
              id="token"
              {...register('token')}
              placeholder="123456"
              maxLength={6}
              className="text-center text-lg font-mono tracking-widest"
            />
            {errors.token && (
              <p className="text-sm text-destructive">{errors.token.message}</p>
            )}
          </div>

          <Alert>
            <AlertDescription>
              Enter the 6-digit code from your authenticator app to complete setup.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Verifying...' : 'Verify & Enable'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}