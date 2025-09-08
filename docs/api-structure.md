# API Structure Documentation

## Overview
This document provides a comprehensive overview of the API structure, authentication methods, response formats, error handling, and integration patterns used throughout the platform.

## Base API Structure

### API Versioning
- **Base URL**: `/api/v1/`
- **Versioning Strategy**: URL path versioning
- **Current Version**: v1

### URL Patterns
**Main URL Configuration**: `backend/config/urls.py`

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/events/', include('apps.events.urls')),
    path('api/v1/availability/', include('apps.availability.urls')),
    path('api/v1/integrations/', include('apps.integrations.urls')),
    path('api/v1/workflows/', include('apps.workflows.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/contacts/', include('apps.contacts.urls')),
    
    # SSO URLs
    path('saml/', include('djangosaml2.urls')),
    path('oidc/', include('mozilla_django_oidc.urls')),
    
    # Public booking URLs (at root level for Calendly-style URLs)
    path('', include('apps.events.public_urls')),
]
```

## Authentication

### Authentication Methods
**Configuration**: `backend/config/settings/base.py`

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
}
```

#### Token Authentication
- **Header**: `Authorization: Token <token_key>`
- **Token Generation**: Automatic on registration/login
- **Token Management**: Revoked on password change, logout
- **Usage**: Primary method for API access

#### Session Authentication
- **Usage**: Web interface, CSRF-protected
- **Session Management**: Django sessions with custom tracking
- **Security**: Secure cookies, CSRF protection

### Authentication Backends
**Configuration**: `backend/config/settings/base.py`

```python
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
    'apps.users.backends.CustomSAMLBackend',
    'apps.users.backends.CustomOIDCBackend',
)
```

### Permission Classes
- **IsAuthenticated**: Default for most endpoints
- **AllowAny**: Public booking endpoints
- **Custom Permissions**: Role-based access control

## Response Formats

### Standard Response Structure
```json
{
  "data": {},
  "message": "Success message",
  "errors": {},
  "meta": {
    "pagination": {},
    "performance": {}
  }
}
```

### Pagination
**Configuration**: Page number pagination with 20 items per page

```json
{
  "count": 100,
  "next": "http://api.example.com/api/v1/endpoint/?page=3",
  "previous": "http://api.example.com/api/v1/endpoint/?page=1",
  "results": []
}
```

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "code": "ERROR_CODE",
  "field_errors": {
    "field_name": ["Field-specific error message"]
  }
}
```

## Rate Limiting

### Rate Limit Configuration
**File**: `backend/config/settings/base.py`

```python
'DEFAULT_THROTTLE_RATES': {
    'anon': '100/hour',
    'user': '1000/hour',
    'booking': '10/minute',
    'login': '5/minute',
    'registration': '3/minute',
    'password_reset': '3/hour',
}
```

### Rate Limit Headers
- `X-RateLimit-Limit`: Request limit per time window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

### Rate Limit Responses
**Status Code**: 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "detail": "Request was throttled. Expected available in 60 seconds.",
  "retry_after": 60
}
```

## Error Handling

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (permission denied)
- **404**: Not Found
- **409**: Conflict (e.g., time slot no longer available)
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error

### Validation Errors
**Format**: Field-specific error messages
```json
{
  "email": ["This field is required."],
  "password": ["Password must contain at least one uppercase letter."],
  "start_time": ["Start time must be in the future."]
}
```

### Business Logic Errors
```json
{
  "error": "Time slot no longer available",
  "code": "SLOT_UNAVAILABLE",
  "details": "The selected time slot has been booked by another user."
}
```

## Public API Endpoints

### Public Booking Endpoints
**No Authentication Required**

#### Organizer Public Page
- **GET** `/<str:organizer_slug>/`
- **Response**: Organizer profile and public event types
- **Caching**: 15 minutes
- **Features**: Privacy-filtered data

#### Event Type Booking Page
- **GET** `/<str:organizer_slug>/<str:event_type_slug>/`
- **Query Parameters**:
  - `start_date`: YYYY-MM-DD
  - `end_date`: YYYY-MM-DD
  - `timezone`: IANA timezone string
  - `attendee_count`: Number of attendees
- **Response**: Event details, available slots, custom questions
- **Features**: Real-time availability calculation

#### Available Slots API
- **GET** `/api/v1/events/slots/<str:organizer_slug>/<str:event_type_slug>/`
- **Query Parameters**: Same as booking page
- **Response**: Available time slots with performance metrics
- **Caching**: Dynamic based on date range

