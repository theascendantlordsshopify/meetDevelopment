# Integrations App Documentation

## Overview
The Integrations app manages connections and data synchronization with third-party services including calendar providers (Google Calendar, Outlook), video conferencing platforms (Zoom, Google Meet), and custom webhooks. It handles OAuth flows, token management, rate limiting, and comprehensive integration monitoring.

## Models

### CalendarIntegration Model
**File**: `backend/apps/integrations/models.py`

**Key Fields**:
- `id`: UUIDField (primary key)
- `organizer`: ForeignKey to User
- `provider`: CharField ('google', 'outlook', 'apple')
- `access_token`: TextField
- `refresh_token`: TextField
- `token_expires_at`: DateTimeField
- `provider_user_id`: CharField
- `provider_email`: EmailField
- `calendar_id`: CharField
- `last_sync_at`: DateTimeField
- `sync_token`: TextField (for incremental sync)
- `sync_errors`: IntegerField (consecutive error count)
- `is_active`: BooleanField
- `sync_enabled`: BooleanField

**Key Methods**:
- `is_token_expired`: Property to check token expiration
- `mark_sync_error()`: Increments error count, disables after 5 errors
- `mark_sync_success()`: Resets error count, updates last sync time

**Unique Constraint**: `['organizer', 'provider']`

### VideoConferenceIntegration Model
**File**: `backend/apps/integrations/models.py`

**Key Fields**:
- `organizer`: ForeignKey to User
- `provider`: CharField ('zoom', 'google_meet', 'microsoft_teams', 'webex')
- `access_token`: TextField
- `refresh_token`: TextField
- `token_expires_at`: DateTimeField
- `provider_user_id`: CharField
- `provider_email`: EmailField
- `last_api_call`: DateTimeField
- `api_calls_today`: IntegerField
- `rate_limit_reset_at`: DateTimeField
- `is_active`: BooleanField
- `auto_generate_links`: BooleanField

**Key Methods**:
- `can_make_api_call()`: Checks daily rate limits
- `record_api_call()`: Records API usage for rate limiting

**Rate Limits**:
- Zoom: 1000 calls/day
- Google Meet: 1000 calls/day
- Microsoft Teams: 500 calls/day

### WebhookIntegration Model
**File**: `backend/apps/integrations/models.py`

**Key Fields**:
- `organizer`: ForeignKey to User
- `name`: CharField
- `webhook_url`: URLField
- `events`: JSONField (list of events to trigger webhook)
- `secret_key`: CharField (for signature validation)
- `headers`: JSONField (additional headers)
- `is_active`: BooleanField
- `retry_failed`: BooleanField
- `max_retries`: IntegerField (default: 3)

**Supported Events**:
- 'booking_created'
- 'booking_cancelled'
- 'booking_rescheduled'
- 'booking_completed'

### IntegrationLog Model
**File**: `backend/apps/integrations/models.py`

**Key Fields**:
- `organizer`: ForeignKey to User
- `log_type`: CharField ('calendar_sync', 'video_link_created', 'webhook_sent', 'error')
- `booking`: ForeignKey to Booking (optional)
- `integration_type`: CharField (provider name)
- `message`: TextField
- `details`: JSONField
- `success`: BooleanField

## API Endpoints

### Calendar Integrations
**Base URL**: `/api/v1/integrations/`

#### Calendar Integration Management
- **GET** `/calendar/`
- **GET** `/calendar/<uuid:pk>/`
- **Serializer**: `CalendarIntegrationSerializer`
- **Features**:
  - List all calendar integrations
  - View integration details
  - Token expiration status
  - Sync status and errors

#### Calendar Operations
- **POST** `/calendar/<uuid:pk>/refresh/`
- **Function**: `refresh_calendar_sync`
- **Features**: Manual calendar sync trigger

- **POST** `/calendar/<uuid:pk>/force-sync/`
- **Function**: `force_calendar_sync`
- **Features**: Force immediate sync

