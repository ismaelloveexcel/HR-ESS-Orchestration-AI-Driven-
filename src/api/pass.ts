/**
 * Universal Pass API Routes
 * 
 * Unified pass system for Candidate, Manager, and Employee.
 * Supports QR code generation and wallet integration.
 */

import { Router, Response } from 'express';
import { db } from '../database';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { 
  UniversalPass, 
  PassType, 
  STAGE_CONFIGS, 
  DEFAULT_MENU_OPTIONS,
  createEmployeePass,
  PASS_DISPLAY,
  PassSupport,
  generatePassId
} from '../models/Pass';

const router = Router();

// ⚠️ CRITICAL: In-memory pass storage - DATA WILL BE LOST ON SERVER RESTART
// This is NOT suitable for production use. All pass data will be permanently lost
// when the server restarts. Must be replaced with persistent database storage
// before production deployment.
const passes = new Map<string, UniversalPass>();
const candidatePasses = new Map<string, UniversalPass>();

// Default support configuration
const DEFAULT_SUPPORT: PassSupport = {
  whatsapp: '+971500000000',
  email: 'hr@baynunah.ae',
  emergency: '+971500000001'
};

/**
 * @route GET /api/pass/my
 * @desc Get current user's pass
 * @access Private
 */
router.get('/my', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    const userRole = req.user?.role;
    
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile linked' });
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Determine pass type based on role
    let passType: PassType = 'employee';
    if (userRole === 'hr_manager' || userRole === 'manager') {
      passType = 'manager';
    }

    // Create or get pass
    const passId = `${passType.toUpperCase().substring(0, 3)}-${employee.entityCode.substring(0, 3)}-${new Date().getFullYear()}-${employee.employeeNumber}`;
    
    let pass = passes.get(passId);
    
    if (!pass) {
      // Create new pass
      pass = createEmployeePass(employee, DEFAULT_SUPPORT);
      pass.id = passId;
      pass.type = passType;
      
      if (passType === 'manager') {
        pass.menu.options = DEFAULT_MENU_OPTIONS.manager;
      }
      
      passes.set(passId, pass);
    }

    // Add dynamic data
    const currentYear = new Date().getFullYear();
    const leaveBalance = db.getLeaveBalance(employeeId, currentYear);
    const todayAttendance = db.getAttendanceByDate(employeeId, new Date().toISOString().split('T')[0]);
    const pendingRequests = db.getEmployeeRequests(employeeId, 'pending');

    // Enrich with live data
    const enrichedPass = {
      ...pass,
      qrCodeUrl: `/api/pass/${pass.id}/qr`,
      walletUrl: `/api/pass/${pass.id}/wallet`,
      profileUrl: `/api/pass/${pass.id}/profile`,
      liveData: {
        leaveBalance: leaveBalance ? {
          annual: leaveBalance.annualLeave.remaining,
          sick: leaveBalance.sickLeave.remaining,
          offset: leaveBalance.offsetDays.remaining
        } : null,
        todayStatus: todayAttendance ? {
          clockedIn: !!todayAttendance.clockIn,
          clockedOut: !!todayAttendance.clockOut,
          status: todayAttendance.status
        } : { clockedIn: false, clockedOut: false, status: 'not_clocked_in' },
        pendingItems: pendingRequests.length
      },
      display: PASS_DISPLAY[pass.type]
    };

    res.json({ pass: enrichedPass });

  } catch (error) {
    console.error('Get my pass error:', error);
    res.status(500).json({ error: 'Failed to get pass' });
  }
});

/**
 * @route GET /api/pass/:id
 * @desc Get pass by ID
 * @access Private
 */
router.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const pass = passes.get(req.params.id) || candidatePasses.get(req.params.id);
    
    if (!pass) {
      return res.status(404).json({ error: 'Pass not found' });
    }

    // Access control
    if (req.user?.role === 'employee') {
      // Employees can only see their own pass
      const employeeId = req.user.employeeId;
      if (pass.type === 'employee' && !pass.id.includes(employeeId || '')) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({
      pass: {
        ...pass,
        qrCodeUrl: `/api/pass/${pass.id}/qr`,
        walletUrl: `/api/pass/${pass.id}/wallet`,
        profileUrl: `/api/pass/${pass.id}/profile`,
        display: PASS_DISPLAY[pass.type]
      }
    });

  } catch (error) {
    console.error('Get pass error:', error);
    res.status(500).json({ error: 'Failed to get pass' });
  }
});

/**
 * @route GET /api/pass/:id/qr
 * @desc Get QR code for pass
 * @access Private
 */
