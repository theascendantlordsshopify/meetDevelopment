'use client';

import { useState } from 'react';
import { Smartphone, Shield, Trash2, RotateCcw } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mfaDisableSchema, backupCodeSchema, type MfaDisableData, type BackupCodeData } from '@/lib/validations/mfa';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import toast from 'react-hot-toast';

interface MfaDevice {
  id: string;
  type: 'totp' | 'sms';
  name: string;
  phone?: string;
  created_at: string;
  last_used?: string;
}

interface MfaDeviceListProps {
  devices: MfaDevice[];
  backupCodesCount: number;
  onDeviceRemoved: () => void;
  onBackupCodesRegenerated: (codes: string[]) => void;
}

export function MfaDeviceList({ 
  devices, 
  backupCodesCount, 
  onDeviceRemoved, 
  onBackupCodesRegenerated 
}: MfaDeviceListProps) {
  const [isDisabling, setIsDisabling] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const {
    register: registerDisable,
    handleSubmit: handleDisableSubmit,
    formState: { errors: disableErrors, isSubmitting: isDisableSubmitting },
    reset: resetDisable,
  } = useForm<MfaDisableData>({
    resolver: zodResolver(mfaDisableSchema),
  });

  const {
    register: registerBackup,
    handleSubmit: handleBackupSubmit,
    formState: { errors: backupErrors, isSubmitting: isBackupSubmitting },
    reset: resetBackup,
  } = useForm<BackupCodeData>({
    resolver: zodResolver(backupCodeSchema),
  });

  const disableMfa = async (data: MfaDisableData) => {
    try {
      await api.post(API_ENDPOINTS.MFA.DISABLE, data);
      toast.success('MFA disabled successfully');
      resetDisable();
      onDeviceRemoved();
    } catch (error: any) {
      toast.error(error.error || 'Failed to disable MFA');
    }
  };

  const regenerateBackupCodes = async (data: BackupCodeData) => {
    try {
      setIsRegenerating(true);
      const response = await api.post(API_ENDPOINTS.MFA.BACKUP_CODES_REGENERATE, data);
      const newCodes = response.data.data?.backup_codes || [];
      onBackupCodesRegenerated(newCodes);
      resetBackup();
      toast.success('Backup codes regenerated successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to regenerate backup codes');
    } finally {
      setIsRegenerating(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'totp':
        return <Shield className="h-5 w-5" />;
      case 'sms':
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getDeviceTypeName = (type: string) => {
    switch (type) {
      case 'totp':
        return 'Authenticator App';
      case 'sms':
        return 'SMS';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MFA Devices</CardTitle>
          <CardDescription>
            Manage your multi-factor authentication devices and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.length === 0 ? (
            <Alert>
              <AlertDescription>
                No MFA devices configured. Set up an authenticator app or SMS to secure your account.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(device.type)}
                    <div>
                      <div className="font-medium">{getDeviceTypeName(device.type)}</div>
                      {device.phone && (
                        <div className="text-sm text-muted-foreground">{device.phone}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Added {new Date(device.created_at).toLocaleDateString()}
                        {device.last_used && (
                          <span> • Last used {new Date(device.last_used).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup Codes</CardTitle>
          <CardDescription>
            Use backup codes to access your account when you can't use your primary MFA method.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">
                {backupCodesCount} backup codes remaining
              </div>
              <div className="text-sm text-muted-foreground">
                Each code can only be used once
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Regenerate Backup Codes</DialogTitle>
                  <DialogDescription>
                    This will invalidate all existing backup codes and generate new ones.
                    Enter your password to confirm.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBackupSubmit(regenerateBackupCodes)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="backup-password">Password</Label>
                      <Input
                        id="backup-password"
                        type="password"
                        {...registerBackup('password')}
                      />
                      {backupErrors.password && (
                        <p className="text-sm text-destructive">
                          {backupErrors.password.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button
                      type="submit"
                      disabled={isBackupSubmitting || isRegenerating}
                    >
                      {isBackupSubmitting || isRegenerating ? 'Regenerating...' : 'Regenerate Codes'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {backupCodesCount <= 3 && (
            <Alert>
              <AlertDescription>
                You're running low on backup codes. Consider regenerating them soon.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {devices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Disable MFA</CardTitle>
            <CardDescription>
              Disable multi-factor authentication for your account. This will make your account less secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Disable MFA
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Disable Multi-Factor Authentication</DialogTitle>
                  <DialogDescription>
                    This will remove all MFA devices and disable two-factor authentication.
                    Your account will be less secure. Enter your password to confirm.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleDisableSubmit(disableMfa)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="disable-password">Password</Label>
                      <Input
                        id="disable-password"
                        type="password"
                        {...registerDisable('password')}
                      />
                      {disableErrors.password && (
                        <p className="text-sm text-destructive">
                          {disableErrors.password.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={isDisableSubmitting}
                    >
                      {isDisableSubmitting ? 'Disabling...' : 'Disable MFA'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}