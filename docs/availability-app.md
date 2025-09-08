# Availability App Documentation

## Overview
The Availability app is responsible for calculating and managing when organizers are available for bookings. It handles complex scheduling rules, blocked times, date overrides, buffer settings, and multi-timezone calculations. This is one of the most performance-critical components of the platform.

## Models

### AvailabilityRule Model
**File**: `backend/apps/availability/models.py`

**Key Fields**:
- `id`: UUIDField (primary key)
- `organizer`: ForeignKey to User
- `day_of_week`: IntegerField (0=Monday, 6=Sunday)
- `start_time`: TimeField
- `end_time`: TimeField
- `event_types`: ManyToManyField to EventType (optional specificity)
- `is_active`: BooleanField

**Key Methods**:
- `spans_midnight()`: Returns True if end_time < start_time
- `applies_to_event_type(event_type)`: Checks if rule applies to specific event type

**Unique Constraint**: `['organizer', 'day_of_week', 'start_time', 'end_time']`

### DateOverrideRule Model
**File**: `backend/apps/availability/models.py`

**Key Fields**:
- `organizer`: ForeignKey to User
- `date`: DateField (specific date)
- `is_available`: BooleanField (if False, entire day blocked)
- `start_time`: TimeField (required if is_available=True)
- `end_time`: TimeField (required if is_available=True)
- `event_types`: ManyToManyField to EventType (optional specificity)
- `reason`: CharField (optional description)
- `is_active`: BooleanField

**Key Methods**:
- `spans_midnight()`: Returns True if end_time < start_time
- `applies_to_event_type(event_type)`: Checks rule applicability

**Validation**: start_time and end_time required when is_available=True

### RecurringBlockedTime Model
**File**: `backend/apps/availability/models.py`

**Key Fields**:
- `organizer`: ForeignKey to User
- `name`: CharField (e.g., "Weekly Team Meeting")
- `day_of_week`: IntegerField (0=Monday, 6=Sunday)
- `start_time`: TimeField
- `end_time`: TimeField
- `start_date`: DateField (optional, when recurring block starts)
- `end_date`: DateField (optional, when recurring block ends)
- `is_active`: BooleanField

**Key Methods**:
- `spans_midnight()`: Handles midnight-crossing blocks
- `applies_to_date(date)`: Checks if block applies to specific date

### BlockedTime Model
**File**: `backend/apps/availability/models.py`

**Key Fields**:
- `organizer`: ForeignKey to User
- `start_datetime`: DateTimeField
- `end_datetime`: DateTimeField
- `reason`: CharField
- `source`: CharField ('manual', 'google_calendar', 'outlook_calendar', 'apple_calendar', 'external_sync')
- `external_id`: CharField (for synced events)
- `external_updated_at`: DateTimeField
- `is_active`: BooleanField

**Purpose**: One-off blocked periods, either manual or synced from external calendars

### BufferTime Model
**File**: `backend/apps/availability/models.py`

**Key Fields**:
- `organizer`: OneToOneField to User
- `default_buffer_before`: IntegerField (0-120 minutes)
- `default_buffer_after`: IntegerField (0-120 minutes)
- `minimum_gap`: IntegerField (0-60 minutes between bookings)
- `slot_interval_minutes`: IntegerField (5-60 minutes, slot generation granularity)

**Purpose**: Global buffer settings that can be overridden by individual event types

## API Endpoints

### Availability Rules Management
**Base URL**: `/api/v1/availability/`

#### Availability Rules CRUD
- **GET/POST** `/rules/`
- **GET/PUT/DELETE** `/rules/<uuid:pk>/`
- **Serializer**: `AvailabilityRuleSerializer`
- **Features**:
  - Day-of-week based rules
  - Time range configuration
  - Event type specificity
  - Midnight-spanning support

#### Date Override Rules CRUD
- **GET/POST** `/overrides/`
- **GET/PUT/DELETE** `/overrides/<uuid:pk>/`
- **Serializer**: `DateOverrideRuleSerializer`
- **Features**:
  - Specific date exceptions
  - Full day blocking or custom hours
  - Event type specificity
  - Reason tracking

#### Recurring Blocked Times CRUD
- **GET/POST** `/recurring-blocks/`
- **GET/PUT/DELETE** `/recurring-blocks/<uuid:pk>/`
- **Serializer**: `RecurringBlockedTimeSerializer`
- **Features**:
  - Weekly recurring blocks
  - Date range limitations
  - Named blocks for organization