router.get('/:id/qr', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const pass = passes.get(req.params.id) || candidatePasses.get(req.params.id);
    
    if (!pass) {
      return res.status(404).json({ error: 'Pass not found' });
    }

    // Generate QR code data URL
    // In production, use 'qrcode' library to generate actual QR
    const profileUrl = `${process.env.BASE_URL || 'https://ess.baynunah.ae'}/pass/${pass.id}/profile`;
    
    // Placeholder SVG QR code
    const qrSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="60" height="60" fill="black"/>
        <rect x="120" y="20" width="60" height="60" fill="black"/>
        <rect x="20" y="120" width="60" height="60" fill="black"/>
        <text x="100" y="105" text-anchor="middle" font-size="10" fill="black">${pass.id}</text>
      </svg>
    `;

    res.json({
      passId: pass.id,
      profileUrl,
      qrCode: {
        svg: qrSvg.trim(),
        dataUrl: `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h expiry
    });

  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

/**
 * @route GET /api/pass/:id/profile
 * @desc Get full profile for pass (QR destination)
 * @access Private
 */
router.get('/:id/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const pass = passes.get(req.params.id) || candidatePasses.get(req.params.id);
    
    if (!pass) {
      return res.status(404).json({ error: 'Pass not found' });
    }

    // Build comprehensive profile based on pass type
    let profile: any = {
      pass: {
        id: pass.id,
        type: pass.type,
        display: PASS_DISPLAY[pass.type]
      },
      personal: pass.personal,
      stage: pass.stage,
      support: pass.support
    };

    if (pass.type === 'employee') {
      // Get employee-specific data
      const employee = db.getEmployeeByNumber(pass.personal.employeeNumber || '');
      if (employee) {
        const currentYear = new Date().getFullYear();
        const leaveBalance = db.getLeaveBalance(employee.id, currentYear);
        const attendance = db.getAttendanceRecords(employee.id);
        const pendingLeave = db.getLeaveRequests(employee.id, 'pending');
        const pendingRequests = db.getEmployeeRequests(employee.id, 'pending');

        profile.employment = {
          employeeNumber: employee.employeeNumber,
          department: employee.department,
          position: employee.position,
          joinDate: employee.joinDate,
          contractType: employee.contractType,
          workSchedule: employee.workSchedule,
          yearsOfService: Math.floor((Date.now() - new Date(employee.joinDate).getTime()) / (365 * 24 * 60 * 60 * 1000))
        };

        profile.leaveBalance = leaveBalance ? {
          annual: leaveBalance.annualLeave,
          sick: leaveBalance.sickLeave,
          offset: leaveBalance.offsetDays
        } : null;

        profile.recentAttendance = attendance.slice(0, 10);
        
        profile.pendingItems = {
          leaveRequests: pendingLeave.length,
          documentRequests: pendingRequests.length
        };
      }
    }

    if (pass.type === 'candidate') {
      profile.evaluation = pass.evaluation;
      profile.documents = []; // Would list uploaded documents
      profile.timeline = pass.stage.labels.map((label, index) => ({
        stage: index + 1,
        label,
        status: index < pass.stage.current ? 'completed' : 
                index === pass.stage.current ? 'current' : 'pending',
        date: index < pass.stage.current ? '2025-01-15' : null
      }));
    }

    res.json({ profile });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * @route GET /api/pass/:id/wallet
 * @desc Generate wallet file (Apple Wallet / Google Wallet)
 * @access Private
 */
router.get('/:id/wallet', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { format = 'apple' } = req.query;
    const pass = passes.get(req.params.id) || candidatePasses.get(req.params.id);
    
    if (!pass) {
      return res.status(404).json({ error: 'Pass not found' });
    }

    // In production, use 'passkit-generator' for Apple Wallet
    // For now, return wallet configuration
    
    if (format === 'apple') {
      const applePassConfig = {
        formatVersion: 1,
        passTypeIdentifier: 'pass.ae.baynunah.hrpass',
        serialNumber: pass.id,
        teamIdentifier: process.env.APPLE_TEAM_ID || 'XXXXXXXXXX',
        organizationName: 'Baynunah',
        description: PASS_DISPLAY[pass.type].title,
        logoText: 'Baynunah HR',
        foregroundColor: 'rgb(255, 255, 255)',
        backgroundColor: PASS_DISPLAY[pass.type].primaryColor,
        generic: {
          primaryFields: [
            {
              key: 'name',
              label: 'NAME',
              value: pass.personal.name
            }
          ],
          secondaryFields: [
            {
              key: 'position',
              label: 'POSITION',
              value: pass.personal.position
            },
            {
              key: 'stage',
              label: 'STAGE',
              value: pass.stage.labels[pass.stage.current - 1]
            }
          ],
          backFields: [
            {
              key: 'id',
              label: 'PASS ID',
              value: pass.id
            },
            {
              key: 'status',
              label: 'STATUS',
              value: pass.stage.status
            },
            {
              key: 'support',
              label: 'SUPPORT',
              value: pass.support.email
            }
          ]
        },
        barcode: {
          format: 'PKBarcodeFormatQR',
          message: `${process.env.BASE_URL || 'https://ess.baynunah.ae'}/pass/${pass.id}`,
          messageEncoding: 'iso-8859-1'
        }
      };

      res.json({
        format: 'apple',
        config: applePassConfig,
        message: 'Apple Wallet pass generation requires signing certificates. This is the pass configuration.'
      });

    } else if (format === 'google') {
      const googlePassConfig = {
        issuerID: process.env.GOOGLE_WALLET_ISSUER_ID,
        classId: `${process.env.GOOGLE_WALLET_CLASS_ID}.${pass.type}`,
        objectId: pass.id,
        genericObject: {
          id: pass.id,
          classId: `${process.env.GOOGLE_WALLET_CLASS_ID}.${pass.type}`,
          genericType: 'GENERIC_TYPE_UNSPECIFIED',
          cardTitle: {
            defaultValue: { value: PASS_DISPLAY[pass.type].title }
          },
          header: {
            defaultValue: { value: pass.personal.name }
          },
          subheader: {
            defaultValue: { value: pass.personal.position }
          },
          barcode: {
            type: 'QR_CODE',
            value: `${process.env.BASE_URL || 'https://ess.baynunah.ae'}/pass/${pass.id}`
          }
        }
      };

      res.json({
        format: 'google',
        config: googlePassConfig,
        message: 'Google Wallet integration requires API setup. This is the pass configuration.'
      });

    } else {
      res.status(400).json({ error: 'Invalid format. Use: apple or google' });
    }

  } catch (error) {
    console.error('Generate wallet error:', error);
    res.status(500).json({ error: 'Failed to generate wallet pass' });
  }
});

