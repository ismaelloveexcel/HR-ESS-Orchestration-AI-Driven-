# Database Schema and Data Models

## Overview

The Digital Card Platform uses PostgreSQL as the primary relational database, leveraging its robust ACID compliance, JSON support for flexible data structures, and excellent performance characteristics. The schema is designed for scalability, data integrity, and efficient querying while maintaining clear relationships between entities.

## Database Design Principles

The schema follows these core principles:

**Normalization**: Data is normalized to third normal form (3NF) to eliminate redundancy while maintaining practical query performance through strategic denormalization where needed.

**Audit Trail**: All critical tables include audit fields (created_at, updated_at, created_by, updated_by) to track data lifecycle and support compliance requirements.

**Soft Deletes**: Important records use soft deletion (deleted_at timestamp) rather than physical deletion to maintain data integrity and support recovery scenarios.

**Flexible Metadata**: JSON/JSONB columns store semi-structured data that varies by context, such as custom fields or configuration settings.

**Security**: Row-level security policies ensure users can only access their own data, with explicit grants for administrative access.

## Core Tables

### users

The central table storing all user accounts, including candidates, employees, and administrators.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_photo_url TEXT,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('candidate', 'employee', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    current_stage INTEGER,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    email_verified_at TIMESTAMP,
    phone_verified_at TIMESTAMP,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_current_stage FOREIGN KEY (current_stage) REFERENCES stages(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_current_stage ON users(current_stage);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

**Key Fields**:
- `user_type` distinguishes between candidates, employees, and administrators
- `current_stage` tracks the user's position in the lifecycle (1-10)
- `preferences` stores user-specific settings as JSON
- `mfa_enabled` and `mfa_secret` support multi-factor authentication

### stages

Defines the ten stages of the employee lifecycle from application to offboarding.

```sql
CREATE TABLE stages (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    stage_type VARCHAR(20) NOT NULL CHECK (stage_type IN ('candidate', 'employee', 'exit')),
    color_theme VARCHAR(50),
    progress_weight INTEGER DEFAULT 10,
    requires_approval BOOLEAN DEFAULT FALSE,
    auto_transition BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stages (id, name, description, stage_type, color_theme, progress_weight) VALUES
(1, 'Application Received', 'Initial application submitted and under review', 'candidate', 'blue', 10),
(2, 'Interview Scheduled', 'Candidate shortlisted and interview dates confirmed', 'candidate', 'blue', 20),
(3, 'Interview Completed', 'All interviews finished, awaiting decision', 'candidate', 'blue', 30),
(4, 'Assessment/Testing', 'Candidate undergoing skills assessment', 'candidate', 'blue', 40),
(5, 'Offer Stage', 'Job offer extended, awaiting acceptance', 'candidate', 'cyan', 50),
(6, 'Documentation & Pre-boarding', 'New hire completing paperwork before start', 'employee', 'green', 60),
(7, 'Confirmed Employee (Probation)', 'Active employee in probationary period', 'employee', 'green', 70),
(8, 'Confirmed Employee (Post-Probation)', 'Permanent employee post-probation', 'employee', 'green', 80),
(9, 'Growth & Development', 'Established employee focused on advancement', 'employee', 'emerald', 90),
(10, 'Offboarding', 'Employee in exit process', 'exit', 'gray', 100);
```

**Key Fields**:
- `stage_type` determines the card design theme
- `progress_weight` calculates the overall progress percentage
- `requires_approval` indicates if HR approval is needed to enter this stage
- `auto_transition` enables automatic progression based on conditions

### candidates

Extended information specific to candidates in the hiring process.

```sql
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    application_id VARCHAR(50) UNIQUE NOT NULL,
    position_id UUID NOT NULL,
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    cv_file_url TEXT,
    cover_letter TEXT,
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    current_location VARCHAR(100),
    nationality VARCHAR(100),
    expected_salary DECIMAL(12, 2),
    notice_period_days INTEGER,
    referral_source VARCHAR(100),
    ai_cv_score INTEGER CHECK (ai_cv_score >= 0 AND ai_cv_score <= 100),
    ai_analysis JSONB,
    interview_date TIMESTAMP,
    interview_type VARCHAR(50),
    interview_location TEXT,
    assessment_score DECIMAL(5, 2),
    offer_letter_url TEXT,
    offer_date DATE,
    offer_accepted_at TIMESTAMP,
    offer_declined_at TIMESTAMP,
    offer_expiry_date DATE,
    rejection_reason TEXT,
    rejected_at TIMESTAMP,
    card_token VARCHAR(255) UNIQUE,
    card_token_expires_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidate_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_candidate_position FOREIGN KEY (position_id) REFERENCES positions(id)
);

CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_candidates_application_id ON candidates(application_id);
CREATE INDEX idx_candidates_position_id ON candidates(position_id);
CREATE INDEX idx_candidates_application_date ON candidates(application_date);
CREATE INDEX idx_candidates_card_token ON candidates(card_token);
```

**Key Fields**:
- `application_id` is the human-readable identifier (e.g., BAYN-2025-001)
- `ai_cv_score` stores the automated CV scoring result (0-100)
- `ai_analysis` contains detailed AI analysis as JSON
- `card_token` is the authentication token for candidate portal access

### employees

Extended information specific to active and former employees.

```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    candidate_id UUID,
    position_id UUID NOT NULL,
    department_id UUID NOT NULL,
    manager_id UUID,
    hire_date DATE NOT NULL,
    probation_end_date DATE,
    confirmation_date DATE,
    employment_type VARCHAR(50) NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern')),
    work_location VARCHAR(100),
    salary DECIMAL(12, 2),
    salary_currency VARCHAR(3) DEFAULT 'AED',
    salary_effective_date DATE,
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(100),
    bank_iban VARCHAR(100),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(50),
    visa_number VARCHAR(100),
    visa_expiry_date DATE,
    passport_number VARCHAR(50),
    passport_expiry_date DATE,
    emirates_id VARCHAR(50),
    emirates_id_expiry_date DATE,
    years_of_service DECIMAL(4, 2) GENERATED ALWAYS AS (
        EXTRACT(YEAR FROM AGE(COALESCE(termination_date, CURRENT_DATE), hire_date))
    ) STORED,
    termination_date DATE,
    termination_reason VARCHAR(100),
    termination_type VARCHAR(50) CHECK (termination_type IN ('resignation', 'retirement', 'termination', 'contract_end')),
    rehire_eligible BOOLEAN,
    exit_interview_completed BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_candidate FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    CONSTRAINT fk_employee_position FOREIGN KEY (position_id) REFERENCES positions(id),
    CONSTRAINT fk_employee_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_employee_manager FOREIGN KEY (manager_id) REFERENCES employees(id)
);

CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_employee_number ON employees(employee_number);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);
CREATE INDEX idx_employees_termination_date ON employees(termination_date);
```

**Key Fields**:
- `employee_number` is the unique identifier (e.g., BAYN-2025-001)
- `candidate_id` links back to the original candidate record
- `manager_id` creates the organizational hierarchy
- `years_of_service` is a computed column for automatic calculation
- Document expiry dates trigger automated reminders

### positions

Job positions available for application or currently held by employees.

```sql
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    department_id UUID NOT NULL,
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    employment_type VARCHAR(50),
    location VARCHAR(100),
    salary_range_min DECIMAL(12, 2),
    salary_range_max DECIMAL(12, 2),
    salary_currency VARCHAR(3) DEFAULT 'AED',
    experience_years_min INTEGER,
    experience_years_max INTEGER,
    education_level VARCHAR(100),
    skills_required TEXT[],
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'on_hold')),
    openings_count INTEGER DEFAULT 1,
    posted_date DATE DEFAULT CURRENT_DATE,
    closing_date DATE,
    hiring_manager_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_position_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_position_hiring_manager FOREIGN KEY (hiring_manager_id) REFERENCES employees(id)
);

CREATE INDEX idx_positions_department_id ON positions(department_id);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_positions_posted_date ON positions(posted_date);
```

### departments

Organizational units within the company.

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    description TEXT,
    parent_department_id UUID,
    head_of_department_id UUID,
    location VARCHAR(100),
    cost_center VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_department_parent FOREIGN KEY (parent_department_id) REFERENCES departments(id),
    CONSTRAINT fk_department_head FOREIGN KEY (head_of_department_id) REFERENCES employees(id)
);

CREATE INDEX idx_departments_parent_id ON departments(parent_department_id);
CREATE INDEX idx_departments_active ON departments(active);
```

## Document Management Tables

### documents

Central repository for all documents in the system.

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('personal', 'employment', 'payroll', 'training', 'policy')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    parent_document_id UUID,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    uploaded_by UUID NOT NULL,
    verified_by UUID,
    verified_at TIMESTAMP,
    expiry_date DATE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_document_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_parent FOREIGN KEY (parent_document_id) REFERENCES documents(id),
    CONSTRAINT fk_document_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id),
    CONSTRAINT fk_document_verified_by FOREIGN KEY (verified_by) REFERENCES users(id)
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX idx_documents_created_at ON documents(created_at);
```

### document_access_logs

Audit trail for document access and downloads.

```sql
CREATE TABLE document_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('view', 'download', 'delete', 'share')),
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_access_log_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_access_log_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_document_access_logs_document_id ON document_access_logs(document_id);
CREATE INDEX idx_document_access_logs_user_id ON document_access_logs(user_id);
CREATE INDEX idx_document_access_logs_accessed_at ON document_access_logs(accessed_at);
```

## Leave Management Tables

### leave_types

Defines different types of leave available to employees.

```sql
CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    days_per_year DECIMAL(5, 2),
    max_consecutive_days INTEGER,
    min_notice_days INTEGER DEFAULT 0,
    requires_approval BOOLEAN DEFAULT TRUE,
    paid BOOLEAN DEFAULT TRUE,
    carries_forward BOOLEAN DEFAULT FALSE,
    max_carryforward_days INTEGER,
    applicable_to TEXT[] DEFAULT ARRAY['all'],
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO leave_types (name, code, days_per_year, min_notice_days, carries_forward) VALUES
('Annual Leave', 'ANNUAL', 30, 3, TRUE),
('Sick Leave', 'SICK', 15, 0, FALSE),
('Emergency Leave', 'EMERGENCY', 5, 0, FALSE),
('Maternity Leave', 'MATERNITY', 60, 30, FALSE),
('Paternity Leave', 'PATERNITY', 5, 7, FALSE),
('Unpaid Leave', 'UNPAID', NULL, 7, FALSE);
```

### leave_balances

Tracks leave balance for each employee by leave type.

```sql
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    leave_type_id UUID NOT NULL,
    year INTEGER NOT NULL,
    total_days DECIMAL(5, 2) NOT NULL,
    used_days DECIMAL(5, 2) DEFAULT 0,
    pending_days DECIMAL(5, 2) DEFAULT 0,
    available_days DECIMAL(5, 2) GENERATED ALWAYS AS (total_days - used_days - pending_days) STORED,
    carried_forward_days DECIMAL(5, 2) DEFAULT 0,
    expires_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leave_balance_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_balance_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    CONSTRAINT unique_employee_leave_year UNIQUE (employee_id, leave_type_id, year)
);

CREATE INDEX idx_leave_balances_employee_id ON leave_balances(employee_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);
```

### leave_requests

Individual leave requests submitted by employees.

```sql
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    leave_type_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5, 2) NOT NULL,
    is_half_day BOOLEAN DEFAULT FALSE,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    review_comments TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    attachment_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leave_request_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_request_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    CONSTRAINT fk_leave_request_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id),
    CONSTRAINT check_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_start_date ON leave_requests(start_date);
CREATE INDEX idx_leave_requests_submitted_at ON leave_requests(submitted_at);
```

## Time and Attendance Tables

### time_entries

Records of employee clock in/out times.

```sql
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    clock_in_time TIMESTAMP NOT NULL,
    clock_out_time TIMESTAMP,
    work_duration_minutes INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (clock_out_time - clock_in_time)) / 60
    ) STORED,
    break_duration_minutes INTEGER DEFAULT 0,
    location_in VARCHAR(255),
    location_out VARCHAR(255),
    ip_address_in INET,
    ip_address_out INET,
    photo_in_url TEXT,
    photo_out_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'adjusted')),
    adjusted_by UUID,
    adjustment_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_time_entry_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_time_entry_adjusted_by FOREIGN KEY (adjusted_by) REFERENCES users(id)
);

CREATE INDEX idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX idx_time_entries_clock_in_time ON time_entries(clock_in_time);
CREATE INDEX idx_time_entries_status ON time_entries(status);
```

### attendance_summary

Daily attendance summary for reporting.

```sql
CREATE TABLE attendance_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'leave', 'holiday', 'weekend')),
    clock_in_time TIME,
    clock_out_time TIME,
    total_hours DECIMAL(5, 2),
    is_late BOOLEAN DEFAULT FALSE,
    is_early_departure BOOLEAN DEFAULT FALSE,
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT unique_employee_date UNIQUE (employee_id, date)
);

CREATE INDEX idx_attendance_summary_employee_id ON attendance_summary(employee_id);
CREATE INDEX idx_attendance_summary_date ON attendance_summary(date);
CREATE INDEX idx_attendance_summary_status ON attendance_summary(status);
```

## Performance Management Tables

### performance_reviews

Formal performance evaluation records.

```sql
CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    review_type VARCHAR(50) NOT NULL CHECK (review_type IN ('probation', 'annual', 'mid_year', 'project')),
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    reviewer_id UUID NOT NULL,
    self_assessment TEXT,
    manager_assessment TEXT,
    overall_rating VARCHAR(50) CHECK (overall_rating IN ('exceeds_expectations', 'meets_expectations', 'needs_improvement', 'unsatisfactory')),
    rating_score DECIMAL(3, 2),
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_next_period TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'completed', 'acknowledged')),
    due_date DATE,
    completed_at TIMESTAMP,
    acknowledged_by_employee_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

CREATE INDEX idx_performance_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_review_type ON performance_reviews(review_type);
CREATE INDEX idx_performance_reviews_status ON performance_reviews(status);
```

### goals

Employee goals and objectives.

```sql
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type VARCHAR(50) CHECK (goal_type IN ('individual', 'team', 'organizational')),
    category VARCHAR(50),
    target_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_by UUID NOT NULL,
    approved_by UUID,
    completed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_goal_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_goal_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_goal_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX idx_goals_employee_id ON goals(employee_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_target_date ON goals(target_date);
```

## Request Management Tables

### requests

Unified table for all employee requests.

```sql
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('document', 'it', 'facility', 'reimbursement', 'hr')),
    request_subtype VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'approved', 'rejected', 'completed', 'cancelled')),
    amount DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'AED',
    attachment_urls TEXT[],
    assigned_to UUID,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    completed_at TIMESTAMP,
    review_comments TEXT,
    sla_due_date TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_request_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT fk_request_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX idx_requests_employee_id ON requests(employee_id);
CREATE INDEX idx_requests_request_type ON requests(request_type);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_submitted_at ON requests(submitted_at);
CREATE INDEX idx_requests_assigned_to ON requests(assigned_to);
```

## Communication Tables

### announcements

Company-wide and targeted announcements.

```sql
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    announcement_type VARCHAR(50) NOT NULL CHECK (announcement_type IN ('company_news', 'department_update', 'policy_change', 'event', 'emergency')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'department', 'location', 'role', 'custom')),
    target_filter JSONB,
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    published_by UUID NOT NULL,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    attachment_urls TEXT[],
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    acknowledgment_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_announcement_published_by FOREIGN KEY (published_by) REFERENCES users(id)
);

CREATE INDEX idx_announcements_announcement_type ON announcements(announcement_type);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_published_at ON announcements(published_at);
```

### announcement_acknowledgments

Tracks which employees have acknowledged announcements.

```sql
CREATE TABLE announcement_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL,
    user_id UUID NOT NULL,
    acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_acknowledgment_announcement FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    CONSTRAINT fk_acknowledgment_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT unique_announcement_user UNIQUE (announcement_id, user_id)
);

CREATE INDEX idx_acknowledgments_announcement_id ON announcement_acknowledgments(announcement_id);
CREATE INDEX idx_acknowledgments_user_id ON announcement_acknowledgments(user_id);
```

### notifications

Individual notifications sent to users.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('in_app', 'email', 'sms', 'push')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
    read_at TIMESTAMP,
    sent_at TIMESTAMP,
    link_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
```

## Learning and Development Tables

### training_courses

Available training courses and programs.

```sql
CREATE TABLE training_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_type VARCHAR(50) CHECK (course_type IN ('technical', 'soft_skills', 'compliance', 'leadership', 'other')),
    delivery_method VARCHAR(50) CHECK (delivery_method IN ('online', 'in_person', 'hybrid', 'self_paced')),
    duration_hours DECIMAL(5, 2),
    provider VARCHAR(100),
    instructor VARCHAR(100),
    max_participants INTEGER,
    is_mandatory BOOLEAN DEFAULT FALSE,
    prerequisites TEXT,
    learning_objectives TEXT,
    cost DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'AED',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_training_courses_course_type ON training_courses(course_type);
CREATE INDEX idx_training_courses_status ON training_courses(status);
```

### training_enrollments

Employee enrollments in training courses.

```sql
CREATE TABLE training_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    start_date DATE,
    completion_date DATE,
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'failed', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    assessment_score DECIMAL(5, 2),
    passed BOOLEAN,
    certificate_url TEXT,
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_enrollment_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES training_courses(id),
    CONSTRAINT unique_employee_course UNIQUE (employee_id, course_id)
);

