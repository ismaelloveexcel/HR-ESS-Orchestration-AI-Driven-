/**
 * Leave Management API Routes
 * 
 * UAE labor law compliant leave management including:
 * - 30 days annual leave
 * - 90 days sick leave (15 full pay, 30 half pay, 45 unpaid)
 * - Offset days from overtime
 * - Various special leaves (maternity, paternity, Hajj, etc.)
 */

import { Router, Response } from 'express';
import { db } from '../database';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// UAE Leave Entitlements
const UAE_LEAVE_RULES = {
  annual: {
    entitlement: 30, // days after 1 year
    entitlementFirstYear: 2, // days per month for first year
    maxCarryOver: 30, // days
    carryOverExpiry: 730 // days (2 years)
  },
  sick: {
    tier1: { days: 15, payRate: 1.0 }, // Full pay
    tier2: { days: 30, payRate: 0.5 }, // Half pay
    tier3: { days: 45, payRate: 0 }, // No pay
    total: 90,
    medicalCertificateRequired: 2 // After 2 consecutive days
  },
  maternity: {
    days: 60, // 45 full pay + 15 half pay (UAE new law)
    fullPayDays: 45,
    halfPayDays: 15
  },
  paternity: {
    days: 5 // UAE Federal Decree-Law No. 33 of 2021
  },
  bereavement: {
    spouse: 5,
    parent: 5,
    child: 5,
    sibling: 3,
    other: 3
  },
  hajj: {
    days: 30, // Once during employment, unpaid
    frequency: 'once'
  }
};

/**
 * Calculate business days between two dates (excluding Fridays for UAE)
 */
function calculateBusinessDays(startDate: string, endDate: string, workSchedule: '5_day' | '6_day' = '5_day'): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Friday (5) is off for all, Saturday (6) off for 5-day schedule
    if (dayOfWeek !== 5 && (workSchedule === '6_day' || dayOfWeek !== 6)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Check for overlapping leave requests
 */
function hasOverlappingLeave(employeeId: string, startDate: string, endDate: string, excludeId?: string): boolean {
  const requests = db.getLeaveRequests(employeeId)
    .filter(r => r.status !== 'rejected' && r.status !== 'cancelled' && r.id !== excludeId);
  
  return requests.some(r => {
    return (startDate <= r.endDate && endDate >= r.startDate);
  });
}

/**
 * @route POST /api/leave/request
 * @desc Submit a new leave request
 * @access Private
 */
router.post('/request', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      type,
      startDate,
      endDate,
      reason,
      documents,
      emergencyContact
    } = req.body;

    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile linked' });
    }

    // Validation
    if (!type || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Leave type, start date, and end date are required'
      });
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start > end) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Start date must be before end date'
      });
    }

    // Calculate days
    const totalDays = calculateBusinessDays(startDate, endDate, employee.workSchedule);

    // Check for overlapping leave
    if (hasOverlappingLeave(employeeId, startDate, endDate)) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'You have overlapping leave requests for this period'
      });
    }

    // Get leave balance
    const currentYear = new Date().getFullYear();
    let balance = db.getLeaveBalance(employeeId, currentYear);
    if (!balance) {
      balance = db.initializeLeaveBalance(employeeId, currentYear, employee.entityCode);
    }

    // Validate balance based on leave type
    let validationError: string | null = null;
    
    switch (type) {
      case 'annual':
        if (totalDays > balance.annualLeave.remaining) {
          validationError = `Insufficient annual leave. Available: ${balance.annualLeave.remaining} days, Requested: ${totalDays} days`;
        }
        break;
      case 'sick':
        if (totalDays > balance.sickLeave.remaining) {
          validationError = `Insufficient sick leave. Available: ${balance.sickLeave.remaining} days, Requested: ${totalDays} days`;
        }
        // Medical certificate required for > 2 days
        if (totalDays > UAE_LEAVE_RULES.sick.medicalCertificateRequired && !documents?.length) {
          validationError = 'Medical certificate required for sick leave exceeding 2 days';
        }
        break;
      case 'offset':
        if (totalDays > balance.offsetDays.remaining) {
          validationError = `Insufficient offset days. Available: ${balance.offsetDays.remaining} days, Requested: ${totalDays} days`;
        }
        break;
      case 'maternity':
        if (totalDays > UAE_LEAVE_RULES.maternity.days) {
          validationError = `Maternity leave cannot exceed ${UAE_LEAVE_RULES.maternity.days} days`;
        }
        break;
      case 'paternity':
        if (totalDays > UAE_LEAVE_RULES.paternity.days) {
          validationError = `Paternity leave cannot exceed ${UAE_LEAVE_RULES.paternity.days} days`;
        }
        break;
      case 'hajj':
        if (totalDays > UAE_LEAVE_RULES.hajj.days) {
          validationError = `Hajj leave cannot exceed ${UAE_LEAVE_RULES.hajj.days} days`;
        }
        break;
    }

    if (validationError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: validationError
      });
    }

    // Create leave request
    const request = db.createLeaveRequest({
      employeeId,
      entityCode: employee.entityCode,
      type,
      startDate,
      endDate,
      totalDays,
      reason,
      status: 'pending',
      documents
    });

    res.status(201).json({
      message: 'Leave request submitted successfully',
      request: {
        id: request.id,
        referenceNumber: request.referenceNumber,
        type: request.type,
        startDate: request.startDate,
        endDate: request.endDate,
        totalDays: request.totalDays,
        status: request.status,
        createdAt: request.createdAt
      },
      balance: {
        annual: balance.annualLeave,
        sick: balance.sickLeave,
        offset: balance.offsetDays
      }
    });

  } catch (error) {
    console.error('Leave request error:', error);
    res.status(500).json({ error: 'Failed to submit leave request' });
  }
});

