import { z } from 'zod';

export const mfaSetupSchema = z.object({
  method: z.enum(['totp', 'sms']),
  phone: z.string().optional(),
});

export const totpVerificationSchema = z.object({
  token: z.string().min(6, 'Token must be 6 digits').max(6, 'Token must be 6 digits'),
});

export const smsVerificationSchema = z.object({
  code: z.string().min(6, 'Code must be 6 digits').max(6, 'Code must be 6 digits'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
});

export const mfaDisableSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const backupCodeSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type MfaSetupData = z.infer<typeof mfaSetupSchema>;
export type TotpVerificationData = z.infer<typeof totpVerificationSchema>;
export type SmsVerificationData = z.infer<typeof smsVerificationSchema>;
export type MfaDisableData = z.infer<typeof mfaDisableSchema>;
export type BackupCodeData = z.infer<typeof backupCodeSchema>;