#### Create Booking
- **POST** `/api/v1/events/bookings/create/`
- **Rate Limited**: 10 requests per minute
- **Features**: 
  - Comprehensive validation
  - Waitlist handling
  - Async post-processing

#### Booking Management
- **GET/POST** `/api/v1/events/booking/<uuid:access_token>/manage/`
- **Features**:
  - Token-based access
  - Cancel/reschedule operations
  - Group event attendee management

### Availability Calculation API
- **GET** `/api/v1/availability/calculated-slots/<str:organizer_slug>/`
- **Features**: Public availability calculation with caching

## Authentication Flows

### Registration Flow
1. **POST** `/api/v1/users/register/`
2. User created with `pending_verification` status
3. Email verification token generated
4. Welcome and verification emails sent
5. User must verify email to activate account

### Login Flow
1. **POST** `/api/v1/users/login/`
2. Credentials validated
3. Account status checked
4. MFA challenge if enabled
5. Session created with tracking
6. Token returned for API access

### Password Reset Flow
1. **POST** `/api/v1/users/request-password-reset/`
2. Reset token generated (if user exists)
3. Reset email sent
4. **POST** `/api/v1/users/confirm-password-reset/`
5. Password updated, all sessions revoked

### OAuth Integration Flow
1. **POST** `/api/v1/integrations/oauth/initiate/`
2. Authorization URL generated with state
3. User redirected to provider
4. **POST** `/api/v1/integrations/oauth/callback/`
5. Code exchanged for tokens
6. Integration created/updated
7. Initial sync triggered

## Data Serialization

### Serializer Patterns
**Read Serializers**: Include related data, computed fields
**Write Serializers**: Validation-focused, minimal fields
**Public Serializers**: Privacy-filtered data

### Common Serializer Fields
- **Read-only Fields**: `id`, `created_at`, `updated_at`
- **Computed Fields**: Success rates, display names, status indicators
- **Related Data**: Nested serializers for foreign keys
- **Privacy Filtering**: Conditional field inclusion

### Date/Time Handling
- **Storage**: UTC in database
- **API Format**: ISO 8601 with timezone
- **Timezone Conversion**: Based on user preferences
- **DST Handling**: Automatic timezone library handling

## Caching Strategy

### Cache Levels
1. **Application Cache**: Redis for computed data
2. **Database Cache**: Query result caching
3. **HTTP Cache**: Browser and CDN caching
4. **API Response Cache**: Endpoint-specific caching

### Cache Keys
**Pattern**: `{app}:{model}:{identifier}:{parameters}`

**Examples**:
- `availability:user123:event456:2024-01-15:2024-01-15:UTC:1`
- `public_organizer:john-doe`
- `event_type:discovery-call:public`

### Cache Invalidation
**Triggers**:
- Model changes (via Django signals)
- Manual cache clearing
- Time-based expiration
- Dependency-based invalidation

**Strategies**:
- Immediate invalidation for critical data
- Lazy invalidation for non-critical data
- Batch invalidation for performance
- Selective invalidation by tags

## Performance Optimization

### Database Optimization
- **Indexing Strategy**: Compound indexes on frequently queried fields
- **Query Optimization**: Select/prefetch related data
- **Connection Pooling**: Efficient database connections
- **Read Replicas**: Separate read/write operations

### API Optimization
- **Response Compression**: Gzip compression
- **Field Selection**: Sparse fieldsets for large objects
- **Pagination**: Limit response sizes
- **Async Processing**: Background tasks for heavy operations

### Monitoring
- **Response Times**: Track API endpoint performance
- **Error Rates**: Monitor failure rates
- **Cache Hit Rates**: Optimize caching strategies
- **Database Performance**: Query analysis and optimization

## Security Headers

