# Events App Documentation

## Overview
The Events app is the core scheduling functionality of the platform. It manages event types (bookable services), bookings (scheduled meetings), attendees for group events, waitlists, custom questions, and comprehensive booking management features.

## Models

### EventType Model
**File**: `backend/apps/events/models.py`

**Key Fields**:
- `id`: UUIDField (primary key)
- `organizer`: ForeignKey to User
- `name`: CharField (max_length=200)
- `event_type_slug`: SlugField (auto-generated, unique per organizer)
- `description`: TextField
- `duration`: IntegerField with choices (15, 30, 45, 60, 90, 120, 180, 240 minutes)
- `max_attendees`: IntegerField (1-100, for group events)
- `enable_waitlist`: BooleanField (for when events are full)
- `is_active`: BooleanField
- `is_private`: BooleanField (accessible only via direct link)
- `min_scheduling_notice`: IntegerField (minutes)
- `max_scheduling_horizon`: IntegerField (minutes)
- `buffer_time_before`: IntegerField (0-120 minutes)
- `buffer_time_after`: IntegerField (0-120 minutes)
- `max_bookings_per_day`: IntegerField (optional limit)
- `slot_interval_minutes`: IntegerField (0-60, overrides organizer default)
- `recurrence_type`: CharField ('none', 'daily', 'weekly', 'monthly')
- `recurrence_rule`: TextField (RRULE string)
- `max_occurrences`: IntegerField (1-365)
- `recurrence_end_date`: DateField
- `location_type`: CharField ('video_call', 'phone_call', 'in_person', 'custom')
- `location_details`: TextField
- `redirect_url_after_booking`: URLField
- `confirmation_workflow`: ForeignKey to Workflow
- `reminder_workflow`: ForeignKey to Workflow
- `cancellation_workflow`: ForeignKey to Workflow
- `custom_questions`: JSONField (legacy, use CustomQuestion model)

**Key Methods**:
- `is_group_event()`: Returns True if max_attendees > 1
- `can_book_on_date(date)`: Validates booking constraints
- `get_total_duration_with_buffers()`: Total time blocked including buffers

### Booking Model
**File**: `backend/apps/events/models.py`

**Key Fields**:
- `id`: UUIDField (primary key)
- `event_type`: ForeignKey to EventType
- `organizer`: ForeignKey to User
- `invitee_name`: CharField
- `invitee_email`: EmailField
- `invitee_phone`: CharField
- `invitee_timezone`: CharField (default: 'UTC')
- `start_time`: DateTimeField
- `end_time`: DateTimeField
- `status`: CharField ('confirmed', 'cancelled', 'rescheduled', 'completed', 'no_show')
- `attendee_count`: IntegerField (for group events)
- `recurrence_id`: UUIDField (links recurring bookings)
- `is_recurring_exception`: BooleanField
- `recurrence_sequence`: IntegerField
- `access_token`: UUIDField (for invitee management)
- `access_token_expires_at`: DateTimeField
- `custom_answers`: JSONField
- `meeting_link`: URLField
- `meeting_id`: CharField
- `meeting_password`: CharField
- `external_calendar_event_id`: CharField
- `calendar_sync_status`: CharField ('pending', 'succeeded', 'failed', 'not_required')
- `calendar_sync_error`: TextField
- `calendar_sync_attempts`: IntegerField
- `cancelled_at`: DateTimeField
- `cancelled_by`: CharField ('organizer', 'invitee', 'system')
- `cancellation_reason`: TextField
- `rescheduled_from`: ForeignKey to self
- `rescheduled_at`: DateTimeField

**Key Methods**:
- `can_be_cancelled()`: Checks if booking can be cancelled
- `can_be_rescheduled()`: Checks if booking can be rescheduled
- `cancel(cancelled_by, reason)`: Cancels the booking
- `regenerate_access_token()`: Generates new access token
- `mark_calendar_sync_success/failed()`: Updates sync status

### Attendee Model (for Group Events)
**Key Fields**:
- `booking`: ForeignKey to Booking
- `name`: CharField
- `email`: EmailField
- `phone`: CharField
- `status`: CharField ('confirmed', 'cancelled', 'no_show')
- `custom_answers`: JSONField
- `joined_at`: DateTimeField
- `cancelled_at`: DateTimeField
- `cancellation_reason`: TextField

### WaitlistEntry Model
**Key Fields**:
- `event_type`: ForeignKey to EventType
- `organizer`: ForeignKey to User
- `desired_start_time`: DateTimeField
- `desired_end_time`: DateTimeField
- `invitee_name`: CharField
- `invitee_email`: EmailField
- `invitee_phone`: CharField
- `invitee_timezone`: CharField
- `notify_when_available`: BooleanField
- `expires_at`: DateTimeField
- `status`: CharField ('active', 'notified', 'converted', 'expired', 'cancelled')
- `custom_answers`: JSONField
- `notified_at`: DateTimeField
- `converted_booking`: ForeignKey to Booking

