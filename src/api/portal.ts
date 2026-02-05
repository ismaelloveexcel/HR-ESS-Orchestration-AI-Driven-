/**
 * Mini Portal API
 * 
 * Quick access features that open separately from the wallet pass:
 * - Quick Links (Leave, Documents, Requests)
 * - Check Status (Reference number search)
 * - View Profile
 */

import { Router, Response, Request } from 'express';
import { db } from '../database';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// ============================================================
// QUICK LINKS - Entry points to main features
// ============================================================

/**
 * @route GET /api/portal/quick-links
 * @desc Get available quick links for the employee
 * @access Private
 */
router.get('/quick-links', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    
    // Get pending counts for badges
    let pendingLeave = 0;
    let pendingRequests = 0;
    
    if (employeeId) {
      pendingLeave = db.getLeaveRequests(employeeId, 'pending').length;
      pendingRequests = db.getEmployeeRequests(employeeId, 'pending').length;
    }

    const quickLinks = [
      {
        id: 'leave',
        title: 'Leave Request',
        icon: '🏖️',
        description: 'Apply for annual, sick, or other leave',
        url: '/leave/request',
        badge: pendingLeave > 0 ? `${pendingLeave} pending` : null,
        color: '#4CAF50'
      },
      {
        id: 'documents',
        title: 'Document Request',
        icon: '📄',
        description: 'Salary certificate, NOC, employment letter',
        url: '/requests/new',
        badge: pendingRequests > 0 ? `${pendingRequests} pending` : null,
        color: '#2196F3'
      },
      {
        id: 'attendance',
        title: 'My Attendance',
        icon: '📊',
        description: 'View attendance history & overtime',
        url: '/attendance/history',
        color: '#FF9800'
      },
      {
        id: 'leave-balance',
        title: 'Leave Balance',
        icon: '📅',
        description: 'Check remaining leave days',
        url: '/leave/balance',
        color: '#9C27B0'
      },
      {
        id: 'policies',
        title: 'Policies',
        icon: '📋',
        description: 'Company policies & procedures',
        url: '/policies',
        color: '#607D8B'
      },
      {
        id: 'calendar',
        title: 'HR Calendar',
        icon: '🗓️',
        description: 'Holidays, events & deadlines',
        url: '/calendar',
        color: '#E91E63'
      }
    ];

    res.json({
      quickLinks,
      employee: employeeId ? {
        id: employeeId,
        pendingItems: pendingLeave + pendingRequests
      } : null
    });

  } catch (error) {
    console.error('Get quick links error:', error);
    res.status(500).json({ error: 'Failed to get quick links' });
  }
});

// ============================================================
// CHECK STATUS - Reference number search
// ============================================================

/**
 * @route GET /api/portal/check-status/:reference
 * @desc Check status of any request by reference number
 * @access Public (anyone with reference can check)
 */