### Video Conference Integrations
#### Video Integration Management
- **GET** `/video/`
- **GET** `/video/<uuid:pk>/`
- **Serializer**: `VideoConferenceIntegrationSerializer`
- **Features**:
  - List video integrations
  - Auto-generate settings
  - Rate limit status
  - Token management

### Webhook Integrations
#### Webhook Management
- **GET/POST** `/webhooks/`
- **GET/PUT/DELETE** `/webhooks/<uuid:pk>/`
- **Serializer**: `WebhookIntegrationSerializer`
- **Features**:
  - Full CRUD operations
  - Event configuration
  - Security settings
  - Retry configuration

#### Webhook Testing
- **POST** `/webhooks/<uuid:pk>/test/`
- **Function**: `test_webhook`
- **Features**: Send test webhook payload

### OAuth Flow
#### OAuth Initiation
- **POST** `/oauth/initiate/`
- **Function**: `initiate_oauth`
- **Serializer**: `OAuthInitiateSerializer`
- **Parameters**:
  - `provider`: 'google', 'outlook', 'zoom', 'microsoft_teams'
  - `integration_type`: 'calendar', 'video'
  - `redirect_uri`: Frontend callback URL
- **Response**: Authorization URL and state parameter

#### OAuth Callback
- **POST** `/oauth/callback/`
- **Function**: `oauth_callback`
- **Serializer**: `OAuthCallbackSerializer`
- **Parameters**:
  - `provider`: Provider name
  - `integration_type`: Integration type
  - `code`: Authorization code
  - `state`: State parameter for security
- **Features**:
  - Token exchange
  - User info retrieval
  - Integration creation/update
  - Initial sync trigger

### Monitoring and Health
#### Integration Health
- **GET** `/health/`
- **Function**: `integration_health`
- **Features**:
  - Overall health status
  - Individual integration status
  - Error summaries
  - Performance metrics

#### Calendar Conflicts
- **GET** `/calendar/conflicts/`
- **Function**: `calendar_conflicts`
- **Features**:
  - Conflict detection between manual and synced blocks
  - Overlap analysis
  - Resolution suggestions

#### Integration Logs
- **GET** `/logs/`
- **Serializer**: `IntegrationLogSerializer`
- **Features**:
  - Activity history
  - Error tracking
  - Performance monitoring
  - Filtering and search

## Integration Clients

### Google Calendar Client
**File**: `backend/apps/integrations/google_client.py`

**Features**:
- **Calendar Event Management**:
  - Create events with attendees
  - Update existing events
  - Delete events
  - Batch operations

- **Busy Time Retrieval**:
  - Fetch busy periods
  - Handle recurring events
  - Filter transparent events
  - Pagination support

- **Google Meet Integration**:
  - Automatic meeting link generation
  - Conference data handling
  - Meeting settings configuration

### Outlook Calendar Client
**File**: `backend/apps/integrations/outlook_client.py`

**Features**:
- **Microsoft Graph API Integration**:
  - Calendar event CRUD operations
  - CalendarView API for efficient queries
  - Batch processing support
  - Error handling and retry logic

- **Event Management**:
  - Create/update/delete events
  - Attendee management
  - Meeting link integration
  - Timezone handling

### Zoom Client
**File**: `backend/apps/integrations/zoom_client.py`

**Features**:
- **Meeting Management**:
  - Create scheduled meetings
  - Update meeting details
  - Delete meetings
  - Meeting settings configuration

- **Rate Limiting**:
  - Daily API call tracking
  - Automatic rate limit enforcement
  - Reset time management

- **Meeting Configuration**:
  - Host/participant video settings
  - Waiting room configuration
  - Security settings
  - Recording options

### Missing Implementations
**Note**: The following providers are defined in models but lack implementation:
- Apple Calendar client (`apple_client.py`)
- Microsoft Teams client (`microsoft_teams_client.py`)
- Webex client (`webex_client.py`)

## Frontend Pages Required

### Integration Dashboard
1. **Integrations Overview** (`/integrations`)
   - Connected services summary
   - Health status indicators
   - Quick connection buttons
   - Recent activity feed