### CustomQuestion Model
**Key Fields**:
- `event_type`: ForeignKey to EventType
- `question_text`: CharField (max_length=500)
- `question_type`: CharField ('text', 'textarea', 'select', 'multiselect', 'checkbox', 'radio', 'email', 'phone', 'number', 'date', 'time', 'url')
- `is_required`: BooleanField
- `order`: IntegerField
- `options`: JSONField (for select/radio questions)
- `conditions`: JSONField (conditional logic)
- `validation_rules`: JSONField

### BookingAuditLog Model
**Key Fields**:
- `booking`: ForeignKey to Booking
- `action`: CharField (comprehensive list of booking actions)
- `description`: TextField
- `actor_type`: CharField ('organizer', 'invitee', 'attendee', 'system', 'integration')
- `actor_email`: EmailField
- `actor_name`: CharField
- `ip_address`: GenericIPAddressField
- `user_agent`: TextField
- `metadata`: JSONField
- `old_values`: JSONField
- `new_values`: JSONField

## API Endpoints

### Event Types Management
**Base URL**: `/api/v1/events/`

#### Event Types CRUD
- **GET/POST** `/event-types/`
- **GET/PUT/DELETE** `/event-types/<uuid:pk>/`
- **Serializers**: `EventTypeSerializer`, `EventTypeCreateSerializer`
- **Features**:
  - Full CRUD operations
  - Custom questions creation
  - Workflow assignments
  - Validation of recurrence settings

### Public Booking Pages
#### Organizer Public Page
- **GET** `/public/<str:organizer_slug>/`
- **Function**: `public_organizer_page`
- **Features**:
  - Lists all public event types
  - Organizer profile information
  - Cached for 15 minutes
  - Privacy-filtered data

#### Event Type Booking Page
- **GET** `/public/<str:organizer_slug>/<str:event_type_slug>/`
- **Function**: `public_event_type_page`
- **Features**:
  - Event type details
  - Available slots calculation
  - Custom questions
  - Multi-timezone support
  - Performance metrics
  - Cache hit tracking

### Available Slots API
- **GET** `/slots/<str:organizer_slug>/<str:event_type_slug>/`
- **Function**: `get_available_slots_api`
- **Query Parameters**:
  - `start_date`: YYYY-MM-DD format
  - `end_date`: YYYY-MM-DD format
  - `timezone`: IANA timezone string
  - `attendee_count`: Number of attendees
- **Features**:
  - Real-time availability calculation
  - Timezone conversion
  - Group event capacity checking
  - Performance monitoring

### Booking Management
#### Booking CRUD
- **GET** `/bookings/`
- **GET** `/bookings/<uuid:pk>/`
- **Serializers**: `BookingSerializer`, `BookingUpdateSerializer`
- **Features**:
  - Filtering by status, date range
  - Organizer-only access
  - Comprehensive booking details

#### Create Booking (Public)
- **POST** `/bookings/create/`
- **Function**: `create_booking`
- **Serializer**: `BookingCreateSerializer`
- **Features**:
  - Public endpoint (no auth required)
  - Rate limiting
  - Comprehensive validation
  - Waitlist handling
  - Async post-booking processing

#### Booking Management (Public)
- **GET/POST** `/booking/<uuid:access_token>/manage/`
- **Function**: `booking_management`
- **Features**:
  - Token-based access
  - Cancel booking
  - Reschedule booking
  - Regenerate access token
  - Group event attendee management

### Group Event Management
#### Add Attendee
- **POST** `/bookings/<uuid:booking_id>/attendees/add/`
- **Features**:
  - Capacity checking
  - Custom answers support
  - Audit logging

#### Remove Attendee
- **POST** `/bookings/<uuid:booking_id>/attendees/<uuid:attendee_id>/remove/`
- **Features**:
  - Attendee cancellation
  - Waitlist processing
  - Audit logging

### Analytics and Reporting
#### Booking Analytics
- **GET** `/analytics/`
- **Function**: `booking_analytics`
- **Features**:
  - Total bookings by status
  - Calendar sync health
  - Event type breakdown
  - Cancellation analysis
  - Group event statistics

#### Booking Audit Logs
- **GET** `/bookings/<uuid:booking_id>/audit/`
- **Features**:
  - Complete audit trail
  - Actor information
  - Change tracking
  - Metadata storage

## Frontend Pages Required

### Event Type Management
1. **Event Types Dashboard** (`/event-types`)
   - List of all event types
   - Create new event type button
   - Quick actions (edit, duplicate, delete)
   - Active/inactive status toggle
   - Usage statistics

