// Base types
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    pagination?: PaginationMeta;
    performance?: PerformanceMeta;
  };
}

export interface PaginationMeta {
  count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  current_page: number;
  total_pages: number;
}

export interface PerformanceMeta {
  query_time: number;
  cache_hit: boolean;
}

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
  field_errors?: Record<string, string[]>;
}

// User types
export interface User extends BaseModel {
  email: string;
  first_name: string;
  last_name: string;
  is_organizer: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_mfa_enabled: boolean;
  account_status: 'active' | 'inactive' | 'suspended' | 'pending_verification' | 'password_expired' | 'password_expired_grace_period';
  roles: Role[];
  last_login: string | null;
  profile?: UserProfile;
}

export interface UserProfile extends BaseModel {
  user: string;
  organizer_slug: string;
  display_name: string;
  bio: string;
  profile_picture: string | null;
  phone: string;
  website: string;
  company: string;
  job_title: string;
  timezone_name: string;
  language: string;
  date_format: string;
  time_format: string;
  brand_color: string;
  brand_logo: string | null;
  public_profile: boolean;
  show_phone: boolean;
  show_email: boolean;
  reasonable_hours_start: number;
  reasonable_hours_end: number;
}

export interface Role extends BaseModel {
  name: string;
  role_type: 'admin' | 'organizer' | 'team_member' | 'billing_manager' | 'viewer';
  parent: string | null;
  role_permissions: Permission[];
  is_system_role: boolean;
}

export interface Permission extends BaseModel {
  codename: string;
  name: string;
  description: string;
  category: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  terms_accepted: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface MFASetupResponse {
  qr_code?: string;
  secret?: string;
  backup_codes?: string[];
}

// Event types
export interface EventType extends BaseModel {
  organizer: string;
  name: string;
  event_type_slug: string;
  description: string;
  duration: number;
  max_attendees: number;
  enable_waitlist: boolean;
  is_active: boolean;
  is_private: boolean;
  min_scheduling_notice: number;
  max_scheduling_horizon: number;
  buffer_time_before: number;
  buffer_time_after: number;
  max_bookings_per_day: number | null;
  slot_interval_minutes: number;
  recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrence_rule: string;
  max_occurrences: number | null;
  recurrence_end_date: string | null;
  location_type: 'video_call' | 'phone_call' | 'in_person' | 'custom';
  location_details: string;
  redirect_url_after_booking: string;
  custom_questions: CustomQuestion[];
  booking_count?: number;
  success_rate?: number;
}

export interface CustomQuestion extends BaseModel {
  event_type: string;
  question_text: string;
  question_type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'email' | 'phone' | 'number' | 'date' | 'time' | 'url';
  is_required: boolean;
  order: number;
  options: string[] | null;
  conditions: any;
  validation_rules: any;
}

// Booking types
export interface Booking extends BaseModel {
  event_type: EventType;
  organizer: User;
  invitee_name: string;
  invitee_email: string;
  invitee_phone: string;
  invitee_timezone: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'rescheduled' | 'completed' | 'no_show';
  attendee_count: number;
  recurrence_id: string | null;
  is_recurring_exception: boolean;
  recurrence_sequence: number;
  access_token: string;
  custom_answers: Record<string, any>;
  meeting_link: string;
  meeting_id: string;
  meeting_password: string;
  external_calendar_event_id: string;
  calendar_sync_status: 'pending' | 'succeeded' | 'failed' | 'not_required';
  calendar_sync_error: string;
  cancelled_at: string | null;
  cancelled_by: 'organizer' | 'invitee' | 'system' | null;
  cancellation_reason: string;
  rescheduled_from: string | null;
  rescheduled_at: string | null;
  attendees?: BookingAttendee[];
}

export interface BookingAttendee extends BaseModel {
  booking: string;
  name: string;
  email: string;
  phone: string;
  status: 'confirmed' | 'cancelled' | 'no_show';
  custom_answers: Record<string, any>;
  joined_at: string;
  cancelled_at: string | null;
  cancellation_reason: string;
}

export interface BookingCreateData {
  event_type_slug: string;
  organizer_slug: string;
  start_time: string;
  end_time: string;
  invitee_name: string;
  invitee_email: string;
  invitee_phone?: string;
  invitee_timezone: string;
  attendee_count?: number;
  custom_answers?: Record<string, any>;
}

// Availability types
export interface AvailabilityRule extends BaseModel {
  organizer: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  event_types: string[];
  is_active: boolean;
}

export interface DateOverrideRule extends BaseModel {
  organizer: string;
  date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  event_types: string[];
  reason: string;
  is_active: boolean;
}

export interface BlockedTime extends BaseModel {
  organizer: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
  source: 'manual' | 'google_calendar' | 'outlook_calendar' | 'apple_calendar' | 'external_sync';
  external_id: string;
  external_updated_at: string | null;
  is_active: boolean;
}

export interface BufferTime extends BaseModel {
  organizer: string;
  default_buffer_before: number;
  default_buffer_after: number;
  minimum_gap: number;
  slot_interval_minutes: number;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  available_spots?: number;
  total_spots?: number;
  is_waitlist_available?: boolean;
}

export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
  timezone: string;
  performance_metrics?: {
    computation_time: number;
    cache_hit: boolean;
    slots_generated: number;
  };
}

