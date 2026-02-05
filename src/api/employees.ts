/**
 * Employee Management API Routes
 * 
 * Full CRUD operations for employee records.
 * Multi-entity aware with proper authorization.
 */

import { Router, Response } from 'express';
import { db } from '../database';
import { authenticate, authorize, authorizeEntity, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/employees
 * @desc Get all employees (filtered by entity for non-admins)
 * @access Private (All authenticated users)
 */
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { department, position, isActive, search } = req.query;
    
    // Get employees based on user's role
    let entityCode: string | undefined;
    if (req.user?.role !== 'admin') {
      entityCode = req.user?.entityCode;
    }

    let employees = db.getEmployees(entityCode);

    // Apply filters
    if (department) {
      employees = employees.filter(e => e.department === department);
    }
    if (position) {
      employees = employees.filter(e => e.position === position);
    }
    if (isActive !== undefined) {
      employees = employees.filter(e => e.isActive === (isActive === 'true'));
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      employees = employees.filter(e => 
        e.firstName.toLowerCase().includes(searchLower) ||
        e.lastName.toLowerCase().includes(searchLower) ||
        e.email.toLowerCase().includes(searchLower) ||
        e.employeeNumber.toLowerCase().includes(searchLower)
      );
    }

    // Get unique departments for filtering
    const departments = [...new Set(db.getEmployees(entityCode).map(e => e.department))];
    const positions = [...new Set(db.getEmployees(entityCode).map(e => e.position))];

    res.json({
      count: employees.length,
      employees: employees.map(e => ({
        id: e.id,
        employeeNumber: e.employeeNumber,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        position: e.position,
        department: e.department,
        joinDate: e.joinDate,
        isActive: e.isActive,
        entityCode: e.entityCode
      })),
      filters: {
        departments,
        positions
      }
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to get employees' });
  }
});

/**
 * @route GET /api/employees/:id
 * @desc Get employee by ID
 * @access Private
 */
router.get('/:id', authenticate, authorizeEntity, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = db.getEmployeeById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check entity access for non-admins
    if (req.user?.role !== 'admin' && employee.entityCode !== req.user?.entityCode) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get manager info if exists
    let manager = null;
    if (employee.managerId) {
      const managerData = db.getEmployeeById(employee.managerId);
      if (managerData) {
        manager = {
          id: managerData.id,
          name: `${managerData.firstName} ${managerData.lastName}`,
          position: managerData.position
        };
      }
    }

    // Get entity info
    const entity = db.getEntityByCode(employee.entityCode);

    res.json({
      ...employee,
      password: undefined, // Never expose password fields
      manager,
      entity: entity ? {
        code: entity.code,
        name: entity.name
      } : null
    });

  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Failed to get employee' });
  }
});

/**
 * @route POST /api/employees
 * @desc Create new employee
 * @access Private (Admin, HR Manager)
 */
router.post('/', authenticate, authorize('admin', 'hr_manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      employeeNumber,
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      managerId,
      joinDate,
      contractType = 'permanent',
      workSchedule = '5_day',
      nationality,
      emiratesId,
      passportNumber,
      visaStatus,
      visaExpiry,
      bankName,
      bankAccount,
      salary,
      entityCode
    } = req.body;

    // Validation
    if (!employeeNumber || !firstName || !lastName || !email || !position || !department) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Employee number, name, email, position, and department are required'
      });
    }

    // Use user's entity if not admin
    const targetEntity = req.user?.role === 'admin' && entityCode 
      ? entityCode 
      : req.user?.entityCode;

    // Check for duplicate employee number
    const existing = db.getEmployeeByNumber(employeeNumber);
    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Employee number already exists'
      });
    }

    // Check for duplicate email
    if (db.getEmployeeByEmail(email)) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email already registered'
      });
    }

    // Validate entity
    const entity = db.getEntityByCode(targetEntity!);
    if (!entity) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid entity code'
      });
    }

    // Validate manager if provided
    if (managerId) {
      const manager = db.getEmployeeById(managerId);
      if (!manager) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Manager not found'
        });
      }
    }

    const employee = db.createEmployee({
      employeeNumber,
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      managerId,
      joinDate: joinDate || new Date().toISOString().split('T')[0],
      contractType,
      workSchedule,
      nationality,
      emiratesId,
      passportNumber,
      visaStatus,
      visaExpiry,
      bankName,
      bankAccount,
      salary,
      entityCode: targetEntity!,
      isActive: true
    });

    // Initialize leave balance for current year
    const currentYear = new Date().getFullYear();
    db.initializeLeaveBalance(employee.id, currentYear, targetEntity!);

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        ...employee,
        salary: undefined // Hide salary in response
      }
    });

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

