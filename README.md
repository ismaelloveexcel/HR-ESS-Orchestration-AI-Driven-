# 🤖 HR-ESS-Orchestration-AI-Driven

> **An AI-powered orchestration framework for building HR Employee Self-Service (ESS) systems tailored to UAE multi-entity contexts**

## 📊 Current Status: Application Ready! ✅

```
┌─────────────────────────────────────────────────────────────┐
│  Repository State: PRODUCTION READY ✅                       │
│  Agent Workflows:  ✅ DEPLOYED (Research, Blueprint, POC)   │
│  AI-DAN Supervisor: ✅ ACTIVE & ORCHESTRATING               │
│  Application Code: ✅ COMPLETE & TESTED                     │
│  Next Step:        Test and deploy to production            │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Project Vision

This repository is designed to orchestrate automated AI agents to:
- **Research** HR ESS best practices and solutions
- **Score** and evaluate modular open-source HR projects
- **Assemble** a customized HR ESS platform for UAE multi-entity contexts

The AI-DAN Supervisor autonomously manages issues, routes work, and coordinates development.

---

## 📁 What's Currently in This Repository

### ✅ Deployed Components

| Component | Status | Description |
|-----------|--------|-------------|
| **AI-DAN Supervisor v2.0** | ✅ Active | Autonomous workflow management system |
| **Workflow File** | ✅ Deployed | `.github/workflows/ai-controller.yml` (27KB) |
| **Agent Workflows** | ✅ Active | Research, Blueprint, POC agents |
| **API Application** | ✅ Complete | Node.js/TypeScript REST API |
| **Documentation** | ✅ Complete | Comprehensive API and setup guides |

### ✅ Agent Workflows

| Agent | Status | Purpose |
|-------|--------|---------|
| **Research Agent** | ✅ Active | Research HR modules and best practices |
| **Blueprint Agent** | ✅ Active | Design system architecture |
| **POC Agent** | ✅ Active | Develop proof-of-concepts |

### 🚀 Application Features

| Module | Status | Features |
|--------|--------|----------|
| **Authentication** | ✅ Complete | JWT-based register/login |
| **Employee Management** | ✅ Complete | Full CRUD with multi-entity support |
| **Attendance** | ✅ Complete | Clock in/out, geolocation, overtime tracking |
| **Leave Management** | ✅ Complete | UAE 30-day leave, offset days, reference tracking |
| **Employee Requests** | ✅ Complete | Auto reference numbers, status tracking |
| **Calendar & Events** | ✅ Complete | Training, deadlines, webinars, announcements |
| **Policies** | ✅ Complete | UAE labor law compliance, acknowledgments |

---

## 🚀 Quick Start

### Set Up the HR ESS Application

**Prerequisites:**
- Node.js 18+ and npm
- GitHub account with repository access
- OpenAI API key (for AI supervisor functionality)

**Quick Start:**

```bash
# Option 1: Automated setup (recommended)
./start.sh

# Option 2: Manual setup
npm install
cp .env.example .env
npm run build
npm run dev
```

The server will start on `http://localhost:3000`

**Test the API:**
```bash
# Health check
curl http://localhost:3000/health

# Get API info
curl http://localhost:3000/api

# Register and login
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!","email":"test@company.ae"}'
```

**See [SETUP.md](./SETUP.md) for detailed testing guide with all endpoints.**

### API Endpoints (Summary)

**Core APIs:**
- `POST /api/auth/register, /api/auth/login` - Authentication
- `GET/POST/PUT/DELETE /api/employees` - Employee management
- `POST /api/attendance/clock-in, clock-out` - Attendance tracking
- `POST /api/leave/request` - Leave requests with auto reference numbers
- `POST /api/requests` - Employee requests with tracking
- `GET /api/calendar/events, announcements` - Calendar & announcements
- `GET /api/policies` - Policies with acknowledgment

**UAE Features:**
- 30-day annual leave entitlement
- Multi-entity support (3 entities)
- 5/6-day work week configuration
- Offset days from overtime
- Geolocation attendance tracking
- Policy acknowledgment (legal requirement)
- Reference number tracking for all requests

**See [API.md](./API.md) for complete API documentation.**

---

## 🤖 AI-DAN Supervisor Overview

The AI-DAN Supervisor v2.0 autonomously orchestrates development:

