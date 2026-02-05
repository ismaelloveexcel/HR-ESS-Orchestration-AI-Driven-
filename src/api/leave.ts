import { Router, Request, Response } from 'express';
import { LeaveRequest, LeaveBalance } from '../models/Leave';

const router = Router();

// Mock databases
const leaveRequests = new Map<string, LeaveRequest>();
const leaveBalances = new Map<string, LeaveBalance>();

// Generate reference number
function generateReferenceNumber(): string {
  return `LV${Date.now().toString().slice(-8)}`;
}

// Submit leave request
router.post('/request', (req: Request, res: Response) => {
  const { employeeId, type, startDate, endDate, reason, documents } = req.body;
  
  if (!employeeId || !type || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const request: LeaveRequest = {
    id: `LR${Date.now()}`,
    referenceNumber: generateReferenceNumber(),
    employeeId,
    type,
    startDate,
    endDate,
    totalDays,
    reason,
    status: 'pending',
    documents,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  leaveRequests.set(request.id, request);
  res.status(201).json(request);
});

// Get leave requests for employee
router.get('/employee/:employeeId', (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const requests = Array.from(leaveRequests.values())
    .filter(r => r.employeeId === employeeId);
  
  res.json({ count: requests.length, requests });
});

// Get leave request by reference number
router.get('/reference/:refNumber', (req: Request, res: Response) => {
  const { refNumber } = req.params;
  const request = Array.from(leaveRequests.values())
    .find(r => r.referenceNumber === refNumber);
  
  if (!request) {
    return res.status(404).json({ error: 'Leave request not found' });
  }
  
  res.json(request);
});

// Update leave request status
router.patch('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, approvedBy, rejectionReason } = req.body;
  
  const request = leaveRequests.get(id);
  if (!request) {
    return res.status(404).json({ error: 'Leave request not found' });
  }
  
  request.status = status;
  request.updatedAt = new Date().toISOString();
  
  if (status === 'approved') {
    request.approvedBy = approvedBy;
    request.approvalDate = new Date().toISOString();
  } else if (status === 'rejected') {
    request.rejectionReason = rejectionReason;
  }
  
  leaveRequests.set(id, request);
  res.json(request);
});

// Get leave balance
router.get('/balance/:employeeId/:year', (req: Request, res: Response) => {
  const { employeeId, year } = req.params;
  const balanceKey = `${employeeId}-${year}`;
  
  let balance = leaveBalances.get(balanceKey);
  
  if (!balance) {
    // Initialize balance for new year
    balance = {
      employeeId,
      year: parseInt(year),
      annualLeave: {
        entitled: 30, // UAE standard
        used: 0,
        remaining: 30
      },
      sickLeave: {
        entitled: 90, // UAE standard (90 days total, first 15 full pay)
        used: 0,
        remaining: 90
      },
      offsetDays: {
        earned: 0,
        used: 0,
        remaining: 0
      },
      unpaidLeave: 0
    };
    leaveBalances.set(balanceKey, balance);
  }
  
  res.json(balance);
});

export default router;