/**
 * @route PUT /api/employees/:id
 * @desc Update employee
 * @access Private (Admin, HR Manager)
 */
router.put('/:id', authenticate, authorize('admin', 'hr_manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = db.getEmployeeById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check entity access for non-admins
    if (req.user?.role !== 'admin' && employee.entityCode !== req.user?.entityCode) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Don't allow changing certain fields
    const { id, employeeNumber, entityCode, createdAt, ...updates } = req.body;

    // Check email uniqueness if changing email
    if (updates.email && updates.email !== employee.email) {
      const existingEmail = db.getEmployeeByEmail(updates.email);
      if (existingEmail) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Email already registered'
        });
      }
    }

    const updated = db.updateEmployee(req.params.id, updates);

    res.json({
      message: 'Employee updated successfully',
      employee: {
        ...updated,
        salary: undefined
      }
    });

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

/**
 * @route DELETE /api/employees/:id
 * @desc Delete (deactivate) employee
 * @access Private (Admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = db.getEmployeeById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Soft delete - just deactivate
    db.updateEmployee(req.params.id, { isActive: false });

    res.json({ message: 'Employee deactivated successfully' });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

/**
 * @route GET /api/employees/:id/summary
 * @desc Get employee summary with attendance and leave info
 * @access Private
 */
router.get('/:id/summary', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = db.getEmployeeById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check access
    if (req.user?.role === 'employee' && req.user.employeeId !== employee.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Get leave balance
    let leaveBalance = db.getLeaveBalance(employee.id, currentYear);
    if (!leaveBalance) {
      leaveBalance = db.initializeLeaveBalance(employee.id, currentYear, employee.entityCode);
    }

    // Get attendance for current month
    const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
    const endOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`;
    const attendance = db.getAttendanceRecords(employee.id, startOfMonth, endOfMonth);

    // Get pending requests
    const pendingLeave = db.getLeaveRequests(employee.id, 'pending');
    const pendingRequests = db.getEmployeeRequests(employee.id, 'pending');

    res.json({
      employee: {
        id: employee.id,
        employeeNumber: employee.employeeNumber,
        name: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        department: employee.department,
        joinDate: employee.joinDate
      },
      leaveBalance: {
        annual: leaveBalance.annualLeave,
        sick: leaveBalance.sickLeave,
        offset: leaveBalance.offsetDays
      },
      attendance: {
        month: currentMonth,
        year: currentYear,
        daysPresent: attendance.filter(a => a.status === 'present').length,
        daysLate: attendance.filter(a => a.status === 'late').length,
        totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
        overtimeHours: attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0)
      },
      pendingItems: {
        leaveRequests: pendingLeave.length,
        documentRequests: pendingRequests.length
      }
    });

  } catch (error) {
    console.error('Get employee summary error:', error);
    res.status(500).json({ error: 'Failed to get employee summary' });
  }
});

/**
 * @route GET /api/employees/department/:department
 * @desc Get employees by department
 * @access Private
 */
router.get('/department/:department', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const entityCode = req.user?.role !== 'admin' ? req.user?.entityCode : undefined;
    
    const employees = db.getEmployees(entityCode)
      .filter(e => e.department === req.params.department && e.isActive);

    res.json({
      department: req.params.department,
      count: employees.length,
      employees: employees.map(e => ({
        id: e.id,
        employeeNumber: e.employeeNumber,
        name: `${e.firstName} ${e.lastName}`,
        position: e.position,
        email: e.email
      }))
    });

  } catch (error) {
    console.error('Get department employees error:', error);
    res.status(500).json({ error: 'Failed to get department employees' });
  }
});

export default router;
