# Users App Documentation

## Overview
The Users app is the core authentication and user management module of the platform. It handles user registration, authentication, authorization (RBAC), profiles, multi-factor authentication (MFA), single sign-on (SSO), and comprehensive audit logging.

## Models

### User Model
**File**: `backend/apps/users/models.py`

**Key Fields**:
- `id`: UUIDField (primary key)
- `email`: EmailField (unique, used as username)
- `first_name`, `last_name`: CharField
- `is_organizer`: BooleanField (default: True)
- `is_email_verified`: BooleanField (default: False)
- `is_phone_verified`: BooleanField (default: False)
- `is_mfa_enabled`: BooleanField (default: False)
- `account_status`: CharField with choices:
  - 'active'
  - 'inactive'
  - 'suspended'
  - 'pending_verification'
  - 'password_expired'
  - 'password_expired_grace_period'
- `password_changed_at`: DateTimeField
- `password_expires_at`: DateTimeField
- `failed_login_attempts`: IntegerField
- `locked_until`: DateTimeField
- `roles`: ManyToManyField to Role
- `mfa_secret`: CharField (TOTP secret)
- `mfa_backup_codes`: JSONField
- `last_login_ip`: GenericIPAddressField

**Key Methods**:
- `has_role(role_name)`: Check if user has specific role
- `has_permission(permission)`: Check permission through roles
- `is_account_locked()`: Check if account is locked
- `lock_account(duration_minutes=30)`: Lock account
- `generate_mfa_secret()`: Generate TOTP secret
- `verify_totp(token)`: Verify TOTP token
- `generate_backup_codes(count=10)`: Generate MFA backup codes

### Profile Model
**File**: `backend/apps/users/models.py`

**Key Fields**:
- `user`: OneToOneField to User
- `organizer_slug`: SlugField (unique, auto-generated)
- `display_name`: CharField
- `bio`: TextField
- `profile_picture`: ImageField
- `phone`: CharField (with validator)
- `website`: URLField
- `company`: CharField
- `job_title`: CharField
- `timezone_name`: CharField (default: 'UTC')
- `language`: CharField (default: 'en')
- `date_format`: CharField (default: 'MM/DD/YYYY')
- `time_format`: CharField (default: '12h')
- `brand_color`: CharField (default: '#0066cc')
- `brand_logo`: ImageField
- `public_profile`: BooleanField (default: True)
- `show_phone`: BooleanField (default: False)
- `show_email`: BooleanField (default: True)
- `reasonable_hours_start`: IntegerField (default: 7, for multi-invitee scheduling)
- `reasonable_hours_end`: IntegerField (default: 22, for multi-invitee scheduling)

### Role Model (RBAC System)
**File**: `backend/apps/users/models.py`

**Key Fields**:
- `name`: CharField (unique)
- `role_type`: CharField with choices:
  - 'admin'
  - 'organizer'
  - 'team_member'
  - 'billing_manager'
  - 'viewer'
- `parent`: ForeignKey to self (hierarchical roles)
- `role_permissions`: ManyToManyField to Permission
- `is_system_role`: BooleanField

**Key Methods**:
- `get_all_permissions()`: Get permissions including inherited
- `has_permission(permission_codename)`: Check specific permission

### Permission Model
**Key Fields**:
- `codename`: CharField (unique identifier)
- `name`: CharField (human-readable)
- `description`: TextField
- `category`: CharField (for organization)

### Other Key Models
- `EmailVerificationToken`: For email verification process
- `PasswordResetToken`: For password reset functionality
- `PasswordHistory`: Prevents password reuse
- `Invitation`: Team member invitations
- `AuditLog`: Comprehensive audit trail
- `UserSession`: Active session tracking
- `MFADevice`: MFA device management
- `SAMLConfiguration`: SAML SSO configuration
- `OIDCConfiguration`: OIDC SSO configuration
- `SSOSession`: SSO session tracking

## API Endpoints

### Authentication Endpoints
**Base URL**: `/api/v1/users/`

#### Registration
- **POST** `/register/`
- **Serializer**: `UserRegistrationSerializer`
- **Fields**: email, first_name, last_name, password, password_confirm, terms_accepted
- **Response**: User data + auth token
- **Triggers**: Email verification and welcome email tasks

#### Login
- **POST** `/login/`
- **Serializer**: `LoginSerializer`
- **Fields**: email, password, remember_me
- **Features**:
  - Account lock after 5 failed attempts
  - Password expiry checking
  - Session creation with geolocation
  - MFA support (if enabled)
- **Response**: User data + auth token

#### Logout
- **POST** `/logout/`
- **Features**:
  - Token revocation
  - Session cleanup
  - Audit logging