/**
 * @route GET /api/leave/requests
 * @desc Get leave requests (filtered by role)
 * @access Private
 */
router.get('/requests', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, type, startDate, endDate } = req.query;
    
    let requests;
    
    if (['admin', 'hr_manager'].includes(req.user?.role || '')) {
      // HR can see all requests in their entity
      const entityCode = req.user?.role !== 'admin' ? req.user?.entityCode : undefined;
      const employees = db.getEmployees(entityCode);
      const employeeIds = employees.map(e => e.id);
      
      requests = employeeIds.flatMap(id => db.getLeaveRequests(id, status as string));
    } else if (req.user?.role === 'manager') {
      // Managers see their team's requests (simplified - would need manager mapping)
      requests = db.getLeaveRequests(req.user?.employeeId, status as string);
    } else {
      // Employees see only their own
      requests = db.getLeaveRequests(req.user?.employeeId, status as string);
    }

    // Apply filters
    if (type) {
      requests = requests.filter(r => r.type === type);
    }
    if (startDate) {
      requests = requests.filter(r => r.startDate >= (startDate as string));
    }
    if (endDate) {
      requests = requests.filter(r => r.endDate <= (endDate as string));
    }

    // Sort by created date (newest first)
    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Enrich with employee info
    const enrichedRequests = requests.map(r => {
      const employee = db.getEmployeeById(r.employeeId);
      return {
        ...r,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
        employeeNumber: employee?.employeeNumber,
        department: employee?.department
      };
    });

    res.json({
      count: enrichedRequests.length,
      requests: enrichedRequests
    });

  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ error: 'Failed to get leave requests' });
  }
});

/**
 * @route GET /api/leave/request/:id
 * @desc Get leave request by ID
 * @access Private
 */
router.get('/request/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const request = db.getLeaveRequestById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Access control
    if (req.user?.role === 'employee' && request.employeeId !== req.user.employeeId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const employee = db.getEmployeeById(request.employeeId);

    res.json({
      ...request,
      employee: employee ? {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeNumber: employee.employeeNumber,
        department: employee.department,
        position: employee.position
      } : null
    });

  } catch (error) {
    console.error('Get leave request error:', error);
    res.status(500).json({ error: 'Failed to get leave request' });
  }
});

/**
 * @route GET /api/leave/reference/:refNumber
 * @desc Get leave request by reference number
 * @access Private
 */
router.get('/reference/:refNumber', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const request = db.getLeaveRequestByReference(req.params.refNumber);
    
    if (!request) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.json(request);

  } catch (error) {
    console.error('Get leave by reference error:', error);
    res.status(500).json({ error: 'Failed to get leave request' });
  }
});

/**
 * @route PATCH /api/leave/request/:id/approve
 * @desc Approve leave request
 * @access Private (Manager, HR, Admin)
 */
router.patch('/request/:id/approve', authenticate, authorize('admin', 'hr_manager', 'manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const request = db.getLeaveRequestById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Cannot approve request with status: ${request.status}`
      });
    }

    // Update request
    const updated = db.updateLeaveRequest(req.params.id, {
      status: 'approved',
      approvedBy: req.user?.userId,
      approvalDate: new Date().toISOString()
    });

    // Deduct from leave balance
    const currentYear = new Date().getFullYear();
    const balance = db.getLeaveBalance(request.employeeId, currentYear);
    
    if (balance) {
      switch (request.type) {
        case 'annual':
          db.updateLeaveBalance(request.employeeId, currentYear, {
            annualLeave: {
              ...balance.annualLeave,
              used: balance.annualLeave.used + request.totalDays,
              remaining: balance.annualLeave.remaining - request.totalDays
            }
          });
          break;
        case 'sick':
          db.updateLeaveBalance(request.employeeId, currentYear, {
            sickLeave: {
              ...balance.sickLeave,
              used: balance.sickLeave.used + request.totalDays,
              remaining: balance.sickLeave.remaining - request.totalDays
            }
          });
          break;
        case 'offset':
          db.updateLeaveBalance(request.employeeId, currentYear, {
            offsetDays: {
              ...balance.offsetDays,
              used: balance.offsetDays.used + request.totalDays,
              remaining: balance.offsetDays.remaining - request.totalDays
            }
          });
          break;
        case 'unpaid':
          db.updateLeaveBalance(request.employeeId, currentYear, {
            unpaidLeave: balance.unpaidLeave + request.totalDays
          });
          break;
      }
    }

    res.json({
      message: 'Leave request approved',
      request: updated
    });

  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ error: 'Failed to approve leave request' });
  }
});

