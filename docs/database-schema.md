# Database Schema Documentation

## Overview
This document provides a comprehensive overview of the database schema, relationships, constraints, and design patterns used throughout the platform. The schema is designed for scalability, data integrity, and performance optimization.

## Database Design Principles

### Primary Key Strategy
- **UUID Primary Keys**: All models use UUIDField for primary keys
- **Benefits**: Distributed system friendly, no collision risk, security
- **Format**: UUID4 (random generation)

### Naming Conventions
- **Table Names**: Lowercase with underscores (e.g., `user_profiles`)
- **Field Names**: Lowercase with underscores
- **Foreign Key Names**: `{model_name}_id` or descriptive names
- **Index Names**: Descriptive names indicating purpose

### Relationship Patterns
- **One-to-One**: User ↔ Profile, User ↔ BufferTime
- **One-to-Many**: User → EventTypes, EventType → Bookings
- **Many-to-Many**: User ↔ Roles, EventType ↔ AvailabilityRules

## Core Schema Tables

### Users and Authentication

#### users
**Purpose**: Core user accounts
**Key Fields**:
- `id`: UUID (PK)
- `email`: VARCHAR(254) UNIQUE
- `first_name`: VARCHAR(30)
- `last_name`: VARCHAR(30)
- `is_organizer`: BOOLEAN DEFAULT TRUE
- `is_email_verified`: BOOLEAN DEFAULT FALSE
- `account_status`: VARCHAR(50)
- `password_changed_at`: TIMESTAMP
- `failed_login_attempts`: INTEGER DEFAULT 0
- `locked_until`: TIMESTAMP NULL
- `last_login_ip`: INET NULL

**Indexes**:
- `email` (unique)
- `account_status`
- `is_organizer`

#### user_profiles
**Purpose**: Extended user information
**Key Fields**:
- `id`: UUID (PK)
- `user_id`: UUID (FK to users, unique)
- `organizer_slug`: VARCHAR(100) UNIQUE
- `display_name`: VARCHAR(100)
- `timezone_name`: VARCHAR(50) DEFAULT 'UTC'
- `brand_color`: VARCHAR(7) DEFAULT '#0066cc'
- `reasonable_hours_start`: INTEGER DEFAULT 7
- `reasonable_hours_end`: INTEGER DEFAULT 22

**Indexes**:
- `organizer_slug` (unique)
- `user_id` (unique)

#### user_roles
**Purpose**: Role definitions for RBAC
**Key Fields**:
- `id`: UUID (PK)
- `name`: VARCHAR(50) UNIQUE
- `role_type`: VARCHAR(20)
- `parent_id`: UUID (FK to self, NULL)
- `is_system_role`: BOOLEAN DEFAULT FALSE

#### user_permissions
**Purpose**: Permission definitions
**Key Fields**:
- `id`: UUID (PK)
- `codename`: VARCHAR(100) UNIQUE
- `name`: VARCHAR(200)
- `category`: VARCHAR(50)

#### user_audit_logs
**Purpose**: Comprehensive audit trail
**Key Fields**:
- `id`: UUID (PK)
- `user_id`: UUID (FK to users, NULL)
- `action`: VARCHAR(30)
- `description`: TEXT
- `ip_address`: INET NULL
- `metadata`: JSONB
- `content_type_id`: INTEGER (FK to ContentType, NULL)
- `object_id`: UUID NULL

**Indexes**:
- `user_id, created_at` (composite)
- `action, created_at` (composite)
- `ip_address, created_at` (composite)

### Events and Bookings

#### event_types
**Purpose**: Bookable event definitions
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users)
- `name`: VARCHAR(200)
- `event_type_slug`: VARCHAR(100)
- `duration`: INTEGER
- `max_attendees`: INTEGER DEFAULT 1
- `location_type`: VARCHAR(20)
- `recurrence_type`: VARCHAR(20) DEFAULT 'none'
- `custom_questions`: JSONB

