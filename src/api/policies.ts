/**
 * Policies API Routes
 * 
 * UAE labor law compliant policy management
 * with acknowledgment tracking.
 */

import { Router, Response } from 'express';
import { db } from '../database';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/policies
 * @desc Get all active policies
 * @access Private
 */
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category } = req.query;
    
    let policies = db.getPolicies(category as string, true);

    // Add acknowledgment status for current user
    const enrichedPolicies = policies.map(policy => {
      const acknowledged = req.user?.employeeId 
        ? db.hasAcknowledgedPolicy(req.user.employeeId, policy.id)
        : false;

      return {
        id: policy.id,
        code: policy.code,
        title: policy.title,
        category: policy.category,
        version: policy.version,
        effectiveDate: policy.effectiveDate,
        requiresAcknowledgment: policy.requiresAcknowledgment,
        acknowledged,
        updatedAt: policy.updatedAt
      };
    });

    // Get categories for filtering
    const categories = [...new Set(policies.map(p => p.category))];

    res.json({
      count: enrichedPolicies.length,
      policies: enrichedPolicies,
      categories
    });

  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({ error: 'Failed to get policies' });
  }
});

/**
 * @route GET /api/policies/:id
 * @desc Get policy by ID (with full content)
 * @access Private
 */
router.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const policy = db.getPolicyById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    const acknowledged = req.user?.employeeId 
      ? db.hasAcknowledgedPolicy(req.user.employeeId, policy.id)
      : false;

    const acknowledgments = db.getPolicyAcknowledgments(undefined, policy.id);

    res.json({
      ...policy,
      acknowledged,
      acknowledgmentCount: acknowledgments.length
    });

  } catch (error) {
    console.error('Get policy error:', error);
    res.status(500).json({ error: 'Failed to get policy' });
  }
});

/**
 * @route GET /api/policies/code/:code
 * @desc Get policy by code
 * @access Private
 */
router.get('/code/:code', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const policy = db.getPolicyByCode(req.params.code);
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json(policy);

  } catch (error) {
    console.error('Get policy by code error:', error);
    res.status(500).json({ error: 'Failed to get policy' });
  }
});

/**
 * @route POST /api/policies/:id/acknowledge
 * @desc Acknowledge a policy
 * @access Private
 */
router.post('/:id/acknowledge', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile linked' });
    }

    const policy = db.getPolicyById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    if (!policy.requiresAcknowledgment) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'This policy does not require acknowledgment'
      });
    }

    // Check if already acknowledged
    if (db.hasAcknowledgedPolicy(employeeId, policy.id)) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'You have already acknowledged this policy'
      });
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Create acknowledgment
    const acknowledgment = db.createPolicyAcknowledgment({
      policyId: policy.id,
      employeeId,
      entityCode: employee.entityCode,
      acknowledgedAt: new Date().toISOString(),
      ipAddress: req.ip
    });

    res.status(201).json({
      message: 'Policy acknowledged successfully',
      acknowledgment: {
        policyId: acknowledgment.policyId,
        policyTitle: policy.title,
        acknowledgedAt: acknowledgment.acknowledgedAt
      }
    });

  } catch (error) {
    console.error('Acknowledge policy error:', error);
    res.status(500).json({ error: 'Failed to acknowledge policy' });
  }
});

/**
 * @route GET /api/policies/pending/acknowledgments
 * @desc Get policies pending acknowledgment for current user
 * @access Private
 */
router.get('/pending/acknowledgments', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile linked' });
    }

    const policies = db.getPolicies(undefined, true)
      .filter(p => p.requiresAcknowledgment);

    const pending = policies.filter(policy => 
      !db.hasAcknowledgedPolicy(employeeId, policy.id)
    );

    res.json({
      count: pending.length,
      policies: pending.map(p => ({
        id: p.id,
        code: p.code,
        title: p.title,
        category: p.category,
        effectiveDate: p.effectiveDate
      }))
    });

  } catch (error) {
    console.error('Get pending acknowledgments error:', error);
    res.status(500).json({ error: 'Failed to get pending acknowledgments' });
  }
});

/**
 * @route GET /api/policies/:id/acknowledgments
 * @desc Get acknowledgments for a policy
 * @access Private (HR, Admin)
 */
router.get('/:id/acknowledgments', authenticate, authorize('admin', 'hr_manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const policy = db.getPolicyById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    const acknowledgments = db.getPolicyAcknowledgments(undefined, policy.id);

    // Enrich with employee info
    const enrichedAcknowledgments = acknowledgments.map(ack => {
      const employee = db.getEmployeeById(ack.employeeId);
      return {
        ...ack,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
        employeeNumber: employee?.employeeNumber,
        department: employee?.department
      };
    });

    // Get employees who haven't acknowledged
    const entityCode = req.user?.role !== 'admin' ? req.user?.entityCode : undefined;
    const allEmployees = db.getEmployees(entityCode).filter(e => e.isActive);
    const acknowledgedIds = new Set(acknowledgments.map(a => a.employeeId));
    
    const pending = allEmployees
      .filter(e => !acknowledgedIds.has(e.id))
      .map(e => ({
        employeeId: e.id,
        employeeName: `${e.firstName} ${e.lastName}`,
        employeeNumber: e.employeeNumber,
        department: e.department
      }));

    res.json({
      policy: {
        id: policy.id,
        code: policy.code,
        title: policy.title
      },
      acknowledged: {
        count: enrichedAcknowledgments.length,
        employees: enrichedAcknowledgments
      },
      pending: {
        count: pending.length,
        employees: pending
      },
      completionRate: Math.round((enrichedAcknowledgments.length / allEmployees.length) * 100)
    });

  } catch (error) {
    console.error('Get policy acknowledgments error:', error);
    res.status(500).json({ error: 'Failed to get acknowledgments' });
  }
});

/**
 * @route GET /api/policies/employee/:employeeId/acknowledgments
 * @desc Get all acknowledgments for an employee
 * @access Private
 */
router.get('/employee/:employeeId/acknowledgments', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId } = req.params;

    // Access control
    if (req.user?.role === 'employee' && req.user.employeeId !== employeeId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const acknowledgments = db.getPolicyAcknowledgments(employeeId);

    // Enrich with policy info
    const enrichedAcknowledgments = acknowledgments.map(ack => {
      const policy = db.getPolicyById(ack.policyId);
      return {
        ...ack,
        policyTitle: policy?.title,
        policyCode: policy?.code,
        policyCategory: policy?.category
      };
    });

    res.json({
      employeeId,
      count: enrichedAcknowledgments.length,
      acknowledgments: enrichedAcknowledgments
    });

  } catch (error) {
    console.error('Get employee acknowledgments error:', error);
    res.status(500).json({ error: 'Failed to get acknowledgments' });
  }
});

export default router;
