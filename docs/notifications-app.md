# Notifications App Documentation

## Overview
The Notifications app manages all automated communication with users and invitees via email and SMS. It provides customizable templates, user preferences, scheduled notifications, delivery tracking, and comprehensive notification management. This app is crucial for user engagement and booking lifecycle communication.

## Models

### NotificationTemplate Model
**File**: `backend/apps/notifications/models.py`

**Key Fields**:
- `id`: UUIDField (primary key)
- `organizer`: ForeignKey to User
- `name`: CharField (max_length=200)
- `template_type`: CharField with choices:
  - 'booking_confirmation'
  - 'booking_reminder'
  - 'booking_cancellation'
  - 'booking_rescheduled'
  - 'follow_up'
  - 'custom'
- `notification_type`: CharField ('email', 'sms')
- `subject`: CharField (for emails)
- `message`: TextField
- `is_active`: BooleanField
- `is_default`: BooleanField
- `required_placeholders`: JSONField (list of required template variables)

**Key Methods**:
- `validate_placeholders(context_data)`: Checks for missing required placeholders
- `render_content(context_data)`: Safely renders template with fallbacks

**Unique Constraint**: `['organizer', 'template_type', 'notification_type', 'is_default']`

### NotificationLog Model
**File**: `backend/apps/notifications/models.py`

**Key Fields**:
- `organizer`: ForeignKey to User
- `booking`: ForeignKey to Booking (optional)
- `template`: ForeignKey to NotificationTemplate (optional)
- `notification_type`: CharField ('email', 'sms')
- `recipient_email`: EmailField
- `recipient_phone`: CharField
- `subject`: CharField
- `message`: TextField
- `status`: CharField with choices:
  - 'pending'
  - 'sent'
  - 'failed'
  - 'bounced'
  - 'delivered'
  - 'opened'
  - 'clicked'
- `sent_at`: DateTimeField
- `delivered_at`: DateTimeField
- `opened_at`: DateTimeField
- `clicked_at`: DateTimeField
- `error_message`: TextField
- `retry_count`: IntegerField
- `max_retries`: IntegerField (default: 3)
- `external_id`: CharField (provider message ID)
- `delivery_status`: CharField (provider-specific status)
- `provider_response`: JSONField

**Key Methods**:
- `can_retry()`: Checks if notification can be retried
- `mark_retry(error_message)`: Records retry attempt

### NotificationPreference Model
**File**: `backend/apps/notifications/models.py`

**Key Fields**:
- `organizer`: OneToOneField to User
- **Email Preferences**:
  - `booking_confirmations_email`: BooleanField (default: True)
  - `booking_reminders_email`: BooleanField (default: True)
  - `booking_cancellations_email`: BooleanField (default: True)
  - `daily_agenda_email`: BooleanField (default: True)
- **SMS Preferences**:
  - `booking_confirmations_sms`: BooleanField (default: False)
  - `booking_reminders_sms`: BooleanField (default: False)
  - `booking_cancellations_sms`: BooleanField (default: False)
- **Timing Preferences**:
  - `reminder_minutes_before`: IntegerField (default: 60)
  - `daily_agenda_time`: TimeField (default: '08:00')
- **Do-Not-Disturb Settings**:
  - `dnd_enabled`: BooleanField (default: False)
  - `dnd_start_time`: TimeField (default: 22:00)
  - `dnd_end_time`: TimeField (default: 07:00)
- **Weekend Preferences**:
  - `exclude_weekends_reminders`: BooleanField (default: False)
  - `exclude_weekends_agenda`: BooleanField (default: True)
- **Communication Preferences**:
  - `preferred_notification_method`: CharField ('email', 'sms', 'both')
  - `max_reminders_per_day`: IntegerField (1-50, default: 10)