/**
 * @route POST /api/pass/candidate
 * @desc Create a new candidate pass
 * @access Private (HR, Admin)
 */
router.post('/candidate', authenticate, authorize('admin', 'hr_manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      position,
      location,
      visa,
      expectedSalary,
      noticePeriod,
      relocationPreference
    } = req.body;

    if (!name || !email || !position) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name, email, and position are required'
      });
    }

    const entityCode = req.user?.entityCode || 'BAYNUNAH';
    const sequence = candidatePasses.size + 1;
    const passId = generatePassId('candidate', entityCode, sequence);

    const candidatePass: UniversalPass = {
      id: passId,
      type: 'candidate',
      entityCode,
      personal: {
        name,
        position,
        email,
        phone,
        location,
        visa,
        expectedSalary,
        noticePeriod,
        relocationPreference
      },
      stage: {
        current: 1,
        labels: STAGE_CONFIGS.candidate.labels,
        status: STAGE_CONFIGS.candidate.defaultStatus,
        statusType: 'info'
      },
      evaluation: {
        profileFit: undefined,
        softSkills: undefined,
        technicalSkills: undefined,
        interviewScore: undefined,
        overallScore: undefined,
        remarks: []
      },
      menu: {
        options: DEFAULT_MENU_OPTIONS.candidate
      },
      support: DEFAULT_SUPPORT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    candidatePasses.set(passId, candidatePass);

    res.status(201).json({
      message: 'Candidate pass created',
      pass: {
        ...candidatePass,
        qrCodeUrl: `/api/pass/${passId}/qr`,
        walletUrl: `/api/pass/${passId}/wallet`,
        profileUrl: `/api/pass/${passId}/profile`,
        display: PASS_DISPLAY.candidate
      }
    });

  } catch (error) {
    console.error('Create candidate pass error:', error);
    res.status(500).json({ error: 'Failed to create candidate pass' });
  }
});

/**
 * @route PATCH /api/pass/:id/stage
 * @desc Update pass stage
 * @access Private (HR, Admin)
 */