**Indexes**:
- `organizer_id, is_active, is_private` (composite)
- `event_type_slug`

**Unique Constraints**:
- `organizer_id, event_type_slug`

#### bookings
**Purpose**: Scheduled meetings
**Key Fields**:
- `id`: UUID (PK)
- `event_type_id`: UUID (FK to event_types)
- `organizer_id`: UUID (FK to users)
- `invitee_name`: VARCHAR(200)
- `invitee_email`: VARCHAR(254)
- `start_time`: TIMESTAMP WITH TIME ZONE
- `end_time`: TIMESTAMP WITH TIME ZONE
- `status`: VARCHAR(20) DEFAULT 'confirmed'
- `attendee_count`: INTEGER DEFAULT 1
- `access_token`: UUID UNIQUE
- `custom_answers`: JSONB
- `calendar_sync_status`: VARCHAR(20) DEFAULT 'pending'

**Indexes**:
- `organizer_id, start_time, end_time` (composite)
- `status, start_time` (composite)
- `access_token` (unique)
- `recurrence_id`

#### booking_attendees
**Purpose**: Individual attendees for group events
**Key Fields**:
- `id`: UUID (PK)
- `booking_id`: UUID (FK to bookings)
- `name`: VARCHAR(200)
- `email`: VARCHAR(254)
- `status`: VARCHAR(20) DEFAULT 'confirmed'
- `custom_answers`: JSONB

**Unique Constraints**:
- `booking_id, email`

#### custom_questions
**Purpose**: Event-specific custom questions
**Key Fields**:
- `id`: UUID (PK)
- `event_type_id`: UUID (FK to event_types)
- `question_text`: VARCHAR(500)
- `question_type`: VARCHAR(20)
- `is_required`: BOOLEAN DEFAULT FALSE
- `order`: INTEGER
- `options`: JSONB
- `conditions`: JSONB

**Unique Constraints**:
- `event_type_id, order`

### Availability Management

#### availability_rules
**Purpose**: Recurring availability patterns
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users)
- `day_of_week`: INTEGER (0=Monday, 6=Sunday)
- `start_time`: TIME
- `end_time`: TIME
- `is_active`: BOOLEAN DEFAULT TRUE

**Unique Constraints**:
- `organizer_id, day_of_week, start_time, end_time`

#### date_override_rules
**Purpose**: Date-specific availability overrides
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users)
- `date`: DATE
- `is_available`: BOOLEAN DEFAULT TRUE
- `start_time`: TIME NULL
- `end_time`: TIME NULL

**Unique Constraints**:
- `organizer_id, date`

#### blocked_times
**Purpose**: One-off blocked periods
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users)
- `start_datetime`: TIMESTAMP WITH TIME ZONE
- `end_datetime`: TIMESTAMP WITH TIME ZONE
- `source`: VARCHAR(20) DEFAULT 'manual'
- `external_id`: VARCHAR(200)

**Indexes**:
- `organizer_id, source, external_id` (composite)
- `organizer_id, start_datetime, end_datetime` (composite)

#### buffer_times
**Purpose**: Buffer time settings per organizer
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users, unique)
- `default_buffer_before`: INTEGER DEFAULT 0
- `default_buffer_after`: INTEGER DEFAULT 0
- `minimum_gap`: INTEGER DEFAULT 0
- `slot_interval_minutes`: INTEGER DEFAULT 15

### Integrations

#### calendar_integrations
**Purpose**: External calendar connections
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users)
- `provider`: VARCHAR(20)
- `access_token`: TEXT
- `refresh_token`: TEXT
- `token_expires_at`: TIMESTAMP NULL
- `sync_errors`: INTEGER DEFAULT 0
- `is_active`: BOOLEAN DEFAULT TRUE

**Indexes**:
- `is_active, sync_enabled` (composite)
- `last_sync_at`

**Unique Constraints**:
- `organizer_id, provider`