**Key Methods**:
- `is_in_dnd_period(check_time)`: Checks if time is in DND period
- `should_exclude_weekend(notification_type, date)`: Weekend exclusion logic
- `get_daily_reminder_count()`: Current day's reminder count
- `can_send_reminder()`: Checks against daily limit

### NotificationSchedule Model
**File**: `backend/apps/notifications/models.py`

**Key Fields**:
- `organizer`: ForeignKey to User
- `booking`: ForeignKey to Booking (optional)
- `schedule_type`: CharField ('reminder', 'follow_up', 'daily_agenda')
- `notification_type`: CharField ('email', 'sms')
- `scheduled_for`: DateTimeField
- `status`: CharField ('scheduled', 'sent', 'cancelled', 'failed')
- `recipient_email`: EmailField
- `recipient_phone`: CharField
- `subject`: CharField
- `message`: TextField
- `sent_at`: DateTimeField
- `error_message`: TextField

**Key Methods**:
- `should_send_now(tolerance_minutes)`: Checks if notification is due
- `calculate_next_send_time(preferences)`: Adjusts send time based on preferences

## API Endpoints

### Template Management
**Base URL**: `/api/v1/notifications/`

#### Notification Templates CRUD
- **GET/POST** `/templates/`
- **GET/PUT/DELETE** `/templates/<uuid:pk>/`
- **Serializer**: `NotificationTemplateSerializer`
- **Features**:
  - Template creation and management
  - Template type organization
  - Default template handling
  - Placeholder validation

#### Template Testing
- **POST** `/templates/<uuid:pk>/test/`
- **Function**: `test_template`
- **Features**: Send test notification using template

### Notification Management
#### Notification Logs
- **GET** `/logs/`
- **Serializer**: `NotificationLogSerializer`
- **Features**:
  - Notification history
  - Delivery status tracking
  - Error analysis
  - Performance metrics

#### Manual Notification Sending
- **POST** `/send/`
- **Function**: `send_notification`
- **Serializer**: `SendNotificationSerializer`
- **Features**:
  - Manual notification sending
  - Template usage
  - Immediate or scheduled sending
  - Validation and error handling

#### Resend Failed Notifications
- **POST** `/<uuid:pk>/resend/`
- **Function**: `resend_failed_notification`
- **Features**: Retry failed notifications manually

### Preferences Management
#### Notification Preferences
- **GET/PUT** `/preferences/`
- **Serializer**: `NotificationPreferenceSerializer`
- **Features**:
  - User preference management
  - DND configuration
  - Timing preferences
  - Method preferences

### Scheduled Notifications
#### Schedule Management
- **GET** `/scheduled/`
- **Serializer**: `NotificationScheduleSerializer`
- **Features**: View scheduled notifications

#### Cancel Scheduled Notification
- **POST** `/scheduled/<uuid:pk>/cancel/`
- **Function**: `cancel_scheduled_notification`
- **Features**: Cancel pending scheduled notifications

### Statistics and Monitoring
#### Notification Statistics
- **GET** `/stats/`
- **Function**: `notification_stats`
- **Features**:
  - Comprehensive statistics
  - Delivery rates
  - Open/click rates
  - Template usage
  - Recent activity

#### Notification Health
- **GET** `/health/`
- **Function**: `notification_health`
- **Features**:
  - System health status
  - Recent failure analysis
  - Configuration validation
  - Service availability

### Webhooks and Callbacks
#### SMS Status Callback
- **POST** `/sms-status-callback/`
- **Function**: `sms_status_callback`
- **Features**: Twilio delivery status updates (CSRF exempt)

## Celery Tasks

### Core Notification Tasks
1. **`send_notification_task`**:
   - Main notification sending engine
   - Handles email and SMS
   - Retry logic with exponential backoff
   - Status tracking and logging
   - Provider response handling

2. **`send_test_notification`**:
   - Sends test notifications using templates
   - Uses mock context data
   - Marks as test in subject/content
   - Validation and error handling

