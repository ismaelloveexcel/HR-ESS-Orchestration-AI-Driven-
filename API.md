# HR ESS API Documentation

**Version:** 0.1.0  
**Base URL:** `http://localhost:3000`

Complete API reference for the HR Employee Self-Service System designed for UAE multi-entity organizations.

---

## Quick Links

- [System Endpoints](#system-endpoints) - Health check and API info
- [Authentication](#authentication) - Register and login
- [Employees](#employee-management) - Employee CRUD operations
- [Attendance](#attendance-management) - Clock in/out, overtime tracking
- [Leave](#leave-management) - Leave requests with reference numbers
- [Requests](#employee-requests) - Employee requests tracking
- [Calendar](#calendar--announcements) - Events and announcements
- [Policies](#policies--labor-law) - Policies and UAE labor law

---

## System Endpoints

### GET `/` - Landing Page
Returns welcome information and feature list.

### GET `/health` - Health Check  
Check API server status.

**Response:**
\`\`\`json
{
  "status": "ok",
  "service": "HR ESS API - UAE Multi-Entity System",
  "version": "0.1.0"
}
\`\`\`

### GET `/api` - API Information
Complete list of available endpoints and features.

---

## Authentication

### POST `/api/auth/register` - Register User

**Request:**
\`\`\`json
{
  "username": "ahmed_ali",
  "password": "SecurePass123!",
  "email": "ahmed@company.ae",
  "role": "employee"
}
\`\`\`

### POST `/api/auth/login` - Login

**Request:**
\`\`\`json
{
  "username": "ahmed_ali",
  "password": "SecurePass123!"
}
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "ahmed_ali",
  "role": "employee"
}
\`\`\`

---

## Employee Management

### GET `/api/employees` - List All Employees
### GET `/api/employees/:id` - Get Employee by ID
### POST `/api/employees` - Create Employee
### PUT `/api/employees/:id` - Update Employee
### DELETE `/api/employees/:id` - Delete Employee

---

## Attendance Management

### POST `/api/attendance/clock-in` - Clock In

Records clock-in with optional geolocation for office/site/remote workers.

**Request:**
\`\`\`json
{
  "employeeId": "EMP001",
  "workLocation": "office",
  "location": {
    "lat": 25.2048,
    "lon": 55.2708
  }
}
\`\`\`

### POST `/api/attendance/clock-out` - Clock Out

Calculates hours worked and overtime (paid/offset).

### GET `/api/attendance/employee/:employeeId` - Get Attendance Records
### GET `/api/attendance/report/:employeeId/:year/:month` - Monthly Report

**Response includes:**
- Total working days
- Present/absent/late days  
- Regular and overtime hours
- Overtime paid vs offset

---

## Leave Management

### POST `/api/leave/request` - Submit Leave Request

**Request:**
\`\`\`json
{
  "employeeId": "EMP001",
  "type": "annual",
  "startDate": "2026-03-10",
  "endDate": "2026-03-15",
  "reason": "Family vacation"
}
\`\`\`

**Response includes auto-generated reference number:** `LV12345678`

### GET `/api/leave/reference/:refNumber` - Track by Reference Number

Employees can check status anytime using reference number.

### GET `/api/leave/balance/:employeeId/:year` - Get Leave Balance

**Includes:**
- Annual leave (30 days - UAE standard)
- Sick leave  
- Offset days (earned from overtime)
- Unpaid leave

### PATCH `/api/leave/:id/status` - Approve/Reject Leave

---

## Employee Requests

All request types supported: document, certificate, loan, IT support, facility, etc.

### POST `/api/requests` - Submit Request

**Request:**
\`\`\`json
{
  "employeeId": "EMP001",
  "type": "certificate",
  "title": "Employment Certificate",
  "description": "Need for visa application",
  "priority": "high"
}
\`\`\`

**Response includes reference number:** `CE12345678`

### GET `/api/requests/reference/:refNumber` - Track Request

Check status with reference number - no login required.

### GET `/api/requests/employee/:employeeId` - Employee's Requests
### GET `/api/requests/pending` - Pending Requests (HR/Admin)
### PATCH `/api/requests/:id/status` - Update Status

**Tracks full status history** for transparency.

---

## Calendar & Announcements

### GET `/api/calendar/events` - Get Calendar Events
Query params: `startDate`, `endDate`, `type`

**Event types:** deadline, training, webinar, meeting, holiday, birthday

### POST `/api/calendar/events` - Create Event
### GET `/api/calendar/events/upcoming` - Next 30 Days

### GET `/api/calendar/announcements` - Get Announcements

**Announcement types:**
- birthday
- new-joiner  
- leaver
- promotion
- achievement
- general

### POST `/api/calendar/announcements` - Create Announcement

---

## Policies & Labor Law

### GET `/api/policies` - List Policies
Query params: `category`, `country`, `requiresAck`

**Categories:** hr-policy, labor-law, company-policy, procedure, guideline

### POST `/api/policies/:policyId/acknowledge` - Acknowledge Policy

**Required for UAE labor law compliance.**

**Request:**
\`\`\`json
{
  "employeeId": "EMP001",
  "signature": "Ahmed Ali"
}
\`\`\`

### GET `/api/policies/pending-acks/:employeeId` - Pending Acknowledgments

Returns policies employee must acknowledge.

### GET `/api/policies/labor-law/topics` - Labor Law Education

Educational content about UAE labor law with:
- Law references (Federal Decree-Law No. 33 of 2021)
- Examples
- Quiz questions
- Related policies

---

## UAE-Specific Features

✅ **30-day annual leave** (UAE standard)  
✅ **Multi-entity support** (3 entities under same group)  
✅ **5 or 6-day work week** configuration  
✅ **Offset days** earned from overtime  
✅ **Geolocation** tracking (office/site/remote/outside)  
✅ **Policy acknowledgment** tracking (legal requirement)  
✅ **Reference number** tracking for all requests  
✅ **UAE labor law** education module

---

## Error Responses

- `200` OK
- `201` Created  
- `204` No Content
- `400` Bad Request
- `401` Unauthorized
- `404` Not Found
- `409` Conflict
- `500` Internal Server Error

**Format:**
\`\`\`json
{
  "error": "Error message"
}
\`\`\`

---

## Reference Number System

All requests generate unique tracking numbers:

| Type | Prefix | Example |
|------|--------|---------|
| Leave | LV | LV12345678 |
| Certificate | CE | CE12345678 |
| Document | DO | DO12345678 |
| IT Support | IT | IT12345678 |
| Other | XX | XX12345678 |

Employees can check status anytime using reference number.

---

## Next Steps

1. **Database Integration** - PostgreSQL for production
2. **JWT Middleware** - Protect routes
3. **File Upload** - Document management
4. **Email Notifications** - Request updates
5. **Frontend** - React/Vue.js portal

---

**Last Updated:** 2026-02-05  
**API Version:** 0.1.0