CREATE INDEX idx_training_enrollments_employee_id ON training_enrollments(employee_id);
CREATE INDEX idx_training_enrollments_course_id ON training_enrollments(course_id);
CREATE INDEX idx_training_enrollments_status ON training_enrollments(status);
```

## Audit and Logging Tables

### audit_logs

Comprehensive audit trail for all system activities.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_log_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

### stage_transitions

Tracks movement between lifecycle stages.

```sql
CREATE TABLE stage_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    from_stage INTEGER,
    to_stage INTEGER NOT NULL,
    transitioned_by UUID NOT NULL,
    transition_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    CONSTRAINT fk_transition_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_transition_from_stage FOREIGN KEY (from_stage) REFERENCES stages(id),
    CONSTRAINT fk_transition_to_stage FOREIGN KEY (to_stage) REFERENCES stages(id),
    CONSTRAINT fk_transition_by FOREIGN KEY (transitioned_by) REFERENCES users(id)
);

CREATE INDEX idx_stage_transitions_user_id ON stage_transitions(user_id);
CREATE INDEX idx_stage_transitions_transition_date ON stage_transitions(transition_date);
```

## Data Relationships Diagram

```
users (central entity)
  ├── candidates (1:1 for candidates)
  │   ├── positions (many:1)
  │   └── documents (1:many)
  │
  ├── employees (1:1 for employees)
  │   ├── positions (many:1)
  │   ├── departments (many:1)
  │   ├── manager (self-referential)
  │   ├── leave_balances (1:many)
  │   ├── leave_requests (1:many)
  │   ├── time_entries (1:many)
  │   ├── attendance_summary (1:many)
  │   ├── performance_reviews (1:many)
  │   ├── goals (1:many)
  │   ├── requests (1:many)
  │   ├── training_enrollments (1:many)
  │   └── documents (1:many)
  │
  ├── notifications (1:many)
  ├── announcement_acknowledgments (1:many)
  └── audit_logs (1:many)

