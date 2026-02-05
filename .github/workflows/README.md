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

## Agent Workflows (AI-Powered)

All agent workflows are now enhanced with AI capabilities using GPT-4 Turbo.

### Research Agent (`agent-research.yml`)
- **Trigger**: Changes to `tasks/01_research_modules.md`, manual, or dispatched by AI-DAN
- **Purpose**: AI-powered research, analysis, and documentation
- **Outputs**: 
  - Markdown reports in `/reports/`
  - JSON data in `/data/output/`
- **Inputs**:
  - `task_description`: Research task to perform
  - `issue_number`: Related issue for status updates
  - `output_format`: markdown, json, or both

### Blueprint Agent (`agent-blueprint.yml`)
- **Trigger**: Changes to `tasks/02_integration_blueprint.md`, manual, or dispatched by AI-DAN
- **Purpose**: AI-powered architecture design with Mermaid diagrams
- **Outputs**:
  - Architecture documents in `/blueprints/`
  - JSON data in `/data/output/`
- **Inputs**:
  - `task_description`: Design task to perform
  - `issue_number`: Related issue for status updates
  - `diagram_style`: mermaid, ascii, or both

### POC Agent (`agent-poc.yml`)
- **Trigger**: Changes to `tasks/04_poc_plan.md`, manual, or dispatched by AI-DAN
- **Purpose**: AI-powered code generation and implementation
- **Outputs**:
  - Generated code in `/app/poc-{timestamp}/`
  - JSON data in `/data/output/`
- **Inputs**:
  - `task_description`: Feature/code to build
  - `issue_number`: Related issue for status updates
  - `target_directory`: app, src, or poc

### Agent Workflow Features
- **Auto-commit**: Results are automatically committed and pushed
- **Issue Updates**: Agents post status updates to related issues
- **Structured Output**: All agents produce both human-readable and machine-readable outputs
- **Error Handling**: Fallback responses when AI is unavailable
- **Retry Logic**: Push operations retry with exponential backoff

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