router.get('/check-status/:reference', (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const refUpper = reference.toUpperCase().trim();

    // Search in leave requests
    const leaveRequest = db.getLeaveRequestByReference(refUpper);
    if (leaveRequest) {
      const employee = db.getEmployeeById(leaveRequest.employeeId);
      return res.json({
        found: true,
        type: 'leave_request',
        reference: leaveRequest.referenceNumber,
        status: leaveRequest.status,
        statusColor: getStatusColor(leaveRequest.status),
        statusIcon: getStatusIcon(leaveRequest.status),
        details: {
          type: formatLeaveType(leaveRequest.type),
          dates: `${formatDate(leaveRequest.startDate)} - ${formatDate(leaveRequest.endDate)}`,
          days: leaveRequest.totalDays,
          submittedOn: formatDate(leaveRequest.createdAt),
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'
        },
        timeline: buildTimeline(leaveRequest),
        message: getStatusMessage('leave', leaveRequest.status)
      });
    }

    // Search in document requests
    const allRequests = db.getEmployeeRequests();
    const docRequest = allRequests.find(r => r.referenceNumber === refUpper);
    if (docRequest) {
      const employee = db.getEmployeeById(docRequest.employeeId);
      return res.json({
        found: true,
        type: 'document_request',
        reference: docRequest.referenceNumber,
        status: docRequest.status,
        statusColor: getStatusColor(docRequest.status),
        statusIcon: getStatusIcon(docRequest.status),
        details: {
          type: formatRequestType(docRequest.type),
          urgency: docRequest.urgency,
          submittedOn: formatDate(docRequest.createdAt),
          completedOn: docRequest.completedAt ? formatDate(docRequest.completedAt) : null,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'
        },
        timeline: buildDocTimeline(docRequest),
        message: getStatusMessage('document', docRequest.status)
      });
    }

    // Not found
    return res.json({
      found: false,
      reference: refUpper,
      message: 'No request found with this reference number. Please check and try again.',
      hint: 'Reference numbers start with LV (leave) or REQ (documents)'
    });

  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

/**
 * @route POST /api/portal/check-status
 * @desc Check status via POST (for form submission)
 * @access Public
 */
router.post('/check-status', (req: Request, res: Response) => {
  const { reference } = req.body;
  if (!reference) {
    return res.status(400).json({ 
      error: 'Reference number required',
      hint: 'Enter your reference number (e.g., LV12345678 or REQ12345678)'
    });
  }
  
  // Same logic as GET endpoint
  const refUpper = reference.toUpperCase().trim();

  // Search in leave requests
  const leaveRequest = db.getLeaveRequestByReference(refUpper);
  if (leaveRequest) {
    const employee = db.getEmployeeById(leaveRequest.employeeId);
    return res.json({
      found: true,
      type: 'leave_request',
      reference: leaveRequest.referenceNumber,
      status: leaveRequest.status,
      statusColor: getStatusColor(leaveRequest.status),
      statusIcon: getStatusIcon(leaveRequest.status),
      details: {
        type: formatLeaveType(leaveRequest.type),
        dates: `${formatDate(leaveRequest.startDate)} - ${formatDate(leaveRequest.endDate)}`,
        days: leaveRequest.totalDays,
        submittedOn: formatDate(leaveRequest.createdAt),
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'
      },
      message: getStatusMessage('leave', leaveRequest.status)
    });
  }

  // Search in document requests
  const allRequests = db.getEmployeeRequests();
  const docRequest = allRequests.find(r => r.referenceNumber === refUpper);
  if (docRequest) {
    const employee = db.getEmployeeById(docRequest.employeeId);
    return res.json({
      found: true,
      type: 'document_request',
      reference: docRequest.referenceNumber,
      status: docRequest.status,
      statusColor: getStatusColor(docRequest.status),
      statusIcon: getStatusIcon(docRequest.status),
      details: {
        type: formatRequestType(docRequest.type),
        urgency: docRequest.urgency,
        submittedOn: formatDate(docRequest.createdAt),
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'
      },
      message: getStatusMessage('document', docRequest.status)
    });
  }

  // Not found
  return res.json({
    found: false,
    reference: refUpper,
    message: 'No request found with this reference number.',
    hint: 'Reference numbers start with LV (leave) or REQ (documents)'
  });
});

// ============================================================
// VIEW PROFILE - Full employee profile
// ============================================================

/**
 * @route GET /api/portal/profile
 * @desc Get full employee profile for the mini portal
 * @access Private
 */
router.get('/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile linked' });
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const entity = db.getEntityByCode(employee.entityCode);
    const currentYear = new Date().getFullYear();
    const leaveBalance = db.getLeaveBalance(employeeId, currentYear);
    const recentLeave = db.getLeaveRequests(employeeId).slice(0, 5);
    const recentRequests = db.getEmployeeRequests(employeeId).slice(0, 5);
    const pendingPolicies = db.getPolicies().filter(p => 
      p.requiresAcknowledgment && !db.hasAcknowledgedPolicy(employeeId, p.id)
    );

    // Calculate years of service
    const joinDate = new Date(employee.joinDate);
    const today = new Date();
    const yearsOfService = Math.floor((today.getTime() - joinDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const monthsOfService = Math.floor(((today.getTime() - joinDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)) % 12);

    res.json({
      profile: {
        // Personal Info
        id: employee.id,
        employeeNumber: employee.employeeNumber,
        name: `${employee.firstName} ${employee.lastName}`,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        
        // Employment Info
        position: employee.position,
        department: employee.department,
        entityCode: employee.entityCode,
        entityName: entity?.name || employee.entityCode,
        joinDate: employee.joinDate,
        joinDateFormatted: formatDate(employee.joinDate),
        contractType: employee.contractType,
        workSchedule: employee.workSchedule,
        
        // Service
        yearsOfService,
        monthsOfService,
        serviceText: yearsOfService > 0 
          ? `${yearsOfService} year${yearsOfService > 1 ? 's' : ''} ${monthsOfService} month${monthsOfService !== 1 ? 's' : ''}`
          : `${monthsOfService} month${monthsOfService !== 1 ? 's' : ''}`
      },
      
      leaveBalance: leaveBalance ? {
        annual: {
          entitled: leaveBalance.annualLeave.entitled,
          used: leaveBalance.annualLeave.used,
          remaining: leaveBalance.annualLeave.remaining,
          percentage: Math.round((leaveBalance.annualLeave.used / leaveBalance.annualLeave.entitled) * 100)
        },
        sick: {
          entitled: leaveBalance.sickLeave.entitled,
          used: leaveBalance.sickLeave.used,
          remaining: leaveBalance.sickLeave.remaining
        },
        offset: leaveBalance.offsetDays
      } : null,
      
      recentActivity: {
        leaveRequests: recentLeave.map(l => ({
          reference: l.referenceNumber,
          type: formatLeaveType(l.type),
          dates: `${formatDate(l.startDate)} - ${formatDate(l.endDate)}`,
          status: l.status,
          statusIcon: getStatusIcon(l.status)
        })),
        documentRequests: recentRequests.map(r => ({
          reference: r.referenceNumber,
          type: formatRequestType(r.type),
          status: r.status,
          statusIcon: getStatusIcon(r.status)
        }))
      },
      
      pendingActions: {
        policies: pendingPolicies.length,
        policyList: pendingPolicies.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category
        }))
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// ============================================================
// MINI PORTAL HOME - Everything in one response
// ============================================================

/**
 * @route GET /api/portal/home
 * @desc Get complete mini portal data in one call
 * @access Private
 */
router.get('/home', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile linked' });
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const entity = db.getEntityByCode(employee.entityCode);
    const today = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    
    // Attendance status
    const todayAttendance = db.getAttendanceByDate(employeeId, today);
    let clockStatus = 'NOT_CLOCKED_IN';
    let clockButtonText = '🕐 Clock In';
    if (todayAttendance?.clockIn && !todayAttendance?.clockOut) {
      clockStatus = 'CLOCKED_IN';
      clockButtonText = '🏠 Clock Out';
    } else if (todayAttendance?.clockOut) {
      clockStatus = 'COMPLETE';
      clockButtonText = '✅ Done';
    }

    // Leave balance
    const leaveBalance = db.getLeaveBalance(employeeId, currentYear);
    
    // Pending items
    const pendingLeave = db.getLeaveRequests(employeeId, 'pending');
    const pendingRequests = db.getEmployeeRequests(employeeId, 'pending');
    const pendingPolicies = db.getPolicies().filter(p => 
      p.requiresAcknowledgment && !db.hasAcknowledgedPolicy(employeeId, p.id)
    );

    // Upcoming events
    const upcomingEvents = db.getCalendarEvents(employee.entityCode, today)
      .slice(0, 3);

    // Recent announcements
    const announcements = db.getAnnouncements(employee.entityCode)
      .filter(a => a.isPublished)
      .slice(0, 3);

    res.json({
      // Greeting
      greeting: getGreeting(),
      employeeName: employee.firstName,
      
      // Quick Stats
      stats: {
        annualLeaveRemaining: leaveBalance?.annualLeave.remaining || 30,
        pendingRequests: pendingLeave.length + pendingRequests.length,
        pendingPolicies: pendingPolicies.length
      },
      
      // Clock Widget
      clock: {
        status: clockStatus,
        buttonText: clockButtonText,
        canTap: clockStatus !== 'COMPLETE',
        todayRecord: todayAttendance ? {
          clockIn: todayAttendance.clockIn,
          clockOut: todayAttendance.clockOut,
          totalHours: todayAttendance.totalHours
        } : null
      },
      
      // Quick Links
      quickLinks: [
        { id: 'leave', title: 'Leave Request', icon: '🏖️', url: '/leave/request', badge: pendingLeave.length || null },
        { id: 'documents', title: 'Documents', icon: '📄', url: '/requests/new', badge: pendingRequests.length || null },
        { id: 'attendance', title: 'Attendance', icon: '📊', url: '/attendance/history' },
        { id: 'balance', title: 'Leave Balance', icon: '📅', url: '/leave/balance' }
      ],
      
      // Profile Summary
      profile: {
        name: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        department: employee.department,
        entity: entity?.name || employee.entityCode,
        photo: null // Would be employee photo URL
      },
      
      // Upcoming
      upcoming: {
        events: upcomingEvents.map(e => ({
          title: e.title,
          date: formatDate(e.startDate),
          type: e.type
        })),
        announcements: announcements.map(a => ({
          title: a.title,
          type: a.type,
          priority: a.priority
        }))
      },
      
      // Action Items
      actionItems: [
        ...pendingPolicies.map(p => ({
          type: 'policy',
          title: `Acknowledge: ${p.title}`,
          url: `/policies/${p.id}/acknowledge`
        })),
        ...pendingLeave.map(l => ({
          type: 'leave',
          title: `Leave: ${l.status}`,
          reference: l.referenceNumber
        }))
      ].slice(0, 5)
    });

  } catch (error) {
    console.error('Get portal home error:', error);
    res.status(500).json({ error: 'Failed to get portal data' });
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-AE', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

function formatLeaveType(type: string): string {
  const types: Record<string, string> = {
    annual: 'Annual Leave',
    sick: 'Sick Leave',
    unpaid: 'Unpaid Leave',
    maternity: 'Maternity Leave',
    paternity: 'Paternity Leave',
    bereavement: 'Bereavement Leave',
    hajj: 'Hajj Leave',
    offset: 'Offset Day'
  };
  return types[type] || type;
}

function formatRequestType(type: string): string {
  const types: Record<string, string> = {
    salary_certificate: 'Salary Certificate',
    employment_letter: 'Employment Letter',
    noc: 'No Objection Certificate (NOC)',
    experience_letter: 'Experience Letter',
    bank_letter: 'Bank Letter',
    other: 'Other Document'
  };
  return types[type] || type;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#FF9800',
    processing: '#2196F3',
    approved: '#4CAF50',
    completed: '#4CAF50',
    rejected: '#F44336',
    cancelled: '#9E9E9E'
  };
  return colors[status] || '#9E9E9E';
}

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    pending: '⏳',
    processing: '🔄',
    approved: '✅',
    completed: '✅',
    rejected: '❌',
    cancelled: '🚫'
  };
  return icons[status] || '❓';
}

function getStatusMessage(type: string, status: string): string {
  if (type === 'leave') {
    const messages: Record<string, string> = {
      pending: 'Your leave request is waiting for approval.',
      approved: 'Your leave has been approved! Enjoy your time off.',
      rejected: 'Your leave request was not approved. Please contact HR for details.',
      cancelled: 'This leave request has been cancelled.'
    };
    return messages[status] || 'Status unknown';
  }
  
  const messages: Record<string, string> = {
    pending: 'Your request has been received and is in the queue.',
    processing: 'HR is currently preparing your document.',
    completed: 'Your document is ready! Check your email or collect from HR.',
    rejected: 'Your request could not be processed. Please contact HR.'
  };
  return messages[status] || 'Status unknown';
}

function buildTimeline(request: any): any[] {
  const timeline = [
    { 
      step: 'Submitted', 
      date: formatDate(request.createdAt), 
      completed: true,
      icon: '📝'
    },
    { 
      step: 'Under Review', 
      date: request.status !== 'pending' ? 'Reviewed' : 'Pending',
      completed: request.status !== 'pending',
      icon: '👀'
    }
  ];

  if (request.status === 'approved') {
    timeline.push({ 
      step: 'Approved', 
      date: request.approvalDate ? formatDate(request.approvalDate) : 'Approved',
      completed: true,
      icon: '✅'
    });
  } else if (request.status === 'rejected') {
    timeline.push({ 
      step: 'Rejected', 
      date: formatDate(request.updatedAt),
      completed: true,
      icon: '❌'
    });
  } else {
    timeline.push({ 
      step: 'Decision', 
      date: 'Pending',
      completed: false,
      icon: '⏳'
    });
  }

  return timeline;
}

function buildDocTimeline(request: any): any[] {
  const timeline = [
    { 
      step: 'Submitted', 
      date: formatDate(request.createdAt), 
      completed: true,
      icon: '📝'
    }
  ];

  if (request.status === 'processing' || request.status === 'completed') {
    timeline.push({ 
      step: 'Processing', 
      date: 'In progress',
      completed: true,
      icon: '🔄'
    });
  } else if (request.status !== 'rejected') {
    timeline.push({ 
      step: 'Processing', 
      date: 'Waiting',
      completed: false,
      icon: '⏳'
    });
  }

  if (request.status === 'completed') {
    timeline.push({ 
      step: 'Ready', 
      date: request.completedAt ? formatDate(request.completedAt) : 'Complete',
      completed: true,
      icon: '✅'
    });
  } else if (request.status === 'rejected') {
    timeline.push({ 
      step: 'Rejected', 
      date: formatDate(request.updatedAt),
      completed: true,
      icon: '❌'
    });
  } else {
    timeline.push({ 
      step: 'Ready', 
      date: 'Pending',
      completed: false,
      icon: '📄'
    });
  }

  return timeline;
}

export default router;