#### Blocked Times CRUD
- **GET/POST** `/blocked/`
- **GET/PUT/DELETE** `/blocked/<uuid:pk>/`
- **Serializer**: `BlockedTimeSerializer`
- **Features**:
  - One-off time blocks
  - Source tracking (manual vs synced)
  - External ID management

#### Buffer Time Settings
- **GET/PUT** `/buffer/`
- **Serializer**: `BufferTimeSerializer`
- **Features**: Global buffer time configuration

### Public Availability API
#### Calculated Slots (Public)
- **GET** `/calculated-slots/<str:organizer_slug>/`
- **Function**: `calculated_slots`
- **Query Parameters**:
  - `event_type_slug`: Required
  - `start_date`: Required (YYYY-MM-DD)
  - `end_date`: Required (YYYY-MM-DD)
  - `invitee_timezone`: Optional (default: UTC)
  - `attendee_count`: Optional (default: 1)
  - `invitee_timezones`: Optional (comma-separated for multi-invitee)
- **Features**:
  - Real-time slot calculation
  - Multi-timezone support
  - Caching with performance metrics
  - Group event capacity handling

### Management and Monitoring
#### Availability Statistics
- **GET** `/stats/`
- **Function**: `availability_stats`
- **Features**:
  - Rule counts and statistics
  - Weekly hours calculation
  - Busiest day identification
  - Cache performance metrics

#### Cache Management
- **POST** `/cache/clear/`
- **POST** `/cache/precompute/`
- **Features**: Manual cache control

#### Testing and Debugging
- **GET** `/test/timezone/`
- **Function**: `test_timezone_handling`
- **Features**: Timezone validation and DST testing

## Core Algorithms

### Availability Calculation (`calculate_available_slots`)
**File**: `backend/apps/availability/utils.py`

**Process**:
1. **Input Validation**:
   - Validates timezone strings
   - Checks date ranges
   - Validates attendee counts

2. **Cache Check**:
   - Generates cache key based on parameters
   - Returns cached result if available and not dirty

3. **Data Collection**:
   - Retrieves availability rules for organizer
   - Gets date overrides for date range
   - Fetches blocked times (manual and synced)
   - Gets recurring blocked times
   - Retrieves existing bookings
   - Fetches external calendar busy times
   - Gets buffer settings

4. **Slot Generation** (per date):
   - Checks if event type can be booked on date
   - Applies date overrides or regular rules
   - For each rule, generates time slots:
     - Handles midnight-spanning rules
     - Applies slot intervals
     - Checks for conflicts with:
       - Blocked times
       - Recurring blocks
       - External calendar events
       - Existing bookings (with buffers)
       - Daily booking limits
   - Validates minimum notice and maximum advance

5. **Post-Processing**:
   - Merges overlapping/adjacent slots
   - Sorts by start time
   - Applies DST safety checks
   - Handles multi-invitee timezone intersection
   - Caches results

6. **Performance Tracking**:
   - Logs computation time
   - Tracks cache hit/miss rates
   - Monitors slow calculations

### Multi-Invitee Timezone Intersection
**Function**: `calculate_multi_invitee_intersection`

**Process**:
1. For each organizer slot, checks if it falls within reasonable hours for all invitees
2. Uses customizable reasonable hours (default 7 AM - 10 PM)
3. Calculates fairness score based on how optimal the time is for each timezone
4. Filters out slots that are unreasonable for any invitee
5. Sorts by fairness score (higher = more fair)

**Fairness Scoring**:
- 10 AM - 4 PM: 100 points (perfect)
- 8 AM - 6 PM: 80 points (good)
- 7 AM - 8 PM: 60 points (acceptable)
- 6 AM - 10 PM: 40 points (manageable)
- Other times: 0 points (too early/late)

### DST Handling
**Function**: `calculate_dst_safe_time_slots`

**Features**:
- Detects DST transitions during slots
- Skips slots that cross DST boundaries
- Adds DST information to slot metadata
- Handles timezone conversion edge cases

## Frontend Pages Required

### Availability Management
1. **Availability Dashboard** (`/availability`)
   - Weekly calendar view of availability
   - Quick rule creation
   - Override management
   - Statistics overview

2. **Availability Rules** (`/availability/rules`)
   - List of all availability rules
   - Day-of-week organization
   - Bulk edit capabilities
   - Event type specificity

3. **Create/Edit Availability Rule** (`/availability/rules/new`, `/availability/rules/<id>/edit`)
   - Day of week selector
   - Time range picker
   - Event type selector (optional)
   - Midnight-spanning support
   - Preview functionality