2. **Create/Edit Event Type** (`/event-types/new`, `/event-types/<id>/edit`)
   - Basic information form (name, description, duration)
   - Scheduling settings (notice, horizon, buffers)
   - Group event settings (max attendees, waitlist)
   - Location settings (type, details)
   - Recurrence configuration
   - Custom questions builder
   - Workflow assignments
   - Preview functionality

3. **Event Type Preview** (`/event-types/<id>/preview`)
   - Public booking page preview
   - Different timezone views
   - Mobile responsiveness check

### Booking Management
1. **Bookings Dashboard** (`/bookings`)
   - Bookings list with filters
   - Status indicators
   - Quick actions (view, cancel, reschedule)
   - Calendar view option
   - Export functionality

2. **Booking Details** (`/bookings/<id>`)
   - Complete booking information
   - Attendee management (for group events)
   - Communication history
   - Audit trail
   - Actions (cancel, reschedule, mark complete)

3. **Booking Analytics** (`/analytics`)
   - Charts and graphs
   - Key metrics dashboard
   - Date range filtering
   - Export reports
   - Performance indicators

### Public Booking Pages
1. **Organizer Public Page** (`/<organizer_slug>`)
   - Organizer profile display
   - Available event types
   - Branding customization
   - Contact information

2. **Event Booking Page** (`/<organizer_slug>/<event_type_slug>`)
   - Event type information
   - Calendar widget for date selection
   - Time slot selection
   - Custom questions form
   - Invitee information form
   - Booking confirmation

3. **Booking Management Page** (`/booking/<access_token>/manage`)
   - Booking details view
   - Cancel booking option
   - Reschedule booking option
   - Add/remove attendees (group events)
   - Download calendar event

### Waitlist Management
1. **Waitlist Dashboard** (`/waitlist`)
   - Active waitlist entries
   - Notification management
   - Conversion tracking

## Components Required

### Event Type Components
1. **EventTypeCard**
   - Event type summary
   - Quick stats (bookings, duration)
   - Action buttons
   - Status indicators

2. **EventTypeForm**
   - Multi-step form for creation/editing
   - Real-time validation
   - Preview functionality
   - Custom questions builder

3. **CustomQuestionBuilder**
   - Drag-and-drop question ordering
   - Question type selector
   - Conditional logic builder
   - Validation rules setup

4. **RecurrenceBuilder**
   - Recurrence pattern selector
   - Visual calendar preview
   - End date/occurrence limits

### Booking Components
1. **BookingCard**
   - Booking summary display
   - Status indicators
   - Quick actions
   - Time display with timezone

2. **BookingForm**
   - Invitee information
   - Custom questions
   - Timezone selector
   - Validation and submission

3. **CalendarWidget**
   - Date picker with availability
   - Time slot selection
   - Timezone conversion
   - Loading states

4. **TimeSlotPicker**
   - Available time slots display
   - Timezone-aware times
   - Group event capacity indicators
   - Loading and error states

### Public Booking Components
1. **PublicEventTypePage**
   - Event type information display
   - Organizer branding
   - Booking form integration
   - Mobile-responsive design

2. **BookingConfirmation**
   - Booking success message
   - Calendar download links
   - Meeting details
   - Next steps information

3. **BookingManagement**
   - Booking details display
   - Cancel/reschedule options
   - Attendee management
   - Access token validation

### Analytics Components
1. **BookingAnalytics**
   - Charts and graphs
   - Key performance indicators
   - Date range selectors
   - Export functionality

2. **BookingMetrics**
   - Real-time statistics
   - Conversion rates
   - Popular time slots
   - Cancellation analysis

## User Flows

### Event Type Creation Flow
1. Organizer navigates to event types
2. Clicks "Create New Event Type"
3. Fills basic information (name, description, duration)
4. Configures scheduling settings
5. Sets up location details
6. Adds custom questions (optional)
7. Configures workflows (optional)
8. Previews public booking page
9. Saves and activates event type
10. Shares booking link

### Public Booking Flow
1. Invitee visits public booking link
2. Views organizer profile and event details
3. Selects preferred date from calendar
4. Chooses available time slot
5. Fills invitee information form
6. Answers custom questions
7. Reviews booking details
8. Confirms booking
9. Receives confirmation email
10. Calendar event added automatically

### Group Event Booking Flow
1. Primary invitee books initial slot
2. Additional attendees can join via:
   - Shared booking link
   - Organizer adding them directly
3. Capacity tracking prevents overbooking
4. Waitlist activated when full
5. Notifications sent to all attendees

### Booking Management Flow
1. Invitee receives booking confirmation with access token
2. Clicks management link
3. Views booking details
4. Can perform actions:
   - Cancel booking
   - Reschedule to new time
   - Add/remove attendees (group events)
   - Regenerate access token

### Waitlist Flow
1. Invitee attempts to book full event
2. Offered waitlist option
3. Joins waitlist with notification preferences
4. Receives notification when spot available
5. Has limited time to claim spot
6. Converts to actual booking or expires