2. **Calendar Integrations** (`/integrations/calendar`)
   - Connected calendar providers
   - Sync status and last sync time
   - Sync error messages
   - Manual sync triggers
   - Disconnect options

3. **Video Integrations** (`/integrations/video`)
   - Connected video providers
   - Auto-generate settings
   - Rate limit status
   - API usage statistics

4. **Webhook Management** (`/integrations/webhooks`)
   - Webhook list with status
   - Create new webhook
   - Test webhook functionality
   - Delivery logs and statistics

### OAuth Connection Pages
1. **Connect Service** (`/integrations/connect/<provider>`)
   - Service information and benefits
   - Permission requirements
   - Connect button
   - Security information

2. **OAuth Callback** (`/integrations/callback`)
   - Processing OAuth response
   - Success/error messages
   - Redirect to integration dashboard
   - Initial sync status

### Integration Management
1. **Calendar Settings** (`/integrations/calendar/<id>`)
   - Sync preferences
   - Calendar selection
   - Conflict resolution settings
   - Sync history

2. **Video Settings** (`/integrations/video/<id>`)
   - Auto-generate preferences
   - Default meeting settings
   - Security configurations
   - Usage statistics

3. **Webhook Configuration** (`/integrations/webhooks/<id>`)
   - Webhook URL configuration
   - Event selection
   - Security settings (secret key, headers)
   - Retry configuration
   - Test functionality

### Monitoring and Troubleshooting
1. **Integration Health** (`/integrations/health`)
   - Overall health dashboard
   - Service status indicators
   - Error summaries
   - Performance metrics

2. **Integration Logs** (`/integrations/logs`)
   - Activity timeline
   - Error logs with details
   - Success/failure rates
   - Filtering and search

3. **Calendar Conflicts** (`/integrations/conflicts`)
   - Conflict detection results
   - Manual vs synced block overlaps
   - Resolution recommendations
   - Bulk conflict resolution

## Components Required

### Integration Status Components
1. **IntegrationCard**
   - Service logo and name
   - Connection status
   - Last sync time
   - Quick actions (sync, disconnect)

2. **HealthIndicator**
   - Visual health status
   - Error count display
   - Performance metrics
   - Alert indicators

3. **SyncStatus**
   - Sync progress indicator
   - Last sync timestamp
   - Error messages
   - Manual sync button

### OAuth Components
1. **OAuthConnector**
   - Service connection flow
   - Permission explanation
   - Security information
   - Connect button

2. **OAuthCallback**
   - Processing state display
   - Success/error handling
   - Redirect management
   - Progress indicators

### Configuration Components
1. **WebhookForm**
   - URL input with validation
   - Event selection checkboxes
   - Security configuration
   - Test functionality

2. **CalendarSyncSettings**
   - Sync preferences
   - Calendar selection
   - Conflict resolution options
   - Sync schedule configuration

3. **VideoMeetingSettings**
   - Default meeting configuration
   - Security settings
   - Auto-generate preferences
   - Provider-specific options

### Monitoring Components
1. **IntegrationLogs**
   - Activity timeline
   - Log entry details
   - Filtering controls
   - Export functionality

2. **ConflictResolver**
   - Conflict visualization
   - Resolution options
   - Bulk operations
   - Preview changes

## User Flows

### Calendar Integration Setup
1. User navigates to integrations
2. Selects calendar provider
3. Reviews permissions and benefits
4. Clicks connect button
5. Redirected to provider OAuth
6. Grants permissions
7. Redirected back to platform
8. Integration created and initial sync triggered
9. Sync status displayed
10. Calendar events now block availability

### Video Integration Setup
1. User selects video provider
2. Reviews meeting features
3. Connects via OAuth
4. Configures default meeting settings
5. Tests meeting creation
6. Integration active for new bookings

### Webhook Configuration
1. User creates new webhook
2. Enters webhook URL
3. Selects trigger events
4. Configures security settings
5. Tests webhook delivery
6. Saves configuration
7. Webhook triggers on selected events

