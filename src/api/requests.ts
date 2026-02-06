import { Router, Request, Response } from 'express';
import { EmployeeRequest } from '../models/EmployeeRequest';

const router = Router();

// Mock database
const employeeRequests = new Map<string, EmployeeRequest>();

// Generate reference number
function generateReferenceNumber(type: string): string {
  const prefix = type.substring(0, 2).toUpperCase();
  const timestamp = Date.now().toString().slice(-8);
  return `${prefix}${timestamp}`;
}

// Submit employee request
router.post('/', (req: Request, res: Response) => {
  const { employeeId, type, title, description, priority = 'medium', attachments } = req.body;
  
  if (!employeeId || !type || !title || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const request: EmployeeRequest = {
    id: `REQ${Date.now()}`,
    referenceNumber: generateReferenceNumber(type),
    employeeId,
    type,
    title,
    description,
    priority,
    status: 'submitted',
    attachments,
    statusHistory: [{
      status: 'submitted',
      timestamp: new Date().toISOString(),
      updatedBy: employeeId,
      notes: 'Request submitted'
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  employeeRequests.set(request.id, request);
  res.status(201).json({
    ...request,
    message: `Request submitted successfully. Reference number: ${request.referenceNumber}`
  });
});

// Get all requests for an employee
router.get('/employee/:employeeId', (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const requests = Array.from(employeeRequests.values())
    .filter(r => r.employeeId === employeeId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json({ count: requests.length, requests });
});

// Get request by reference number
router.get('/reference/:refNumber', (req: Request, res: Response) => {
  const { refNumber } = req.params;
  const request = Array.from(employeeRequests.values())
    .find(r => r.referenceNumber === refNumber);
  
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  
  res.json(request);
});

// Update request status
router.patch('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, updatedBy, notes, assignedTo } = req.body;
  
  const request = employeeRequests.get(id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  
  request.status = status;
  request.updatedAt = new Date().toISOString();
  
  if (assignedTo) {
    request.assignedTo = assignedTo;
  }
  
  if (status === 'completed') {
    request.completedAt = new Date().toISOString();
  }
  
  request.statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    updatedBy,
    notes
  });
  
  employeeRequests.set(id, request);
  res.json(request);
});

// Get all pending requests (for HR/Admin)
router.get('/pending', (req: Request, res: Response) => {
  const requests = Array.from(employeeRequests.values())
    .filter(r => r.status === 'submitted' || r.status === 'in-progress')
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  
  res.json({ count: requests.length, requests });
});

export default router;
