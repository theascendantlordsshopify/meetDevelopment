// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Application Constants
export const APP_NAME = 'CalendlyClone';
export const APP_DESCRIPTION = 'Smart Scheduling Made Simple';

// Route Constants
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // Dashboard routes
  DASHBOARD: '/dashboard',
  EVENT_TYPES: '/event-types',
  BOOKINGS: '/bookings',
  AVAILABILITY: '/availability',
  INTEGRATIONS: '/integrations',
  WORKFLOWS: '/workflows',
  NOTIFICATIONS: '/notifications',
  CONTACTS: '/contacts',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  
  // Profile routes
  PROFILE: '/profile',
  TEAM: '/team',
  
  // Public booking routes
  PUBLIC_PROFILE: (slug: string) => `/${slug}`,
  PUBLIC_BOOKING: (organizerSlug: string, eventSlug: string) => `/${organizerSlug}/${eventSlug}`,
  BOOKING_MANAGEMENT: (token: string) => `/booking/${token}/manage`,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/v1/users/login/',
    REGISTER: '/api/v1/users/register/',
    LOGOUT: '/api/v1/users/logout/',
    REFRESH: '/api/v1/users/refresh/',
    PROFILE: '/api/v1/users/profile/',
    CHANGE_PASSWORD: '/api/v1/users/change-password/',
    REQUEST_PASSWORD_RESET: '/api/v1/users/request-password-reset/',
    CONFIRM_PASSWORD_RESET: '/api/v1/users/confirm-password-reset/',
    VERIFY_EMAIL: '/api/v1/users/verify-email/',
    RESEND_VERIFICATION: '/api/v1/users/resend-verification/',
  },
  
  // Event Types
  EVENT_TYPES: {
    LIST: '/api/v1/events/event-types/',
    DETAIL: (id: string) => `/api/v1/events/event-types/${id}/`,
    PUBLIC: (organizerSlug: string, eventSlug: string) => `/${organizerSlug}/${eventSlug}/`,
  },
  
  // Bookings
  BOOKINGS: {
    LIST: '/api/v1/events/bookings/',
    DETAIL: (id: string) => `/api/v1/events/bookings/${id}/`,
    CREATE: '/api/v1/events/bookings/create/',
    MANAGE: (token: string) => `/api/v1/events/booking/${token}/manage/`,
    ANALYTICS: '/api/v1/events/analytics/',
  },
  
  // Availability
  AVAILABILITY: {
    RULES: '/api/v1/availability/rules/',
    OVERRIDES: '/api/v1/availability/overrides/',
    BLOCKED: '/api/v1/availability/blocked/',
    BUFFER: '/api/v1/availability/buffer/',
    SLOTS: (organizerSlug: string, eventSlug: string) => 
      `/api/v1/events/slots/${organizerSlug}/${eventSlug}/`,
    CALCULATED_SLOTS: (organizerSlug: string) => 
      `/api/v1/availability/calculated-slots/${organizerSlug}/`,
  },
  
  // Integrations
  INTEGRATIONS: {
    CALENDAR: '/api/v1/integrations/calendar/',
    VIDEO: '/api/v1/integrations/video/',
    WEBHOOKS: '/api/v1/integrations/webhooks/',
    OAUTH_INITIATE: '/api/v1/integrations/oauth/initiate/',
    OAUTH_CALLBACK: '/api/v1/integrations/oauth/callback/',
    HEALTH: '/api/v1/integrations/health/',
  },
  
  // Workflows
  WORKFLOWS: {
    LIST: '/api/v1/workflows/',
    DETAIL: (id: string) => `/api/v1/workflows/${id}/`,
    TEST: (id: string) => `/api/v1/workflows/${id}/test/`,
    VALIDATE: (id: string) => `/api/v1/workflows/${id}/validate/`,
    TEMPLATES: '/api/v1/workflows/templates/',
  },
  
  // Notifications
  NOTIFICATIONS: {
    TEMPLATES: '/api/v1/notifications/templates/',
    LOGS: '/api/v1/notifications/logs/',
    PREFERENCES: '/api/v1/notifications/preferences/',
    SEND: '/api/v1/notifications/send/',
    STATS: '/api/v1/notifications/stats/',
  },
  
  // Contacts
  CONTACTS: {
    LIST: '/api/v1/contacts/',
    DETAIL: (id: string) => `/api/v1/contacts/${id}/`,
    GROUPS: '/api/v1/contacts/groups/',
    IMPORT: '/api/v1/contacts/import/',
    EXPORT: '/api/v1/contacts/export/',
    STATS: '/api/v1/contacts/stats/',
  },
} as const;

