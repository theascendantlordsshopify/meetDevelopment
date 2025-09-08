'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { smsVerificationSchema, type SmsVerificationData } from '@/lib/validations/mfa';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import toast from 'react-hot-toast';

interface SmsSetupProps {
  onSuccess: (backupCodes: string[]) => void;
  onCancel: () => void;
}

export function SmsSetup({ onSuccess, onCancel }: SmsSetupProps) {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<SmsVerificationData>({
    resolver: zodResolver(smsVerificationSchema),
  });

  const sendSmsCode = async (phone: string) => {
    try {
      setIsLoading(true);
      await api.post(API_ENDPOINTS.MFA.SETUP, {
        method: 'sms',
        phone,
      });
      
      setPhoneNumber(phone);
      setValue('phone', phone);
      setStep('verify');
      setCountdown(60);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast.success('Verification code sent to your phone');
    } catch (error: any) {
      toast.error(error.error || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (countdown > 0) return;
    await sendSmsCode(phoneNumber);
  };

  const onSubmit = async (data: SmsVerificationData) => {
    try {
      const response = await api.post(API_ENDPOINTS.MFA.VERIFY, {
        method: 'sms',
        code: data.code,
        phone: data.phone,
      });
      
      toast.success('SMS authentication enabled successfully!');
      onSuccess(response.data.data?.backup_codes || []);
    } catch (error: any) {
      toast.error(error.error || 'Invalid verification code');
    }
  };

  if (step === 'phone') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set up SMS Authentication</CardTitle>
          <CardDescription>
            Enter your phone number to receive verification codes via SMS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const phone = formData.get('phone') as string;
              if (phone) {
                sendSmsCode(phone);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>

            <Alert>
              <AlertDescription>
                Standard messaging rates may apply. We'll send you a 6-digit verification code.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Sending...' : 'Send Code'}
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Your Phone</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to {phoneNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('phone')} />
          
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              {...register('code')}
              placeholder="123456"
              maxLength={6}
              className="text-center text-lg font-mono tracking-widest"
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={resendCode}
              disabled={countdown > 0}
              className="text-sm"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
            </Button>
          </div>

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