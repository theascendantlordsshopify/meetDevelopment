# Workflows App Documentation

## Overview
The Workflows app provides a powerful automation engine that allows organizers to create sequences of actions triggered by specific events (like booking creation, cancellation, etc.). It supports conditional logic, multiple action types, and comprehensive execution tracking. This is essentially a business process automation system within the scheduling platform.

## Models

### Workflow Model
**File**: `backend/apps/workflows/models.py`

**Key Fields**:
- `id`: UUIDField (primary key)
- `organizer`: ForeignKey to User
- `name`: CharField (max_length=200)
- `description`: TextField
- `trigger`: CharField with choices:
  - 'booking_created'
  - 'booking_cancelled'
  - 'booking_completed'
  - 'before_meeting'
  - 'after_meeting'
- `event_types`: ManyToManyField to EventType (optional filter)
- `delay_minutes`: IntegerField (delay before execution)
- `is_active`: BooleanField
- `total_executions`: IntegerField (statistics)
- `successful_executions`: IntegerField
- `failed_executions`: IntegerField
- `last_executed_at`: DateTimeField

**Key Methods**:
- `get_success_rate()`: Calculates percentage success rate
- `increment_execution_stats(success)`: Updates execution statistics

### WorkflowAction Model
**File**: `backend/apps/workflows/models.py`

**Key Fields**:
- `workflow`: ForeignKey to Workflow
- `name`: CharField (max_length=200)
- `action_type`: CharField with choices:
  - 'send_email'
  - 'send_sms'
  - 'webhook'
  - 'update_booking'
- `order`: IntegerField (execution order)
- `recipient`: CharField ('organizer', 'invitee', 'both', 'custom')
- `custom_email`: EmailField (for custom recipient)
- `subject`: CharField (for email/SMS)
- `message`: TextField (email/SMS content)
- `webhook_url`: URLField
- `webhook_data`: JSONField (additional payload data)
- `conditions`: JSONField (conditional logic)
- `update_booking_fields`: JSONField (for update_booking actions)
- `is_active`: BooleanField
- `total_executions`: IntegerField
- `successful_executions`: IntegerField
- `failed_executions`: IntegerField
- `last_executed_at`: DateTimeField

**Key Methods**:
- `get_success_rate()`: Action-level success rate
- `increment_execution_stats(success)`: Updates action statistics

**Validation**:
- Conditions must follow specific JSON structure
- Update booking fields must be valid booking model fields
- Custom email required when recipient is 'custom'

### WorkflowExecution Model
**File**: `backend/apps/workflows/models.py`

**Key Fields**:
- `workflow`: ForeignKey to Workflow
- `booking`: ForeignKey to Booking
- `status`: CharField ('pending', 'running', 'completed', 'failed', 'cancelled')
- `started_at`: DateTimeField
- `completed_at`: DateTimeField
- `error_message`: TextField
- `actions_executed`: IntegerField
- `actions_failed`: IntegerField
- `execution_log`: JSONField (detailed action results)

**Purpose**: Tracks individual workflow executions with detailed logging

### WorkflowTemplate Model
**File**: `backend/apps/workflows/models.py`

**Key Fields**:
- `name`: CharField
- `description`: TextField
- `category`: CharField ('booking', 'follow_up', 'reminder', 'feedback')
- `template_data`: JSONField (workflow and actions configuration)
- `is_public`: BooleanField
- `usage_count`: IntegerField

**Purpose**: Pre-built workflow configurations for common use cases

## API Endpoints

### Workflow Management
**Base URL**: `/api/v1/workflows/`

#### Workflow CRUD
- **GET/POST** `/`
- **GET/PUT/DELETE** `/<uuid:pk>/`
- **Serializers**: `WorkflowSerializer`, `WorkflowCreateSerializer`
- **Features**:
  - Full workflow management
  - Event type filtering
  - Execution statistics
  - Performance metrics

#### Workflow Testing and Validation
- **POST** `/<uuid:pk>/test/`
- **Function**: `test_workflow`
- **Serializer**: `WorkflowTestSerializer`
- **Test Types**:
  - `mock_data`: Test with generated data
  - `real_data`: Test with actual booking data
  - `live_test`: Execute real actions (use with caution)

- **POST** `/<uuid:pk>/validate/`
- **Function**: `validate_workflow`
- **Features**:
  - Configuration validation
  - Runtime checks
  - Dependency verification
  - Error reporting

#### Workflow Operations
- **GET** `/<uuid:pk>/execution-summary/`
- **Function**: `workflow_execution_summary`
- **Features**: Detailed execution history and statistics

