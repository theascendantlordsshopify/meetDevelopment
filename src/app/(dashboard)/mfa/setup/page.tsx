'use client';

import { useState } from 'react';
import { ArrowLeft, Shield, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TotpSetup } from '@/components/mfa/totp-setup';
import { SmsSetup } from '@/components/mfa/sms-setup';
import { BackupCodesDisplay } from '@/components/mfa/backup-codes-display';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';

type SetupStep = 'method' | 'setup' | 'backup-codes';

export default function MfaSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>('method');
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'sms' | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleMethodSelect = (method: 'totp' | 'sms') => {
    setSelectedMethod(method);
    setStep('setup');
  };

  const handleSetupSuccess = (codes: string[]) => {
    setBackupCodes(codes);
    setStep('backup-codes');
  };

  const handleComplete = () => {
    router.push(ROUTES.PROFILE);
  };

  const handleCancel = () => {
    if (step === 'setup') {
      setStep('method');
      setSelectedMethod(null);
    } else {
      router.push(ROUTES.PROFILE);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Set up Multi-Factor Authentication</h1>
        <p className="text-muted-foreground mt-2">
          Add an extra layer of security to your account
        </p>
      </div>

      {step === 'method' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your MFA Method</CardTitle>
              <CardDescription>
                Select how you'd like to receive verification codes for two-factor authentication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="totp" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="totp">Authenticator App</TabsTrigger>
                  <TabsTrigger value="sms">SMS</TabsTrigger>
                </TabsList>
                
                <TabsContent value="totp" className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 border rounded-lg">
                    <Shield className="h-6 w-6 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold">Authenticator App (Recommended)</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Use apps like Google Authenticator, Authy, or 1Password to generate codes.
                        Works offline and is more secure than SMS.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Works without internet connection</li>
                        <li>• More secure than SMS</li>
                        <li>• Supported by most authenticator apps</li>
                      </ul>
                    </div>
                  </div>
                  <Button onClick={() => handleMethodSelect('totp')} className="w-full">
                    Set up Authenticator App
                  </Button>
                </TabsContent>
                
                <TabsContent value="sms" className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 border rounded-lg">
                    <Smartphone className="h-6 w-6 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold">SMS Text Messages</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Receive verification codes via text message to your phone.
                        Requires cellular service and may incur messaging charges.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Easy to set up</li>
                        <li>• Works on any phone</li>
                        <li>• Requires cellular service</li>
                      </ul>
                    </div>
                  </div>
                  <Button onClick={() => handleMethodSelect('sms')} className="w-full">
                    Set up SMS Authentication
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'setup' && selectedMethod === 'totp' && (
        <TotpSetup onSuccess={handleSetupSuccess} onCancel={handleCancel} />
      )}

      {step === 'setup' && selectedMethod === 'sms' && (
        <SmsSetup onSuccess={handleSetupSuccess} onCancel={handleCancel} />
      )}

      {step === 'backup-codes' && (
        <BackupCodesDisplay codes={backupCodes} onComplete={handleComplete} />
      )}
    </div>
  );
}