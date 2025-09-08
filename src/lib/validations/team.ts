import { z } from 'zod';

// Team Invitation Schema
export const teamInvitationSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.string().min(1, 'Role is required'),
  message: z.string().max(500).optional(),
});

// Invitation Response Schema
export const invitationResponseSchema = z.object({
  action: z.enum(['accept', 'decline']),
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().max(100).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  confirm_password: z.string().optional(),
}).refine((data) => {
  if (data.action === 'accept' && data.password && data.confirm_password) {
    return data.password === data.confirm_password;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

// Role Management Schema
export const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50),
  role_type: z.enum(['admin', 'organizer', 'team_member', 'billing_manager', 'viewer']),
  parent: z.string().optional(),
  role_permissions: z.array(z.string()).default([]),
  is_system_role: z.boolean().default(false),
});

// Export types
export type TeamInvitationData = z.infer<typeof teamInvitationSchema>;
export type InvitationResponseData = z.infer<typeof invitationResponseSchema>;
export type RoleData = z.infer<typeof roleSchema>;