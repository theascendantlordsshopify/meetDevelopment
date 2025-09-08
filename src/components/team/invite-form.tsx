'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { teamInvitationSchema, type TeamInvitationData } from '@/lib/validations/team';
import toast from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  role_type: string;
  description?: string;
}

interface InviteTeamMemberFormProps {
  roles: Role[];
  onSubmit: (data: TeamInvitationData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function InviteTeamMemberForm({
  roles,
  onSubmit,
  onCancel,
  isLoading = false,
}: InviteTeamMemberFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeamInvitationData>({
    resolver: zodResolver(teamInvitationSchema),
    defaultValues: {
      email: '',
      role: '',
      message: '',
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: TeamInvitationData) => {
    try {
      await onSubmit(data);
      toast.success('Invitation sent successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to send invitation');
    }
  };

  const selectedRole = roles.find(role => role.id === watchedValues.role);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Invite Team Member</span>
        </CardTitle>
        <CardDescription>
          Send an invitation to join your team with a specific role and permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="colleague@company.com"
              disabled={isSubmitting || isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={watchedValues.role}
              onValueChange={(value) => setValue('role', value)}
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center space-x-2">
                      <span>{role.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({role.role_type})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
            
            {selectedRole && (
              <Alert>
                <AlertDescription>
                  <strong>{selectedRole.name}</strong>: {selectedRole.description || `${selectedRole.role_type} level access`}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Add a personal message to the invitation..."
              rows={4}
              disabled={isSubmitting || isLoading}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Optional personal message included in the invitation email</span>
              <span>{watchedValues.message?.length || 0}/500</span>
            </div>
          </div>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              An invitation email will be sent to the provided address with instructions to join your team.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Send className="h-4 w-4 mr-2 animate-pulse" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}