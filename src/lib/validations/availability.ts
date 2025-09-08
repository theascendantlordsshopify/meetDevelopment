import { z } from 'zod';

// Availability Rule Schema
export const availabilityRuleSchema = z.object({
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  event_types: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
});

// Date Override Rule Schema
export const dateOverrideRuleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  is_available: z.boolean(),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
  event_types: z.array(z.string()).optional(),
  reason: z.string().optional(),
  is_active: z.boolean().default(true),
}).refine((data) => {
  if (data.is_available && (!data.start_time || !data.end_time)) {
    return false;
  }
  return true;
}, {
  message: 'Start time and end time are required when available',
  path: ['start_time'],
});

// Recurring Blocked Time Schema
export const recurringBlockedTimeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  is_active: z.boolean().default(true),
});

// Blocked Time Schema
export const blockedTimeSchema = z.object({
  start_datetime: z.string(),
  end_datetime: z.string(),
  reason: z.string().min(1, 'Reason is required'),
  source: z.enum(['manual', 'google_calendar', 'outlook_calendar', 'apple_calendar', 'external_sync']).default('manual'),
  is_active: z.boolean().default(true),
});

// Buffer Time Schema
export const bufferTimeSchema = z.object({
  default_buffer_before: z.number().min(0).max(120),
  default_buffer_after: z.number().min(0).max(120),
  minimum_gap: z.number().min(0).max(60),
  slot_interval_minutes: z.number().min(5).max(60),
});

// Export types
export type AvailabilityRuleData = z.infer<typeof availabilityRuleSchema>;
export type DateOverrideRuleData = z.infer<typeof dateOverrideRuleSchema>;
export type RecurringBlockedTimeData = z.infer<typeof recurringBlockedTimeSchema>;
export type BlockedTimeData = z.infer<typeof blockedTimeSchema>;
export type BufferTimeData = z.infer<typeof bufferTimeSchema>;