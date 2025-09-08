import { z } from 'zod';

// Booking Filter Schema
export const bookingFilterSchema = z.object({
  status: z.enum(['all', 'confirmed', 'cancelled', 'rescheduled', 'completed', 'no_show']).default('all'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  event_type: z.string().optional(),
  search: z.string().optional(),
});

// Booking Update Schema
export const bookingUpdateSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'rescheduled', 'completed', 'no_show']).optional(),
  cancellation_reason: z.string().optional(),
  meeting_link: z.string().url().optional(),
  meeting_id: z.string().optional(),
  meeting_password: z.string().optional(),
  custom_answers: z.record(z.any()).optional(),
});

// Bulk Booking Action Schema
export const bulkBookingActionSchema = z.object({
  booking_ids: z.array(z.string()).min(1, 'Select at least one booking'),
  action: z.enum(['cancel', 'mark_completed', 'mark_no_show', 'export']),
  reason: z.string().optional(),
});

// Attendee Management Schema
export const attendeeManagementSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  custom_answers: z.record(z.any()).optional(),
});

// Reschedule Booking Schema
export const rescheduleBookingSchema = z.object({
  new_start_time: z.string().min(1, 'New start time is required'),
  new_end_time: z.string().min(1, 'New end time is required'),
  reason: z.string().optional(),
});

// Export types
export type BookingFilterData = z.infer<typeof bookingFilterSchema>;
export type BookingUpdateData = z.infer<typeof bookingUpdateSchema>;
export type BulkBookingActionData = z.infer<typeof bulkBookingActionSchema>;
export type AttendeeManagementData = z.infer<typeof attendeeManagementSchema>;
export type RescheduleBookingData = z.infer<typeof rescheduleBookingSchema>;