4. **Date Overrides** (`/availability/overrides`)
   - Calendar view of overrides
   - Quick date blocking
   - Bulk operations
   - Reason tracking

5. **Create/Edit Date Override** (`/availability/overrides/new`, `/availability/overrides/<id>/edit`)
   - Date picker
   - Available/blocked toggle
   - Time range picker (if available)
   - Event type selector
   - Reason input

6. **Recurring Blocks** (`/availability/recurring-blocks`)
   - List of recurring blocks
   - Visual calendar preview
   - Date range management

7. **Blocked Times** (`/availability/blocked`)
   - List of all blocked times
   - Source identification (manual vs synced)
   - Bulk management
   - Conflict resolution

8. **Buffer Settings** (`/availability/buffer`)
   - Global buffer time configuration
   - Minimum gap settings
   - Slot interval configuration
   - Preview of effects

## Components Required

### Calendar Components
1. **AvailabilityCalendar**
   - Weekly/monthly view
   - Rule visualization
   - Override indicators
   - Interactive editing

2. **TimeRangePicker**
   - Start/end time selection
   - Midnight-spanning support
   - Validation feedback
   - Visual time blocks

3. **DayOfWeekSelector**
   - Multiple day selection
   - Visual day indicators
   - Bulk operations
   - Rule preview

### Rule Management Components
1. **AvailabilityRuleCard**
   - Rule summary display
   - Quick edit options
   - Status indicators
   - Event type tags

2. **AvailabilityRuleForm**
   - Complete rule configuration
   - Real-time validation
   - Preview functionality
   - Conflict detection

3. **DateOverrideCard**
   - Override summary
   - Date and time display
   - Reason display
   - Quick actions

4. **RecurringBlockCard**
   - Block summary
   - Recurrence pattern display
   - Date range indicators
   - Edit/delete actions

### Slot Calculation Components
1. **SlotCalculator**
   - Real-time slot generation
   - Performance monitoring
   - Cache status display
   - Error handling

2. **TimezoneConverter**
   - Multi-timezone display
   - DST handling
   - Conversion utilities
   - Validation feedback

3. **CapacityIndicator**
   - Group event capacity display
   - Available spots counter
   - Waitlist status
   - Visual indicators

## User Flows

### Setting Up Availability
1. Organizer navigates to availability settings
2. Views current availability overview
3. Creates basic weekly schedule:
   - Selects days of week
   - Sets time ranges for each day
   - Configures buffer times
4. Adds date-specific overrides:
   - Blocks holidays/vacation days
   - Sets special hours for specific dates
5. Configures recurring blocks:
   - Weekly team meetings
   - Regular appointments
6. Sets buffer time preferences
7. Previews availability calendar
8. Saves configuration

### Managing Blocked Times
1. Organizer views blocked times list
2. Can add manual blocks:
   - Selects date and time range
   - Adds reason/description
   - Saves block
3. Views synced blocks from external calendars
4. Resolves conflicts between manual and synced blocks
5. Bulk operations for multiple blocks

### Multi-Timezone Scheduling
1. Invitee provides multiple timezone preferences
2. System calculates intersection of reasonable hours
3. Displays slots that work for all participants
4. Shows local time for each participant
5. Ranks slots by fairness score
6. Allows booking of optimal slots

## Advanced Features

### Intelligent Slot Generation
1. **Conflict Resolution**:
   - Checks against all booking types
   - Applies buffer times appropriately
   - Handles group event capacity
   - Resolves external calendar conflicts

2. **Performance Optimization**:
   - Multi-level caching strategy
   - Dirty flag system for cache invalidation
   - Batch processing for large date ranges
   - Performance monitoring and alerting

3. **Timezone Intelligence**:
   - Automatic DST handling
   - Multi-timezone intersection
   - Cultural working hours consideration
   - Fairness scoring for global teams

### Cache Management
1. **Cache Strategy**:
   - 15-minute cache for calculated slots
   - Weekly chunk caching
   - Timezone-specific caching
   - Attendee-count-specific caching

2. **Cache Invalidation**:
   - Automatic on rule changes
   - Booking-triggered invalidation
   - External calendar sync invalidation
   - Manual cache clearing

3. **Performance Monitoring**:
   - Cache hit rate tracking
   - Computation time monitoring
   - Slow query detection
   - Performance alerting

## Validation Rules

