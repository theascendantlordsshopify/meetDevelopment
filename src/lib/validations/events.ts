import { z } from 'zod';

// Event Type Schema
export const eventTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  event_type_slug: z.string().min(1, 'Slug is required').max(100, 'Slug too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  duration: z.number().min(15).max(240),
  max_attendees: z.number().min(1).max(100).default(1),
  enable_waitlist: z.boolean().default(false),
  is_active: z.boolean().default(true),
  is_private: z.boolean().default(false),
  min_scheduling_notice: z.number().min(0).default(0),
  max_scheduling_horizon: z.number().min(1).default(10080), // 1 week in minutes
  buffer_time_before: z.number().min(0).max(120).default(0),
  buffer_time_after: z.number().min(0).max(120).default(0),
  max_bookings_per_day: z.number().min(1).optional(),
  slot_interval_minutes: z.number().min(5).max(60).default(15),
  location_type: z.enum(['video_call', 'phone_call', 'in_person', 'custom']),
  location_details: z.string().optional(),
  redirect_url_after_booking: z.string().url().optional().or(z.literal('')),
});

// Custom Question Schema
export const customQuestionSchema = z.object({
  question_text: z.string().min(1, 'Question text is required').max(500),
  question_type: z.enum([
    'text', 'textarea', 'select', 'multiselect', 'checkbox', 
    'radio', 'email', 'phone', 'number', 'date', 'time', 'url'
  ]),
  is_required: z.boolean().default(false),
  order: z.number().min(0),
  options: z.array(z.string()).optional(),
  conditions: z.any().optional(),
  validation_rules: z.any().optional(),
});

// Booking Creation Schema
export const bookingCreateSchema = z.object({
  event_type_slug: z.string().min(1, 'Event type is required'),
  organizer_slug: z.string().min(1, 'Organizer is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  invitee_name: z.string().min(1, 'Name is required').max(200),
  invitee_email: z.string().email('Valid email is required'),
  invitee_phone: z.string().optional(),
  invitee_timezone: z.string().default('UTC'),
  attendee_count: z.number().min(1).default(1),
  custom_answers: z.record(z.any()).optional(),
});

// Booking Management Schema
export const bookingManagementSchema = z.object({
  action: z.enum(['cancel', 'reschedule']),
  reason: z.string().optional(),
  new_start_time: z.string().optional(),
  new_end_time: z.string().optional(),
});

// Export types
export type EventTypeData = z.infer<typeof eventTypeSchema>;
export type CustomQuestionData = z.infer<typeof customQuestionSchema>;
export type BookingCreateData = z.infer<typeof bookingCreateSchema>;
export type BookingManagementData = z.infer<typeof bookingManagementSchema>;