- **POST** `/<uuid:pk>/duplicate/`
- **Function**: `duplicate_workflow`
- **Features**: Create copy of existing workflow

### Workflow Actions
#### Action Management
- **GET/POST** `/<uuid:workflow_id>/actions/`
- **GET/PUT/DELETE** `/actions/<uuid:pk>/`
- **Serializers**: `WorkflowActionSerializer`, `WorkflowActionCreateSerializer`
- **Features**:
  - Action CRUD operations
  - Order management
  - Condition configuration
  - Performance tracking

### Workflow Executions
#### Execution History
- **GET** `/executions/`
- **Serializer**: `WorkflowExecutionSerializer`
- **Features**:
  - Execution history
  - Detailed logs
  - Performance metrics
  - Error analysis

### Workflow Templates
#### Template Management
- **GET** `/templates/`
- **POST** `/templates/create-from/`
- **Serializer**: `WorkflowTemplateSerializer`, `WorkflowFromTemplateSerializer`
- **Features**:
  - Browse public templates
  - Create workflow from template
  - Customization options

### Bulk Operations and Analytics
#### Bulk Testing
- **POST** `/bulk-test/`
- **Function**: `bulk_test_workflows`
- **Features**: Test multiple workflows simultaneously

#### Performance Statistics
- **GET** `/performance-stats/`
- **Function**: `workflow_performance_stats`
- **Features**:
  - Overall performance metrics
  - Top performing workflows
  - Problematic workflows identification
  - Success rate analysis

## Conditional Logic System

### Condition Structure
**Format**: List of condition groups, each with operator and rules

```json
[
  {
    "operator": "AND",
    "rules": [
      {
        "field": "event_type_name",
        "operator": "equals",
        "value": "Discovery Call"
      },
      {
        "field": "invitee_domain",
        "operator": "equals",
        "value": "enterprise.com"
      }
    ]
  }
]
```

### Supported Operators
**Comparison Operators**:
- `equals`: Exact match
- `not_equals`: Not equal
- `greater_than`: Numeric comparison
- `less_than`: Numeric comparison
- `greater_than_or_equal`: Numeric comparison
- `less_than_or_equal`: Numeric comparison

**String Operators**:
- `contains`: Substring search
- `not_contains`: Negative substring search
- `starts_with`: Prefix match
- `ends_with`: Suffix match
- `is_empty`: Empty or null check
- `is_not_empty`: Non-empty check

**List Operators**:
- `in_list`: Value in list
- `not_in_list`: Value not in list

**Advanced Operators**:
- `regex_match`: Regular expression matching

### Available Context Fields
**Booking Fields**:
- `booking_id`, `booking_status`, `invitee_name`, `invitee_email`, `invitee_phone`
- `invitee_timezone`, `attendee_count`, `start_time`, `end_time`, `duration`
- `cancellation_reason`, `meeting_link`, `meeting_id`, `meeting_password`

**Event Type Fields**:
- `event_type_id`, `event_type_name`, `event_type_slug`, `event_type_description`
- `event_type_duration`, `event_type_location_type`, `event_type_max_attendees`

**Organizer Fields**:
- `organizer_id`, `organizer_email`, `organizer_name`, `organizer_first_name`
- `organizer_last_name`, `organizer_timezone`, `organizer_company`

**Time-based Fields**:
- `booking_hour`, `booking_day_of_week`, `booking_date`
- `is_weekend`, `is_business_hours`, `booking_created_today`

**Derived Fields**:
- `invitee_domain`, `has_phone`, `has_meeting_link`

**Custom Answer Fields**:
- `custom_{key}`: Flattened custom question answers

## Action Types

### Send Email Action
**Configuration**:
- `recipient`: Who receives the email
- `custom_email`: Email address (if recipient is 'custom')
- `subject`: Email subject with template variables
- `message`: Email body with template variables

**Template Variables**: All context fields available using `{{variable_name}}` syntax

**Process**:
1. Determines recipients based on configuration
2. Renders subject and message with booking context
3. Creates NotificationLog entry
4. Queues email for sending via notifications app

### Send SMS Action
**Configuration**:
- `recipient`: Who receives the SMS
- `message`: SMS content with template variables

**Process**:
1. Validates recipient phone numbers
2. Renders message with booking context
3. Creates NotificationLog entry
4. Queues SMS for sending via notifications app

**Validation**: Phone numbers must be available and valid

### Webhook Action
**Configuration**:
- `webhook_url`: Target URL for webhook
- `webhook_data`: Additional data to include in payload