### Scheduled Notification Tasks
1. **`process_scheduled_notifications`**:
   - Processes due scheduled notifications
   - Applies user preferences (DND, weekends)
   - Handles daily limits
   - Defers notifications when appropriate

2. **`send_booking_reminders`**:
   - Sends reminders for upcoming bookings
   - Respects user preferences
   - Handles timezone calculations
   - Creates scheduled reminders for future

3. **`send_daily_agenda`**:
   - Sends daily agenda emails
   - Timezone-aware scheduling
   - Weekend exclusion handling
   - Booking summary generation

### Booking Lifecycle Notifications
1. **`send_booking_notification`**:
   - Handles all booking-related notifications
   - Supports multiple event types (created, cancelled, rescheduled)
   - Applies user preferences
   - Schedules follow-up notifications

2. **Template-Specific Tasks**:
   - `send_booking_confirmation_email/sms`
   - `send_booking_cancellation_email/sms`
   - `send_booking_rescheduled_email/sms`
   - `schedule_booking_reminder`

### Monitoring and Maintenance Tasks
1. **`cleanup_old_notification_logs`**:
   - Removes logs older than 90 days
   - Prevents database bloat
   - Maintains performance

2. **`monitor_notification_failures`**:
   - Tracks failure rates
   - Identifies problematic organizers
   - Sends alerts for high failure rates
   - Generates health reports

3. **`retry_failed_notifications`**:
   - Automatically retries failed notifications
   - Respects retry limits
   - Uses exponential backoff
   - Updates status appropriately

## Template System

### Template Variables
**Booking Context**:
- `{{booking_id}}`: Unique booking identifier
- `{{invitee_name}}`: Invitee's full name
- `{{invitee_email}}`: Invitee's email address
- `{{invitee_phone}}`: Invitee's phone number
- `{{invitee_timezone}}`: Invitee's timezone
- `{{organizer_name}}`: Organizer's name
- `{{organizer_email}}`: Organizer's email
- `{{event_name}}`: Event type name
- `{{event_description}}`: Event type description
- `{{duration}}`: Meeting duration
- `{{start_time}}`: Start time in organizer timezone
- `{{end_time}}`: End time in organizer timezone
- `{{start_time_invitee}}`: Start time in invitee timezone
- `{{end_time_invitee}}`: End time in invitee timezone
- `{{meeting_link}}`: Video meeting URL
- `{{meeting_id}}`: Meeting ID
- `{{meeting_password}}`: Meeting password
- `{{cancellation_reason}}`: Reason for cancellation
- `{{booking_url}}`: Booking management URL
- `{{reschedule_url}}`: Reschedule URL
- `{{cancel_url}}`: Cancellation URL

**Custom Answer Variables**:
- `{{custom_answer_key}}`: Any custom question answer

**Fallback System**: Missing variables replaced with sensible defaults (e.g., "TBD", "N/A", "Guest")

### Template Rendering
**Engine**: Django template engine with fallback to simple string replacement

**Safety Features**:
- Graceful handling of missing variables
- HTML escaping for email templates
- Length limits for SMS
- Validation of required placeholders

## Frontend Pages Required

### Template Management
1. **Templates Dashboard** (`/notifications/templates`)
   - Template list organized by type
   - Default template indicators
   - Usage statistics
   - Quick actions (edit, test, duplicate)
   - Template type filtering

2. **Create/Edit Template** (`/notifications/templates/new`, `/notifications/templates/<id>/edit`)
   - Template type selection
   - Notification type selection (email/SMS)
   - Subject line editor (email only)
   - Message editor with variable helper
   - Required placeholder configuration
   - Preview functionality
   - Test sending

3. **Template Editor** (component within create/edit)
   - Rich text editor for email templates
   - Plain text editor for SMS
   - Variable insertion helper
   - Real-time character count (SMS)
   - Preview with sample data
   - Validation feedback

