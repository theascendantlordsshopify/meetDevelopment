'use client';

import { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MfaDeviceList } from '@/components/mfa/mfa-device-list';
import { BackupCodesDisplay } from '@/components/mfa/backup-codes-display';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS, ROUTES } from '@/constants';
import toast from 'react-hot-toast';

interface MfaDevice {
  id: string;
  type: 'totp' | 'sms';
  name: string;
  phone?: string;
  created_at: string;
  last_used?: string;
}

interface MfaStatus {
  devices: MfaDevice[];
  backup_codes_count: number;
  is_enabled: boolean;
}

export default function MfaManagePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mfaStatus, setMfaStatus] = useState<MfaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewBackupCodes, setShowNewBackupCodes] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    fetchMfaStatus();
  }, []);

  const fetchMfaStatus = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<MfaStatus>(API_ENDPOINTS.MFA.DEVICES);
      setMfaStatus(response.data.data!);
    } catch (error: any) {
      toast.error(error.error || 'Failed to load MFA status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceRemoved = () => {
    fetchMfaStatus();
  };

  const handleBackupCodesRegenerated = (codes: string[]) => {
    setNewBackupCodes(codes);
    setShowNewBackupCodes(true);
    fetchMfaStatus();
  };

  const handleBackupCodesComplete = () => {
    setShowNewBackupCodes(false);
    setNewBackupCodes([]);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      </div>
    );
  }

  if (showNewBackupCodes) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <BackupCodesDisplay 
          codes={newBackupCodes} 
          onComplete={handleBackupCodesComplete} 
        />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(ROUTES.PROFILE)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Multi-Factor Authentication</h1>
            <p className="text-muted-foreground mt-2">
              Manage your two-factor authentication settings
            </p>
          </div>
          {!mfaStatus?.is_enabled && (
            <Button onClick={() => router.push(ROUTES.MFA_SETUP)}>
              <Plus className="h-4 w-4 mr-2" />
              Set up MFA
            </Button>
          )}
        </div>
      </div>

      {!user?.is_mfa_enabled ? (
        <Card>
          <CardHeader>
            <CardTitle>MFA Not Enabled</CardTitle>
            <CardDescription>
              Multi-factor authentication is not enabled for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                Enable MFA to add an extra layer of security to your account. 
                This helps protect your account even if your password is compromised.
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push(ROUTES.MFA_SETUP)}>
              <Plus className="h-4 w-4 mr-2" />
              Set up Multi-Factor Authentication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Alert>
            <AlertDescription>
              Multi-factor authentication is enabled for your account. 
              Your account is protected with an additional security layer.
            </AlertDescription>
          </Alert>

          {mfaStatus && (
            <MfaDeviceList
              devices={mfaStatus.devices}
              backupCodesCount={mfaStatus.backup_codes_count}
              onDeviceRemoved={handleDeviceRemoved}
              onBackupCodesRegenerated={handleBackupCodesRegenerated}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Add Another Method</CardTitle>
              <CardDescription>
                You can add multiple MFA methods for better security and convenience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push(ROUTES.MFA_SETUP)}>
                <Plus className="h-4 w-4 mr-2" />
                Add MFA Method
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}