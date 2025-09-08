import { z } from 'zod';

// Workflow Schema
export const workflowSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
  trigger: z.enum(['booking_created', 'booking_cancelled', 'booking_completed', 'before_meeting', 'after_meeting']),
  event_types: z.array(z.string()).default([]),
  delay_minutes: z.number().min(0).max(10080).default(0), // Max 1 week
  is_active: z.boolean().default(true),
});

// Workflow Action Schema
export const workflowActionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  action_type: z.enum(['send_email', 'send_sms', 'webhook', 'update_booking']),
  order: z.number().min(0).default(0),
  recipient: z.enum(['organizer', 'invitee', 'both', 'custom']).default('invitee'),
  custom_email: z.string().email().optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, 'Message is required'),
  webhook_url: z.string().url().optional(),
  webhook_data: z.record(z.any()).default({}),
  conditions: z.array(z.any()).default([]),
  update_booking_fields: z.record(z.any()).default({}),
  is_active: z.boolean().default(true),
});

// Condition Group Schema
export const conditionGroupSchema = z.object({
  operator: z.enum(['AND', 'OR']),
  rules: z.array(z.object({
    field: z.string().min(1, 'Field is required'),
    operator: z.enum([
      'equals', 'not_equals', 'greater_than', 'less_than', 
      'greater_than_or_equal', 'less_than_or_equal',
      'contains', 'not_contains', 'starts_with', 'ends_with',
      'is_empty', 'is_not_empty', 'in_list', 'not_in_list', 'regex_match'
    ]),
    value: z.any(),
  })),
});

// Workflow Test Schema
export const workflowTestSchema = z.object({
  test_type: z.enum(['mock_data', 'real_data', 'live_test']),
  booking_id: z.string().optional(),
  mock_context: z.record(z.any()).optional(),
});

// Template Variable Schema
export const templateVariableSchema = z.object({
  variable_name: z.string(),
  description: z.string(),
  example_value: z.string(),
  category: z.enum(['booking', 'event_type', 'organizer', 'time', 'derived', 'custom']),
});

// Export types
export type WorkflowData = z.infer<typeof workflowSchema>;
export type WorkflowActionData = z.infer<typeof workflowActionSchema>;
export type ConditionGroupData = z.infer<typeof conditionGroupSchema>;
export type WorkflowTestData = z.infer<typeof workflowTestSchema>;
export type TemplateVariableData = z.infer<typeof templateVariableSchema>;