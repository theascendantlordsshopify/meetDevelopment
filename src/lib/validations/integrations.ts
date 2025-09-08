import { z } from 'zod';

// OAuth Initiate Schema
export const oauthInitiateSchema = z.object({
  provider: z.enum(['google', 'outlook', 'zoom', 'microsoft_teams']),
  integration_type: z.enum(['calendar', 'video']),
  redirect_uri: z.string().url(),
});

// OAuth Callback Schema
export const oauthCallbackSchema = z.object({
  provider: z.enum(['google', 'outlook', 'zoom', 'microsoft_teams']),
  integration_type: z.enum(['calendar', 'video']),
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required'),
});

// Webhook Integration Schema
export const webhookIntegrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  webhook_url: z.string().url('Valid webhook URL is required'),
  events: z.array(z.enum(['booking_created', 'booking_cancelled', 'booking_rescheduled', 'booking_completed'])).min(1, 'Select at least one event'),
  secret_key: z.string().optional(),
  headers: z.record(z.string()).optional(),
  is_active: z.boolean().default(true),
  retry_failed: z.boolean().default(true),
  max_retries: z.number().min(0).max(10).default(3),
});

// Calendar Sync Settings Schema
export const calendarSyncSettingsSchema = z.object({
  sync_enabled: z.boolean().default(true),
  calendar_id: z.string().optional(),
  sync_frequency: z.enum(['15min', '30min', '1hour']).default('15min'),
  conflict_resolution: z.enum(['manual', 'auto_block', 'ignore']).default('manual'),
});

// Export types
export type OAuthInitiateData = z.infer<typeof oauthInitiateSchema>;
export type OAuthCallbackData = z.infer<typeof oauthCallbackSchema>;
export type WebhookIntegrationData = z.infer<typeof webhookIntegrationSchema>;
export type CalendarSyncSettingsData = z.infer<typeof calendarSyncSettingsSchema>;