### Profile Management
#### Profile CRUD
- **GET/PUT/PATCH** `/profile/`
- **Serializer**: `ProfileSerializer` / `ProfileUpdateSerializer`
- **Features**: Complete profile management with audit logging

#### Public Profile
- **GET** `/public/<str:organizer_slug>/`
- **Serializer**: `PublicProfileSerializer`
- **Features**: Public view of organizer profile (filtered by privacy settings)

### Password Management
#### Change Password
- **POST** `/change-password/`
- **Serializer**: `ChangePasswordSerializer`
- **Features**:
  - Password history checking
  - Token revocation
  - Session cleanup (except current)

#### Force Password Change
- **POST** `/force-password-change/`
- **Serializer**: `ForcedPasswordChangeSerializer`
- **Features**: For users in password expired grace period

#### Request Password Reset
- **POST** `/request-password-reset/`
- **Serializer**: `PasswordResetRequestSerializer`
- **Features**: Rate limited, doesn't reveal if email exists

#### Confirm Password Reset
- **POST** `/confirm-password-reset/`
- **Serializer**: `PasswordResetConfirmSerializer`
- **Features**: Complete password reset with token validation

### Email Verification
#### Verify Email
- **POST** `/verify-email/`
- **Serializer**: `EmailVerificationSerializer`
- **Features**: Token-based email verification

#### Resend Verification
- **POST** `/resend-verification/`
- **Serializer**: `ResendVerificationSerializer`
- **Features**: Rate limited resend

### Role & Permission Management
#### Permissions List
- **GET** `/permissions/`
- **Serializer**: `PermissionSerializer`
- **Features**: List all available permissions

#### Roles List
- **GET** `/roles/`
- **Serializer**: `RoleSerializer`
- **Features**: List all roles with permission details

### Team Management (Invitations)
#### Invitation Management
- **GET/POST** `/invitations/`
- **Serializers**: `InvitationSerializer` / `InvitationCreateSerializer`
- **Features**: Send and manage team invitations

#### Respond to Invitation
- **POST** `/invitations/respond/`
- **Serializer**: `InvitationResponseSerializer`
- **Features**: Accept/decline invitations, auto-create users

### Session Management
#### Session List
- **GET** `/sessions/`
- **Serializer**: `UserSessionSerializer`
- **Features**: List active sessions with device info

#### Revoke Session
- **POST** `/sessions/<uuid:session_id>/revoke/`
- **Features**: Revoke specific session

#### Revoke All Sessions
- **POST** `/sessions/revoke-all/`
- **Features**: Revoke all sessions except current

### MFA Management
#### MFA Devices
- **GET** `/mfa/devices/`
- **Serializer**: `MFADeviceSerializer`
- **Features**: List user's MFA devices

#### Setup MFA
- **POST** `/mfa/setup/`
- **Serializer**: `MFASetupSerializer`
- **Features**: 
  - TOTP: Returns QR code and secret
  - SMS: Sends verification code

#### Verify MFA Setup
- **POST** `/mfa/verify/`
- **Serializer**: `MFAVerificationSerializer`
- **Features**: Complete MFA setup with backup codes

#### Disable MFA
- **POST** `/mfa/disable/`
- **Features**: Requires password confirmation

#### SMS MFA Operations
- **POST** `/mfa/resend-sms/`
- **POST** `/mfa/send-sms-code/`
- **POST** `/mfa/verify-sms/`

#### Regenerate Backup Codes
- **POST** `/mfa/backup-codes/regenerate/`
- **Features**: Requires password confirmation

### SSO Configuration (Admin)
#### SAML Configuration
- **GET/POST** `/sso/saml/`
- **GET/PUT/DELETE** `/sso/saml/<uuid:pk>/`
- **Serializer**: `SAMLConfigurationSerializer`

#### OIDC Configuration
- **GET/POST** `/sso/oidc/`
- **GET/PUT/DELETE** `/sso/oidc/<uuid:pk>/`
- **Serializer**: `OIDCConfigurationSerializer`

#### SSO Operations
- **POST** `/sso/initiate/`
- **POST** `/sso/logout/`
- **GET** `/sso/discovery/`
- **GET** `/sso/sessions/`
- **POST** `/sso/sessions/<uuid:session_id>/revoke/`

### Audit Logs
- **GET** `/audit-logs/`
- **Serializer**: `AuditLogSerializer`
- **Features**: User's audit trail

## Frontend Pages Required

### Authentication Pages
1. **Registration Page** (`/register`)
   - Form fields: email, first_name, last_name, password, password_confirm, terms_accepted
   - Password strength indicator
   - Terms and conditions checkbox
   - Link to login page