### Troubleshooting Flow
1. User notices integration issue
2. Checks integration health dashboard
3. Reviews error logs
4. Attempts manual sync/reconnection
5. Contacts support if needed
6. Monitors resolution

## Advanced Features

### Intelligent Sync
1. **Incremental Sync**:
   - Uses sync tokens for efficiency
   - Only fetches changed events
   - Handles deletions properly
   - Minimizes API calls

2. **Conflict Resolution**:
   - Detects overlaps between manual and synced blocks
   - Provides resolution suggestions
   - Allows manual override
   - Tracks resolution history

3. **Performance Optimization**:
   - Batch processing for large datasets
   - Rate limit management
   - Retry logic with exponential backoff
   - Connection pooling

### Security Features
1. **Token Management**:
   - Automatic token refresh
   - Secure token storage
   - Expiration monitoring
   - Revocation handling

2. **Webhook Security**:
   - HMAC signature validation
   - Secret key management
   - Request validation
   - Replay attack prevention

3. **Rate Limiting**:
   - Per-provider rate limits
   - Per-organizer tracking
   - Graceful degradation
   - Alert notifications

## Error Handling

### OAuth Errors
- Invalid authorization codes
- Token exchange failures
- Scope permission issues
- State parameter validation

### API Errors
- Rate limit exceeded
- Token expiration
- Network timeouts
- Service unavailability

### Sync Errors
- Calendar access revoked
- Event creation failures
- Conflict resolution issues
- Data format problems

## Performance Considerations

### Optimization Strategies
1. **Caching**:
   - API response caching
   - Token caching
   - User info caching
   - Rate limit caching

2. **Batch Operations**:
   - Bulk event processing
   - Batch API requests
   - Parallel processing
   - Queue management

3. **Connection Management**:
   - Connection pooling
   - Keep-alive connections
   - Timeout configuration
   - Retry strategies

### Monitoring
1. **Performance Metrics**:
   - API response times
   - Success/failure rates
   - Token refresh frequency
   - Sync duration

2. **Health Checks**:
   - Service availability
   - Token validity
   - Sync status
   - Error rates

## Integration Specifications

### Google Calendar Integration
**OAuth Scopes**:
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`

**Features**:
- Full calendar event CRUD
- Busy time retrieval
- Recurring event handling
- Conference data support
- Incremental sync with sync tokens

### Microsoft Outlook Integration
**OAuth Scopes**:
- `https://graph.microsoft.com/calendars.readwrite`
- `offline_access`

**Features**:
- Microsoft Graph API integration
- Calendar view for efficient queries
- Event management
- Timezone handling
- Batch operations

### Zoom Integration
**OAuth Scopes**:
- `meeting:write`
- `meeting:read`

**Features**:
- Scheduled meeting creation
- Meeting settings configuration
- Participant management
- Recording options
- Waiting room settings

### Webhook Integration
**Supported Events**:
- booking_created
- booking_cancelled
- booking_rescheduled
- booking_completed
- notification_sent

**Security Features**:
- HMAC-SHA256 signature validation
- Custom headers support
- Retry logic with exponential backoff
- Delivery status tracking

## Celery Tasks

### Calendar Sync Tasks
1. **`sync_calendar_events`**:
   - Syncs events from external calendar
   - Handles incremental sync
   - Processes date ranges
   - Error handling and retry

2. **`reconcile_calendar_events`**:
   - Reconciles external events with internal blocks
   - Creates/updates/deletes blocked times
   - Conflict detection
   - Cache invalidation

3. **`sync_all_calendar_integrations`**:
   - Triggers sync for all active integrations
   - Staggers requests to avoid API limits
   - Monitors overall sync health

### Video Conference Tasks
1. **`generate_meeting_link`**:
   - Creates video meeting for booking
   - Handles multiple providers
   - Stores meeting details
   - Error handling and fallback

2. **`create_calendar_event`**:
   - Creates calendar events for bookings
   - Handles multiple calendar providers
   - Stores external event IDs
   - Retry logic for failures