## Features and Functionalities

### Event Type Features
1. **Flexible Duration Options**
   - Predefined duration choices
   - Custom duration support
   - Buffer time configuration

2. **Group Event Support**
   - Multiple attendee capacity
   - Individual attendee tracking
   - Waitlist functionality
   - Capacity management

3. **Scheduling Constraints**
   - Minimum notice requirements
   - Maximum advance booking
   - Daily booking limits
   - Custom availability rules

4. **Recurrence Support**
   - Daily, weekly, monthly patterns
   - RRULE specification
   - Exception handling
   - Occurrence limits

5. **Location Flexibility**
   - Video call integration
   - Phone call setup
   - In-person meetings
   - Custom location types

### Booking Features
1. **Comprehensive Booking Data**
   - Invitee information storage
   - Custom question answers
   - Timezone handling
   - Meeting details

2. **Calendar Integration**
   - Automatic calendar event creation
   - Sync status tracking
   - Error handling and retry logic
   - Multiple calendar support

3. **Meeting Link Generation**
   - Automatic video link creation
   - Platform integration (Zoom, Google Meet)
   - Meeting credentials storage
   - Link validation

4. **Access Control**
   - Secure access tokens
   - Token expiration handling
   - Public management interface
   - Permission validation

### Advanced Features
1. **Waitlist Management**
   - Automatic waitlist creation
   - Notification system
   - Position tracking
   - Conversion monitoring

2. **Audit Trail**
   - Comprehensive action logging
   - Actor identification
   - Change tracking
   - Metadata storage

3. **Analytics and Reporting**
   - Booking statistics
   - Performance metrics
   - Conversion tracking
   - Export capabilities

## Validation Rules

### Event Type Validation
- Name required and unique per organizer
- Duration must be positive
- Buffer times cannot exceed duration
- Recurrence settings must be complete
- Location details required for custom types

### Booking Validation
- Start time must be in future
- Must respect minimum notice
- Cannot exceed maximum advance
- Attendee count cannot exceed event type limit
- Custom answers must match questions

### Custom Question Validation
- Question text required
- Options required for select/radio types
- Validation rules must be valid JSON
- Conditional logic must reference existing questions

## Error Handling

### Booking Errors
- Time slot no longer available
- Event type not found
- Capacity exceeded
- Invalid timezone
- Validation failures

### Calendar Sync Errors
- Token expiration
- API rate limits
- Network failures
- Permission issues

### Access Token Errors
- Token expired
- Invalid token format
- Booking not found
- Insufficient permissions

## Performance Considerations

### Caching Strategy
- Public page caching (15 minutes)
- Availability calculation caching
- Event type data caching
- Organizer profile caching

### Database Optimization
- Proper indexing on frequently queried fields
- Efficient query patterns for bookings
- Pagination for large datasets
- Connection pooling

### Async Processing
- Post-booking tasks (email, calendar sync)
- Workflow execution
- Notification sending
- Analytics computation

## Integration Points

### Internal Integrations
- Users app (organizer profiles)
- Availability app (slot calculation)
- Notifications app (booking communications)
- Workflows app (automation triggers)
- Integrations app (calendar/video sync)

### External Integrations
- Calendar providers (Google, Outlook)
- Video conferencing (Zoom, Google Meet)
- Email services
- SMS services
- Webhook endpoints

## Security Considerations

### Public Endpoint Security
- Rate limiting on booking creation
- Input validation and sanitization
- CSRF protection
- Access token validation

### Data Protection
- Sensitive data encryption
- Secure token generation
- Audit trail maintenance
- Privacy compliance

## Testing Requirements

### Unit Tests
- Model validation
- Business logic
- Utility functions
- Serializer validation

### Integration Tests
- API endpoint testing
- Public booking flow
- Calendar sync functionality
- Workflow integration

### Performance Tests
- Availability calculation speed
- Concurrent booking handling
- Cache effectiveness
- Database query optimization

## Deployment Considerations

### Environment Configuration
- Database settings
- Cache configuration
- External service credentials
- Rate limiting settings

### Monitoring
- Booking success rates
- Calendar sync health
- Performance metrics
- Error tracking

### Scalability
- Database sharding considerations
- Cache distribution
- Load balancing
- Background task scaling

## Mobile Considerations

### Responsive Design
- Mobile-first booking pages
- Touch-friendly time selection
- Optimized form layouts
- Fast loading times

### Progressive Web App
- Offline booking capability
- Push notifications
- App-like experience
- Installation prompts

## Accessibility Requirements

### WCAG Compliance
- Screen reader compatibility
- Keyboard navigation
- Color contrast requirements
- Alternative text for images

### Internationalization
- Multi-language support
- RTL language support
- Cultural date/time formats
- Timezone handling