### Time Range Validation
- Start time cannot equal end time
- Midnight-spanning rules allowed
- Time ranges must be logical
- Buffer times cannot exceed event duration

### Date Validation
- Override dates must be in future (for new overrides)
- Date ranges must be logical (start <= end)
- Recurring block date ranges optional

### Timezone Validation
- IANA timezone string validation
- DST transition handling
- Invalid timezone graceful handling
- Multi-timezone compatibility

## Error Handling

### Calculation Errors
- Invalid timezone fallback to UTC
- Missing rules default to no availability
- Conflict resolution prioritization
- Graceful degradation on external service failures

### Cache Errors
- Cache miss fallback to real-time calculation
- Redis connection failure handling
- Cache corruption recovery
- Performance degradation alerts

### External Integration Errors
- Calendar sync failure handling
- API rate limit management
- Token expiration recovery
- Network timeout handling

## Performance Considerations

### Optimization Strategies
1. **Caching Layers**:
   - Redis for calculated slots
   - Database query caching
   - External API response caching
   - Browser-level caching headers

2. **Query Optimization**:
   - Efficient database queries
   - Proper indexing strategy
   - Query result pagination
   - Connection pooling

3. **Computation Optimization**:
   - Parallel processing for multiple event types
   - Batch operations for large date ranges
   - Early termination for impossible slots
   - Memory-efficient algorithms

### Monitoring and Alerting
1. **Performance Metrics**:
   - Slot calculation time
   - Cache hit rates
   - Database query performance
   - External API response times

2. **Alert Conditions**:
   - Calculation time > 100ms
   - Cache hit rate < 80%
   - High error rates
   - External service failures

## Integration Points

### Internal Integrations
- **Events App**: Event type constraints and existing bookings
- **Users App**: Organizer profiles and timezone settings
- **Integrations App**: External calendar busy times
- **Notifications App**: Availability change notifications

### External Integrations
- **Calendar Providers**: Busy time synchronization
- **Timezone Services**: DST and timezone data
- **Geolocation Services**: Timezone detection from location

## Testing Requirements

### Unit Tests
- Slot calculation algorithms
- Timezone conversion logic
- Conflict resolution
- Cache key generation

### Integration Tests
- End-to-end availability calculation
- External calendar integration
- Multi-timezone scenarios
- Performance benchmarks

### Edge Case Tests
- DST transition handling
- Midnight-spanning rules
- Leap year considerations
- Extreme timezone differences

## Frontend Implementation Notes

### Real-Time Updates
- WebSocket connections for live availability updates
- Optimistic UI updates
- Conflict resolution display
- Auto-refresh on changes

### Mobile Optimization
- Touch-friendly time pickers
- Responsive calendar views
- Gesture support for navigation
- Offline capability consideration

### Accessibility
- Screen reader support for time pickers
- Keyboard navigation for calendars
- High contrast mode support
- Voice input compatibility

## Deployment Considerations

### Environment Configuration
- Redis configuration for caching
- Database optimization settings
- External service credentials
- Performance monitoring setup

### Scaling Considerations
- Cache distribution across nodes
- Database read replicas
- Background task scaling
- Load balancing strategies

### Monitoring Setup
- Performance metric collection
- Error rate monitoring
- Cache performance tracking
- External service health checks

## Security Considerations

### Data Protection
- Sensitive time data encryption
- Access control for availability data
- Audit logging for changes
- Privacy compliance

### API Security
- Rate limiting on public endpoints
- Input validation and sanitization
- CSRF protection
- Authentication for management endpoints

## Future Enhancements

### Planned Features
1. **AI-Powered Scheduling**:
   - Optimal time suggestions
   - Pattern recognition
   - Preference learning
   - Conflict prediction

2. **Advanced Multi-Timezone**:
   - Cultural working hours
   - Holiday calendars
   - Time zone preferences
   - Global team optimization

3. **Performance Improvements**:
   - Predictive caching
   - Machine learning optimization
   - Real-time cache warming
   - Intelligent prefetching

### Incomplete/Placeholder Features
1. **Dirty Cache Flag Processing**:
   - `get_dirty_organizers()` returns empty list
   - Batch cache invalidation not fully implemented
   - Redis SCAN operations needed

2. **Cache Hit Rate Tracking**:
   - Currently hardcoded to 85%
   - Needs Redis metrics integration
   - Real-time performance tracking

3. **Advanced Conflict Resolution**:
   - Automatic conflict resolution suggestions
   - Priority-based conflict handling
   - User preference learning