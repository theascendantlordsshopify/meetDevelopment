'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, XCircle, Mail, Users, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { invitationResponseSchema, type InvitationResponseData } from '@/lib/validations/team';
import { api } from '@/lib/api/client';
import { ROUTES } from '@/constants';
import { getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

interface InvitationDetails {
  id: string;
  email: string;
  role: {
    name: string;
    role_type: string;
    description?: string;
  };
  invited_by: {
    first_name: string;
    last_name: string;
    email: string;
    company?: string;
  };
  organization: {
    name: string;
    display_name: string;
  };
  message?: string;
  expires_at: string;
  status: string;
}

export default function InvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvitationResponseData>({
    resolver: zodResolver(invitationResponseSchema),
    defaultValues: {
      action: 'accept',
    },
  });

  const watchedPassword = watch('password');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      fetchInvitationDetails(token);
    } else {
      setError('Invalid invitation link');
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchInvitationDetails = async (token: string) => {
    try {
      const response = await api.get(`/api/v1/users/invitations/details/?token=${token}`);
      const invitationData = response.data.data;
      setInvitation(invitationData);
      
      // Check if this is a new user (invitation for non-existing account)
      setIsNewUser(invitationData.is_new_user || false);
    } catch (error: any) {
      setError(error.error || 'Invalid or expired invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: InvitationResponseData) => {
    const token = searchParams.get('token');
    if (!token) return;

    try {
      const response = await api.post('/api/v1/users/invitations/respond/', {
        ...data,
        token,
      });

      if (data.action === 'accept') {
        toast.success('Invitation accepted! Welcome to the team.');
        // Redirect to login or dashboard based on whether user was created
        router.push(isNewUser ? ROUTES.LOGIN : ROUTES.DASHBOARD);
      } else {
        toast.success('Invitation declined.');
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.error || 'Failed to respond to invitation');
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Invitation not found or has expired.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(watchedPassword || '');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-center">Team Invitation</CardTitle>
          <CardDescription className="text-center">
            You've been invited to join a team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="text-center space-y-4">
            <Avatar className="h-16 w-16 mx-auto">
              <AvatarFallback className="text-xl font-semibold">
                {getInitials(invitation.organization.display_name)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="text-xl font-semibold">{invitation.organization.display_name}</h3>
              <p className="text-muted-foreground">
                {invitation.invited_by.first_name} {invitation.invited_by.last_name} has invited you to join their team
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{invitation.role.name}</span>
              </Badge>
            </div>

            {invitation.message && (
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Personal message:</strong> {invitation.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New User Registration Fields */}
            {isNewUser && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Since this is your first time, please provide some basic information to create your account.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      {...register('first_name')}
                      placeholder="Enter your first name"
                      disabled={isSubmitting}
                    />
                    {errors.first_name && (
                      <p className="text-sm text-destructive">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      {...register('last_name')}
                      placeholder="Enter your last name"
                      disabled={isSubmitting}
                    />
                    {errors.last_name && (
                      <p className="text-sm text-destructive">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="Create a secure password"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
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
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirm_password')}
                      placeholder="Confirm your password"
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
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                type="submit"
                onClick={() => setValue('action', 'accept')}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  'Processing...'
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
              <Button
                type="submit"
                variant="outline"
                onClick={() => setValue('action', 'decline')}
                disabled={isSubmitting}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            By accepting this invitation, you agree to join {invitation.organization.display_name} 
            with {invitation.role.name} permissions.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}