// Event Type Durations (in minutes)
export const EVENT_DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240] as const;

// Buffer Time Options (in minutes)
export const BUFFER_TIME_OPTIONS = [0, 5, 10, 15, 30, 45, 60, 90, 120] as const;

// Slot Interval Options (in minutes)
export const SLOT_INTERVAL_OPTIONS = [5, 10, 15, 20, 30, 60] as const;

// Days of Week
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday', short: 'Mon' },
  { value: 1, label: 'Tuesday', short: 'Tue' },
  { value: 2, label: 'Wednesday', short: 'Wed' },
  { value: 3, label: 'Thursday', short: 'Thu' },
  { value: 4, label: 'Friday', short: 'Fri' },
  { value: 5, label: 'Saturday', short: 'Sat' },
  { value: 6, label: 'Sunday', short: 'Sun' },
] as const;

// Time Zones (common ones)
export const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
] as const;

// Location Types
export const LOCATION_TYPES = [
  { value: 'video_call', label: 'Video Call', icon: 'VideoCameraIcon' },
  { value: 'phone_call', label: 'Phone Call', icon: 'PhoneIcon' },
  { value: 'in_person', label: 'In Person', icon: 'MapPinIcon' },
  { value: 'custom', label: 'Custom', icon: 'CogIcon' },
] as const;

// Booking Statuses
export const BOOKING_STATUSES = [
  { value: 'confirmed', label: 'Confirmed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
  { value: 'rescheduled', label: 'Rescheduled', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'info' },
  { value: 'no_show', label: 'No Show', color: 'error' },
] as const;

// Account Statuses
export const ACCOUNT_STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'warning' },
  { value: 'suspended', label: 'Suspended', color: 'error' },
  { value: 'pending_verification', label: 'Pending Verification', color: 'warning' },
  { value: 'password_expired', label: 'Password Expired', color: 'error' },
  { value: 'password_expired_grace_period', label: 'Grace Period', color: 'warning' },
] as const;

// Notification Types
export const NOTIFICATION_TYPES = [
  { value: 'email', label: 'Email', icon: 'EnvelopeIcon' },
  { value: 'sms', label: 'SMS', icon: 'DevicePhoneMobileIcon' },
] as const;

// Workflow Triggers
export const WORKFLOW_TRIGGERS = [
  { value: 'booking_created', label: 'Booking Created' },
  { value: 'booking_cancelled', label: 'Booking Cancelled' },
  { value: 'booking_completed', label: 'Booking Completed' },
  { value: 'before_meeting', label: 'Before Meeting' },
  { value: 'after_meeting', label: 'After Meeting' },
] as const;

// Workflow Action Types
export const WORKFLOW_ACTION_TYPES = [
  { value: 'send_email', label: 'Send Email', icon: 'EnvelopeIcon' },
  { value: 'send_sms', label: 'Send SMS', icon: 'DevicePhoneMobileIcon' },
  { value: 'webhook', label: 'Webhook', icon: 'LinkIcon' },
  { value: 'update_booking', label: 'Update Booking', icon: 'PencilIcon' },
] as const;

// Integration Providers
export const INTEGRATION_PROVIDERS = {
  CALENDAR: [
    { value: 'google', label: 'Google Calendar', icon: '/icons/google.svg' },
    { value: 'outlook', label: 'Microsoft Outlook', icon: '/icons/microsoft.svg' },
    { value: 'apple', label: 'Apple Calendar', icon: '/icons/apple.svg' },
  ],
  VIDEO: [
    { value: 'zoom', label: 'Zoom', icon: '/icons/zoom.svg' },
    { value: 'google_meet', label: 'Google Meet', icon: '/icons/google-meet.svg' },
    { value: 'microsoft_teams', label: 'Microsoft Teams', icon: '/icons/teams.svg' },
    { value: 'webex', label: 'Webex', icon: '/icons/webex.svg' },
  ],
} as const;

// File Upload Limits
export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Date Formats
export const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY' },
] as const;

// Time Formats
export const TIME_FORMATS = [
  { value: '12h', label: '12-hour (AM/PM)' },
  { value: '24h', label: '24-hour' },
] as const;

// Languages
export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
] as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'The requested resource was not found',
  SERVER_ERROR: 'An unexpected error occurred. Please try again.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SENT: 'Sent successfully',
  COPIED: 'Copied to clipboard',
  UPLOADED: 'Uploaded successfully',
  CONNECTED: 'Connected successfully',
  DISCONNECTED: 'Disconnected successfully',
} as const;