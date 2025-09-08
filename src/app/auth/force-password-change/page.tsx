'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CheckCircle, Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { forcePasswordChangeSchema, type ForcePasswordChangeData } from '@/lib/validations/auth';
import { api } from '@/lib/api/client';
import { ROUTES } from '@/constants';
import toast from 'react-hot-toast';

export default function ForcePasswordChangePage() {
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForcePasswordChangeData>({
    resolver: zodResolver(forcePasswordChangeSchema),
  });

  const watchedPassword = watch('new_password');

  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = [
      { regex: /.{8,}/, label: 'At least 8 characters' },
      { regex: /[A-Z]/, label: 'Uppercase letter' },
      { regex: /[a-z]/, label: 'Lowercase letter' },
      { regex: /[0-9]/, label: 'Number' },
      { regex: /[^A-Za-z0-9]/, label: 'Special character' },
    ];

    const results = checks.map(check => ({
      ...check,
      passed: check.regex.test(password),
    }));

    score = results.filter(r => r.passed).length;

    return {
      score,
      checks: results,
      strength: score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong',
    };
  };

  const onSubmit = async (data: ForcePasswordChangeData) => {
    try {
      await api.post('/api/v1/users/force-password-change/', data);
      
      setIsSuccess(true);
      toast.success('Password updated successfully');
      
      // Redirect to dashboard after success
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 3000);
    } catch (error: any) {
      toast.error(error.error || 'Failed to update password');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span>Password Updated</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your password has been updated successfully. You can now continue using your account.
            </p>
            
            <Alert>
              <AlertDescription>
                You'll be redirected to your dashboard in a few seconds.
              </AlertDescription>
            </Alert>

            <Button onClick={() => router.push(ROUTES.DASHBOARD)} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(watchedPassword || '');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center space-x-2">
            <Key className="h-6 w-6" />
            <span>Update Your Password</span>
          </CardTitle>
          <CardDescription className="text-center">
            Your password has expired. Please set a new password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              For security reasons, you must update your password before continuing to use your account.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password *</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  {...register('new_password')}
                  placeholder="Enter your new password"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.new_password && (
                <p className="text-sm text-destructive">{errors.new_password.message}</p>
              )}

              {/* Password Strength Indicator */}
              {watchedPassword && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.strength === 'weak' ? 'bg-red-500 w-1/3' :
                          passwordStrength.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      passwordStrength.strength === 'weak' ? 'text-red-500' :
                      passwordStrength.strength === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {passwordStrength.checks.map((check, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {check.passed ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={check.passed ? 'text-green-600' : 'text-gray-500'}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password *</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirm_password')}
                  placeholder="Confirm your new password"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}