#### video_integrations
**Purpose**: Video conferencing connections
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users)
- `provider`: VARCHAR(20)
- `access_token`: TEXT
- `api_calls_today`: INTEGER DEFAULT 0
- `rate_limit_reset_at`: TIMESTAMP NULL

**Unique Constraints**:
- `organizer_id, provider`

#### integration_logs
**Purpose**: Integration activity tracking
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users)
- `log_type`: VARCHAR(30)
- `booking_id`: UUID (FK to bookings, NULL)
- `message`: TEXT
- `details`: JSONB
- `success`: BOOLEAN DEFAULT TRUE

### Workflows and Automation

#### workflows
**Purpose**: Automation workflow definitions
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users)
- `name`: VARCHAR(200)
- `trigger`: VARCHAR(30)
- `delay_minutes`: INTEGER DEFAULT 0
- `is_active`: BOOLEAN DEFAULT TRUE
- `total_executions`: INTEGER DEFAULT 0
- `successful_executions`: INTEGER DEFAULT 0

#### workflow_actions
**Purpose**: Individual actions within workflows
**Key Fields**:
- `id`: UUID (PK)
- `workflow_id`: UUID (FK to workflows)
- `name`: VARCHAR(200)
- `action_type`: VARCHAR(20)
- `order`: INTEGER DEFAULT 0
- `recipient`: VARCHAR(20)
- `conditions`: JSONB
- `webhook_data`: JSONB

#### workflow_executions
**Purpose**: Workflow execution tracking
**Key Fields**:
- `id`: UUID (PK)
- `workflow_id`: UUID (FK to workflows)
- `booking_id`: UUID (FK to bookings)
- `status`: VARCHAR(20) DEFAULT 'pending'
- `execution_log`: JSONB
- `actions_executed`: INTEGER DEFAULT 0
- `actions_failed`: INTEGER DEFAULT 0

### Notifications

#### notification_templates
**Purpose**: Customizable notification templates
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users)
- `name`: VARCHAR(200)
- `template_type`: VARCHAR(30)
- `notification_type`: VARCHAR(10)
- `subject`: VARCHAR(200)
- `message`: TEXT
- `required_placeholders`: JSONB

**Unique Constraints**:
- `organizer_id, template_type, notification_type, is_default`

#### notification_logs
**Purpose**: Notification delivery tracking
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users)
- `booking_id`: UUID (FK to bookings, NULL)
- `notification_type`: VARCHAR(10)
- `recipient_email`: VARCHAR(254)
- `recipient_phone`: VARCHAR(20)
- `status`: VARCHAR(20) DEFAULT 'pending'
- `external_id`: VARCHAR(200)
- `provider_response`: JSONB

#### notification_preferences
**Purpose**: User notification preferences
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users, unique)
- `booking_confirmations_email`: BOOLEAN DEFAULT TRUE
- `reminder_minutes_before`: INTEGER DEFAULT 60
- `dnd_enabled`: BOOLEAN DEFAULT FALSE
- `preferred_notification_method`: VARCHAR(10) DEFAULT 'email'

### Contacts and CRM

#### contacts
**Purpose**: Contact management
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users)
- `first_name`: VARCHAR(100)
- `email`: VARCHAR(254)
- `company`: VARCHAR(200)
- `tags`: JSONB
- `total_bookings`: INTEGER DEFAULT 0
- `last_booking_date`: TIMESTAMP NULL

**Unique Constraints**:
- `organizer_id, email`

#### contact_groups
**Purpose**: Contact organization
**Key Fields**:
- `id`: UUID (PK)
- `organizer_id`: UUID (FK to users)
- `name`: VARCHAR(100)
- `color`: VARCHAR(7) DEFAULT '#0066cc'

**Unique Constraints**:
- `organizer_id, name`

## Relationship Mapping

### Core Relationships
```
User (1) ←→ (1) Profile
User (1) → (*) EventType
User (1) → (*) Booking
EventType (1) → (*) Booking
Booking (1) → (*) Attendee
User (*) ←→ (*) Role
Role (*) ←→ (*) Permission
```

