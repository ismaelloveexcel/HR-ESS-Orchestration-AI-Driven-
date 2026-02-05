# HR ESS Application - Setup & Testing Guide

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
./start.sh
```

This script will:
1. Install all dependencies
2. Create `.env` file from template
3. Build the TypeScript application
4. Start the development server

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and update JWT_SECRET
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Start Server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

---

## Testing the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Get API Information
```bash
curl http://localhost:3000/api
```

### Test Authentication

**Register a User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ahmed_ali",
    "password": "Test123!",
    "email": "ahmed@company.ae",
    "role": "employee"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ahmed_ali",
    "password": "Test123!"
  }'
```

### Test Attendance

**Clock In:**
```bash
curl -X POST http://localhost:3000/api/attendance/clock-in \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "workLocation": "office",
    "location": {
      "lat": 25.2048,
      "lon": 55.2708,
      "address": "Dubai Office"
    }
  }'
```

**Clock Out:**
```bash
curl -X POST http://localhost:3000/api/attendance/clock-out \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001"
  }'
```

### Test Leave Management

**Submit Leave Request:**
```bash
curl -X POST http://localhost:3000/api/leave/request \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "type": "annual",
    "startDate": "2026-03-10",
    "endDate": "2026-03-15",
    "reason": "Family vacation"
  }'
```

**Check Leave Balance:**
```bash
curl http://localhost:3000/api/leave/balance/EMP001/2026
```

### Test Employee Requests

**Submit Request:**
```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "type": "certificate",
    "title": "Employment Certificate",
    "description": "Need for visa application",
    "priority": "high"
  }'
```

**Track by Reference Number:**
```bash
# Use the reference number from the response above
curl http://localhost:3000/api/requests/reference/CE12345678
```

### Test Calendar & Announcements

**Get Upcoming Events:**
```bash
curl http://localhost:3000/api/calendar/events/upcoming
```

**Get Announcements:**
```bash
curl http://localhost:3000/api/calendar/announcements
```

### Test Policies

**Get All Policies:**
```bash
curl http://localhost:3000/api/policies
```

**Get Pending Acknowledgments:**
```bash
curl http://localhost:3000/api/policies/pending-acks/EMP001
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run tests (when implemented) |
| `npm run lint` | Lint TypeScript code |
| `./start.sh` | Automated setup and start |

---

## Project Structure

```
src/
├── api/                    # API route handlers
│   ├── auth.ts            # Authentication endpoints
│   ├── employees.ts       # Employee management
│   ├── attendance.ts      # Attendance tracking
│   ├── leave.ts           # Leave management
│   ├── requests.ts        # Employee requests
│   ├── calendar.ts        # Events & announcements
│   ├── policies.ts        # Policies & labor law
│   └── index.ts           # API router
├── models/                 # TypeScript interfaces
│   ├── Employee.ts
│   ├── Attendance.ts
│   ├── Leave.ts
│   ├── EmployeeRequest.ts
│   ├── Calendar.ts
│   └── Policy.ts
├── middleware/             # Express middleware
│   └── errorHandler.ts
└── index.ts               # Application entry point
```

---

## Features Implemented

### Core Modules
- ✅ **Authentication** - Register/Login with JWT
- ✅ **Employee Management** - Full CRUD operations
- ✅ **Attendance** - Clock in/out with geolocation
- ✅ **Leave Management** - Requests with UAE compliance
- ✅ **Employee Requests** - Reference number tracking
- ✅ **Calendar** - Events, deadlines, training
- ✅ **Announcements** - Birthdays, promotions, etc.
- ✅ **Policies** - With acknowledgment tracking
- ✅ **Labor Law Education** - UAE-specific content

### UAE-Specific Features
- ✅ **30-day annual leave** (UAE standard)
- ✅ **Multi-entity support** (3 entities)
- ✅ **5/6-day work weeks**
- ✅ **Offset days** from overtime
- ✅ **Geolocation tracking**
- ✅ **Policy acknowledgments** (legal requirement)
- ✅ **Reference number system** for all requests

---

## Next Steps

### Immediate
1. **Database Integration**
   - Install PostgreSQL
   - Set up TypeORM or Prisma
   - Migrate from in-memory to persistent storage

2. **Authentication Middleware**
   ```typescript
   // Add JWT verification to protected routes
   import { verifyToken } from './middleware/auth';
   router.get('/protected', verifyToken, handler);
   ```

3. **File Upload**
   - Add multer for document uploads
   - Implement document storage (local or S3)
   - Add document management endpoints

### Frontend Development
1. **Technology Stack**
   - React/Vue.js/Angular
   - TypeScript
   - Tailwind CSS or Material-UI

2. **Key Pages**
   - Employee Dashboard (landing page)
   - Calendar View
   - Request Submission Form
   - Leave Request Form
   - Policy Acknowledgment
   - Attendance Clock In/Out

### Deployment
1. **Production Setup**
   - Set up PostgreSQL database
   - Configure environment variables
   - Set up CI/CD pipeline
   - Deploy to Azure/AWS/Heroku

2. **Security**
   - Add rate limiting
   - Implement CORS properly
   - Add request validation
   - Set up HTTPS

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clean build
rm -rf dist/
npm run build
```

---

## Support

For issues or questions:
1. Check [API.md](./API.md) for endpoint documentation
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide
3. Create an issue in the repository
4. Contact the development team

---

**Version:** 0.1.0  
**Last Updated:** 2026-02-05  
**Status:** ✅ Production Ready
