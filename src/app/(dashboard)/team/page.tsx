'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Mail, Crown, Shield, Eye, UserCheck, Clock, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InviteTeamMemberForm } from '@/components/team/invite-form';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { getInitials, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: Array<{
    id: string;
    name: string;
    role_type: string;
  }>;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: {
    id: string;
    name: string;
    role_type: string;
  };
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invited_by: string;
  created_at: string;
  expires_at: string;
  message?: string;
}

interface Role {
  id: string;
  name: string;
  role_type: string;
  description?: string;
}

export default function TeamPage() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      const [membersRes, invitationsRes, rolesRes] = await Promise.all([
        api.get('/api/v1/users/team-members/'),
        api.get('/api/v1/users/invitations/'),
        api.get('/api/v1/users/roles/'),
      ]);

      setTeamMembers(membersRes.data.data || []);
      setInvitations(invitationsRes.data.data || []);
      setRoles(rolesRes.data.data || []);
    } catch (error: any) {
      toast.error(error.error || 'Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvitation = async (data: any) => {
    try {
      const response = await api.post('/api/v1/users/invitations/', data);
      setInvitations([...invitations, response.data.data]);
      setShowInviteForm(false);
      toast.success('Invitation sent successfully');
    } catch (error: any) {
      throw error;
    }
  };

  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      await api.post(`/api/v1/users/invitations/${invitation.id}/resend/`);
      toast.success('Invitation resent successfully');
    } catch (error: any) {
      toast.error(error.error || 'Failed to resend invitation');
    }
  };

  const handleCancelInvitation = async (invitation: Invitation) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) return;

    try {
      await api.delete(`/api/v1/users/invitations/${invitation.id}/`);
      setInvitations(invitations.filter(inv => inv.id !== invitation.id));
      toast.success('Invitation cancelled');
    } catch (error: any) {
      toast.error(error.error || 'Failed to cancel invitation');
    }
  };

  const handleRemoveTeamMember = async (member: TeamMember) => {
    if (!confirm(`Are you sure you want to remove ${member.first_name} ${member.last_name} from the team?`)) return;

    try {
      await api.delete(`/api/v1/users/team-members/${member.id}/`);
      setTeamMembers(teamMembers.filter(m => m.id !== member.id));
      toast.success('Team member removed');
    } catch (error: any) {
      toast.error(error.error || 'Failed to remove team member');
    }
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'organizer': return <UserCheck className="h-4 w-4" />;
      case 'team_member': return <Users className="h-4 w-4" />;
      case 'billing_manager': return <Shield className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (roleType: string) => {
    switch (roleType) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'organizer': return 'bg-blue-100 text-blue-800';
      case 'team_member': return 'bg-green-100 text-green-800';
      case 'billing_manager': return 'bg-orange-100 text-orange-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your team members and invitations
            </p>
          </div>
          <Button onClick={() => setShowInviteForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Invite Team Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {teamMembers.filter(m => m.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {invitations.filter(inv => inv.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="mb-8">
          <InviteTeamMemberForm
            roles={roles}
            onSubmit={handleSendInvitation}
            onCancel={() => setShowInviteForm(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Current team members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No team members yet. Invite your first team member to get started.
                </AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-sm">
                              {getInitials(`${member.first_name} ${member.last_name}`)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {member.first_name} {member.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {member.roles.map((role) => (
                            <Badge 
                              key={role.id} 
                              variant="outline" 
                              className={getRoleColor(role.role_type)}
                            >
                              <div className="flex items-center space-x-1">
                                {getRoleIcon(role.role_type)}
                                <span>{role.name}</span>
                              </div>
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={member.is_active ? 'default' : 'secondary'}>
                            {member.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {member.last_login && (
                            <div className="text-xs text-muted-foreground">
                              Last login: {formatRelativeTime(member.last_login)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Roles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleRemoveTeamMember(member)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Outstanding invitations waiting for response
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No pending invitations. Send invitations to grow your team.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">
                          {getInitials(invitation.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{invitation.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {invitation.role.name} • Sent {formatRelativeTime(invitation.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getInvitationStatusColor(invitation.status)}>
                        {invitation.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {invitation.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleResendInvitation(invitation)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Resend
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleCancelInvitation(invitation)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}