2. **Login Page** (`/login`)
   - Form fields: email, password, remember_me checkbox
   - "Forgot password" link
   - Account locked message handling
   - MFA challenge if enabled
   - SSO discovery and initiation

3. **Email Verification Page** (`/verify-email`)
   - Token parameter from URL
   - Success/error messages
   - Resend verification option

4. **Password Reset Pages**
   - **Request Reset** (`/request-password-reset`): Email input form
   - **Reset Password** (`/reset-password`): New password form with token

5. **Force Password Change** (`/force-password-change`)
   - For users in grace period
   - New password form without old password requirement

### Profile Management Pages
1. **Profile Settings** (`/profile`)
   - Personal information form
   - Profile picture upload
   - Contact information
   - Localization settings (timezone, language, date/time format)
   - Branding settings (brand color, logo)
   - Privacy settings (public profile, show phone/email)
   - Reasonable hours for multi-invitee scheduling

2. **Public Profile View** (`/<organizer_slug>`)
   - Read-only profile display
   - Filtered by privacy settings
   - Event types list (if public)

### Security Pages
1. **Change Password** (`/change-password`)
   - Current password verification
   - New password form with strength indicator
   - Password history validation

2. **MFA Setup** (`/mfa/setup`)
   - Device type selection (TOTP/SMS)
   - QR code display for TOTP
   - Phone number input for SMS
   - Verification step
   - Backup codes display

3. **MFA Management** (`/mfa/manage`)
   - List of MFA devices
   - Enable/disable options
   - Regenerate backup codes
   - Device management

4. **Session Management** (`/sessions`)
   - Active sessions list with device info
   - Location and last activity
   - Revoke individual sessions
   - Revoke all sessions option

### Team Management Pages
1. **Team Members** (`/team`)
   - Team members list
   - Role assignments
   - Invitation management

2. **Send Invitation** (`/team/invite`)
   - Email input
   - Role selection
   - Personal message
   - Invitation preview

3. **Invitation Response** (`/invitation`)
   - Token parameter from URL
   - Accept/decline options
   - New user registration form (if needed)

### Admin Pages (Role-based access)
1. **Roles & Permissions** (`/admin/roles`)
   - Roles list with permissions
   - Create/edit roles
   - Permission assignment

2. **SSO Configuration** (`/admin/sso`)
   - SAML configuration
   - OIDC configuration
   - SSO testing

3. **Audit Logs** (`/admin/audit`)
   - Comprehensive audit trail
   - Filtering and search
   - Export capabilities

## User Flows

### Registration Flow
1. User visits registration page
2. Fills out form (email, name, password)
3. Accepts terms and conditions
4. Submits form
5. Receives success message
6. Email verification sent
7. User clicks verification link
8. Account activated
9. Redirected to dashboard

### Login Flow
1. User visits login page
2. Enters email and password
3. System checks account status
4. If MFA enabled, shows MFA challenge
5. User enters MFA code
6. Successful login redirects to dashboard
7. Failed attempts increment counter
8. Account locks after 5 failed attempts

### MFA Setup Flow
1. User navigates to MFA setup
2. Selects device type (TOTP/SMS)
3. For TOTP: Scans QR code with authenticator app
4. For SMS: Enters phone number
5. Enters verification code
6. MFA enabled successfully
7. Backup codes displayed and saved

### Password Reset Flow
1. User clicks "Forgot password"
2. Enters email address
3. Reset email sent (if account exists)
4. User clicks reset link
5. Enters new password
6. Password updated successfully
7. All sessions revoked except current

### Team Invitation Flow
1. Organizer sends invitation
2. Invitee receives email
3. Clicks invitation link
4. If new user: completes registration
5. If existing user: accepts invitation
6. Role assigned automatically
7. Access granted to team resources

## Components Required

### Authentication Components
1. **LoginForm**
   - Email/password inputs
   - Remember me checkbox
   - Validation and error handling
   - MFA challenge integration

2. **RegistrationForm**
   - All registration fields
   - Password strength indicator
   - Terms acceptance
   - Real-time validation

3. **MFAChallenge**
   - TOTP code input
   - SMS code input
   - Backup code option
   - Device selection

4. **PasswordResetForm**
   - Email input for request
   - New password form for reset
   - Strength validation

### Profile Components
1. **ProfileForm**
   - Personal information fields
   - Image upload for profile picture
   - Timezone selector
   - Language selector
   - Brand color picker

2. **ProfilePreview**
   - Read-only profile display
   - Privacy-filtered information
   - Public profile view

3. **SecuritySettings**
   - Password change form
   - MFA management
   - Session management
   - Account security overview

### Team Management Components
1. **TeamMembersList**
   - Members table with roles
   - Action buttons (edit, remove)
   - Invitation status

