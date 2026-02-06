# 🤖 HR-ESS-Orchestration-AI-Driven

> **An AI-powered orchestration framework for building HR Employee Self-Service (ESS) systems tailored to UAE multi-entity contexts**

---

## 🚀 How to Use This System (The One-Step Automation)

**Do not modify workflow files manually.** To execute any task, simply create a GitHub Issue with your request.

### Quick Start

1. Go to the [**Issues**](../../issues) tab
2. Click **New Issue**
3. Write your request in plain English

### Example Commands (Copy & Paste)

| Request Type | Example Command |
|--------------|-----------------|
| **Research** | `Find open-source attendance systems with GPS and UAE support.` |
| **Design** | `Create an integration blueprint for the shortlisted leave management module.` |
| **Build** | `Build a PoC for employee clock-in with a mock GPS endpoint.` |
| **Question** | `What UAE labor laws apply to overtime tracking?` |

The **AI-DAN Supervisor** will automatically read your issue, classify it, and delegate it to the appropriate specialist agent.

---

## 📊 Current Status

```
┌─────────────────────────────────────────────────────────────┐
│  Repository State: PRODUCTION READY ✅                       │
│  Agent Workflows:  ✅ DEPLOYED (Research, Blueprint, POC)   │
│  AI-DAN Supervisor: ✅ ACTIVE & ORCHESTRATING               │
│  Application Code: ✅ COMPLETE & TESTED                     │
│  Azure Deployment: ✅ CONFIGURED                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

| Component | Workflow File | Trigger | Purpose |
|-----------|---------------|---------|---------|
| **🤖 AI-DAN Supervisor** | `ai-controller.yml` | New Issue, PR, Schedule | Routes tasks to specialists using AI analysis |
| **🕵️ Research Agent** | `agent-research.yml` | Dispatched by AI-DAN | Discovers and evaluates OSS modules. Outputs to `/reports/` |
| **📐 Blueprint Agent** | `agent-blueprint.yml` | Dispatched by AI-DAN | Creates architecture diagrams and integration plans. Outputs to `/blueprints/` |
| **🚀 PoC Agent** | `agent-poc.yml` | Dispatched by AI-DAN | Builds proof-of-concept code. Outputs to `/app/` |
| **☁️ Azure Deployer** | `deploy-azure.yml` | Push to `main` | Deploys code to Azure Web Apps |

### How It Works

```
     ┌──────────────────────────────────────────────────────┐
     │               YOU CREATE AN ISSUE                    │
     │        "Build a PoC for clock-in with GPS"          │
     └──────────────────────┬───────────────────────────────┘
                            │
                            ▼
     ┌──────────────────────────────────────────────────────┐
     │            🤖 AI-DAN SUPERVISOR                      │
     │                                                      │
     │  1. Reads your issue                                 │
     │  2. Classifies the request                          │
     │  3. Decides: "This needs POC Agent"                 │
     │  4. Triggers agent workflow                         │
     └──────────────────────┬───────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
    ┌───────────┐    ┌───────────┐    ┌───────────┐
    │ 🕵️ Research│    │ 📐 Blueprint│   │ 🚀 PoC    │
    │   Agent   │    │   Agent   │    │   Agent   │
    ├───────────┤    ├───────────┤    ├───────────┤
    │ /reports/ │    │/blueprints/│   │  /app/    │
    └───────────┘    └───────────┘    └───────────┘
```

---

## 📁 Repository Structure

```
.github/workflows/          # All automation workflows
├── ai-controller.yml       # 🤖 Main supervisor (AI-DAN)
├── agent-research.yml      # 🕵️ Research specialist
├── agent-blueprint.yml     # 📐 Blueprint architect
├── agent-poc.yml           # 🚀 PoC developer
└── deploy-azure.yml        # ☁️ Azure deployment

src/                        # Main application code
├── api/                    # API route handlers
│   ├── auth.ts             # Authentication
│   ├── employees.ts        # Employee management
│   ├── attendance.ts       # Clock in/out
│   ├── leave.ts            # Leave requests
│   ├── requests.ts         # Document requests
│   ├── policies.ts         # Company policies
│   ├── calendar.ts         # Events & announcements
│   ├── pass.ts             # Universal Pass
│   ├── businesscard.ts     # Digital business card
│   ├── portal.ts           # Mini portal (Quick Links, Status)
│   └── education.ts        # Employee education
├── database/               # Database layer
├── middleware/             # Auth & error handling
└── models/                 # Data models

public/                     # Web app (PWA)
├── index.html              # Mobile-friendly UI
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
└── offline.html            # Offline fallback

mobile/                     # Expo Go app (React Native)
├── App.tsx                 # Main app component
└── src/                    # Mobile source