// Integration types
export interface CalendarIntegration extends BaseModel {
  organizer: string;
  provider: 'google' | 'outlook' | 'apple';
  provider_user_id: string;
  provider_email: string;
  calendar_id: string;
  last_sync_at: string | null;
  sync_token: string;
  sync_errors: number;
  is_active: boolean;
  sync_enabled: boolean;
}

export interface VideoConferenceIntegration extends BaseModel {
  organizer: string;
  provider: 'zoom' | 'google_meet' | 'microsoft_teams' | 'webex';
  provider_user_id: string;
  provider_email: string;
  last_api_call: string | null;
  api_calls_today: number;
  rate_limit_reset_at: string | null;
  is_active: boolean;
  auto_generate_links: boolean;
}

export interface WebhookIntegration extends BaseModel {
  organizer: string;
  name: string;
  webhook_url: string;
  events: string[];
  secret_key: string;
  headers: Record<string, string>;
  is_active: boolean;
  retry_failed: boolean;
  max_retries: number;
}

// Workflow types
export interface Workflow extends BaseModel {
  organizer: string;
  name: string;
  description: string;
  trigger: 'booking_created' | 'booking_cancelled' | 'booking_completed' | 'before_meeting' | 'after_meeting';
  event_types: string[];
  delay_minutes: number;
  is_active: boolean;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  last_executed_at: string | null;
  actions: WorkflowAction[];
}

export interface WorkflowAction extends BaseModel {
  workflow: string;
  name: string;
  action_type: 'send_email' | 'send_sms' | 'webhook' | 'update_booking';
  order: number;
  recipient: 'organizer' | 'invitee' | 'both' | 'custom';
  custom_email: string;
  subject: string;
  message: string;
  webhook_url: string;
  webhook_data: Record<string, any>;
  conditions: any[];
  update_booking_fields: Record<string, any>;
  is_active: boolean;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  last_executed_at: string | null;
}

export interface WorkflowExecution extends BaseModel {
  workflow: string;
  booking: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at: string | null;
  error_message: string;
  actions_executed: number;
  actions_failed: number;
  execution_log: any[];
}

// Notification types
export interface NotificationTemplate extends BaseModel {
  organizer: string;
  name: string;
  template_type: 'booking_confirmation' | 'booking_reminder' | 'booking_cancellation' | 'booking_rescheduled' | 'follow_up' | 'custom';
  notification_type: 'email' | 'sms';
  subject: string;
  message: string;
  is_active: boolean;
  is_default: boolean;
  required_placeholders: string[];
  usage_count?: number;
  last_used?: string;
}

export interface NotificationLog extends BaseModel {
  organizer: string;
  booking: string | null;
  template: string | null;
  notification_type: 'email' | 'sms';
  recipient_email: string;
  recipient_phone: string;
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced' | 'delivered' | 'opened' | 'clicked';
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  error_message: string;
  retry_count: number;
  max_retries: number;
  external_id: string;
  delivery_status: string;
  provider_response: any;
  template_info?: {
    name: string;
    template_type: string;
  };
}

export interface NotificationPreference extends BaseModel {
  organizer: string;
  booking_confirmations_email: boolean;
  booking_reminders_email: boolean;
  booking_cancellations_email: boolean;
  daily_agenda_email: boolean;
  booking_confirmations_sms: boolean;
  booking_reminders_sms: boolean;
  booking_cancellations_sms: boolean;
  reminder_minutes_before: number;
  daily_agenda_time: string;
  dnd_enabled: boolean;
  dnd_start_time: string;
  dnd_end_time: string;
  exclude_weekends_reminders: boolean;
  exclude_weekends_agenda: boolean;
  preferred_notification_method: 'email' | 'sms' | 'both';
  max_reminders_per_day: number;
}

// Contact types
export interface Contact extends BaseModel {
  organizer: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  notes: string;
  tags: string[];
  total_bookings: number;
  last_booking_date: string | null;
  is_active: boolean;
}

export interface ContactGroup extends BaseModel {
  organizer: string;
  name: string;
  description: string;
  color: string;
  contacts: string[];
  contact_count?: number;
}

export interface ContactInteraction extends BaseModel {
  contact: string;
  organizer: string;
  interaction_type: 'booking_created' | 'booking_completed' | 'booking_cancelled' | 'email_sent' | 'note_added' | 'manual_entry';
  description: string;
  booking: string | null;
  metadata: any;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  validation?: any;
  description?: string;
}

// UI types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: string;
}

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string | number;
  children?: MenuItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'checkbox';
  options?: SelectOption[];
  placeholder?: string;
}

// Chart types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: React.ComponentType<any>;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

// Theme types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    foreground: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  borderRadius: string;
}

// Utility types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export type SortDirection = 'asc' | 'desc';

export type ViewMode = 'list' | 'grid' | 'calendar';

export type DateRange = {
  start: Date;
  end: Date;
};

export type TimeRange = {
  start: string;
  end: string;
};

export type Timezone = {
  value: string;
  label: string;
  offset: string;
};