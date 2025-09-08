import { z } from 'zod';

// Notification Template Schema
export const notificationTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(200),
  template_type: z.enum([
    'booking_confirmation',
    'booking_reminder', 
    'booking_cancellation',
    'booking_rescheduled',
    'follow_up',
    'custom'
  ]),
  notification_type: z.enum(['email', 'sms']),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, 'Message is required'),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  required_placeholders: z.array(z.string()).default([]),
});

// Notification Preferences Schema
export const notificationPreferenceSchema = z.object({
  // Email Preferences
  booking_confirmations_email: z.boolean().default(true),
  booking_reminders_email: z.boolean().default(true),
  booking_cancellations_email: z.boolean().default(true),
  daily_agenda_email: z.boolean().default(true),
  
  // SMS Preferences
  booking_confirmations_sms: z.boolean().default(false),
  booking_reminders_sms: z.boolean().default(false),
  booking_cancellations_sms: z.boolean().default(false),
  
  // Timing Preferences
  reminder_minutes_before: z.number().min(5).max(1440).default(60),
  daily_agenda_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('08:00'),
  
  // Do-Not-Disturb Settings
  dnd_enabled: z.boolean().default(false),
  dnd_start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('22:00'),
  dnd_end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('07:00'),
  
  // Weekend Preferences
  exclude_weekends_reminders: z.boolean().default(false),
  exclude_weekends_agenda: z.boolean().default(true),
  
  // Communication Preferences
  preferred_notification_method: z.enum(['email', 'sms', 'both']).default('email'),
  max_reminders_per_day: z.number().min(1).max(50).default(10),
});

// Send Notification Schema
export const sendNotificationSchema = z.object({
  template_id: z.string().optional(),
  notification_type: z.enum(['email', 'sms']),
  recipient_email: z.string().email().optional(),
  recipient_phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
  scheduled_for: z.string().optional(),
  booking_id: z.string().optional(),
});

// Notification Filter Schema
export const notificationFilterSchema = z.object({
  notification_type: z.enum(['all', 'email', 'sms']).default('all'),
  status: z.enum(['all', 'pending', 'sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked']).default('all'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  template_type: z.string().optional(),
  search: z.string().optional(),
});

// Export types
export type NotificationTemplateData = z.infer<typeof notificationTemplateSchema>;
export type NotificationPreferenceData = z.infer<typeof notificationPreferenceSchema>;
export type SendNotificationData = z.infer<typeof sendNotificationSchema>;
export type NotificationFilterData = z.infer<typeof notificationFilterSchema>;