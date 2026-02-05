import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './api';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'HR ESS API - UAE Multi-Entity System',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Landing page info
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to HR ESS API',
    description: 'Employee Self-Service System for UAE Multi-Entity Organizations',
    version: '0.1.0',
    documentation: '/api',
    health: '/health',
    features: [
      'Attendance Management (Clock in/out, Overtime tracking)',
      'Leave Management (Annual, Sick, Offset days)',
      'Employee Requests (Track with reference numbers)',
      'Calendar & Events (Trainings, Deadlines, Webinars)',
      'Announcements (Birthdays, New joiners, Promotions)',
      'Policies & Procedures (UAE Labor Law compliance)',
      'Multi-entity Support',
      'Geolocation Tracking',
      '5/6 Day Work Week Support'
    ]
  });
});

// API Routes
app.use('/api', apiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      root: '/',
      health: '/health',
      api: '/api'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 HR ESS API Server Started`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 Port: ${PORT}`);
  console.log(`\n📍 Available Endpoints:`);
  console.log(`   Root:       http://localhost:${PORT}/`);
  console.log(`   Health:     http://localhost:${PORT}/health`);
  console.log(`   API Info:   http://localhost:${PORT}/api`);
  console.log(`\n🔧 API Modules:`);
  console.log(`   Auth:       /api/auth`);
  console.log(`   Employees:  /api/employees`);
  console.log(`   Attendance: /api/attendance`);
  console.log(`   Leave:      /api/leave`);
  console.log(`   Requests:   /api/requests`);
  console.log(`   Calendar:   /api/calendar`);
  console.log(`   Policies:   /api/policies`);
  console.log(`${'='.repeat(60)}\n`);
});

export default app;
