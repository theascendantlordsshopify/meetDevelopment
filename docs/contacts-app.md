# Contacts App Documentation

## Overview
The Contacts app provides Customer Relationship Management (CRM) functionality, allowing organizers to manage their contacts, track interactions, organize contacts into groups, and maintain comprehensive contact histories. It automatically creates contacts from bookings and provides tools for contact management and analytics.

## Models

### Contact Model
**File**: `backend/apps/contacts/models.py`

**Key Fields**:
- `id`: UUIDField (primary key)
- `organizer`: ForeignKey to User
- `first_name`: CharField (max_length=100)
- `last_name`: CharField (max_length=100, blank=True)
- `email`: EmailField
- `phone`: CharField (max_length=20, blank=True)
- `company`: CharField (max_length=200, blank=True)
- `job_title`: CharField (max_length=200, blank=True)
- `notes`: TextField (blank=True)
- `tags`: JSONField (list of tags for categorization)
- `total_bookings`: IntegerField (default=0, auto-updated)
- `last_booking_date`: DateTimeField (auto-updated)
- `is_active`: BooleanField (default=True)

**Key Properties**:
- `full_name`: Returns formatted full name

**Unique Constraint**: `['organizer', 'email']`

### ContactGroup Model
**File**: `backend/apps/contacts/models.py`

**Key Fields**:
- `organizer`: ForeignKey to User
- `name`: CharField (max_length=100)
- `description`: TextField (blank=True)
- `color`: CharField (hex color code, default='#0066cc')
- `contacts`: ManyToManyField to Contact

**Key Properties**:
- `contact_count`: Returns number of contacts in group

**Unique Constraint**: `['organizer', 'name']`

### ContactInteraction Model
**File**: `backend/apps/contacts/models.py`

**Key Fields**:
- `contact`: ForeignKey to Contact
- `organizer`: ForeignKey to User
- `interaction_type`: CharField with choices:
  - 'booking_created'
  - 'booking_completed'
  - 'booking_cancelled'
  - 'email_sent'
  - 'note_added'
  - 'manual_entry'
- `description`: TextField
- `booking`: ForeignKey to Booking (optional)
- `metadata`: JSONField (additional data)

**Purpose**: Tracks all interactions and touchpoints with contacts

## API Endpoints

### Contact Management
**Base URL**: `/api/v1/contacts/`

#### Contact CRUD
- **GET/POST** `/`
- **GET/PUT/DELETE** `/<uuid:pk>/`
- **Serializers**: `ContactSerializer`, `ContactCreateSerializer`
- **Query Parameters** (for GET list):
  - `search`: Search in name, email, company
  - `group`: Filter by group ID
  - `tags`: Filter by comma-separated tags
  - `is_active`: Filter by active status
- **Features**:
  - Full contact management
  - Advanced filtering and search
  - Tag-based organization
  - Activity status management

### Contact Groups
#### Group Management
- **GET/POST** `/groups/`
- **GET/PUT/DELETE** `/groups/<uuid:pk>/`
- **Serializers**: `ContactGroupSerializer`, `ContactGroupCreateSerializer`
- **Features**:
  - Group creation and management
  - Color coding for organization
  - Contact assignment
  - Bulk operations

#### Group Operations
- **POST** `/<uuid:contact_id>/groups/<uuid:group_id>/add/`
- **Function**: `add_contact_to_group`
- **Features**: Add contact to specific group

- **POST** `/<uuid:contact_id>/groups/<uuid:group_id>/remove/`
- **Function**: `remove_contact_from_group`
- **Features**: Remove contact from specific group

### Contact Interactions
#### Interaction Management
- **GET** `/<uuid:contact_id>/interactions/`
- **GET** `/interactions/` (all interactions)
- **POST** `/<uuid:contact_id>/interactions/add/`
- **Serializer**: `ContactInteractionSerializer`
- **Features**:
  - View interaction history
  - Add manual interactions
  - Track booking-related interactions
  - Metadata storage

### Statistics and Analytics
#### Contact Statistics
- **GET** `/stats/`
- **Function**: `contact_stats`
- **Serializer**: `ContactStatsSerializer`
- **Features**:
  - Total and active contact counts
  - Group statistics
  - Recent interaction counts
  - Top companies analysis
  - Booking frequency metrics

### Import/Export Operations
#### Import Contacts
- **POST** `/import/`
- **Function**: `import_contacts`
- **Serializer**: `ContactImportSerializer`
- **Features**:
  - CSV file upload
  - Duplicate handling options
  - Update existing contacts option
  - Async processing