3. **`remove_calendar_event`**:
   - Removes calendar events for cancelled bookings
   - Handles multiple providers
   - Error handling for missing events

### Webhook Tasks
1. **`send_webhook`**:
   - Sends webhook notifications
   - Handles authentication
   - Retry logic
   - Delivery tracking

### Token Management Tasks
1. **`refresh_expired_tokens`**:
   - Automatically refreshes expiring tokens
   - Handles refresh failures
   - Notifies users of disconnections
   - Maintains integration health

2. **`notify_integration_disconnected`**:
   - Sends email notifications
   - Provides reconnection instructions
   - Tracks notification delivery

### Monitoring Tasks
1. **`cleanup_old_integration_logs`**:
   - Removes logs older than 90 days
   - Prevents database bloat
   - Maintains performance

## Frontend Pages Required

### Integration Dashboard
1. **Integrations Overview** (`/integrations`)
   - Connected services grid
   - Health status summary
   - Quick connect buttons
   - Recent activity timeline
   - Performance metrics

2. **Calendar Integrations** (`/integrations/calendar`)
   - Connected calendars list
   - Sync status indicators
   - Last sync timestamps
   - Error messages and resolution
   - Manual sync buttons
   - Disconnect options

3. **Video Integrations** (`/integrations/video`)
   - Connected video services
   - Auto-generate settings
   - Default meeting configurations
   - Usage statistics
   - Rate limit status

4. **Webhook Management** (`/integrations/webhooks`)
   - Webhook list with status
   - Create/edit webhook forms
   - Test webhook functionality
   - Delivery logs and statistics
   - Error tracking

### Connection Setup Pages
1. **Connect Calendar** (`/integrations/connect/calendar/<provider>`)
   - Provider information and benefits
   - Permission requirements explanation
   - Security and privacy information
   - Connect button
   - Troubleshooting tips

2. **Connect Video** (`/integrations/connect/video/<provider>`)
   - Video service features
   - Meeting configuration options
   - Connect button
   - Setup instructions

3. **OAuth Callback Handler** (`/integrations/callback`)
   - Processing OAuth response
   - Success/error messages
   - Redirect to appropriate page
   - Initial sync status

### Configuration Pages
1. **Calendar Settings** (`/integrations/calendar/<id>/settings`)
   - Sync preferences
   - Calendar selection (if multiple)
   - Conflict resolution settings
   - Sync frequency options
   - Troubleshooting tools

2. **Video Settings** (`/integrations/video/<id>/settings`)
   - Default meeting settings
   - Security configurations
   - Auto-generate preferences
   - Meeting templates

3. **Webhook Configuration** (`/integrations/webhooks/<id>`)
   - Webhook URL input
   - Event selection checkboxes
   - Security settings (secret, headers)
   - Retry configuration
   - Test interface

### Monitoring Pages
1. **Integration Health** (`/integrations/health`)
   - Health dashboard with status indicators
   - Error summaries
   - Performance metrics
   - Troubleshooting guides

2. **Integration Logs** (`/integrations/logs`)
   - Activity timeline
   - Log filtering and search
   - Error details
   - Export functionality

3. **Sync Status** (`/integrations/sync-status`)
   - Real-time sync monitoring
   - Progress indicators
   - Error resolution
   - Manual intervention options

## Components Required

### Integration Management Components
1. **IntegrationCard**
   - Service logo and name
   - Connection status indicator
   - Last activity timestamp
   - Quick action buttons
   - Health status badge

2. **ConnectionWizard**
   - Multi-step connection process
   - Provider selection
   - Permission explanation
   - OAuth flow handling
   - Success confirmation

3. **SyncStatusIndicator**
   - Visual sync status
   - Progress bars
   - Error indicators
   - Last sync time
   - Manual sync button

### Configuration Components
1. **WebhookForm**
   - URL input with validation
   - Event selection interface
   - Security configuration
   - Test functionality
   - Delivery monitoring

2. **CalendarSyncSettings**
   - Sync preferences
   - Calendar selection
   - Conflict resolution options
   - Frequency settings