**Payload Structure**:
```json
{
  "action": "action_name",
  "workflow_id": "uuid",
  "workflow_name": "workflow_name",
  "booking_id": "uuid",
  "event_type_name": "event_name",
  "organizer_email": "email",
  "invitee_name": "name",
  "invitee_email": "email",
  "start_time": "iso_datetime",
  "end_time": "iso_datetime",
  "duration_minutes": 30,
  "status": "confirmed",
  "timestamp": "iso_datetime",
  ...webhook_data
}
```

**Process**:
1. Builds comprehensive payload with booking data
2. Adds custom webhook data
3. Sends HTTP POST request with retry logic
4. Tracks delivery status and response

### Update Booking Action
**Configuration**:
- `update_booking_fields`: Dictionary of fields to update

**Allowed Fields**:
- `status`: Booking status
- `cancellation_reason`: Reason for cancellation
- `meeting_link`: Video meeting URL
- `meeting_id`: Meeting identifier
- `meeting_password`: Meeting password
- `custom_answers`: Additional custom data

**Process**:
1. Validates update fields against booking model
2. Stores original values for audit
3. Applies updates to booking
4. Creates audit log entry
5. Saves changes to database

## Celery Tasks

### Core Execution Tasks
1. **`execute_workflow`**:
   - Main workflow execution engine
   - Handles delays and scheduling
   - Creates execution records
   - Processes actions sequentially
   - Logs detailed results
   - Updates statistics

2. **`trigger_workflows`**:
   - Finds workflows matching trigger type
   - Filters by event type if specified
   - Schedules workflow executions
   - Handles multiple workflows per trigger

### Action Execution Functions
1. **`execute_email_action`**:
   - Processes email actions
   - Handles recipient determination
   - Renders content with context
   - Queues notifications

2. **`execute_sms_action`**:
   - Processes SMS actions
   - Validates phone numbers
   - Renders content
   - Queues notifications

3. **`execute_webhook_action`**:
   - Builds webhook payload
   - Sends HTTP requests
   - Handles authentication
   - Tracks delivery

4. **`execute_update_booking_action`**:
   - Validates update fields
   - Applies changes to booking
   - Creates audit logs
   - Handles errors gracefully

### Monitoring and Maintenance Tasks
1. **`cleanup_old_workflow_executions`**:
   - Removes executions older than 90 days
   - Prevents database bloat
   - Maintains performance

2. **`monitor_workflow_performance`**:
   - Tracks workflow performance
   - Identifies problematic workflows
   - Sends alerts for issues
   - Generates performance reports

3. **`validate_all_workflow_configurations`**:
   - Validates all active workflows
   - Checks configuration integrity
   - Reports issues
   - Suggests fixes

## Frontend Pages Required

### Workflow Management
1. **Workflows Dashboard** (`/workflows`)
   - List of all workflows
   - Status indicators (active/inactive)
   - Success rate metrics
   - Quick actions (edit, test, duplicate)
   - Recent execution summary
   - Performance overview

2. **Create Workflow** (`/workflows/new`)
   - Workflow basic information form
   - Trigger selection
   - Event type filtering (optional)
   - Delay configuration
   - Template selection option

3. **Edit Workflow** (`/workflows/<id>/edit`)
   - Workflow configuration form
   - Action management interface
   - Condition builder
   - Test functionality
   - Execution history

4. **Workflow Builder** (`/workflows/<id>/builder`)
   - Visual workflow designer
   - Drag-and-drop action creation
   - Condition logic builder
   - Real-time validation
   - Preview functionality

### Action Management
1. **Action Configuration** (within workflow builder)
   - Action type selection
   - Recipient configuration
   - Content editor with template variables
   - Condition builder
   - Test functionality

2. **Condition Builder** (component within action config)
   - Visual condition editor
   - Field selection from context
   - Operator selection
   - Value input with validation
   - Logic group management (AND/OR)

### Testing and Monitoring
1. **Workflow Testing** (`/workflows/<id>/test`)
   - Test type selection (mock/real/live)
   - Booking selection for real data tests
   - Test execution results
   - Action-by-action breakdown
   - Performance metrics

2. **Execution History** (`/workflows/<id>/executions`)
   - Execution timeline
   - Success/failure indicators
   - Detailed execution logs
   - Performance metrics
   - Error analysis

3. **Workflow Analytics** (`/workflows/analytics`)
   - Performance dashboard
   - Success rate trends
   - Most/least successful workflows
   - Execution time analysis
   - Error pattern identification