### Notification Management
1. **Notifications Dashboard** (`/notifications`)
   - Recent notifications overview
   - Delivery statistics
   - Failed notifications alerts
   - Quick actions
   - Performance metrics

2. **Notification History** (`/notifications/history`)
   - Comprehensive notification log
   - Filtering by type, status, date
   - Search functionality
   - Delivery details
   - Retry options for failed notifications

3. **Send Notification** (`/notifications/send`)
   - Manual notification sending
   - Template selection
   - Recipient input
   - Content customization
   - Immediate or scheduled sending
   - Preview before sending

### Preferences Management
1. **Notification Preferences** (`/notifications/preferences`)
   - Email notification toggles
   - SMS notification toggles
   - Timing preferences (reminder minutes, agenda time)
   - Do-Not-Disturb configuration
   - Weekend exclusion settings
   - Daily limit configuration
   - Preferred communication method

2. **DND Configuration** (component within preferences)
   - Enable/disable toggle
   - Start/end time pickers
   - Timezone consideration
   - Preview of affected times

### Scheduled Notifications
1. **Scheduled Notifications** (`/notifications/scheduled`)
   - Upcoming scheduled notifications
   - Cancellation options
   - Rescheduling functionality
   - Status tracking

### Analytics and Monitoring
1. **Notification Analytics** (`/notifications/analytics`)
   - Delivery rate statistics
   - Open/click rates (email)
   - Template performance comparison
   - Failure analysis
   - Trend charts

2. **Notification Health** (`/notifications/health`)
   - System health indicators
   - Recent failure analysis
   - Configuration validation
   - Service status (email/SMS providers)

## Components Required

### Template Components
1. **TemplateCard**
   - Template summary display
   - Type and notification method indicators
   - Usage statistics
   - Quick actions (edit, test, duplicate)
   - Default template badge

2. **TemplateEditor**
   - Rich text editor for email content
   - Plain text editor for SMS
   - Variable insertion helper
   - Character count for SMS
   - Preview functionality
   - Validation feedback

3. **VariableHelper**
   - Available variables list
   - Variable descriptions
   - One-click insertion
   - Context-aware suggestions
   - Required variable indicators

4. **TemplatePreview**
   - Rendered template display
   - Sample data substitution
   - Mobile preview for emails
   - Character count for SMS
   - Validation warnings

### Notification Management Components
1. **NotificationCard**
   - Notification summary
   - Delivery status indicators
   - Timestamp information
   - Recipient details
   - Action buttons (resend, view details)

2. **NotificationList**
   - Sortable notification table
   - Status filtering
   - Date range filtering
   - Search functionality
   - Bulk operations

3. **DeliveryStatus**
   - Visual status indicators
   - Delivery timeline
   - Error details
   - Retry information
   - Provider response data

### Preferences Components
1. **NotificationPreferences**
   - Toggle switches for notification types
   - Time pickers for scheduling
   - Method selection (email/SMS/both)
   - Daily limit sliders
   - Preview of settings impact

2. **DNDConfiguration**
   - Enable/disable toggle
   - Time range picker
   - Timezone display
   - Weekend handling
   - Preview of blocked times

3. **ReminderSettings**
   - Minutes before meeting slider
   - Method selection
   - Preview of reminder timing
   - Validation feedback

### Analytics Components
1. **NotificationAnalytics**
   - Delivery rate charts
   - Open/click rate trends
   - Template performance comparison
   - Failure analysis graphs
   - Export functionality

2. **DeliveryMetrics**
   - Real-time statistics
   - Success/failure rates
   - Provider performance
   - Historical trends

## User Flows

### Setting Up Notification Preferences
1. User navigates to notification preferences
2. Reviews current settings
3. Configures email preferences:
   - Enables/disables notification types
   - Sets reminder timing
   - Configures daily agenda time
4. Configures SMS preferences:
   - Enables/disables SMS notifications
   - Verifies phone number
