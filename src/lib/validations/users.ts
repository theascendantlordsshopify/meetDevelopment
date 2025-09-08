import { z } from 'zod';

// User Profile Schema
export const userProfileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(100),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  profile_picture: z.string().url().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  company: z.string().max(200).optional(),
  job_title: z.string().max(200).optional(),
  timezone_name: z.string().min(1, 'Timezone is required'),
  language: z.string().min(1, 'Language is required'),
  date_format: z.string().min(1, 'Date format is required'),
  time_format: z.string().min(1, 'Time format is required'),
  brand_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  brand_logo: z.string().url().optional().or(z.literal('')),
  public_profile: z.boolean().default(true),
  show_phone: z.boolean().default(false),
  show_email: z.boolean().default(true),
  reasonable_hours_start: z.number().min(0).max(23),
  reasonable_hours_end: z.number().min(0).max(23),
});

// Change Password Schema
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

// Email Verification Schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Password Reset Request Schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
});

// Password Reset Confirm Schema
export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

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

// Export types
export type UserProfileData = z.infer<typeof userProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmData = z.infer<typeof passwordResetConfirmSchema>;
export type TeamInvitationData = z.infer<typeof teamInvitationSchema>;
export type InvitationResponseData = z.infer<typeof invitationResponseSchema>;