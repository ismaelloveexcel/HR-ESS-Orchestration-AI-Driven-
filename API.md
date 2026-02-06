# HR ESS API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000`

Complete API reference for the HR Employee Self-Service System designed for UAE multi-entity organizations.

---

## Quick Links

- [System Endpoints](#system-endpoints) - Health check and API info
- [Authentication](#authentication) - Register and login
- [Employees](#employee-management) - Employee CRUD operations
- [Attendance](#attendance-management) - One-tap clock in/out
- [Leave](#leave-management) - Leave requests with reference numbers
- [Requests](#employee-requests) - Document requests tracking
- [Calendar](#calendar--announcements) - Events and announcements
- [Policies](#policies) - Company policies and acknowledgments
- [Pass](#universal-pass) - Employee digital pass
- [Business Card](#digital-business-card) - Contact sharing
- [Portal](#mini-portal) - Quick links and status check
- [Education](#employee-education) - UAE labor law learning

---

## System Endpoints

### GET `/` - Web App
Mobile-friendly PWA interface.

### GET `/health` - Health Check  
```json
{
  "status": "ok",
  "service": "HR ESS API - UAE Multi-Entity System",
  "version": "1.0.0"
}
```

### GET `/api` - API Information
Complete list of available endpoints and features.

---

## Authentication

### POST `/api/auth/register`
```json
{
  "username": "ahmed_ali",
  "password": "SecurePass123!",
  "email": "ahmed@company.ae",
  "entityCode": "TC-UAE"
}
```

### POST `/api/auth/login`
```json
{
  "username": "ahmed_ali",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "username": "ahmed_ali", "role": "employee" }
}
```

### GET `/api/auth/me` 🔒
Get current user info.

### POST `/api/auth/change-password` 🔒
Change password.

---

## Employee Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/:id` | Get employee by ID |
| GET | `/api/employees/:id/summary` | Get employee summary |
| POST | `/api/employees` | Create employee (Admin/HR) |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

---

## Attendance Management

### POST `/api/attendance/quick` 🔒 ⭐
**One-tap clock in/out** - automatically detects if clocking in or out.

```json
{
  "location": { "lat": 25.2048, "lon": 55.2708 }
}
```

**Response:**
```json
{
  "action": "clock_in",
  "message": "Clocked in successfully",
  "time": "09:00:00",
  "location": "office"
}
```

### GET `/api/attendance/status` 🔒
Get current clock status for UI display.

```json
{
  "status": "clocked_in",
  "clockedInAt": "2026-02-05T09:00:00Z",
  "action": "Clock Out",
  "message": "Working for 4h 30m"
}
```

### POST `/api/attendance/clock-in` 🔒
Manual clock in with location.

### POST `/api/attendance/clock-out` 🔒
Manual clock out.

### GET `/api/attendance/employee/:employeeId` 🔒
Get attendance records.

---

## Leave Management

### POST `/api/leave` 🔒
Submit leave request.

```json
{
  "type": "annual",
  "startDate": "2026-03-10",
  "endDate": "2026-03-15",
  "reason": "Family vacation"
}
```

**Response includes reference number:** `LV-202603-0001`

### GET `/api/leave/balance` 🔒
Get leave balance (annual: 30 days UAE standard).

### GET `/api/leave/:id` 🔒
Get leave request details.

### PATCH `/api/leave/:id/approve` 🔒 (Manager/HR)
### PATCH `/api/leave/:id/reject` 🔒 (Manager/HR)
### PATCH `/api/leave/:id/cancel` 🔒

---

## Employee Requests

### GET `/api/requests/types`
Available request types (salary certificate, NOC, etc.)

### POST `/api/requests` 🔒
Submit document request.

```json
{
  "type": "salary_certificate",
  "purpose": "Bank loan application",
  "urgent": false
}
```

**Response includes reference:** `REQ-202602-0001`

### GET `/api/requests/:id` 🔒
### GET `/api/requests/my` 🔒
### PATCH `/api/requests/:id/process` 🔒 (HR)
### PATCH `/api/requests/:id/complete` 🔒 (HR)

---

## Calendar & Announcements

### GET `/api/calendar/events`
Query: `?startDate=2026-02-01&endDate=2026-02-28&type=holiday`

### GET `/api/calendar/upcoming`
Next 30 days of events.

### POST `/api/calendar/events` 🔒 (Admin/HR)

### GET `/api/calendar/announcements`
Birthdays, new joiners, promotions.

### GET `/api/calendar/today`
Today's summary.

---

## Policies

### GET `/api/policies`
List active policies.

### GET `/api/policies/:id`
Get policy details.

### POST `/api/policies/:id/acknowledge` 🔒
Acknowledge reading a policy.

### GET `/api/policies/pending` 🔒
Policies requiring acknowledgment.

---

## Universal Pass

### GET `/api/pass/my` 🔒
Get current user's pass.

```json
{
  "id": "PASS-EMP001",
  "type": "employee",
  "personal": {
    "name": "Ahmed Al Mansoori",
    "position": "Software Engineer",
    "entity": "TechCorp UAE"
  },
  "stage": "confirmed",
  "menu": [...]
}
```

### GET `/api/pass/:id/qr`
Generate QR code for pass.

### GET `/api/pass/:id/profile`
Full profile for QR scan destination.

### POST `/api/pass/candidate` 🔒 (HR)
Create candidate pass.

---

## Digital Business Card

### GET `/api/businesscard/my` 🔒
Get my business card.

### GET `/api/businesscard/my/vcard`
Download vCard file.

### GET `/api/businesscard/my/qr`
QR code for contact sharing.

### PATCH `/api/businesscard/:id/visibility` 🔒
Control which fields are visible.

```json
{
  "phone": true,
  "email": true,
  "position": true,
  "department": false
}
```

---

## Mini Portal

### GET `/api/portal/home` 🔒 ⭐
**Complete portal data in one call** - greeting, stats, quick links, upcoming events.

### GET `/api/portal/quick-links` 🔒
Available quick actions with pending counts.

```json
{
  "links": [
    { "id": "leave", "label": "Leave", "icon": "calendar", "badge": 2 },
    { "id": "documents", "label": "Documents", "icon": "document" }
  ]
}
```

### GET `/api/portal/check-status/:reference` ⭐
**Public** - Check request status by reference number.

```json
{
  "found": true,
  "reference": "LV-202602-0001",
  "type": "leave",
  "status": { "code": "pending", "label": "Pending Approval" },
  "details": { "type": "Annual Leave", "startDate": "2026-03-10" }
}
```

### GET `/api/portal/profile` 🔒
Comprehensive employee profile view.

---

## Employee Education

### GET `/api/education/overview`
Education center sections.

### GET `/api/education/uae-labor-law`
List of UAE labor law topics.

### GET `/api/education/uae-labor-law/:topicId`
Topic content with quiz.

**Topics:**
- `working-hours` - Working hours and overtime
- `annual-leave` - 30 days entitlement
- `sick-leave` - 90 days (15 full, 30 half, 45 unpaid)
- `maternity-paternity` - 60 days / 5 days
- `end-of-service` - Gratuity calculation
- `notice-period` - 30-90 days
- `probation` - 6 months max

### GET `/api/education/tips`
Tips and guides.

### GET `/api/education/faq`
Frequently asked questions.

### POST `/api/education/quiz/:topicId/submit` 🔒
Submit quiz answers, get score.

### GET `/api/education/search?q=leave`
Search all education content.

---

## Authentication Notes

🔒 = Requires JWT token in header:
```
Authorization: Bearer <token>
```

⭐ = Recommended endpoint for common operations.

---

## UAE-Specific Features

| Feature | Implementation |
|---------|----------------|
| 30-day annual leave | UAE labor law standard |
| Multi-entity support | Separate entity codes |
| 5 or 6-day work week | Configurable |
| Offset days | Earned from overtime |
| GPS validation | Office location check |
| Policy acknowledgment | Legal compliance tracking |
| Reference numbers | All requests trackable |
| Labor law education | Interactive quizzes |

---

## Error Responses

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

```json
{
  "error": "Error message",
  "message": "Detailed description"
}
```

---

**Last Updated:** 2026-02-05  
**API Version:** 1.0.0
