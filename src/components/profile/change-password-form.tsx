'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { changePasswordSchema, type ChangePasswordData } from '@/lib/validations/users';
import toast from 'react-hot-toast';

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordData) => Promise<void>;
  isLoading?: boolean;
}

export function ChangePasswordForm({ onSubmit, isLoading = false }: ChangePasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
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

  const handleFormSubmit = async (data: ChangePasswordData) => {
    try {
      await onSubmit(data);
      reset();
      toast.success('Password changed successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to change password');
    }
  };

  const passwordStrength = getPasswordStrength(watchedPassword || '');

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Current Password */}
      <div className="space-y-2">
        <Label htmlFor="current_password">Current Password *</Label>
        <div className="relative">
          <Input
            id="current_password"
            type={showCurrentPassword ? 'text' : 'password'}
            {...register('current_password')}
            placeholder="Enter your current password"
            disabled={isSubmitting || isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.current_password && (
          <p className="text-sm text-destructive">{errors.current_password.message}</p>
        )}
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="new_password">New Password *</Label>
        <div className="relative">
          <Input
            id="new_password"
            type={showNewPassword ? 'text' : 'password'}
            {...register('new_password')}
            placeholder="Enter your new password"
            disabled={isSubmitting || isLoading}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
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
            disabled={isSubmitting || isLoading}
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

      <Alert>
        <AlertDescription>
          Changing your password will log you out of all other devices and sessions.
        </AlertDescription>
      </Alert>

      <Button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full"
      >
        {isSubmitting ? 'Changing Password...' : 'Change Password'}
      </Button>
    </form>
  );
}