blueprints/                 # Architecture outputs
reports/                    # Research findings
tasks/                      # Task definitions
```

---

## ⚙️ Prerequisites & Setup

### Required GitHub Secrets

| Secret | Purpose | Status |
|--------|---------|--------|
| `OPENAI_API_KEY` | AI task analysis (AI-DAN) | Required |
| `AZURE_CREDENTIALS` | Azure deployment (JSON) | For deployment |
| `GITHUB_TOKEN` | Auto-provided by GitHub | ✅ Automatic |

### Local Development

```bash
# Quick start
./start.sh

# Or manual setup
npm install
cp .env.example .env
npm run build
npm run dev
```

Server runs on `http://localhost:3000`

---

## 🚀 Application Features (Already Built)

The HR ESS system includes these UAE-compliant features:

### Core API Modules

| Module | Features |
|--------|----------|
| **Authentication** | JWT-based register/login, role-based access |
| **Employee Management** | Full CRUD with multi-entity support |
| **Attendance** | One-tap clock in/out, GPS validation, overtime |
| **Leave Management** | UAE 30-day leave, offset days, reference tracking |
| **Employee Requests** | Auto reference numbers, status tracking |
| **Calendar & Events** | Training, deadlines, announcements |
| **Policies** | UAE labor law compliance, acknowledgments |

### Universal Pass System

| Feature | Description |
|---------|-------------|
| **Employee Pass** | Digital ID card with QR code |
| **Business Card** | vCard export, QR sharing, admin visibility control |
| **Mini Portal** | Quick Links, Check Status, View Profile |

### Employee Education

| Section | Content |
|---------|---------|
| **UAE Labor Law** | 7 topics with interactive quizzes |
| **Tips & Guides** | Clock-in, leave, documents best practices |
| **FAQ** | 8 common employee questions |

### Mobile Experience

| Platform | Status |
|----------|--------|
| **Web App (PWA)** | ✅ Ready - works on any browser |
| **Expo Go App** | ✅ Ready - React Native mobile app |

### Test the API

```bash
# Health check
curl http://localhost:3000/health

# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!","email":"test@company.ae"}'
```

**See [API.md](./API.md) for complete API documentation.**

---

## 🤖 AI-DAN Supervisor Capabilities

The AI-DAN Supervisor v2.0 provides:

| Capability | Description |
|------------|-------------|
| 🔄 **Auto-Monitoring** | Every 4 hours + on all events |
| 🏷️ **Issue Triage** | Automatic labeling and routing |
| 🤖 **AI Decisions** | 8 action types via GPT-4 Turbo |
| 🔧 **Self-Healing** | Creates issues on workflow failures |
| 📊 **Cost Tracking** | API usage metrics |
| 🚨 **Health Checks** | Repository state monitoring |
| 🤝 **Agent Coordination** | Routes work to specialized agents |

### Decision Types

- `TRIGGER_AGENT` - Dispatches work to Research/Blueprint/POC agents
- `CREATE_ISSUE` - Creates tracked issues for work items
- `COMMENT` - Adds contextual comments
- `AUTO_LABEL` - Categorizes issues automatically
- `AUTO_ASSIGN` - Assigns to appropriate agents
- `AUTO_CLOSE` - Closes resolved/stale issues
- `INVESTIGATE` - Marks for deeper analysis
- `IGNORE` - No action needed (health checks)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [API.md](./API.md) | Complete API reference |
| [SETUP.md](./SETUP.md) | Installation and testing guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment instructions |
| [CURRENT-STATE.md](./CURRENT-STATE.md) | Repository architecture |
| [AI-CONTROLLER-ENHANCEMENTS.md](.github/workflows/AI-CONTROLLER-ENHANCEMENTS.md) | AI-DAN details |

---

## 🎯 Next Steps

1. **Database**: Connect PostgreSQL for persistent data (currently in-memory)
2. **Production Deploy**: Deploy to Azure Web Apps with CI/CD
3. **Apple/Google Wallet**: Generate actual wallet passes
4. **Push Notifications**: Employee alerts and reminders

### Self-Building Capability

Create an issue to have the system build itself:
> "Add email notifications for leave approval"

---

## 🤝 Contributing

Simply create an issue with your request. The AI-DAN Supervisor will:
- Label it by type (bug, enhancement, documentation)
- Assign urgency levels
- Route to appropriate agents
- Track progress automatically

### Manual Supervisor Trigger

```bash
gh workflow run ai-controller.yml \
  -f force_action=health-check \
  -f context="Manual test"
```

---

**Version**: Infrastructure v2.0 | Application v1.0  
**Last Updated**: 2026-02-05  
**Status**: ✅ Production Ready

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🚀 Create an issue to get started!                        │
│                                                             │
│  The AI-DAN Supervisor is watching and ready to help.      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