5. Sets up Do-Not-Disturb:
   - Enables DND
   - Sets quiet hours
   - Configures weekend handling
6. Sets daily limits
7. Saves preferences
8. Tests notification delivery

### Creating Custom Templates
1. User navigates to templates
2. Clicks "Create New Template"
3. Selects template type and notification method
4. Enters template name
5. Writes subject line (email) or message (SMS)
6. Inserts template variables
7. Configures required placeholders
8. Previews template with sample data
9. Tests template delivery
10. Saves and activates template

### Managing Notification History
1. User views notification dashboard
2. Reviews recent delivery statistics
3. Investigates failed notifications:
   - Views error details
   - Attempts manual retry
   - Updates configuration if needed
4. Analyzes delivery patterns
5. Optimizes templates based on performance

### Troubleshooting Delivery Issues
1. User notices delivery problems
2. Checks notification health dashboard
3. Reviews recent failures
4. Validates configuration:
   - Email service settings
   - SMS service settings
   - Template validation
5. Tests notification delivery
6. Contacts support if needed

## Advanced Features

### Intelligent Scheduling
1. **Preference-Aware Scheduling**:
   - Respects DND periods
   - Handles weekend exclusions
   - Applies daily limits
   - Timezone-aware timing

2. **Adaptive Timing**:
   - Learns from user behavior
   - Optimizes send times
   - Avoids spam filters
   - Maximizes engagement

### Template Intelligence
1. **Smart Variables**:
   - Context-aware suggestions
   - Required variable validation
   - Fallback value system
   - Dynamic content generation

2. **Performance Optimization**:
   - Template caching
   - Batch rendering
   - Efficient variable substitution
   - Memory optimization

### Delivery Optimization
1. **Provider Management**:
   - Multiple email provider support
   - SMS provider failover
   - Rate limit management
   - Cost optimization

2. **Retry Logic**:
   - Exponential backoff
   - Provider-specific retry rules
   - Intelligent failure classification
   - Maximum retry limits

## Integration Points

### Internal Integrations
- **Events App**: Booking lifecycle notifications
- **Users App**: User preferences and profile data
- **Workflows App**: Automated notification sending
- **Integrations App**: Webhook notifications

### External Integrations
- **Email Services**: SMTP, SendGrid, Mailgun, AWS SES
- **SMS Services**: Twilio (implemented), others possible
- **Analytics**: Email open/click tracking
- **Monitoring**: Error tracking and alerting

## Validation Rules

### Template Validation
- Template name required and unique per organizer/type
- Message content required
- Subject required for email templates
- Required placeholders must be present
- Valid template variable syntax

### Notification Validation
- Recipient required (email or phone based on type)
- Valid email format
- Valid phone number format (E.164)
- Message content not empty
- Scheduled time in future (for scheduled notifications)

### Preference Validation
- Reminder minutes must be positive
- Daily agenda time must be valid
- DND times must be logical
- Daily limits within reasonable range (1-50)

## Error Handling

### Sending Errors
- Invalid recipient information
- Provider service failures
- Rate limit exceeded
- Network timeouts
- Authentication failures

### Template Errors
- Missing required variables
- Invalid template syntax
- Rendering failures
- Character limit exceeded (SMS)

### Scheduling Errors
- Invalid send times
- Timezone conversion issues
- Preference conflicts
- Daily limit exceeded

## Performance Considerations

### Optimization Strategies
1. **Batch Processing**:
   - Bulk notification sending
   - Template rendering optimization
   - Database query batching
   - Provider API batching

2. **Caching**:
   - Template caching
   - Rendered content caching
   - User preference caching
   - Provider response caching

3. **Queue Management**:
   - Priority queues for urgent notifications
   - Rate limiting queues
   - Retry queues
   - Dead letter queues

### Monitoring
1. **Performance Metrics**:
   - Send time tracking
   - Delivery rate monitoring
   - Template rendering time
   - Provider response times