stages (reference data)
  └── users.current_stage (many:1)

leave_types (reference data)
  ├── leave_balances (1:many)
  └── leave_requests (1:many)

training_courses (reference data)
  └── training_enrollments (1:many)

announcements
  └── announcement_acknowledgments (1:many)

documents
  ├── parent_document (self-referential for versions)
  └── document_access_logs (1:many)
```

## Database Functions and Triggers

### Auto-update timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repeat for other tables...
```

### Auto-generate application ID

```sql
CREATE OR REPLACE FUNCTION generate_application_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.application_id = 'BAYN-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
                        LPAD(NEXTVAL('application_id_seq')::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE application_id_seq START 1;

CREATE TRIGGER generate_candidate_application_id BEFORE INSERT ON candidates
    FOR EACH ROW EXECUTE FUNCTION generate_application_id();
```

### Auto-generate employee number

```sql
CREATE OR REPLACE FUNCTION generate_employee_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.employee_number = 'BAYN-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
                         LPAD(NEXTVAL('employee_number_seq')::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE employee_number_seq START 1;

CREATE TRIGGER generate_employee_id BEFORE INSERT ON employees
    FOR EACH ROW EXECUTE FUNCTION generate_employee_number();
```

### Update leave balance on request approval

```sql
CREATE OR REPLACE FUNCTION update_leave_balance_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        UPDATE leave_balances
        SET used_days = used_days + NEW.total_days,
            pending_days = pending_days - NEW.total_days
        WHERE employee_id = NEW.employee_id
          AND leave_type_id = NEW.leave_type_id
          AND year = EXTRACT(YEAR FROM NEW.start_date);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_balance_on_leave_approval AFTER UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_leave_balance_on_approval();
```

