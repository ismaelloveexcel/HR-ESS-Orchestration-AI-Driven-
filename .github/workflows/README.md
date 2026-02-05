# Workflows Directory

This directory contains all GitHub Actions workflows for the HR ESS Orchestration project.

## Workflow Overview

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| AI-DAN Supervisor | `ai-controller.yml` | Issues, PRs, Schedule, Manual | Autonomous orchestration |
| Deploy to Azure | `deploy-azure.yml` | Push to main, Manual | Application deployment |
| Research Agent | `agent-research.yml` | Task file changes, Manual | Research and documentation |
| Blueprint Agent | `agent-blueprint.yml` | Task file changes, Manual | Architecture and design |
| POC Agent | `agent-poc.yml` | Task file changes, Manual | Implementation and coding |

---

## AI-DAN Supervisor (`ai-controller.yml`)

The AI-DAN Supervisor workflow is an autonomous orchestration system that monitors and manages the repository.

### Monitored Events
- **Issues**: opened, edited, labeled, closed, reopened, assigned
- **Pull Requests**: opened, edited, labeled, closed, reopened, synchronize, review_requested
- **Workflow Runs**: Deploy to Azure, Research Agent, Blueprint Agent, POC Agent
- **Schedule**: Every 4 hours for health checks
- **Manual**: workflow_dispatch with configurable actions

### Capabilities
- Automatic issue triage and labeling
- Agent task assignment based on context
- Workflow failure detection and alerting
- Repository health monitoring
- Cost and metrics tracking

### Important Note on YAML Validation

This workflow file uses bash heredocs within GitHub Actions `run:` blocks. While Python's strict YAML parser (`pyyaml`) may report syntax errors on the heredoc content, **this is a known compatibility issue** and the file **WILL work correctly on GitHub Actions**.

GitHub Actions uses a more lenient YAML parser (based on Go's YAML library) that properly handles bash heredocs in multiline strings, which is a common and well-established pattern in GitHub Actions workflows.

### Testing the Workflow

To test manually:
1. Go to Actions tab in GitHub
2. Select "AI-DAN Supervisor" workflow
3. Click "Run workflow"
4. Choose action type (investigate, health-check, auto-fix)
5. Optionally provide context
6. Click "Run workflow"

---

## Deploy to Azure (`deploy-azure.yml`)

Handles application deployment to Azure Web Apps.

### Triggers
- **Push to main**: Automatic deployment when source files change
- **Manual**: workflow_dispatch with environment selection

### Environments
- **Staging**: Automatic deployment on push to main
- **Production**: Manual trigger required

### Required Secrets
- `AZURE_CREDENTIALS`: Azure service principal credentials (JSON format)

### Testing Deployment
1. Go to Actions tab in GitHub
2. Select "Deploy to Azure" workflow
3. Click "Run workflow"
4. Select environment (staging/production)
5. Optionally skip tests
6. Click "Run workflow"

---

## Agent Workflows

### Research Agent (`agent-research.yml`)
- **Trigger**: Changes to `tasks/01_research_modules.md` or manual
- **Purpose**: Information gathering, tool evaluation, documentation

### Blueprint Agent (`agent-blueprint.yml`)
- **Trigger**: Changes to `tasks/02_integration_blueprint.md` or manual
- **Purpose**: Architecture design, system diagrams, technical planning

### POC Agent (`agent-poc.yml`)
- **Trigger**: Changes to `tasks/04_poc_plan.md` or manual
- **Purpose**: Code implementation, feature development, bug fixes

---

## Required Secrets

| Secret | Used By | Purpose |
|--------|---------|---------|
| `OPENAI_API_KEY` | AI-DAN Supervisor | AI decision making |
| `AZURE_CREDENTIALS` | Deploy to Azure | Azure authentication |
| `GITHUB_TOKEN` | All workflows | Auto-provided by GitHub |

---

## Documentation

See `AI-CONTROLLER-ENHANCEMENTS.md` for detailed information about the enhancements and capabilities of the AI-DAN Supervisor.