### Template Management
1. **Workflow Templates** (`/workflows/templates`)
   - Browse public templates
   - Template categories
   - Usage statistics
   - Preview functionality
   - Create from template

2. **Template Details** (`/workflows/templates/<id>`)
   - Template configuration preview
   - Customization options
   - Usage instructions
   - Create workflow button

## Components Required

### Workflow Management Components
1. **WorkflowCard**
   - Workflow summary display
   - Status indicators
   - Success rate visualization
   - Quick action buttons
   - Last execution info

2. **WorkflowForm**
   - Basic workflow configuration
   - Trigger selection
   - Event type filtering
   - Delay configuration
   - Validation feedback

3. **WorkflowList**
   - Sortable workflow table
   - Filtering options
   - Bulk operations
   - Status management
   - Performance indicators

### Action Builder Components
1. **ActionBuilder**
   - Visual action designer
   - Action type selection
   - Configuration forms
   - Preview functionality
   - Validation feedback

2. **ActionCard**
   - Action summary display
   - Type and recipient info
   - Condition indicators
   - Edit/delete buttons
   - Execution statistics

3. **ActionForm**
   - Type-specific configuration
   - Recipient selection
   - Content editor
   - Template variable helper
   - Real-time validation

### Condition Builder Components
1. **ConditionBuilder**
   - Visual condition editor
   - Group management (AND/OR)
   - Rule creation interface
   - Field selection dropdown
   - Operator selection
   - Value input with validation

2. **ConditionGroup**
   - Group operator selection
   - Rule management
   - Add/remove rules
   - Nested group support

3. **ConditionRule**
   - Field selection
   - Operator selection
   - Value input
   - Validation feedback
   - Delete functionality

### Content Editor Components
1. **TemplateEditor**
   - Rich text editor
   - Template variable insertion
   - Preview functionality
   - Syntax highlighting
   - Validation feedback

2. **VariableHelper**
   - Available variables list
   - Variable descriptions
   - Insert functionality
   - Context-aware suggestions

3. **ContentPreview**
   - Rendered content preview
   - Sample data display
   - Variable substitution
   - Formatting validation

### Testing Components
1. **WorkflowTester**
   - Test type selection
   - Booking selection for real data
   - Test execution interface
   - Results display
   - Performance metrics

2. **ExecutionResults**
   - Action-by-action results
   - Success/failure indicators
   - Execution times
   - Error details
   - Retry options

3. **ExecutionLog**
   - Detailed execution timeline
   - Action status indicators
   - Error messages
   - Performance data
   - Export functionality

### Analytics Components
1. **WorkflowAnalytics**
   - Performance dashboard
   - Success rate charts
   - Execution time trends
   - Error analysis
   - Comparative metrics

2. **PerformanceMetrics**
   - Real-time statistics
   - Historical trends
   - Benchmark comparisons
   - Alert indicators

## User Flows

### Creating a Workflow
1. User navigates to workflows dashboard
2. Clicks "Create New Workflow"
3. Enters basic information (name, description)
4. Selects trigger event
5. Optionally filters by event types
6. Sets execution delay if needed
7. Adds first action:
   - Selects action type
   - Configures recipients
   - Writes content with template variables
   - Sets conditions if needed
8. Adds additional actions as needed
9. Tests workflow with mock data
10. Activates workflow
11. Monitors execution results

### Building Complex Conditions
1. User adds condition to action
2. Creates first condition group
3. Selects group operator (AND/OR)
4. Adds rules to group:
   - Selects field from context
   - Chooses operator
   - Enters comparison value
5. Adds additional groups if needed
6. Tests condition logic
7. Saves configuration

### Testing Workflows
1. User selects workflow to test
2. Chooses test type:
   - Mock data for safe testing
   - Real booking data for realistic testing
   - Live test for actual execution
3. Reviews test results:
   - Action execution status
   - Content rendering results
   - Condition evaluation
   - Performance metrics
4. Adjusts configuration based on results
5. Retests until satisfied

### Monitoring Workflow Performance
1. User views workflow analytics
2. Identifies underperforming workflows
3. Reviews execution logs for errors
4. Analyzes condition logic effectiveness
5. Optimizes workflow configuration
6. Monitors improvement over time

## Advanced Features

### Template Variable System
**Available Variables**: All context fields from booking, event type, organizer, and derived data

**Usage Examples**:
- `{{invitee_name}}`: Invitee's name
- `{{event_type_name}}`: Event type name
- `{{start_time}}`: Meeting start time
- `{{organizer_name}}`: Organizer's name
- `{{custom_company}}`: Custom answer for "company" question

