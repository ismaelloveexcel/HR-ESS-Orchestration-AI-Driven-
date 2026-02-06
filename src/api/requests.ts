/**
 * Employee Requests API Routes
 * 
 * Handle document requests like salary certificates,
 * employment letters, NOC, etc.
 */

import { Router, Response } from 'express';
import { db } from '../database';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Request types with processing times (in business days)
const REQUEST_TYPES = {
  salary_certificate: { name: 'Salary Certificate', processingDays: 2 },
  employment_letter: { name: 'Employment Letter', processingDays: 2 },
  noc: { name: 'No Objection Certificate', processingDays: 3 },
  experience_letter: { name: 'Experience Letter', processingDays: 3 },
  bank_letter: { name: 'Bank Letter', processingDays: 2 },
  other: { name: 'Other Request', processingDays: 5 }
};

/**
 * @route POST /api/requests
 * @desc Submit a new document request
 * @access Private
 */
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      type,
      purpose,
      urgency = 'normal',
      notes,
      additionalInfo
    } = req.body;

    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile linked' });
    }

    // Validation
    if (!type) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Request type is required'
      });
    }

    if (!REQUEST_TYPES[type as keyof typeof REQUEST_TYPES]) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Invalid request type. Valid types: ${Object.keys(REQUEST_TYPES).join(', ')}`
      });
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Create request
    const request = db.createEmployeeRequest({
      employeeId,
      entityCode: employee.entityCode,
      type,
      purpose,
      urgency,
      status: 'pending',
      notes: additionalInfo || notes
    });

    // Calculate expected completion date
    const requestInfo = REQUEST_TYPES[type as keyof typeof REQUEST_TYPES];
    const processingDays = urgency === 'urgent' 
      ? Math.ceil(requestInfo.processingDays / 2) 
      : requestInfo.processingDays;
    
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + processingDays);

    res.status(201).json({
      message: 'Request submitted successfully',
      request: {
        id: request.id,
        referenceNumber: request.referenceNumber,
        type: request.type,
        typeName: requestInfo.name,
        purpose: request.purpose,
        urgency: request.urgency,
        status: request.status,
        expectedCompletionDate: expectedDate.toISOString().split('T')[0],
        createdAt: request.createdAt
      }
    });

  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

/**
 * @route GET /api/requests
 * @desc Get requests (filtered by role)
 * @access Private
 */
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, type } = req.query;

    let requests;

    if (['admin', 'hr_manager'].includes(req.user?.role || '')) {
      // HR sees all requests in their entity
      const entityCode = req.user?.role !== 'admin' ? req.user?.entityCode : undefined;
      const employees = db.getEmployees(entityCode);
      const employeeIds = employees.map(e => e.id);
      
      requests = employeeIds.flatMap(id => db.getEmployeeRequests(id, status as string));
    } else {
      // Employees see only their own
      requests = db.getEmployeeRequests(req.user?.employeeId, status as string);
    }

    // Apply type filter
    if (type) {
      requests = requests.filter(r => r.type === type);
    }

    // Sort by created date (newest first)
    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Enrich with employee info
    const enrichedRequests = requests.map(r => {
      const employee = db.getEmployeeById(r.employeeId);
      const requestInfo = REQUEST_TYPES[r.type as keyof typeof REQUEST_TYPES];
      return {
        ...r,
        typeName: requestInfo?.name || r.type,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
        employeeNumber: employee?.employeeNumber
      };
    });

    res.json({
      count: enrichedRequests.length,
      requests: enrichedRequests
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

/**
 * @route GET /api/requests/:id
 * @desc Get request by ID
 * @access Private
 */
router.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = db.getEmployeeRequests();
    const request = requests.find(r => r.id === req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Access control
    if (req.user?.role === 'employee' && request.employeeId !== req.user.employeeId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const employee = db.getEmployeeById(request.employeeId);
    const requestInfo = REQUEST_TYPES[request.type as keyof typeof REQUEST_TYPES];

    res.json({
      ...request,
      typeName: requestInfo?.name,
      employee: employee ? {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeNumber: employee.employeeNumber,
        department: employee.department
      } : null
    });

  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to get request' });
  }
});

/**
 * @route GET /api/requests/reference/:refNumber
 * @desc Get request by reference number
 * @access Private
 */
router.get('/reference/:refNumber', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = db.getEmployeeRequests();
    const request = requests.find(r => r.referenceNumber === req.params.refNumber);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);

  } catch (error) {
    console.error('Get request by reference error:', error);
    res.status(500).json({ error: 'Failed to get request' });
  }
});

/**
 * @route PATCH /api/requests/:id/process
 * @desc Start processing a request
 * @access Private (HR, Admin)
 */
router.patch('/:id/process', authenticate, authorize('admin', 'hr_manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = db.getEmployeeRequests();
    const request = requests.find(r => r.id === req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Cannot process request with status: ${request.status}`
      });
    }

    const updated = db.updateEmployeeRequest(req.params.id, {
      status: 'processing',
      processedBy: req.user?.userId
    });

    res.json({
      message: 'Request is now being processed',
      request: updated
    });

  } catch (error) {
    console.error('Process request error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

/**
 * @route PATCH /api/requests/:id/complete
 * @desc Complete a request
 * @access Private (HR, Admin)
 */
router.patch('/:id/complete', authenticate, authorize('admin', 'hr_manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { documentUrl, notes } = req.body;

    const requests = db.getEmployeeRequests();
    const request = requests.find(r => r.id === req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (!['pending', 'processing'].includes(request.status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Cannot complete request with status: ${request.status}`
      });
    }

    const updated = db.updateEmployeeRequest(req.params.id, {
      status: 'completed',
      completedDocument: documentUrl,
      completedAt: new Date().toISOString(),
      processedBy: req.user?.userId,
      notes: notes || request.notes
    });

    res.json({
      message: 'Request completed successfully',
      request: updated
    });

  } catch (error) {
    console.error('Complete request error:', error);
    res.status(500).json({ error: 'Failed to complete request' });
  }
});

/**
 * @route PATCH /api/requests/:id/reject
 * @desc Reject a request
 * @access Private (HR, Admin)
 */
router.patch('/:id/reject', authenticate, authorize('admin', 'hr_manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;

    const requests = db.getEmployeeRequests();
    const request = requests.find(r => r.id === req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (!['pending', 'processing'].includes(request.status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Cannot reject request with status: ${request.status}`
      });
    }

    const updated = db.updateEmployeeRequest(req.params.id, {
      status: 'rejected',
      notes: reason || 'Request rejected'
    });

    res.json({
      message: 'Request rejected',
      request: updated
    });

  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

/**
 * @route GET /api/requests/types
 * @desc Get available request types
 * @access Public
 */
router.get('/types/list', (req, res: Response) => {
  try {
    const types = Object.entries(REQUEST_TYPES).map(([code, info]) => ({
      code,
      name: info.name,
      processingDays: info.processingDays
    }));

    res.json({ types });

  } catch (error) {
    console.error('Get request types error:', error);
    res.status(500).json({ error: 'Failed to get request types' });
  }
});

export default router;