router.patch('/:id/stage', authenticate, authorize('admin', 'hr_manager', 'manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { stage, status, statusType } = req.body;
    
    const pass = passes.get(req.params.id) || candidatePasses.get(req.params.id);
    
    if (!pass) {
      return res.status(404).json({ error: 'Pass not found' });
    }

    // Validate stage
    if (stage && (stage < 1 || stage > pass.stage.labels.length)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Stage must be between 1 and ${pass.stage.labels.length}`
      });
    }

    // Update stage
    if (stage !== undefined) pass.stage.current = stage;
    if (status) pass.stage.status = status;
    if (statusType) pass.stage.statusType = statusType;
    pass.stage.lastUpdated = new Date().toISOString();
    pass.updatedAt = new Date().toISOString();

    // Save back
    if (pass.type === 'candidate') {
      candidatePasses.set(pass.id, pass);
    } else {
      passes.set(pass.id, pass);
    }

    res.json({
      message: 'Pass stage updated',
      pass: {
        id: pass.id,
        stage: pass.stage
      }
    });

  } catch (error) {
    console.error('Update pass stage error:', error);
    res.status(500).json({ error: 'Failed to update pass stage' });
  }
});

/**
 * @route POST /api/pass/:id/evaluation
 * @desc Add evaluation to candidate pass
 * @access Private (HR, Admin, Manager)
 */
router.post('/:id/evaluation', authenticate, authorize('admin', 'hr_manager', 'manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { profileFit, softSkills, technicalSkills, interviewScore, remark } = req.body;
    
    const pass = candidatePasses.get(req.params.id);
    
    if (!pass) {
      return res.status(404).json({ error: 'Pass not found or not a candidate pass' });
    }

    if (!pass.evaluation) {
      pass.evaluation = { remarks: [] };
    }

    // Update scores
    if (profileFit !== undefined) pass.evaluation.profileFit = profileFit;
    if (softSkills !== undefined) pass.evaluation.softSkills = softSkills;
    if (technicalSkills !== undefined) pass.evaluation.technicalSkills = technicalSkills;
    if (interviewScore !== undefined) pass.evaluation.interviewScore = interviewScore;

    // Calculate overall score
    const scores = [
      pass.evaluation.profileFit,
      pass.evaluation.softSkills,
      pass.evaluation.technicalSkills,
      pass.evaluation.interviewScore
    ].filter(s => s !== undefined) as number[];

    if (scores.length > 0) {
      pass.evaluation.overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    // Add remark if provided
    if (remark) {
      pass.evaluation.remarks = pass.evaluation.remarks || [];
      pass.evaluation.remarks.push({
        author: req.user?.username || 'Unknown',
        role: req.user?.role || 'unknown',
        content: remark,
        date: new Date().toISOString()
      });
    }

    pass.updatedAt = new Date().toISOString();
    candidatePasses.set(pass.id, pass);

    res.json({
      message: 'Evaluation updated',
      evaluation: pass.evaluation
    });

  } catch (error) {
    console.error('Add evaluation error:', error);
    res.status(500).json({ error: 'Failed to add evaluation' });
  }
});

/**
 * @route GET /api/pass/candidates
 * @desc List all candidate passes
 * @access Private (HR, Admin)
 */
router.get('/candidates/list', authenticate, authorize('admin', 'hr_manager', 'manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { stage, position } = req.query;
    
    let candidates = Array.from(candidatePasses.values());

    // Filter by entity for non-admins
    if (req.user?.role !== 'admin') {
      candidates = candidates.filter(c => c.entityCode === req.user?.entityCode);
    }

    // Apply filters
    if (stage) {
      candidates = candidates.filter(c => c.stage.current === parseInt(stage as string));
    }
    if (position) {
      candidates = candidates.filter(c => c.personal.position.toLowerCase().includes((position as string).toLowerCase()));
    }

    // Sort by updated date
    candidates.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    res.json({
      count: candidates.length,
      candidates: candidates.map(c => ({
        id: c.id,
        name: c.personal.name,
        position: c.personal.position,
        email: c.personal.email,
        stage: c.stage.current,
        stageLabel: c.stage.labels[c.stage.current - 1],
        status: c.stage.status,
        overallScore: c.evaluation?.overallScore,
        updatedAt: c.updatedAt
      }))
    });

  } catch (error) {
    console.error('List candidates error:', error);
    res.status(500).json({ error: 'Failed to list candidates' });
  }
});

/**
 * @route GET /api/pass/types
 * @desc Get pass type configurations
 * @access Authenticated
 */
router.get('/types/config', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    types: ['candidate', 'manager', 'employee'],
    stages: STAGE_CONFIGS,
    menuOptions: DEFAULT_MENU_OPTIONS,
    display: PASS_DISPLAY
  });
});

export default router;
