# Copilot Instructions for HR-ESS-Orchestration-AI-Driven

## Overview

This is an **AI-orchestrated HR Employee Self-Service (ESS) system** framework designed for UAE multi-entity organizations. The project has two layers:

1. **AI-DAN Supervisor** (v2.0): Deployed GitHub Actions workflow for autonomous orchestration and issue management
2. **HR ESS Application**: Node.js/TypeScript REST API with 34 endpoints across 8 HR modules (varies based on state)

## Current State - CRITICAL

**AI-DRIVEN DEVELOPMENT**: This repository is designed to minimize manual intervention by leveraging AI agents and supervisors. The AI-DAN Supervisor orchestrates three specialized agents to handle development tasks autonomously.

**PROJECT STATUS**: Application not yet reviewed by project owner. Implementation documentation exists but actual source code state is unverified. AI agents should build features incrementally with minimal manual intervention.

### Priority Modules (In Order)
1. **Recruitment Process** - Applicant tracking, job postings, interview scheduling
2. **Annual Leave Planning** - UAE-compliant leave requests, balance tracking, approvals
3. **Performance Management** - Goals, reviews, feedback, evaluations
4. **Attendance** - Clock in/out with geolocation, overtime tracking

## Architecture

### Core Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3
- **Framework**: Express 4.18
- **Auth**: JWT + bcrypt
- **AI Orchestration**: AI-DAN Supervisor (GPT-4 Turbo via .github/workflows/ai-controller.yml)

### Module Structure (when implemented)
```
src/
├── api/              # 7 route modules (auth, employees, attendance, leave, requests, calendar, policies)
├── models/           # 6 TypeScript interfaces for data structures
├── middleware/       # errorHandler, auth verification
└── index.ts         # Express app, health check, error routing
```

## Essential Workflows

### Build & Run
```bash
npm install && npm run build && npm run dev
# Server at http://localhost:3000
# Health check: GET /health
```

### Testing API Endpoints
- All responses use `application/json`
- No database yet (in-memory Map structures)
- Test with curl examples in SETUP.md or API.md

### AI Supervisor Trigger (Manual)
```bash
gh workflow run ai-controller.yml -f force_action=health-check
```

## Key Patterns

### API Response Convention
Every endpoint returns structured JSON:
```typescript
// Success
{ data: {...}, statusCode: 200, message?: string }
// Error
{ error: "message", statusCode: 400 }
```

### Error Handling
Centralized in `src/middleware/errorHandler.ts` - all routes must throw or pass errors to next(err).

### Module Organization
Each feature gets its own file in `src/api/{feature}.ts`:
- Independent Router creation
- Mock data storage via new Map<string, T>()
- Consistent query parameter filtering pattern
- PATCH for updates, POST for creation

### UAE-Specific Features (Must Implement)
- 30-day annual leave entitlement
- 5/6-day work week configuration  
- Offset days from overtime allocation
- Geolocation attendance tracking
- Multi-entity support (3+ entities)
- Policy acknowledgment requirement
- Reference number generation for all requests

## AI Agent System

### AI-DAN Supervisor
The `.github/workflows/ai-controller.yml` orchestrates three specialized agents:
- **RESEARCH_AGENT**: Information gathering, tool evaluation, documentation, file generation
- **BLUEPRINT_AGENT**: Architecture design, system diagrams, technical planning
- **POC_AGENT**: Code implementation, feature development, bug fixes, testing

Supervisor actions: TRIGGER_AGENT, CREATE_ISSUE, LABEL, COMMENT, UPDATE_STATUS, CLOSE
Runs: Every 4 hours + on issues/PRs/pushes

### Available Subagents (VSCode)
- **AIAgentExpert**: AI app/workflow development with Microsoft Agent Framework
- **DataAnalysisExpert**: Data file analysis and insights
- **Plan**: Research and outline multi-step plans

### Leveraging Agents
**For new features**: Let AI agents handle the work - supervisor will route to appropriate agent based on task type. Create issues for complex features and let the agent system break down and implement incrementally.

## Development Responsibilities

**When Adding Features**:
1. Create new route file in `src/api/{feature}.ts`
2. Add TypeScript interface in `src/models/{Feature}.ts`
3. Export router from `src/api/index.ts`
4. Add reference number generation where applicable
5. Include UAE compliance checks (leave balances, work week, etc.)
6. Test with provided curl examples

**Database Migration (Pending)**:
- Designed for easy transition from Map to PostgreSQL
- Use TypeORM or Prisma (examples in SETUP.md)
- Keep same model interfaces

## Files to Reference

- **Architecture explanation**: IMPLEMENTATION-SUMMARY.md (lines 85-150)
- **API documentation**: API.md (all endpoints with request/response examples)
- **Setup & test commands**: SETUP.md (line 47+)
- **Supervisor details**: AI-SUPERVISOR-UPGRADE-SUMMARY.md, DEPLOYMENT-SUCCESS.md
- **Integration patterns**: src/models/*.ts (interfaces define data contracts)

## Common Pitfalls

1. **In-memory data loss**: Map structures reset on restart - production needs database
2. **Missing middleware**: New routes for protected operations need `verifyToken` middleware (not yet implemented)
3. **UAE compliance**: Leave balance calculations must include offset days logic
4. **Reference tracking**: All requests (leave, time off, documents) need auto-generated reference numbers
5. **Multi-entity**: Requests must include `entityId` filtering

## Agent-First Development Workflow

1. **For Complex Features**: Use `Plan` agent to create detailed implementation roadmap
2. **For AI Components**: Use `AIAgentExpert` for AI-powered HR features  
3. **For Architecture**: Let BLUEPRINT_AGENT design system structure
4. **For Implementation**: Let POC_AGENT build features incrementally
5. **For Research**: Let RESEARCH_AGENT gather requirements and best practices

**Philosophy**: Minimize manual coding. Let agents collaborate to build the system.