### CORS Configuration
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
]
CORS_ALLOW_CREDENTIALS = True
```

### Security Headers
- **HSTS**: HTTP Strict Transport Security
- **CSP**: Content Security Policy
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME sniffing protection

## API Documentation

### Endpoint Documentation Format
Each endpoint should include:
- **Purpose**: What the endpoint does
- **Authentication**: Required authentication level
- **Parameters**: Query parameters and request body
- **Response**: Expected response format
- **Errors**: Possible error conditions
- **Examples**: Request/response examples

### OpenAPI/Swagger Integration
**Recommended**: Generate API documentation from Django REST Framework
- **Schema Generation**: Automatic from serializers
- **Interactive Documentation**: Swagger UI
- **Client Generation**: SDK generation capability

## Testing Strategy

### API Testing Levels
1. **Unit Tests**: Individual endpoint testing
2. **Integration Tests**: End-to-end API flows
3. **Performance Tests**: Load and stress testing
4. **Security Tests**: Authentication and authorization testing

### Test Data Management
- **Fixtures**: Consistent test data
- **Factories**: Dynamic test data generation
- **Cleanup**: Proper test isolation
- **Mocking**: External service mocking

## Deployment Configuration

### Environment Variables
**Critical Settings**:
- `DJANGO_SECRET_KEY`: Application secret
- `DATABASE_URL`: Database connection
- `REDIS_URL`: Cache and queue connection
- `EMAIL_*`: Email service configuration
- `TWILIO_*`: SMS service configuration
- OAuth provider credentials

### Production Considerations
- **SSL/TLS**: HTTPS enforcement
- **Load Balancing**: Multiple server support
- **Database Scaling**: Read replicas, connection pooling
- **Cache Distribution**: Redis clustering
- **Background Tasks**: Celery worker scaling

## API Client Guidelines

### Request Headers
**Required**:
- `Content-Type: application/json`
- `Authorization: Token <token>` (for authenticated endpoints)

**Optional**:
- `Accept-Language`: Preferred language
- `X-Timezone`: User timezone
- `User-Agent`: Client identification

### Response Handling
**Success Responses**: Check status code and parse JSON
**Error Responses**: Handle error codes appropriately
**Rate Limiting**: Respect rate limit headers
**Retries**: Implement exponential backoff for retries

### Best Practices
1. **Error Handling**: Graceful degradation for API failures
2. **Caching**: Cache responses when appropriate
3. **Pagination**: Handle paginated responses properly
4. **Validation**: Client-side validation matching server-side
5. **Security**: Secure token storage and transmission

## WebSocket Integration (Future)

### Real-Time Features
- **Live Availability Updates**: Real-time slot availability
- **Booking Notifications**: Instant booking alerts
- **Calendar Sync Status**: Live sync progress
- **Workflow Execution**: Real-time execution status

### Implementation Considerations
- **Django Channels**: WebSocket support
- **Authentication**: Token-based WebSocket auth
- **Scaling**: WebSocket server scaling
- **Fallback**: Polling fallback for unsupported clients

## API Monitoring

### Metrics to Track
- **Response Times**: Per endpoint performance
- **Error Rates**: Success/failure ratios
- **Usage Patterns**: Popular endpoints and features
- **User Behavior**: API usage analytics

### Monitoring Tools
- **Application Performance Monitoring**: APM integration
- **Log Aggregation**: Centralized logging
- **Alerting**: Automated alert systems
- **Dashboards**: Real-time monitoring dashboards

## Integration Patterns

### Webhook Patterns
**Outgoing Webhooks**: Platform to external services
- **Security**: HMAC signature validation
- **Retry Logic**: Exponential backoff
- **Payload Format**: Standardized JSON structure
- **Event Types**: Booking lifecycle events

**Incoming Webhooks**: External services to platform
- **Authentication**: API key or signature validation
- **Rate Limiting**: Prevent abuse
- **Validation**: Strict payload validation
- **Processing**: Async processing for heavy operations

### External API Integration
**Pattern**: Centralized API client utilities
- **Rate Limiting**: Respect provider limits
- **Error Handling**: Provider-specific error handling
- **Token Management**: Automatic refresh logic
- **Monitoring**: Integration health tracking

## Development Guidelines

### API Design Principles
1. **RESTful Design**: Follow REST conventions
2. **Consistency**: Consistent naming and patterns
3. **Versioning**: Backward compatibility
4. **Documentation**: Comprehensive API docs
5. **Testing**: Thorough test coverage

### Code Organization
- **Serializers**: Input validation and output formatting
- **Views**: Business logic and request handling
- **Utils**: Reusable utility functions
- **Tasks**: Async processing with Celery
- **Tests**: Comprehensive test coverage

### Error Handling Patterns
- **Validation Errors**: Field-specific error messages
- **Business Logic Errors**: Descriptive error codes
- **System Errors**: Generic error messages (no sensitive info)
- **Logging**: Comprehensive error logging for debugging

This API structure provides a solid foundation for building a robust, scalable, and secure scheduling platform with comprehensive features and enterprise-grade capabilities.