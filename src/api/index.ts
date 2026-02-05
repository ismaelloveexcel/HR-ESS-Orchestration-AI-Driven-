import { Router } from 'express';
import employeeRouter from './employees';
import authRouter from './auth';
import attendanceRouter from './attendance';
import leaveRouter from './leave';
import requestsRouter from './requests';
import calendarRouter from './calendar';
import policiesRouter from './policies';

export const apiRouter = Router();

// API routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/employees', employeeRouter);
apiRouter.use('/attendance', attendanceRouter);
apiRouter.use('/leave', leaveRouter);
apiRouter.use('/requests', requestsRouter);
apiRouter.use('/calendar', calendarRouter);
apiRouter.use('/policies', policiesRouter);

// API info endpoint
apiRouter.get('/', (req, res) => {
  res.json({
    message: 'HR ESS API - UAE Multi-Entity Employee Self-Service System',
    version: '0.1.0',
    description: 'Comprehensive HR management system with attendance, leave, policies, and more',
    endpoints: {
      auth: {
        path: '/api/auth',
        description: 'Authentication (register, login)'
      },
      employees: {
        path: '/api/employees',
        description: 'Employee management and profiles'
      },
      attendance: {
        path: '/api/attendance',
        description: 'Clock in/out, attendance tracking, overtime'
      },
      leave: {
        path: '/api/leave',
        description: 'Leave requests, balance, and approvals'
      },
      requests: {
        path: '/api/requests',
        description: 'Employee requests (documents, certificates, etc.)'
      },
      calendar: {
        path: '/api/calendar',
        description: 'Events, deadlines, training, announcements'
      },
      policies: {
        path: '/api/policies',
        description: 'Company policies, labor law education, acknowledgments'
      }
    },
    features: [
      'Multi-entity support (UAE)',
      'Attendance with geolocation',
      'Leave management with offset days',
      'Employee request tracking with reference numbers',
      'Policy acknowledgment (UAE labor law compliance)',
      'Calendar and announcements',
      '5/6 day work week support'
    ]
  });
});

export default apiRouter;