**Fallback System**: Missing variables replaced with sensible defaults

### Execution Engine
**Features**:
1. **Sequential Processing**: Actions executed in order
2. **Condition Evaluation**: Skip actions based on conditions
3. **Error Isolation**: Failed actions don't stop workflow
4. **Performance Tracking**: Detailed timing and success metrics
5. **Retry Logic**: Automatic retries for transient failures

### Performance Monitoring
**Metrics Tracked**:
- Execution time per workflow
- Success/failure rates
- Action-level performance
- Condition evaluation efficiency
- External service response times

**Alerting**:
- High failure rates (>50%)
- Slow execution (>60 seconds)
- External service issues
- Configuration problems

## Validation Rules

### Workflow Validation
- Name required and unique per organizer
- At least one active action required
- Trigger type must be valid
- Event type filters must exist
- Delay must be non-negative

### Action Validation
- Name required
- Action type must be valid
- Recipient configuration must be complete
- Content required for email/SMS actions
- Webhook URL required for webhook actions
- Update fields required for update actions

### Condition Validation
- Must follow JSON schema
- Field names must be valid context fields
- Operators must be supported
- Values must be appropriate for operators
- Group operators must be AND/OR

## Error Handling

### Execution Errors
- Action failures logged but don't stop workflow
- Retry logic for transient failures
- Graceful degradation for external service issues
- Detailed error reporting

### Configuration Errors
- Real-time validation feedback
- Configuration warnings
- Runtime dependency checking
- Suggestion system for fixes

### External Service Errors
- Rate limit handling
- Network timeout recovery
- Authentication failure handling
- Service unavailability graceful handling

## Performance Considerations

### Optimization Strategies
1. **Efficient Execution**:
   - Parallel action execution where possible
   - Early termination for failed conditions
   - Resource pooling for external calls
   - Memory-efficient processing

2. **Caching**:
   - Context data caching
   - Template rendering caching
   - External service response caching
   - Condition evaluation caching

3. **Monitoring**:
   - Real-time performance tracking
   - Bottleneck identification
   - Resource usage monitoring
   - Optimization recommendations

## Security Considerations

### Data Protection
- Sensitive data masking in logs
- Secure template variable handling
- Access control for workflow management
- Audit trail for all changes

### External Service Security
- Webhook signature validation
- Secure credential storage
- Rate limiting protection
- Input sanitization

## Testing Requirements

### Unit Tests
- Condition evaluation logic
- Template rendering
- Action execution
- Error handling

### Integration Tests
- End-to-end workflow execution
- External service integration
- Performance benchmarks
- Error recovery scenarios

### Performance Tests
- Large-scale workflow execution
- Concurrent execution handling
- Memory usage optimization
- External service load testing

## Deployment Considerations

### Environment Configuration
- External service credentials
- Rate limiting settings
- Performance thresholds
- Monitoring configuration

### Scaling Considerations
- Background task scaling
- Database connection pooling
- External service rate distribution
- Memory usage optimization

### Monitoring Setup
- Performance metric collection
- Error rate tracking
- External service health monitoring
- Alert configuration

## Future Enhancements

### Planned Features
1. **Advanced Logic**:
   - Nested condition groups
   - Mathematical expressions
   - Date/time calculations
   - Regular expression builder

2. **Visual Designer**:
   - Drag-and-drop workflow builder
   - Visual condition editor
   - Flow chart representation
   - Real-time preview

3. **AI Integration**:
   - Smart template suggestions
   - Condition optimization
   - Performance recommendations
   - Anomaly detection

### Current Limitations
1. **Sequential Execution**: Actions run one after another (no parallel execution)
2. **Limited Operators**: Basic comparison operators only
3. **Simple Templates**: No advanced template logic (loops, conditionals)
4. **Manual Optimization**: No automatic performance optimization

## Integration with Other Apps

### Events App Integration
- Triggered by booking lifecycle events
- Accesses booking and event type data
- Can modify booking fields
- Integrates with booking audit system

### Notifications App Integration
- Uses notification templates
- Queues email and SMS sending
- Tracks delivery status
- Handles notification preferences

### Users App Integration
- Uses organizer and invitee data
- Integrates with audit logging
- Respects user permissions
- Handles user context

### Integrations App Integration
- Sends webhook notifications
- Uses external service clients
- Handles rate limiting
- Tracks integration health

This comprehensive workflow system provides powerful automation capabilities while maintaining flexibility, performance, and reliability for enterprise-level scheduling platforms.