2. **InvitationForm**
   - Email input
   - Role selector
   - Message textarea
   - Send invitation button

3. **RoleSelector**
   - Dropdown with role descriptions
   - Permission preview
   - Hierarchical role display

### Session Management Components
1. **SessionsList**
   - Active sessions table
   - Device and location info
   - Last activity timestamps
   - Revoke buttons

2. **SessionCard**
   - Individual session display
   - Device icon and info
   - Location and IP
   - Security actions

## Features and Functionalities

### Authentication Features
1. **Email-based Authentication**
   - No username required
   - Email verification mandatory
   - Password strength requirements

2. **Account Security**
   - Failed login attempt tracking
   - Account locking mechanism
   - Password expiry with grace period
   - Audit logging for all actions

3. **Multi-Factor Authentication**
   - TOTP support (Google Authenticator, Authy)
   - SMS verification
   - Backup codes for recovery
   - Device management

### Profile Management Features
1. **Organizer Profiles**
   - Public/private profile settings
   - Custom branding (colors, logos)
   - Contact information management
   - Localization preferences

2. **Slug Generation**
   - Automatic slug creation from name
   - Uniqueness enforcement
   - URL-friendly format

### Team Collaboration Features
1. **Role-Based Access Control**
   - Hierarchical role system
   - Granular permissions
   - Inheritance from parent roles

2. **Team Invitations**
   - Email-based invitations
   - Role assignment
   - Expiration handling
   - Auto-user creation

### Enterprise Features
1. **Single Sign-On**
   - SAML 2.0 support
   - OIDC support
   - JIT user provisioning
   - Organization domain mapping

2. **Advanced Security**
   - Session management
   - IP tracking
   - Device fingerprinting
   - Comprehensive audit trails

## Validation Rules

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character
- No common patterns
- Not similar to user information
- Cannot reuse last 5 passwords

### Email Validation
- Valid email format
- Uniqueness across platform
- Domain validation

### Phone Number Validation
- International format support
- E.164 format for storage
- Validation regex: `^\+?1?\d{9,15}$`

## Error Handling

### Account Status Errors
- `pending_verification`: Redirect to email verification
- `suspended`: Show suspension message
- `password_expired`: Force password change
- `password_expired_grace_period`: Allow limited access

### Authentication Errors
- Invalid credentials: Generic error message
- Account locked: Show unlock time
- MFA required: Redirect to MFA challenge
- Token expired: Redirect to login

### Validation Errors
- Field-specific error messages
- Real-time validation feedback
- Server-side validation confirmation

## Security Considerations

### Session Security
- Session timeout configuration
- Secure cookie settings
- CSRF protection
- XSS prevention

### Password Security
- Bcrypt hashing
- Salt generation
- History tracking
- Expiry enforcement

### MFA Security
- TOTP secret protection
- SMS rate limiting
- Backup code single-use
- Device verification

## Internationalization

### Supported Features
- Multiple language support
- Timezone handling
- Date/time format preferences
- Localized error messages

### Implementation Notes
- Use Django's i18n framework
- Store user preferences in profile
- Dynamic content translation
- RTL language support consideration

## Audit and Compliance

### Audit Log Types
- Authentication events (login, logout, failed attempts)
- Profile changes
- Password changes
- Role assignments
- MFA events
- Session management
- SSO events

### Compliance Features
- GDPR data handling
- Audit trail retention
- Data export capabilities
- User consent tracking

## Integration Points

### External Services
- Email service integration
- SMS service (Twilio)
- Geolocation services (placeholder)
- SSO identity providers

### Internal Integrations
- Events app (organizer relationship)
- Notifications app (user preferences)
- Workflows app (user context)
- Availability app (timezone handling)

## Performance Considerations

### Caching Strategy
- User session caching
- Permission caching
- Profile data caching
- Rate limiting caches

### Database Optimization
- Proper indexing on frequently queried fields
- Efficient query patterns
- Connection pooling
- Read replicas consideration

## Testing Requirements

### Unit Tests
- Model validation
- Authentication logic
- Permission checking
- MFA functionality

### Integration Tests
- API endpoint testing
- Authentication flows
- SSO integration
- Email/SMS sending

### Security Tests
- Authentication bypass attempts
- Permission escalation tests
- Session hijacking prevention
- CSRF protection validation

## Deployment Considerations

### Environment Variables
- Secret key management
- Database credentials
- Email service configuration
- SMS service configuration
- SSO provider credentials

### Security Headers
- HSTS configuration
- Content Security Policy
- X-Frame-Options
- XSS protection headers

### Monitoring
- Failed login monitoring
- Account lock monitoring
- MFA failure tracking
- Session anomaly detection