#### Export Contacts
- **GET** `/export/`
- **Function**: `export_contacts`
- **Features**:
  - CSV export of all contacts
  - Complete contact data
  - Booking statistics included

### Contact Management Operations
#### Merge Contacts
- **POST** `/merge/`
- **Function**: `merge_contacts`
- **Features**:
  - Merge duplicate contacts
  - Data consolidation
  - Interaction history merging
  - Async processing

## Celery Tasks

### Contact Processing Tasks
1. **`create_contact_from_booking`**:
   - Automatically creates/updates contacts from bookings
   - Extracts name from invitee_name field
   - Updates booking statistics
   - Creates interaction records
   - Handles duplicate detection

2. **`process_contact_import`**:
   - Processes CSV import files
   - Handles duplicate detection
   - Updates existing contacts optionally
   - Validates contact data
   - Reports import results

3. **`merge_contact_data`**:
   - Merges duplicate contacts
   - Consolidates booking statistics
   - Merges interaction histories
   - Combines tags and notes
   - Updates references

### Maintenance Tasks
1. **`update_contact_booking_stats`**:
   - Updates contact booking statistics
   - Recalculates total bookings
   - Updates last booking dates
   - Ensures data consistency

## Frontend Pages Required

### Contact Management
1. **Contacts Dashboard** (`/contacts`)
   - Contact list with search and filtering
   - Quick stats overview
   - Recent interactions
   - Import/export buttons
   - Group management access

2. **Contact List** (`/contacts/list`)
   - Sortable contact table
   - Advanced filtering options:
     - Search by name, email, company
     - Filter by groups
     - Filter by tags
     - Filter by activity status
     - Filter by booking history
   - Bulk operations:
     - Add to groups
     - Export selected
     - Merge duplicates
     - Bulk edit tags

3. **Contact Details** (`/contacts/<id>`)
   - Complete contact information
   - Interaction timeline
   - Booking history
   - Group memberships
   - Edit functionality
   - Communication options

4. **Create/Edit Contact** (`/contacts/new`, `/contacts/<id>/edit`)
   - Contact information form
   - Tag management
   - Group assignment
   - Notes editor
   - Validation feedback

### Contact Groups
1. **Groups Management** (`/contacts/groups`)
   - Group list with contact counts
   - Color-coded organization
   - Create new group
   - Bulk group operations

2. **Group Details** (`/contacts/groups/<id>`)
   - Group information
   - Contact list within group
   - Add/remove contacts
   - Group settings
   - Bulk operations

3. **Create/Edit Group** (`/contacts/groups/new`, `/contacts/groups/<id>/edit`)
   - Group name and description
   - Color picker
   - Initial contact selection
   - Validation feedback

### Contact Interactions
1. **Interaction Timeline** (component within contact details)
   - Chronological interaction list
   - Interaction type indicators
   - Related booking links
   - Add manual interaction
   - Filter by interaction type

2. **Add Interaction** (`/contacts/<id>/interactions/add`)
   - Interaction type selection
   - Description input
   - Metadata configuration
   - Related booking selection

### Import/Export
1. **Import Contacts** (`/contacts/import`)
   - CSV file upload
   - Field mapping interface
   - Duplicate handling options
   - Preview before import
   - Import progress tracking
   - Results summary

2. **Export Contacts** (`/contacts/export`)
   - Export format selection
   - Field selection
   - Filtering options
   - Download preparation
   - Export history

### Analytics and Reporting
1. **Contact Analytics** (`/contacts/analytics`)
   - Contact growth trends
   - Interaction frequency analysis
   - Top companies/industries
   - Booking conversion rates
   - Engagement metrics

2. **Contact Reports** (`/contacts/reports`)
   - Customizable reports
   - Date range selection
   - Export functionality
   - Scheduled reports
   - Report templates

## Components Required

### Contact Management Components
1. **ContactCard**
   - Contact summary display
   - Profile picture placeholder
   - Key information (name, company, email)
   - Quick action buttons
   - Status indicators
   - Last interaction info

2. **ContactList**
   - Sortable table/grid view
   - Advanced filtering controls
   - Search functionality
   - Bulk selection
   - Pagination
   - View mode toggle (table/cards)

3. **ContactForm**
   - Personal information fields
   - Company information
   - Contact details
   - Tag management
   - Notes editor
   - Validation feedback

4. **ContactSearch**
   - Advanced search interface
   - Multiple field search
   - Tag filtering
   - Group filtering
   - Saved searches

### Group Management Components
1. **GroupCard**
   - Group summary display
   - Color indicator
   - Contact count
   - Quick actions
   - Description preview