/**
 * @route PATCH /api/leave/request/:id/reject
 * @desc Reject leave request
 * @access Private (Manager, HR, Admin)
 */
router.patch('/request/:id/reject', authenticate, authorize('admin', 'hr_manager', 'manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;
    
    const request = db.getLeaveRequestById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Cannot reject request with status: ${request.status}`
      });
    }

    const updated = db.updateLeaveRequest(req.params.id, {
      status: 'rejected',
      rejectionReason: reason || 'Request rejected by approver'
    });

    res.json({
      message: 'Leave request rejected',
      request: updated
    });

  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ error: 'Failed to reject leave request' });
  }
});

/**
 * @route PATCH /api/leave/request/:id/cancel
 * @desc Cancel leave request
 * @access Private
 */
router.patch('/request/:id/cancel', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const request = db.getLeaveRequestById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Only owner can cancel
    if (request.employeeId !== req.user?.employeeId && !['admin', 'hr_manager'].includes(req.user?.role || '')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!['pending', 'approved'].includes(request.status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Cannot cancel request with status: ${request.status}`
      });
    }

    // If was approved, restore balance
    if (request.status === 'approved') {
      const currentYear = new Date().getFullYear();
      const balance = db.getLeaveBalance(request.employeeId, currentYear);
      
      if (balance) {
        switch (request.type) {
          case 'annual':
            db.updateLeaveBalance(request.employeeId, currentYear, {
              annualLeave: {
                ...balance.annualLeave,
                used: balance.annualLeave.used - request.totalDays,
                remaining: balance.annualLeave.remaining + request.totalDays
              }
            });
            break;
          case 'sick':
            db.updateLeaveBalance(request.employeeId, currentYear, {
              sickLeave: {
                ...balance.sickLeave,
                used: balance.sickLeave.used - request.totalDays,
                remaining: balance.sickLeave.remaining + request.totalDays
              }
            });
            break;
          case 'offset':
            db.updateLeaveBalance(request.employeeId, currentYear, {
              offsetDays: {
                ...balance.offsetDays,
                used: balance.offsetDays.used - request.totalDays,
                remaining: balance.offsetDays.remaining + request.totalDays
              }
            });
            break;
        }
      }
    }

    const updated = db.updateLeaveRequest(req.params.id, {
      status: 'cancelled'
    });

    res.json({
      message: 'Leave request cancelled',
      request: updated
    });

  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ error: 'Failed to cancel leave request' });
  }
});

/**
 * @route GET /api/leave/balance/:employeeId/:year
 * @desc Get leave balance for an employee
 * @access Private
 */
router.get('/balance/:employeeId/:year', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId, year } = req.params;

    // Access control
    if (req.user?.role === 'employee' && req.user.employeeId !== employeeId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    let balance = db.getLeaveBalance(employeeId, parseInt(year));
    if (!balance) {
      balance = db.initializeLeaveBalance(employeeId, parseInt(year), employee.entityCode);
    }

    res.json({
      employeeId,
      year: parseInt(year),
      balance: {
        annual: balance.annualLeave,
        sick: balance.sickLeave,
        offset: balance.offsetDays,
        unpaid: balance.unpaidLeave
      },
      entitlements: UAE_LEAVE_RULES
    });

  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ error: 'Failed to get leave balance' });
  }
});

/**
 * @route GET /api/leave/calendar
 * @desc Get team leave calendar
 * @access Private
 */
router.get('/calendar', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { month, year, department } = req.query;
    
    const m = parseInt(month as string) || new Date().getMonth() + 1;
    const y = parseInt(year as string) || new Date().getFullYear();
    
    const startDate = `${y}-${m.toString().padStart(2, '0')}-01`;
    const endDate = `${y}-${m.toString().padStart(2, '0')}-31`;

    // Get employees based on role
    let employees = db.getEmployees(
      req.user?.role !== 'admin' ? req.user?.entityCode : undefined
    ).filter(e => e.isActive);

    if (department) {
      employees = employees.filter(e => e.department === department);
    }

    // Get approved leave for the period
    const leaveCalendar = employees.map(employee => {
      const leaves = db.getLeaveRequests(employee.id, 'approved')
        .filter(l => l.startDate <= endDate && l.endDate >= startDate);
      
      return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        leaves: leaves.map(l => ({
          id: l.id,
          type: l.type,
          startDate: l.startDate,
          endDate: l.endDate,
          totalDays: l.totalDays
        }))
      };
    }).filter(e => e.leaves.length > 0);

    res.json({
      period: { month: m, year: y },
      calendar: leaveCalendar
    });

  } catch (error) {
    console.error('Get leave calendar error:', error);
    res.status(500).json({ error: 'Failed to get leave calendar' });
  }
});

export default router;
