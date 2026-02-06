# 🚀 Getting Started Guide

> **Quick start guide for understanding and using this repository**

---

## 📍 Where Are We?

This repository is in **Phase 1 Complete / Phase 2 Pending**:
- ✅ **Phase 1**: AI orchestration infrastructure deployed
- ⏳ **Phase 2**: HR ESS application development (not started)

---

## 🎯 Choose Your Path

### Path A: "I want to understand what's here"
→ Go to [Understanding the Current State](#understanding-the-current-state)

### Path B: "I want to start building the HR app"
→ Go to [Starting Development](#starting-development)

### Path C: "I want to test the AI supervisor"
→ Go to [Testing the AI Supervisor](#testing-the-ai-supervisor)

### Path D: "I want to disable the noisy alerts"
→ Go to [Quieting the Supervisor](#quieting-the-supervisor)

---

## Understanding the Current State

### What You Have Right Now

```
┌─────────────────────────────────────────────────────┐
│  AI-DAN Supervisor v2.0                             │
│  • Monitors issues, PRs, workflows                  │
│  • Makes AI-powered decisions                       │
│  • Auto-labels and routes work                      │
│  • Health checks every 4 hours                      │
│  • Uses GPT-4 Turbo (requires OPENAI_API_KEY)      │
└─────────────────────────────────────────────────────┘
```

**Status**: ✅ Fully deployed and functional

### What You Don't Have Yet

```
┌─────────────────────────────────────────────────────┐
│  HR ESS Application                                 │
│  • No source code files                             │
│  • No dependencies (package.json, etc.)             │
│  • No database models                               │
│  • No API endpoints                                 │
│  • No UI components                                 │
└─────────────────────────────────────────────────────┘
```

**Status**: ❌ Not yet implemented

### Why This Setup?

**Strategy**: Build the orchestration framework first, then the application.

**Benefits**:
- ✅ Infrastructure-as-code from day one
- ✅ Automated issue management ready
- ✅ CI/CD foundation in place
- ✅ AI assistance available immediately

**Trade-off**:
- ⚠️ Supervisor will report "missing files" until app exists
- ⚠️ Some features won't activate until agents/app are created

---

## Starting Development

### Prerequisites

1. **Choose Your Tech Stack** (Pick ONE)
   - [ ] Node.js/TypeScript (React/Next.js/Express)
   - [ ] Python (Django/FastAPI/Flask)
   - [ ] Go (Gin/Echo/Fiber)
   - [ ] Java (Spring Boot)
   - [ ] .NET (ASP.NET Core)

2. **Set Up Local Environment**
   ```bash
   # Clone if you haven't
   git clone https://github.com/ismaelloveexcel/HR-ESS-Orchestration-AI-Driven-.git
   cd HR-ESS-Orchestration-AI-Driven-
   ```

3. **Configure GitHub Secrets** (Optional - for AI features)
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Create new secret: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

---

### Quick Start: Node.js/TypeScript Example

```bash
# 1. Initialize Node.js project
npm init -y

# 2. Install TypeScript and dependencies
npm install --save-dev typescript @types/node ts-node
npm install express dotenv

# 3. Create TypeScript configuration
npx tsc --init

# 4. Create project structure
mkdir -p src/{api,models,services,utils}
mkdir -p tests

# 5. Create main entry point
cat > src/index.ts << 'EOF'
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'HR-ESS API' });
});

app.listen(PORT, () => {
  console.log(`HR-ESS API listening on port ${PORT}`);
});
EOF

# 6. Update package.json scripts
npm pkg set scripts.start="node dist/index.js"
npm pkg set scripts.dev="ts-node src/index.ts"
npm pkg set scripts.build="tsc"

# 7. Test it
npm run dev
# Visit http://localhost:3000/health
```

---

### Quick Start: Python/FastAPI Example

```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0
EOF

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create project structure
mkdir -p app/{api,models,services,utils}
mkdir -p tests

# 5. Create main entry point
cat > app/main.py << 'EOF'
from fastapi import FastAPI

app = FastAPI(title="HR-ESS API")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "HR-ESS API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# 6. Test it
python app/main.py
# Visit http://localhost:8000/health
# Visit http://localhost:8000/docs for API docs
```

---

### Quick Start: Go Example

```bash
# 1. Initialize Go module
go mod init github.com/ismaelloveexcel/HR-ESS-Orchestration-AI-Driven-

# 2. Create project structure
mkdir -p cmd/server
mkdir -p pkg/{api,models,services}
mkdir -p internal

# 3. Install Gin framework
go get github.com/gin-gonic/gin

# 4. Create main entry point
cat > cmd/server/main.go << 'EOF'
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "HR-ESS API",
		})
	})

	r.Run(":8080")
}
EOF

# 5. Test it
go run cmd/server/main.go
# Visit http://localhost:8080/health
```

---

### Next Steps After Initial Setup

1. **Commit Your Initial Structure**
   ```bash
   git add .
   git commit -m "Initial application structure"
   git push
   ```

2. **Create First Issue**
   ```bash
   # Go to GitHub Issues and create a new issue like:
   # Title: "Define HR ESS core features"
   # Body: "List the essential features for MVP"
   ```
   The AI supervisor will automatically label and triage it!

3. **Build Core Features** (Example roadmap)
   - [ ] Authentication & authorization
   - [ ] Employee profile management
   - [ ] Leave request workflow
   - [ ] Payslip access
   - [ ] Benefits enrollment
   - [ ] Time tracking
   - [ ] Document management

4. **Add Tests**
   ```bash
   # Choose testing framework based on your stack
   # Node.js: Jest, Mocha, Vitest
   # Python: pytest, unittest
   # Go: go test
   ```

5. **Create Deployment Workflow**
   ```yaml
   # .github/workflows/deploy-azure.yml
   name: Deploy to Azure
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Deploy
           run: echo "Add deployment steps here"
   ```

---

## Testing the AI Supervisor

### Option 1: Manual Workflow Trigger

```bash
# Using GitHub CLI
gh workflow run ai-controller.yml \
  -f force_action=health-check \
  -f context="Testing the supervisor"

# Check the run
gh run list --workflow=ai-controller.yml
gh run view <run-id> --log
```

### Option 2: Create a Test Issue

1. Go to: Repository → Issues → New issue
2. Title: "Test AI Supervisor"
3. Body: "This is a test to see how the AI supervisor handles new issues"
4. Click "Submit new issue"
5. Watch as the AI supervisor:
   - Analyzes the issue
   - Adds labels
   - Posts a comment
   - Routes to an agent (or explains why it can't)

### Option 3: Via GitHub UI

1. Go to: Repository → Actions tab
2. Click "AI-DAN Supervisor 🤖" workflow
3. Click "Run workflow" button
4. Fill in inputs:
   - Branch: Select your branch
   - force_action: `health-check`
   - context: "Manual test"
5. Click "Run workflow"
6. Watch the execution in real-time

### What to Expect

**With OPENAI_API_KEY configured:**
- ✅ AI-powered decision making
- ✅ Intelligent issue classification
- ✅ Context-aware responses

**Without OPENAI_API_KEY:**
- ⚠️ Falls back to rule-based decisions
- ⚠️ Basic labeling only
- ⚠️ Generic responses

---

## Quieting the Supervisor

If health check alerts are too noisy during development:

### Option 1: Disable Scheduled Health Checks

```bash
# Edit .github/workflows/ai-controller.yml
# Find lines 7-8 and comment them out:

# Before:
#   schedule:
#     - cron: '0 */4 * * *'

# After:
#   # schedule:
#   #   - cron: '0 */4 * * *'

# Commit the change
git add .github/workflows/ai-controller.yml
git commit -m "Temporarily disable scheduled health checks"
git push
```

**Effect**: Supervisor still works for issues/PRs, but won't run automatic health checks.

### Option 2: Adjust Health Check Logic

Edit the workflow to skip certain checks until the app exists:

```yaml
# Add condition to health check steps
if: github.event_name != 'schedule' || env.APP_EXISTS == 'true'
```

### Option 3: Accept the Noise

**Rationale**: The "missing file" issues are actually helpful!
- They remind you what still needs to be built
- They auto-close when you add the files
- They serve as a to-do list

---

## Common Tasks

### Add a New Feature

1. Create an issue describing the feature
2. AI supervisor labels and routes it
3. Create a branch: `git checkout -b feature/feature-name`
4. Implement the feature
5. Create a pull request
6. AI supervisor monitors and comments
7. Merge when ready

### Fix a Bug

1. Create an issue with the `bug` label
2. AI supervisor prioritizes it
3. Create a branch: `git checkout -b fix/bug-name`
4. Fix the bug
5. Add tests to prevent regression
6. Create a pull request
7. Merge when tests pass

### Update Documentation

1. Edit relevant .md files
2. Commit: `git commit -m "docs: update getting started guide"`
3. Push: `git push`
4. AI supervisor may auto-label documentation PRs

---

## Troubleshooting

### "AI supervisor isn't responding to my issues"

**Possible causes**:
1. Workflow not enabled → Check Actions tab
2. GITHUB_TOKEN permissions → Check Settings → Actions → General
3. Workflow failed → Check Actions tab for error logs

**Solution**:
```bash
# Check workflow status
gh workflow list
gh workflow enable ai-controller.yml

# View recent runs
gh run list --workflow=ai-controller.yml
```

### "I'm getting API rate limit errors"

**Cause**: Too many OpenAI API calls

**Solutions**:
1. Reduce health check frequency (from 4 hours to 6 hours)
2. Use a lower-tier model (gpt-3.5-turbo instead of gpt-4-turbo)
3. Add request throttling

### "Workflow is creating too many issues"

**Cause**: Health checks finding many "missing" items

**Solution**: See [Quieting the Supervisor](#quieting-the-supervisor)

---

## Next Steps

### Immediate (Week 1)
- [ ] Choose tech stack
- [ ] Set up development environment
- [ ] Create initial project structure
- [ ] Add package.json / requirements.txt / go.mod
- [ ] Create first "Hello World" endpoint
- [ ] Test locally

### Short-term (Month 1)
- [ ] Define HR ESS core features
- [ ] Design database schema
- [ ] Implement authentication
- [ ] Create first HR module (e.g., leave management)
- [ ] Add tests
- [ ] Document API endpoints

### Medium-term (Month 2-3)
- [ ] Complete core HR features
- [ ] Create deployment pipeline
- [ ] Set up staging environment
- [ ] Add agent workflows for coordination
- [ ] Implement UAE-specific compliance
- [ ] User acceptance testing

---

## Resources

### Documentation
- [Current State Report](./CURRENT-STATE.md) - Detailed analysis
- [AI Supervisor Upgrade](./AI-SUPERVISOR-UPGRADE-SUMMARY.md) - Full feature list
- [Deployment Guide](./DEPLOYMENT-SUCCESS.md) - Setup and configuration

### GitHub Actions
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub CLI](https://cli.github.com/)
- [Actions Marketplace](https://github.com/marketplace?type=actions)

### HR ESS Resources
- [UAE Labor Law](https://u.ae/en/information-and-services/jobs/employment-contracts)
- [HR Best Practices](https://www.shrm.org/)
- [Open Source HR Systems](https://github.com/topics/hrms)

---

## Getting Help

### AI Supervisor
- Create an issue with `ai-supervisor` label
- Check workflow logs in Actions tab
- Review decision logs in workflow artifacts

### Development
- Create an issue with `question` label
- Check existing issues for similar questions
- Review repository documentation

### Urgent Issues
- Create an issue with `urgent` label
- AI supervisor will prioritize automatically

---

**Ready to Start?** Pick your path at the top and begin! 🚀

---

**Last Updated**: 2026-02-04  
**Guide Version**: 1.0  
**Repository Status**: Infrastructure Complete | Application Pending