### Audit log trigger

```sql
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (
        CURRENT_SETTING('app.current_user_id', TRUE)::UUID,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply to sensitive tables
CREATE TRIGGER audit_employees AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();
```

## Data Migration Strategy

### From Replit to Azure

**Phase 1: Schema Migration**
Export schema from Replit PostgreSQL using pg_dump with schema-only option, review and adjust for Azure PostgreSQL compatibility, and create schema in Azure Database for PostgreSQL.

**Phase 2: Data Export**
Export data using pg_dump with data-only option, compress export files for faster transfer, and verify data integrity with checksums.

**Phase 3: Data Import**
Import data to Azure using pg_restore, verify row counts match source, and validate foreign key relationships.

**Phase 4: Index and Constraint Creation**
Create indexes for query performance and enable foreign key constraints after data load.

**Phase 5: Validation**
Run data validation queries comparing source and destination, test application connectivity, and perform load testing.

## Performance Optimization

### Indexing Strategy
Primary indexes on foreign keys for join performance, composite indexes on frequently queried column combinations, and partial indexes for common filtered queries.

### Query Optimization
Use EXPLAIN ANALYZE to identify slow queries, implement materialized views for complex aggregations, and partition large tables by date ranges.

### Connection Pooling
Use PgBouncer for connection pooling with pool size configured based on concurrent users and transaction mode for short queries, session mode for complex transactions.

### Caching Strategy
Cache frequently accessed reference data (stages, leave types, departments) in Redis with 1-hour TTL, cache user sessions in Redis, and cache computed values like leave balances.

## Backup and Recovery

### Backup Schedule
Full database backup daily at 2 AM with 30-day retention, transaction log backup every 15 minutes with 7-day retention, and point-in-time recovery enabled.

### Recovery Testing
Monthly recovery drills to verify backup integrity, documented recovery procedures, and RTO target of 4 hours, RPO target of 1 hour.