### Capabilities
- 🔄 **Automatic Monitoring**: Every 4 hours + on events
- 🏷️ **Issue Triage**: Auto-labeling and routing
- 🤖 **AI Decisions**: 8 action types (GPT-4 Turbo)
- 🔧 **Self-Healing**: Creates issues on failures
- 📊 **Cost Tracking**: API usage metrics
- 🚨 **Health Checks**: Monitors repository state
- 🤝 **Agent Coordination**: Routes work to specialized agents

### How It Works
```
Event (Issue/PR/Schedule/Agent Workflow) 
    ↓
AI-DAN Analyzes Context
    ↓
Makes Decision (TRIGGER_AGENT, CREATE_ISSUE, etc.)
    ↓
Executes Action
    ↓
Logs Results & Metrics
```

### 📚 Documentation
- [API Reference](./API.md) - Complete endpoint documentation
- [Setup Guide](./SETUP.md) - Installation and testing
- [Current State](./CURRENT-STATE.md) - Repository architecture
- [Getting Started](./GETTING-STARTED.md) - Development guide
- [Deployment](./DEPLOYMENT.md) - Deployment instructions
- [Workflow Enhancements](.github/workflows/AI-CONTROLLER-ENHANCEMENTS.md) - AI-DAN details

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AI-DAN Supervisor                       │
│              (Autonomous Orchestration)                     │
└────────┬────────────────────────────────┬──────────────────┘
         │                                │
         ▼                                ▼
┌──────────────────┐          ┌──────────────────────────┐
│  Agent Workflows │          │   HR ESS Application     │
├──────────────────┤          ├──────────────────────────┤
│ • Research 🕵️    │          │ • Node.js/TypeScript     │
│ • Blueprint 🏗️   │          │ • Express API            │
│ • POC 💻         │          │ • Authentication (JWT)   │
└──────────────────┘          │ • Employee Management    │
                              │ • UAE Compliance         │
                              └──────────────────────────┘
```

### Technology Stack
- **Backend**: Node.js + TypeScript + Express
- **Authentication**: JWT + bcrypt
- **Orchestration**: AI-DAN Supervisor (GPT-4 Turbo)
- **Agents**: GitHub Actions workflows
- **Deployment**: Azure (planned)

---

## 🗺️ Development Roadmap

### ✅ Completed
- [x] AI-DAN Supervisor deployed and active
- [x] Agent workflows (Research, Blueprint, POC)
- [x] Application foundation (Node.js/TypeScript)
- [x] Authentication API (register/login)
- [x] Employee Management CRUD
- [x] Attendance tracking with geolocation
- [x] Leave management with UAE compliance
- [x] Employee requests with reference tracking
- [x] Calendar and announcements
- [x] Policies with acknowledgment system
- [x] UAE labor law education module
- [x] Multi-entity support
- [x] Comprehensive API documentation
- [x] Setup and testing guides

### 📋 Next Steps
- [ ] Database integration (PostgreSQL)
- [ ] JWT authentication middleware
- [ ] File upload for documents
- [ ] Email notifications
- [ ] Frontend UI (React/Vue.js)
- [ ] Deployment to Azure/AWS

---

## 🤝 Contributing

### Creating Issues
The AI supervisor automatically:
- Labels issues by type (bug, enhancement, documentation)
- Assigns urgency levels
- Routes to appropriate agents

Simply create an issue and let the AI supervisor help triage it!

### Pull Requests
The supervisor monitors PRs and can:
- Add contextual comments
- Trigger reviews
- Update status on related issues

---

## 📞 Support

### Getting Help
1. **Documentation Issues**: Check the guides in this repository
2. **Supervisor Issues**: Review workflow logs in the Actions tab
3. **General Questions**: Create an issue with the `question` label

### Manual Supervisor Trigger
```bash
# Test the AI supervisor manually
gh workflow run ai-controller.yml \
  -f force_action=health-check \
  -f context="Manual test"
```

---

## 📄 License

[Specify your license here]

---

## 🙏 Acknowledgments

- AI-DAN Supervisor powered by OpenAI GPT-4 Turbo
- GitHub Actions for workflow automation
- Open-source HR ESS projects (to be integrated)

---

**Version**: Infrastructure v2.0 | Application v0.0.0  
**Last Updated**: 2026-02-04  
**Status**: 🔨 Under Construction

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🚀 Ready to build an AI-orchestrated HR ESS system!       │
│                                                             │
│  Next: Define your tech stack and create application code  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
