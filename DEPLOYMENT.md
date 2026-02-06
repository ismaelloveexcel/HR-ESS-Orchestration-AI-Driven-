# Deployment Guide

## Quick Setup

### 1. Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- OpenAI API key (for AI-DAN Supervisor)

### 2. Installation

```bash
# Clone repository
git clone https://github.com/ismaelloveexcel/HR-ESS-Orchestration-AI-Driven-.git
cd HR-ESS-Orchestration-AI-Driven-

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev
```

The server will start on `http://localhost:3000`

### 3. Verify Installation

```bash
# Test health check
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","service":"HR ESS API","version":"0.1.0",...}

# Test API
curl http://localhost:3000/api

# Test employees endpoint
curl http://localhost:3000/api/employees
```

## Configuration

### Environment Variables

Edit `.env` file:

```env
# Application
NODE_ENV=development
PORT=3000

# Database (when implemented)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hr_ess_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=24h

# API
API_BASE_URL=http://localhost:3000/api

# CORS
CORS_ORIGIN=http://localhost:3000
```

### GitHub Secrets

For AI-DAN Supervisor to work:

1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Add new repository secret:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

## Building for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Testing the API

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ahmed","password":"secure123","email":"ahmed@company.ae","role":"employee"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ahmed","password":"secure123"}'
```

### Get Employees

```bash
curl http://localhost:3000/api/employees
```

## Deployment to Azure (Planned)

Coming soon:
- Azure App Service deployment
- Azure Database for PostgreSQL
- Azure Key Vault for secrets
- CI/CD pipeline with GitHub Actions

## Next Steps

1. Add Database: Integrate PostgreSQL or MongoDB
2. Implement Authentication Middleware
3. Add More Modules: Leave management, payroll, benefits
4. Build Frontend: React or Vue.js dashboard
5. Deploy to Azure