2. **GroupForm**
   - Group name input
   - Description editor
   - Color picker
   - Contact selection
   - Validation feedback

3. **GroupSelector**
   - Multi-select group interface
   - Create new group option
   - Color-coded display
   - Search functionality

### Interaction Components
1. **InteractionTimeline**
   - Chronological interaction list
   - Interaction type icons
   - Expandable details
   - Related booking links
   - Add interaction button

2. **InteractionCard**
   - Interaction summary
   - Type indicator
   - Timestamp
   - Description
   - Related objects
   - Edit/delete options

3. **AddInteractionForm**
   - Interaction type selection
   - Description input
   - Booking selection
   - Metadata fields
   - Quick save options

### Import/Export Components
1. **ImportWizard**
   - File upload interface
   - Field mapping
   - Duplicate handling options
   - Preview functionality
   - Progress tracking

2. **ExportBuilder**
   - Field selection
   - Filter configuration
   - Format selection
   - Preview functionality
   - Download management

3. **ImportProgress**
   - Upload progress indicator
   - Processing status
   - Error reporting
   - Results summary
   - Retry options

### Analytics Components
1. **ContactAnalytics**
   - Growth charts
   - Interaction metrics
   - Conversion funnels
   - Engagement scores
   - Trend analysis

2. **ContactMetrics**
   - Key performance indicators
   - Real-time statistics
   - Comparative analysis
   - Goal tracking

## User Flows

### Contact Creation from Booking
1. Invitee books a meeting
2. System automatically creates/updates contact
3. Extracts information from booking:
   - Name from invitee_name
   - Email from invitee_email
   - Phone from invitee_phone
4. Updates booking statistics
5. Creates interaction record
6. Contact appears in organizer's contact list

### Manual Contact Management
1. Organizer navigates to contacts
2. Clicks "Add New Contact"
3. Fills contact information form
4. Assigns to groups (optional)
5. Adds tags for organization
6. Saves contact
7. Contact available for future reference

### Contact Import Process
1. Organizer prepares CSV file
2. Navigates to import page
3. Uploads CSV file
4. Maps CSV columns to contact fields
5. Configures duplicate handling
6. Previews import data
7. Confirms import
8. Monitors import progress
9. Reviews import results
10. Handles any errors or duplicates

### Contact Group Organization
1. Organizer creates contact groups
2. Assigns colors for visual organization
3. Adds contacts to appropriate groups
4. Uses groups for:
   - Filtering contact lists
   - Bulk operations
   - Targeted communications
   - Analytics segmentation

### Interaction Tracking
1. System automatically tracks booking interactions
2. Organizer can add manual interactions:
   - Meeting notes
   - Follow-up actions
   - Communication logs
   - Important updates
3. Interaction timeline provides complete history
4. Interactions linked to related bookings

## Advanced Features

### Automatic Contact Creation
**Trigger**: New booking creation
**Process**:
1. Checks if contact exists by email
2. Creates new contact or updates existing
3. Extracts data from booking
4. Updates booking statistics
5. Creates interaction record
6. Handles name parsing (first/last name split)

### Duplicate Detection and Merging
**Detection Criteria**:
- Same email address
- Similar names with same company
- Phone number matching

**Merge Process**:
1. Identifies potential duplicates
2. Presents merge suggestions
3. Allows manual merge confirmation
4. Consolidates all data:
   - Booking statistics
   - Interaction histories
   - Tags and notes
   - Group memberships
5. Updates all references
6. Removes duplicate records

### Tag System
**Features**:
- Free-form tagging
- Auto-completion
- Tag-based filtering
- Tag analytics
- Bulk tag operations

**Use Cases**:
- Industry categorization
- Lead status tracking
- Priority marking
- Custom categorization

### Contact Analytics
**Metrics Tracked**:
- Total contacts and growth
- Active vs inactive contacts
- Booking frequency
- Interaction patterns
- Top companies/industries
- Engagement scores

## Validation Rules

### Contact Validation
- Email required and must be valid format
- Email unique per organizer
- Phone number format validation (if provided)
- Name required (at least first name)
- Tags must be valid JSON array

### Group Validation
- Name required and unique per organizer
- Color must be valid hex code
- Description optional but limited length

### Interaction Validation
- Contact and organizer required
- Interaction type must be valid
- Description required
- Metadata must be valid JSON

## Error Handling

### Import Errors
- Invalid CSV format
- Missing required fields
- Duplicate email handling
- Data validation failures
- File size limitations

### Merge Errors
- Contact not found
- Permission issues
- Data integrity problems
- Concurrent modification conflicts

