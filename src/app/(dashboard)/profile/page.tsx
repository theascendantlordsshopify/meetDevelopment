'use client';

import { useState, useEffect } from 'react';
import { User, Shield, Key, Users, Settings, ExternalLink, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProfileForm } from '@/components/profile/profile-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { SessionManagement } from '@/components/profile/session-management';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS, ROUTES } from '@/constants';
import { type UserProfileData } from '@/lib/validations/users';
import { UserProfile } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<UserProfile>('/api/v1/users/profile/');
      setProfile(response.data.data!);
    } catch (error: any) {
      toast.error(error.error || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (data: UserProfileData) => {
    try {
      const response = await api.put<UserProfile>('/api/v1/users/profile/', data);
      setProfile(response.data.data!);
      await refreshUser(); // Refresh user context
      toast.success('Profile updated successfully');
    } catch (error: any) {
      throw error;
    }
  };

  const handlePasswordChange = async (data: any) => {
    try {
      await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
      toast.success('Password changed successfully');
    } catch (error: any) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      </div>
    );
  }

  const publicProfileUrl = profile?.organizer_slug 
    ? `${window.location.origin}/${profile.organizer_slug}`
    : '';

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings, security, and public profile
            </p>
          </div>
          {profile?.public_profile && publicProfileUrl && (
            <Button variant="outline" asChild>
              <a href={publicProfileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Profile
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={user?.account_status === 'active' ? 'default' : 'secondary'}>
                {user?.account_status || 'Unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Status</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={user?.is_email_verified ? 'default' : 'destructive'}>
                {user?.is_email_verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MFA Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={user?.is_mfa_enabled ? 'default' : 'secondary'}>
                {user?.is_mfa_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Profile</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={profile?.public_profile ? 'default' : 'secondary'}>
                {profile?.public_profile ? 'Public' : 'Private'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {profile && (
            <ProfileForm
              initialData={profile}
              onSubmit={handleProfileUpdate}
              isLoading={isLoading}
            />
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Password</span>
                </CardTitle>
                <CardDescription>
                  Change your account password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm onSubmit={handlePasswordChange} />
              </CardContent>
            </Card>

            {/* MFA Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Multi-Factor Authentication</span>
                </CardTitle>
                <CardDescription>
                  Secure your account with two-factor authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">MFA Status</div>
                    <div className="text-sm text-muted-foreground">
                      {user?.is_mfa_enabled 
                        ? 'Your account is protected with MFA'
                        : 'Add an extra layer of security'
                      }
                    </div>
                  </div>
                  <Badge variant={user?.is_mfa_enabled ? 'default' : 'secondary'}>
                    {user?.is_mfa_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>

                <div className="flex space-x-2">
                  {user?.is_mfa_enabled ? (
                    <Button variant="outline" asChild className="flex-1">
                      <Link href={ROUTES.MFA_MANAGE}>
                        <Settings className="h-4 w-4 mr-2" />
                        Manage MFA
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="flex-1">
                      <Link href={ROUTES.MFA_SETUP}>
                        <Shield className="h-4 w-4 mr-2" />
                        Set up MFA
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Verification */}
          {!user?.is_email_verified && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Your email address is not verified. Please check your inbox for a verification email.
                <Button variant="link" className="p-0 h-auto ml-2">
                  Resend verification email
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <SessionManagement />
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Management</span>
              </CardTitle>
              <CardDescription>
                Manage team members and invitations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Team Management</h3>
              <p className="text-muted-foreground mb-4">
                Team management features are coming soon. You'll be able to invite team members and manage roles.
              </p>
              <Button variant="outline" disabled>
                <Users className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}