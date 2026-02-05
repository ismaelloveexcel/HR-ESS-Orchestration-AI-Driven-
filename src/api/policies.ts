import { Router, Request, Response } from 'express';
import { Policy, PolicyAcknowledgment, LaborLawEducation } from '../models/Policy';

const router = Router();

// Mock databases
const policies = new Map<string, Policy>();
const acknowledgments = new Map<string, PolicyAcknowledgment>();
const laborLawContent = new Map<string, LaborLawEducation>();

// Get all policies
router.get('/', (req: Request, res: Response) => {
  const { category, country, requiresAck } = req.query;
  
  let policyList = Array.from(policies.values())
    .filter(p => p.isActive)
    .filter(p => !category || p.category === category)
    .filter(p => !country || p.country === country)
    .filter(p => requiresAck === undefined || p.requiresAcknowledgment === (requiresAck === 'true'));
  
  res.json({ count: policyList.length, policies: policyList });
});

// Get policy by ID
router.get('/:id', (req: Request, res: Response) => {
  const policy = policies.get(req.params.id);
  if (!policy) {
    return res.status(404).json({ error: 'Policy not found' });
  }
  res.json(policy);
});

// Create policy
router.post('/', (req: Request, res: Response) => {
  const policy: Policy = {
    id: `POL${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  policies.set(policy.id, policy);
  res.status(201).json(policy);
});

// Acknowledge policy
router.post('/:policyId/acknowledge', (req: Request, res: Response) => {
  const { policyId } = req.params;
  const { employeeId, signature, ipAddress } = req.body;
  
  const policy = policies.get(policyId);
  if (!policy) {
    return res.status(404).json({ error: 'Policy not found' });
  }
  
  const acknowledgment: PolicyAcknowledgment = {
    id: `ACK${Date.now()}`,
    policyId,
    policyVersion: policy.version,
    employeeId,
    acknowledgedAt: new Date().toISOString(),
    ipAddress,
    signature
  };
  
  acknowledgments.set(acknowledgment.id, acknowledgment);
  res.status(201).json({
    message: 'Policy acknowledged successfully',
    acknowledgment
  });
});

// Get employee's acknowledgments
router.get('/acknowledgments/:employeeId', (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const empAcks = Array.from(acknowledgments.values())
    .filter(a => a.employeeId === employeeId);
  
  res.json({ count: empAcks.length, acknowledgments: empAcks });
});

// Get pending acknowledgments for employee
router.get('/pending-acks/:employeeId', (req: Request, res: Response) => {
  const { employeeId } = req.params;
  
  // Get all policies requiring acknowledgment
  const policiesRequiringAck = Array.from(policies.values())
    .filter(p => p.isActive && p.requiresAcknowledgment);
  
  // Get employee's existing acknowledgments
  const employeeAcks = Array.from(acknowledgments.values())
    .filter(a => a.employeeId === employeeId)
    .map(a => a.policyId);
  
  // Find unacknowledged policies
  const pending = policiesRequiringAck.filter(p => !employeeAcks.includes(p.id));
  
  res.json({ count: pending.length, policies: pending });
});

// Get labor law education content
router.get('/labor-law/topics', (req: Request, res: Response) => {
  const topics = Array.from(laborLawContent.values())
    .filter(l => l.isActive);
  
  res.json({ count: topics.length, topics });
});

// Get specific labor law topic
router.get('/labor-law/:id', (req: Request, res: Response) => {
  const topic = laborLawContent.get(req.params.id);
  if (!topic) {
    return res.status(404).json({ error: 'Topic not found' });
  }
  res.json(topic);
});

// Create labor law education content
router.post('/labor-law', (req: Request, res: Response) => {
  const content: LaborLawEducation = {
    id: `LAW${Date.now()}`,
    ...req.body,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  laborLawContent.set(content.id, content);
  res.status(201).json(content);
});

export default router;
