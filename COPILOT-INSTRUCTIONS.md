# Copilot Instructions for HR-ESS-Orchestration-AI-Driven

## Overview

This is an **AI-orchestrated HR Employee Self-Service (ESS) system** for UAE multi-entity organizations. The project has two layers:

1. **AI-DAN Supervisor** (v2.0): GitHub Actions workflow for autonomous orchestration
2. **HR ESS Application**: Node.js/TypeScript REST API with **11 modules** and **50+ endpoints**

---

## Current State

| Component | Status |
|-----------|--------|
| Backend API | ✅ Complete (11 modules) |
| Web App (PWA) | ✅ Complete |
| Mobile App (Expo) | ✅ Ready |
| AI Workflows | ✅ Deployed |
| Database | ⚠️ In-memory (needs PostgreSQL) |
| Production Deploy | ⚠️ Pending |

### Implemented Modules (11)
```
auth        employees    attendance   leave      requests
calendar    policies     pass         businesscard
portal      education
```

### Models (8)
```
Employee    Attendance   Leave        EmployeeRequest
Calendar    Policy       Pass         BusinessCard
```

---

## Architecture

### Core Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3
- **Framework**: Express 4.18
- **Auth**: JWT + bcrypt + RBAC
- **Database**: In-memory Map (PostgreSQL-ready)

### Repository Structure
```
src/
├── api/              # 11 route modules
│   ├── auth.ts       # JWT authentication
│   ├── employees.ts  # Employee CRUD
│   ├── attendance.ts # One-tap clock in/out, GPS
│   ├── leave.ts      # UAE 30-day leave
│   ├── requests.ts   # Document requests
│   ├── calendar.ts   # Events, announcements
│   ├── policies.ts   # Policy acknowledgments
│   ├── pass.ts       # Universal employee pass
│   ├── businesscard.ts # Digital vCard
│   ├── portal.ts     # Mini portal, status check
│   └── education.ts  # UAE labor law learning
├── database/         # Abstraction layer
│   └── index.ts      # CRUD operations, seed data
├── middleware/
│   ├── auth.ts       # JWT verify, RBAC, entity auth
│   └── errorHandler.ts
├── models/           # TypeScript interfaces
└── index.ts          # Express app entry

public/               # PWA web app
├── index.html        # Mobile-friendly UI
├── manifest.json     # PWA manifest
├── sw.js             # Service worker
└── offline.html

mobile/               # Expo Go React Native app
├── App.tsx           # Main component
└── src/api/config.ts # API configuration

.github/workflows/    # AI orchestration
├── ai-controller.yml # AI-DAN Supervisor
├── agent-research.yml
├── agent-blueprint.yml
├── agent-poc.yml
└── deploy-azure.yml
```

---

## Quick Commands

### Build & Run
```bash
npm install
npm run build
npm run dev
# Server: http://localhost:3000
```

### Test Endpoints
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api
curl http://localhost:3000/api/education/overview
curl http://localhost:3000/api/portal/check-status/REF123
```

### Trigger AI Supervisor
```bash
gh workflow run ai-controller.yml -f force_action=health-check
```

---

## API Patterns

### Response Convention
```typescript
// Success
{ data: {...}, message?: "Success" }

// Error
{ error: "message", message: "details" }
```

### Authentication
```typescript
// Public endpoints (no auth)
GET /api/education/*
GET /api/portal/check-status/:ref

// Protected endpoints (JWT required)
Authorization: Bearer <token>
```

### RBAC Roles
```typescript
'admin' | 'hr_manager' | 'manager' | 'employee'
```

---

## UAE-Specific Features (Implemented)

| Feature | Implementation |
|---------|----------------|
| 30-day annual leave | `src/api/leave.ts` |
| Sick leave (90 days tiered) | 15 full + 30 half + 45 unpaid |
| Maternity (60 days) | 45 full + 15 half |
| Paternity (5 days) | Full pay |
| Multi-entity support | `entityCode` on all records |
| GPS attendance | Office location validation |
| Offset days | Earned from overtime |
| Reference numbers | Auto-generated (LV-, REQ-) |
| Policy acknowledgment | Tracked per employee |
| Labor law education | 7 topics with quizzes |

---

## Priority Roadmap (Not Yet Implemented)

1. **Database Migration** - PostgreSQL with TypeORM/Prisma
2. **Recruitment Module** - Job postings, applicant tracking
3. **Performance Management** - Goals, reviews, evaluations
4. **Push Notifications** - Leave approvals, reminders
5. **Apple/Google Wallet** - Actual wallet pass generation
6. **Email Notifications** - Request status updates

---

## AI Agent System

### AI-DAN Supervisor
File: `.github/workflows/ai-controller.yml`

**Triggers**: Issues, PRs, Schedule (4h), Manual
**Actions**: TRIGGER_AGENT, CREATE_ISSUE, LABEL, COMMENT, CLOSE

### Specialized Agents
| Agent | Purpose | Output |
|-------|---------|--------|
| RESEARCH | Information gathering, evaluation | `/reports/` |
| BLUEPRINT | Architecture, diagrams, planning | `/blueprints/` |
| POC | Code implementation, features | `/app/` |

### Agent-First Workflow
1. Create GitHub Issue with request
2. AI-DAN classifies and routes
3. Agent executes and commits
4. Results pushed to repo

---

## Development Guidelines

### Adding New Features
1. Create route: `src/api/{feature}.ts`
2. Create model: `src/models/{Feature}.ts`
3. Add to database: `src/database/index.ts`
4. Export router: `src/api/index.ts`
5. Update API docs: `API.md`

### Database Layer
```typescript
// src/database/index.ts provides:
db.employees.get(id)
db.employees.create(data)
db.employees.update(id, data)
db.employees.delete(id)
db.employees.find(filter)
db.generateId()
db.generateReferenceNumber(prefix)
```

### Code Style
- Use `AuthenticatedRequest` for protected routes
- Use `authenticate` middleware for JWT verification
- Use `authorize(...roles)` for RBAC
- Always validate `entityCode` for multi-entity

---

## Files Reference

| File | Purpose |
|------|---------|
| `API.md` | Complete API documentation |
| `README.md` | Project overview, architecture |
| `SETUP.md` | Installation, testing guide |
| `DEPLOYMENT.md` | Azure deployment instructions |
| `CURRENT-STATE.md` | Detailed state documentation |
| `.github/workflows/AI-CONTROLLER-ENHANCEMENTS.md` | AI-DAN details |

---

## Common Pitfalls

1. **In-memory data resets on restart** - Use seed data or add PostgreSQL
2. **JWT secret** - Set `JWT_SECRET` env var in production
3. **CORS** - Configure for production domains
4. **Entity validation** - Always filter by user's entity
5. **Reference numbers** - Must be unique per type

---

## Philosophy

**Minimize manual coding. Let AI agents collaborate to build the system.**

Create issues → AI-DAN routes → Agents implement → Code pushed automatically.

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-06