### Integration Relationships
```
User (1) → (*) CalendarIntegration
User (1) → (*) VideoConferenceIntegration
User (1) → (*) WebhookIntegration
Booking (1) → (*) IntegrationLog
```

### Workflow Relationships
```
User (1) → (*) Workflow
Workflow (1) → (*) WorkflowAction
Workflow (1) → (*) WorkflowExecution
Booking (1) → (*) WorkflowExecution
```

### Availability Relationships
```
User (1) → (*) AvailabilityRule
User (1) → (*) BlockedTime
User (1) ←→ (1) BufferTime
EventType (*) ←→ (*) AvailabilityRule
```

## Data Integrity Constraints

### Foreign Key Constraints
- **CASCADE**: User deletion cascades to owned resources
- **SET_NULL**: Optional relationships preserved on deletion
- **PROTECT**: Prevent deletion of referenced objects

### Check Constraints
- **Time Validation**: Start time < End time
- **Positive Values**: Durations, counts must be positive
- **Enum Validation**: Status fields limited to valid choices
- **Date Logic**: End dates after start dates

### Unique Constraints
- **Business Logic**: Prevent duplicate business entities
- **Data Integrity**: Ensure referential integrity
- **Performance**: Enable efficient lookups

## Indexing Strategy

### Primary Indexes
- **Primary Keys**: Automatic UUID indexes
- **Foreign Keys**: Automatic relationship indexes
- **Unique Fields**: Automatic unique indexes

### Composite Indexes
```sql
-- Booking queries
CREATE INDEX idx_bookings_organizer_time ON bookings(organizer_id, start_time, end_time);
CREATE INDEX idx_bookings_status_time ON bookings(status, start_time);

-- Availability queries
CREATE INDEX idx_availability_organizer_day ON availability_rules(organizer_id, day_of_week);
CREATE INDEX idx_blocked_times_organizer_time ON blocked_times(organizer_id, start_datetime, end_datetime);

-- Audit queries
CREATE INDEX idx_audit_user_time ON user_audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action_time ON user_audit_logs(action, created_at DESC);
```

### Performance Indexes
- **Search Fields**: Full-text search on names, descriptions
- **Filter Fields**: Common filter combinations
- **Sort Fields**: Frequently sorted columns
- **Date Ranges**: Time-based queries

## JSON Field Usage

### JSONB Fields
**Advantages**: Flexible schema, efficient queries, indexing support

**Usage Patterns**:
- **Configuration Data**: Settings, preferences, options
- **Dynamic Content**: Custom answers, metadata
- **Audit Data**: Change tracking, context information
- **Template Data**: Workflow templates, notification content

### JSONB Indexing
```sql
-- Custom answers queries
CREATE INDEX idx_custom_answers_gin ON bookings USING GIN (custom_answers);

-- Metadata searches
CREATE INDEX idx_audit_metadata_gin ON user_audit_logs USING GIN (metadata);

-- Tag searches
CREATE INDEX idx_contact_tags_gin ON contacts USING GIN (tags);
```

## Data Migration Strategy

### Migration Principles
- **Backward Compatibility**: Maintain API compatibility
- **Zero Downtime**: Online schema changes
- **Data Preservation**: Never lose user data
- **Rollback Support**: Reversible migrations

### Migration Types
1. **Additive Changes**: New tables, columns, indexes
2. **Modification Changes**: Column type changes, constraint updates
3. **Removal Changes**: Deprecated field removal
4. **Data Migrations**: Data transformation, cleanup

### Migration Best Practices
- **Small Batches**: Incremental changes
- **Testing**: Thorough testing on production-like data
- **Monitoring**: Performance impact monitoring
- **Rollback Plans**: Clear rollback procedures

## Performance Optimization