### General Errors
- Database constraint violations
- Network issues during import
- File processing errors
- Validation failures

## Performance Considerations

### Optimization Strategies
1. **Database Optimization**:
   - Proper indexing on email and organizer
   - Efficient query patterns
   - Pagination for large contact lists
   - Connection pooling

2. **Import Optimization**:
   - Async processing for large imports
   - Batch processing
   - Progress tracking
   - Memory-efficient processing

3. **Search Optimization**:
   - Full-text search capabilities
   - Indexed search fields
   - Efficient filtering
   - Cached search results

### Monitoring
- Import processing times
- Search performance
- Database query efficiency
- Memory usage during operations

## Integration Points

### Internal Integrations
- **Events App**: Automatic contact creation from bookings
- **Users App**: Organizer relationship and permissions
- **Notifications App**: Contact-based communication
- **Workflows App**: Contact data in workflow context

### External Integrations
- **CRM Systems**: Export/import capabilities
- **Email Marketing**: Contact list synchronization
- **Analytics Platforms**: Contact data analysis
- **Communication Tools**: Contact information sharing

## Security Considerations

### Data Protection
- Contact data encryption
- Access control per organizer
- Audit logging for changes
- Privacy compliance (GDPR)

### Import Security
- File validation
- Virus scanning consideration
- Size limitations
- Format restrictions

## Testing Requirements

### Unit Tests
- Contact model validation
- Group management
- Interaction tracking
- Import/export functionality

### Integration Tests
- Automatic contact creation from bookings
- Import/export workflows
- Group operations
- Analytics calculations

### Performance Tests
- Large contact list handling
- Import processing speed
- Search performance
- Concurrent access

## Deployment Considerations

### Environment Configuration
- File upload settings
- Import processing limits
- Search configuration
- Analytics settings

### Scaling Considerations
- Database sharding for large contact lists
- File processing scaling
- Search index management
- Cache distribution

## Future Enhancements

### Planned Features
1. **Advanced CRM Features**:
   - Lead scoring
   - Sales pipeline tracking
   - Communication history
   - Task management

2. **Enhanced Analytics**:
   - Predictive analytics
   - Engagement scoring
   - Churn prediction
   - ROI tracking

3. **Integration Expansion**:
   - Popular CRM integrations
   - Email marketing platforms
   - Social media connections
   - Communication tools

### Current Limitations
1. **Basic CRM Features**: Limited compared to dedicated CRM systems
2. **No Lead Management**: No sales pipeline or lead scoring
3. **Limited Communication**: No built-in email/SMS sending from contacts
4. **Basic Analytics**: Simple statistics only

## CSV Import/Export Format

### Import CSV Format
**Required Columns**:
- `email`: Contact email (required)

**Optional Columns**:
- `first_name`: First name
- `last_name`: Last name
- `phone`: Phone number
- `company`: Company name
- `job_title`: Job title
- `notes`: Additional notes
- `tags`: Comma-separated tags

### Export CSV Format
**Columns Included**:
- First Name, Last Name, Email, Phone, Company
- Job Title, Notes, Tags, Total Bookings, Last Booking Date

### Import Options
- **Skip Duplicates**: Ignore contacts with existing emails
- **Update Existing**: Update existing contacts with new data
- **Merge Mode**: Combine data from duplicates

## Contact Lifecycle

### Automatic Creation
1. New booking created
2. System checks for existing contact by email
3. If not found, creates new contact:
   - Extracts name from invitee_name
   - Sets email from invitee_email
   - Sets phone from invitee_phone
4. If found, updates booking statistics
5. Creates interaction record
6. Updates last booking date

### Manual Management
1. Organizer adds contact manually
2. Fills complete contact information
3. Assigns to groups
4. Adds tags for organization
5. Adds notes and context
6. Contact available for future bookings

### Data Enrichment
1. Booking interactions automatically tracked
2. Manual interactions can be added
3. Contact statistics updated in real-time
4. Group memberships managed
5. Tags updated based on interactions

## Mobile Considerations

### Responsive Design
- Mobile-optimized contact cards
- Touch-friendly interaction
- Swipe gestures for actions
- Optimized search interface

### Offline Capabilities
- Contact list caching
- Offline contact viewing
- Sync when connection restored
- Conflict resolution

## Accessibility Requirements

### WCAG Compliance
- Screen reader support for contact lists
- Keyboard navigation
- High contrast mode
- Alternative text for contact photos

### Internationalization
- Multi-language support
- Cultural name formats
- International phone formats
- Localized date formats

This contacts system provides essential CRM functionality while maintaining simplicity and integration with the core scheduling platform features.