3. **VideoMeetingDefaults**
   - Default meeting settings
   - Security configurations
   - Provider-specific options
   - Template management

### Monitoring Components
1. **HealthDashboard**
   - Service status grid
   - Performance metrics
   - Error summaries
   - Alert notifications

2. **ActivityTimeline**
   - Chronological activity list
   - Success/failure indicators
   - Expandable details
   - Filtering controls

3. **ConflictViewer**
   - Visual conflict representation
   - Resolution options
   - Bulk operations
   - Preview changes

## User Flows

### Calendar Integration Flow
1. User navigates to integrations
2. Selects "Connect Calendar"
3. Chooses provider (Google/Outlook)
4. Reviews permissions
5. Clicks "Connect"
6. Redirected to provider OAuth
7. Grants calendar access
8. Redirected back to platform
9. Integration created successfully
10. Initial sync begins
11. Busy times now block availability
12. Calendar events created for new bookings

### Video Integration Flow
1. User selects "Connect Video Service"
2. Chooses provider (Zoom/Google Meet)
3. Reviews meeting features
4. Connects via OAuth
5. Configures default meeting settings
6. Tests meeting creation
7. Integration active for new bookings
8. Meeting links auto-generated

### Webhook Setup Flow
1. User creates new webhook
2. Enters webhook URL
3. Selects trigger events
4. Configures security (secret, headers)
5. Tests webhook delivery
6. Reviews test results
7. Saves configuration
8. Webhook triggers on selected events
9. Monitors delivery status

### Troubleshooting Flow
1. User notices sync issues
2. Checks integration health
3. Reviews error logs
4. Attempts manual sync
5. Reconnects if token expired
6. Contacts support if needed
7. Monitors resolution

## Security Considerations

### OAuth Security
- State parameter validation
- PKCE implementation consideration
- Scope limitation
- Token secure storage

### Webhook Security
- HMAC signature validation
- Request origin validation
- Replay attack prevention
- Rate limiting

### Data Protection
- Token encryption at rest
- Secure transmission
- Access logging
- Data retention policies

## Performance Optimization

### Caching Strategy
- API response caching
- Token caching
- User data caching
- Rate limit caching

### Rate Limiting
- Per-provider limits
- Per-user tracking
- Graceful degradation
- Queue management

### Error Recovery
- Automatic retry logic
- Exponential backoff
- Circuit breaker pattern
- Fallback mechanisms

## Testing Requirements

### Unit Tests
- OAuth flow testing
- API client testing
- Token management
- Error handling

### Integration Tests
- End-to-end OAuth flow
- Calendar sync functionality
- Video meeting creation
- Webhook delivery

### Performance Tests
- API response times
- Concurrent request handling
- Rate limit enforcement
- Cache effectiveness

## Deployment Considerations

### Environment Variables
- OAuth client credentials
- API endpoints
- Rate limit configurations
- Security settings

### Monitoring Setup
- Integration health monitoring
- Performance metric collection
- Error rate tracking
- Alert configuration

### Scaling Considerations
- Background task scaling
- API rate limit distribution
- Cache distribution
- Database connection pooling

## Future Enhancements

### Planned Features
1. **Additional Providers**:
   - Apple Calendar implementation
   - Microsoft Teams client
   - Webex integration
   - Slack integration

2. **Advanced Sync**:
   - Real-time sync via webhooks
   - Bidirectional sync
   - Conflict resolution AI
   - Predictive sync

3. **Enhanced Monitoring**:
   - Real-time dashboards
   - Predictive alerts
   - Performance optimization
   - Usage analytics

### Current Limitations
1. **Missing Implementations**:
   - Apple Calendar client
   - Microsoft Teams client
   - Webex client

2. **Rate Limiting**:
   - Hardcoded conservative estimates
   - Need dynamic limit management
   - Provider-specific optimization

3. **Error Recovery**:
   - Limited automatic recovery
   - Manual intervention often required
   - Need intelligent retry strategies