2. **Health Monitoring**:
   - Service availability
   - Error rate tracking
   - Queue depth monitoring
   - Resource usage tracking

## Security Considerations

### Data Protection
- Sensitive content encryption
- Secure template storage
- Access control for templates
- Audit logging for changes

### Provider Security
- Secure credential storage
- API key rotation
- Rate limiting protection
- Webhook signature validation

### Privacy Compliance
- Opt-out mechanisms
- Data retention policies
- Consent tracking
- GDPR compliance

## Testing Requirements

### Unit Tests
- Template rendering logic
- Preference application
- Validation rules
- Error handling

### Integration Tests
- End-to-end notification flow
- Provider integration
- Webhook delivery
- Preference enforcement

### Performance Tests
- High-volume notification sending
- Template rendering performance
- Provider rate limit handling
- Queue processing efficiency

## Deployment Considerations

### Environment Configuration
- Email service credentials
- SMS service credentials (Twilio)
- Rate limiting settings
- Monitoring configuration

### Scaling Considerations
- Background task scaling
- Provider rate limit distribution
- Database connection pooling
- Queue management

### Monitoring Setup
- Delivery rate monitoring
- Error rate tracking
- Performance metric collection
- Alert configuration

## Future Enhancements

### Planned Features
1. **Advanced Templates**:
   - Rich HTML email templates
   - Template inheritance
   - Conditional content blocks
   - A/B testing support

2. **Enhanced Analytics**:
   - Engagement tracking
   - Conversion metrics
   - Template optimization suggestions
   - Predictive analytics

3. **Multi-Channel Support**:
   - Push notifications
   - In-app notifications
   - Slack/Teams integration
   - Voice notifications

### Current Limitations
1. **Email Delivery Tracking**:
   - `get_email_delivery_status_from_provider` is placeholder
   - No open/click tracking implementation
   - Limited provider integration

2. **Template Features**:
   - Basic template engine
   - No conditional logic in templates
   - Limited formatting options
   - No template inheritance

3. **Provider Support**:
   - Single email provider (SMTP)
   - Single SMS provider (Twilio)
   - No failover mechanisms
   - Limited provider-specific features

## SMS Integration Details

### Twilio Integration
**Configuration**:
- `TWILIO_ACCOUNT_SID`: Account identifier
- `TWILIO_AUTH_TOKEN`: Authentication token
- `TWILIO_PHONE_NUMBER`: Sending phone number

**Features**:
- Message sending with delivery tracking
- Status callbacks for delivery updates
- Error handling and retry logic
- Cost tracking and optimization

**Status Callback Handling**:
- Receives delivery status updates
- Updates notification log status
- Tracks delivery timestamps
- Handles error codes and messages

### Phone Number Validation
**Format**: E.164 international format
**Validation Rules**:
- 10-15 digits
- Optional country code
- Automatic formatting
- Invalid number handling

## Email Integration Details

### SMTP Configuration
**Settings**:
- `EMAIL_HOST`: SMTP server
- `EMAIL_PORT`: Server port
- `EMAIL_USE_TLS`: TLS encryption
- `EMAIL_HOST_USER`: Username
- `EMAIL_HOST_PASSWORD`: Password

**Features**:
- HTML and plain text support
- Attachment support (future)
- Template rendering
- Error handling

### HTML Email Templates
**Location**: `backend/templates/emails/`
**Available Templates**:
- `generic.html`: Base template for all notifications
- `welcome.html`: Welcome email for new users
- `invitation.html`: Team invitation email
- `password_reset.html`: Password reset email
- `booking_reminder.html`: Meeting reminder email
- `email_verification.html`: Email verification
- `password_expiry_warning.html`: Password expiry warning

**Features**:
- Responsive design
- Brand customization
- Professional styling
- Mobile optimization

This comprehensive notification system provides robust communication capabilities with extensive customization, monitoring, and optimization features for enterprise-level scheduling platforms.