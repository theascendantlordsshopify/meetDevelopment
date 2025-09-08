import { z } from 'zod';

// Contact Schema
export const contactSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().max(100).optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().max(20).optional(),
  company: z.string().max(200).optional(),
  job_title: z.string().max(200).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
});

// Contact Group Schema
export const contactGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#0066cc'),
  contacts: z.array(z.string()).default([]),
});

// Contact Interaction Schema
export const contactInteractionSchema = z.object({
  interaction_type: z.enum([
    'booking_created',
    'booking_completed', 
    'booking_cancelled',
    'email_sent',
    'note_added',
    'manual_entry'
  ]),
  description: z.string().min(1, 'Description is required'),
  booking: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Contact Import Schema
export const contactImportSchema = z.object({
  file: z.any(),
  duplicate_handling: z.enum(['skip', 'update', 'merge']).default('skip'),
  update_existing: z.boolean().default(false),
});

// Contact Filter Schema
export const contactFilterSchema = z.object({
  search: z.string().optional(),
  group: z.string().optional(),
  tags: z.array(z.string()).default([]),
  is_active: z.boolean().optional(),
  has_bookings: z.boolean().optional(),
  company: z.string().optional(),
});

// Contact Merge Schema
export const contactMergeSchema = z.object({
  primary_contact_id: z.string().min(1, 'Primary contact is required'),
  secondary_contact_ids: z.array(z.string()).min(1, 'Select contacts to merge'),
  merge_strategy: z.enum(['keep_primary', 'merge_all', 'manual']).default('merge_all'),
});

// Export types
export type ContactData = z.infer<typeof contactSchema>;
export type ContactGroupData = z.infer<typeof contactGroupSchema>;
export type ContactInteractionData = z.infer<typeof contactInteractionSchema>;
export type ContactImportData = z.infer<typeof contactImportSchema>;
export type ContactFilterData = z.infer<typeof contactFilterSchema>;
export type ContactMergeData = z.infer<typeof contactMergeSchema>;