### Query Optimization
- **Select Related**: Minimize database queries
- **Prefetch Related**: Efficient many-to-many queries
- **Query Analysis**: Regular EXPLAIN ANALYZE
- **Index Usage**: Monitor index effectiveness

### Connection Management
- **Connection Pooling**: Efficient connection reuse
- **Read Replicas**: Separate read/write operations
- **Connection Limits**: Prevent connection exhaustion
- **Timeout Configuration**: Appropriate timeout settings

### Caching Strategy
- **Query Caching**: Cache expensive queries
- **Object Caching**: Cache frequently accessed objects
- **Computed Values**: Cache calculated fields
- **Cache Invalidation**: Efficient cache management

## Data Archival and Retention

### Retention Policies
- **Audit Logs**: 7 years retention
- **Notification Logs**: 90 days retention
- **Integration Logs**: 90 days retention
- **Workflow Executions**: 90 days retention
- **User Sessions**: 30 days after inactivity

### Archival Strategy
- **Cold Storage**: Move old data to cheaper storage
- **Compression**: Compress archived data
- **Indexing**: Maintain searchability
- **Compliance**: Meet regulatory requirements

## Backup and Recovery

### Backup Strategy
- **Full Backups**: Daily complete database backups
- **Incremental Backups**: Hourly incremental backups
- **Point-in-Time Recovery**: Transaction log backups
- **Cross-Region**: Geographic backup distribution

### Recovery Procedures
- **RTO**: Recovery Time Objective < 4 hours
- **RPO**: Recovery Point Objective < 1 hour
- **Testing**: Regular recovery testing
- **Documentation**: Clear recovery procedures

## Security Considerations

### Data Encryption
- **At Rest**: Database encryption
- **In Transit**: TLS encryption
- **Application Level**: Sensitive field encryption
- **Key Management**: Secure key storage

### Access Control
- **Database Users**: Principle of least privilege
- **Connection Security**: Secure connection strings
- **Audit Logging**: Database access logging
- **Monitoring**: Suspicious activity detection

### Data Privacy
- **PII Protection**: Personal information encryption
- **Right to Deletion**: GDPR compliance
- **Data Minimization**: Store only necessary data
- **Consent Tracking**: User consent management

## Monitoring and Alerting

### Database Monitoring
- **Performance Metrics**: Query performance, connection usage
- **Health Checks**: Database availability, replication lag
- **Capacity Monitoring**: Storage usage, growth trends
- **Error Tracking**: Failed queries, connection errors

### Alert Conditions
- **High CPU Usage**: > 80% for 5 minutes
- **Slow Queries**: > 1 second execution time
- **Connection Exhaustion**: > 90% connections used
- **Replication Lag**: > 30 seconds behind primary

## Development Guidelines

### Schema Changes
1. **Planning**: Impact analysis before changes
2. **Testing**: Thorough testing on staging
3. **Documentation**: Update schema documentation
4. **Communication**: Notify team of changes
5. **Monitoring**: Watch for performance impact

### Data Modeling Best Practices
- **Normalization**: Appropriate normalization level
- **Denormalization**: Strategic denormalization for performance
- **Constraints**: Enforce business rules at database level
- **Documentation**: Clear field documentation

### Query Guidelines
- **Efficient Queries**: Use appropriate indexes
- **Avoid N+1**: Use select_related/prefetch_related
- **Limit Results**: Always paginate large datasets
- **Monitor Performance**: Regular query performance review

## Future Considerations

### Scalability Planning
- **Horizontal Scaling**: Sharding strategies
- **Vertical Scaling**: Hardware upgrade paths
- **Read Replicas**: Read scaling strategies
- **Caching Layers**: Multi-level caching

### Technology Evolution
- **Database Upgrades**: PostgreSQL version upgrades
- **Feature Adoption**: New PostgreSQL features
- **Tool Integration**: Enhanced monitoring tools
- **Cloud Migration**: Cloud database services

This database schema provides a solid foundation for a scalable, secure, and performant scheduling platform with comprehensive features and enterprise-grade capabilities.