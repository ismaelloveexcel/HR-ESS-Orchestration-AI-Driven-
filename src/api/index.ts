/**
 * API Router - Main Entry Point
 * 
 * All API routes are registered here.
 * Base path: /api
 */

import { Router, Request, Response } from 'express';
import authRouter from './auth';
import employeesRouter from './employees';
import attendanceRouter from './attendance';
import leaveRouter from './leave';
import requestsRouter from './requests';
import policiesRouter from './policies';
import calendarRouter from './calendar';
import passRouter from './pass';
import businesscardRouter from './businesscard';
import portalRouter from './portal';
import educationRouter from './education';
import { db } from '../database';

export const apiRouter = Router();

// API Info endpoint
apiRouter.get('/', (req: Request, res: Response) => {
  const entities = db.getEntities();
  
  res.json({
    name: 'HR ESS API',
    version: '1.0.0',
    description: 'Employee Self-Service System for UAE Multi-Entity Organizations',
    documentation: '/api/docs',
    status: 'operational',
    entities: entities.map(e => ({ code: e.code, name: e.name })),
    endpoints: {
      auth: {
        base: '/api/auth',
        routes: [
          { method: 'POST', path: '/register', description: 'Register new user' },
          { method: 'POST', path: '/login', description: 'Authenticate user' },
          { method: 'GET', path: '/me', description: 'Get current user info', auth: true },
          { method: 'POST', path: '/change-password', description: 'Change password', auth: true },
          { method: 'GET', path: '/entities', description: 'Get available entities' }
        ]
      },
      employees: {
        base: '/api/employees',
        routes: [
          { method: 'GET', path: '/', description: 'List employees', auth: true },
          { method: 'GET', path: '/:id', description: 'Get employee by ID', auth: true },
          { method: 'POST', path: '/', description: 'Create employee', auth: true, roles: ['admin', 'hr_manager'] },
          { method: 'PUT', path: '/:id', description: 'Update employee', auth: true, roles: ['admin', 'hr_manager'] },
          { method: 'DELETE', path: '/:id', description: 'Deactivate employee', auth: true, roles: ['admin'] },
          { method: 'GET', path: '/:id/summary', description: 'Get employee summary', auth: true }
        ]
      },
      attendance: {
        base: '/api/attendance',
        routes: [
          { method: 'POST', path: '/quick', description: '⭐ ONE-TAP clock in/out (auto-detects)', auth: true },
          { method: 'GET', path: '/status', description: 'Get button state (what to show)', auth: true },
          { method: 'POST', path: '/clock-in', description: 'Manual clock in with GPS', auth: true },
          { method: 'POST', path: '/clock-out', description: 'Manual clock out', auth: true },
          { method: 'GET', path: '/today', description: 'Get today\'s record', auth: true },
          { method: 'GET', path: '/employee/:id', description: 'Get employee attendance', auth: true },
          { method: 'GET', path: '/report/:year/:month', description: 'Monthly report', auth: true, roles: ['admin', 'hr_manager', 'manager'] },
          { method: 'POST', path: '/manual', description: 'Manual entry', auth: true, roles: ['admin', 'hr_manager'] }
        ]
      },
      leave: {
        base: '/api/leave',
        routes: [
          { method: 'POST', path: '/request', description: 'Submit leave request', auth: true },
          { method: 'GET', path: '/requests', description: 'List leave requests', auth: true },
          { method: 'GET', path: '/request/:id', description: 'Get request details', auth: true },
          { method: 'PATCH', path: '/request/:id/approve', description: 'Approve request', auth: true, roles: ['admin', 'hr_manager', 'manager'] },
          { method: 'PATCH', path: '/request/:id/reject', description: 'Reject request', auth: true, roles: ['admin', 'hr_manager', 'manager'] },
          { method: 'PATCH', path: '/request/:id/cancel', description: 'Cancel request', auth: true },
          { method: 'GET', path: '/balance/:employeeId/:year', description: 'Get leave balance', auth: true },
          { method: 'GET', path: '/calendar', description: 'Team leave calendar', auth: true }
        ]
      },
      requests: {
        base: '/api/requests',
        routes: [
          { method: 'POST', path: '/', description: 'Submit document request', auth: true },
          { method: 'GET', path: '/', description: 'List requests', auth: true },
          { method: 'GET', path: '/:id', description: 'Get request details', auth: true },
          { method: 'PATCH', path: '/:id/process', description: 'Start processing', auth: true, roles: ['admin', 'hr_manager'] },
          { method: 'PATCH', path: '/:id/complete', description: 'Complete request', auth: true, roles: ['admin', 'hr_manager'] },
          { method: 'GET', path: '/types/list', description: 'Get request types' }
        ]
      },
      policies: {
        base: '/api/policies',
        routes: [
          { method: 'GET', path: '/', description: 'List policies', auth: true },
          { method: 'GET', path: '/:id', description: 'Get policy details', auth: true },
          { method: 'POST', path: '/:id/acknowledge', description: 'Acknowledge policy', auth: true },
          { method: 'GET', path: '/pending/acknowledgments', description: 'Pending acknowledgments', auth: true },
          { method: 'GET', path: '/:id/acknowledgments', description: 'Policy acknowledgment report', auth: true, roles: ['admin', 'hr_manager'] }
        ]
      },
      calendar: {
        base: '/api/calendar',
        routes: [
          { method: 'GET', path: '/events', description: 'Get calendar events', auth: true },
          { method: 'GET', path: '/holidays', description: 'Get public holidays', auth: true },
          { method: 'GET', path: '/upcoming', description: 'Upcoming events', auth: true },
          { method: 'POST', path: '/events', description: 'Create event', auth: true, roles: ['admin', 'hr_manager'] },
          { method: 'GET', path: '/announcements', description: 'Get announcements', auth: true },
          { method: 'POST', path: '/announcements', description: 'Create announcement', auth: true, roles: ['admin', 'hr_manager'] },
          { method: 'GET', path: '/today', description: 'Today\'s summary', auth: true }
        ]
      },
      pass: {
        base: '/api/pass',
        description: 'Universal Pass System - One layout, three modes (PWA enabled)',
        routes: [
          { method: 'GET', path: '/my', description: 'Get current user\'s pass', auth: true },
          { method: 'GET', path: '/:id', description: 'Get pass by ID', auth: true },
          { method: 'GET', path: '/:id/qr', description: 'Get QR code for pass', auth: true },
          { method: 'GET', path: '/:id/profile', description: 'Get full profile (QR destination)', auth: true },
          { method: 'GET', path: '/:id/wallet', description: 'Generate wallet file', auth: true },
          { method: 'POST', path: '/candidate', description: 'Create candidate pass', auth: true, roles: ['admin', 'hr_manager'] },
          { method: 'PATCH', path: '/:id/stage', description: 'Update pass stage', auth: true, roles: ['admin', 'hr_manager', 'manager'] },
          { method: 'POST', path: '/:id/evaluation', description: 'Add evaluation', auth: true, roles: ['admin', 'hr_manager', 'manager'] },
          { method: 'GET', path: '/candidates/list', description: 'List all candidate passes', auth: true, roles: ['admin', 'hr_manager', 'manager'] },
          { method: 'GET', path: '/types/config', description: 'Get pass type configurations' }
        ]
      },
      businesscard: {
        base: '/api/businesscard',
        description: 'Digital Business Card - QR code, vCard export, admin-controlled visibility',
        routes: [
          { method: 'GET', path: '/my', description: 'Get your business card', auth: true },
          { method: 'GET', path: '/my/vcard', description: 'Download your vCard file', auth: true },
          { method: 'GET', path: '/my/qr', description: 'Get QR code for your contact', auth: true },
          { method: 'GET', path: '/:employeeId', description: 'Get employee business card', auth: true },
          { method: 'GET', path: '/:employeeId/vcard', description: 'Download employee vCard', auth: true },
          { method: 'PATCH', path: '/:employeeId/visibility', description: 'Update visibility settings', auth: true },
          { method: 'PATCH', path: '/:employeeId', description: 'Update business card', auth: true, roles: ['admin', 'hr_manager'] },
          { method: 'GET', path: '/settings/:entityCode', description: 'Get entity card settings', auth: true, roles: ['admin', 'hr_manager'] },
          { method: 'PATCH', path: '/settings/:entityCode', description: 'Update entity settings', auth: true, roles: ['admin'] }
        ]
      },
      portal: {
        base: '/api/portal',
        description: 'Mini Portal - Quick Links, Check Status, View Profile (opens separately from wallet)',
        routes: [
          { method: 'GET', path: '/home', description: '⭐ Complete portal data in one call', auth: true },
          { method: 'GET', path: '/quick-links', description: 'Get available quick action links', auth: true },
          { method: 'GET', path: '/check-status/:reference', description: '🔍 Check request status by reference number' },
          { method: 'POST', path: '/check-status', description: 'Check status via form POST' },
          { method: 'GET', path: '/profile', description: 'View full employee profile', auth: true }
        ]
      },
      education: {
        base: '/api/education',
        description: '📚 Employee Education - UAE Labor Law, Tips, Guides, FAQ',
        routes: [
          { method: 'GET', path: '/overview', description: 'Education center overview' },
          { method: 'GET', path: '/uae-labor-law', description: 'UAE labor law topics list' },
          { method: 'GET', path: '/uae-labor-law/:topicId', description: 'Get topic content with quiz' },
          { method: 'GET', path: '/tips', description: 'Tips and guides list' },
          { method: 'GET', path: '/tips/:tipId', description: 'Get specific tip content' },
          { method: 'GET', path: '/faq', description: 'Frequently asked questions' },
          { method: 'POST', path: '/quiz/:topicId/submit', description: 'Submit quiz answers', auth: true },
          { method: 'GET', path: '/search', description: 'Search all education content' }
        ]
      }
    },
    uaeCompliance: {
      annualLeave: '30 days after 1 year',
      sickLeave: '90 days (15 full, 30 half, 45 unpaid)',
      workWeek: '48 hours max (5 or 6 day)',
      overtime: '125% normal, 150% Friday/Holiday',
      maternity: '60 days (45 full + 15 half)',
      paternity: '5 days'
    }
  });
});

// Mount routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/employees', employeesRouter);
apiRouter.use('/attendance', attendanceRouter);
apiRouter.use('/leave', leaveRouter);
apiRouter.use('/requests', requestsRouter);
apiRouter.use('/policies', policiesRouter);
apiRouter.use('/calendar', calendarRouter);
apiRouter.use('/pass', passRouter);
apiRouter.use('/businesscard', businesscardRouter);
apiRouter.use('/portal', portalRouter);
apiRouter.use('/education', educationRouter);

// API health check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

export default apiRouter;
