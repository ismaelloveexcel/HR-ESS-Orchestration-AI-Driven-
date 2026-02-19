/**
 * Digital Business Card API
 * 
 * Generate vCards, QR codes for contacts, and manage
 * visibility settings per employee/entity.
 */

import { Router, Response } from 'express';
import { db } from '../database';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { 
  BusinessCard, 
  DEFAULT_VISIBILITY,
  generateVCard,
  generateContactQRData,
  EntityBusinessCardSettings,
  DEFAULT_ENTITY_SETTINGS
} from '../models/BusinessCard';

const router = Router();

// ⚠️ CRITICAL: In-memory storage - DATA WILL BE LOST ON SERVER RESTART
// This is NOT suitable for production use. All business card data and settings
// will be permanently lost when the server restarts, including the initialization
// below. Must be replaced with persistent database storage before production deployment.
const businessCards = new Map<string, BusinessCard>();
const entitySettings = new Map<string, EntityBusinessCardSettings>();

// Initialize default entity settings
['BAYNUNAH', 'ENTITY_B', 'ENTITY_C'].forEach(code => {
  const entity = db.getEntityByCode(code);
  if (entity) {
    entitySettings.set(code, {
      ...DEFAULT_ENTITY_SETTINGS,
      entityCode: code,
      entityName: entity.name,
      entityWebsite: 'https://baynunah.ae'
    });
  }
});

/**
 * @route GET /api/businesscard/my
 * @desc Get current user's business card
 * @access Private
 */
router.get('/my', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile linked' });
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get or create business card
    let card = businessCards.get(employeeId);
    
    if (!card) {
      // Create from employee data
      const entity = db.getEntityByCode(employee.entityCode);
      const settings = entitySettings.get(employee.entityCode);
      
      card = {
        employeeId: employee.id,
        entityCode: employee.entityCode,
        name: `${employee.firstName} ${employee.lastName}`,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        entityName: entity?.name || employee.entityCode,
        department: employee.department,
        email: employee.email,
        phone: employee.phone,
        mobile: employee.phone,
        location: 'UAE',
        website: settings?.entityWebsite,
        visibility: settings?.defaultVisibility || DEFAULT_VISIBILITY,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      businessCards.set(employeeId, card);
    }

    // Generate QR data
    const qrData = generateContactQRData(card);
    
    res.json({
      card,
      qrData,
      downloadUrl: `/api/businesscard/my/vcard`,
      qrUrl: `/api/businesscard/my/qr`
    });

  } catch (error) {
    console.error('Get business card error:', error);
    res.status(500).json({ error: 'Failed to get business card' });
  }
});

/**
 * @route GET /api/businesscard/my/vcard
 * @desc Download vCard file
 * @access Private
 */
router.get('/my/vcard', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile linked' });
    }

    const card = businessCards.get(employeeId);
    if (!card) {
      return res.status(404).json({ error: 'Business card not found. Visit /api/businesscard/my first.' });
    }

    const vcard = generateVCard(card);
    const filename = `${card.firstName}_${card.lastName}.vcf`.replace(/\s+/g, '_');

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(vcard);

  } catch (error) {
    console.error('Download vCard error:', error);
    res.status(500).json({ error: 'Failed to generate vCard' });
  }
});

/**
 * @route GET /api/businesscard/my/qr
 * @desc Get QR code for business card
 * @access Private
 */
router.get('/my/qr', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile linked' });
    }

    const card = businessCards.get(employeeId);
    if (!card) {
      return res.status(404).json({ error: 'Business card not found' });
    }

    const qrData = generateContactQRData(card);
    
    // Generate SVG QR code (placeholder - use 'qrcode' library in production)
    const qrSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250">
        <rect width="250" height="250" fill="white"/>
        <rect x="20" y="20" width="60" height="60" fill="black"/>
        <rect x="170" y="20" width="60" height="60" fill="black"/>
        <rect x="20" y="170" width="60" height="60" fill="black"/>
        <rect x="90" y="90" width="70" height="70" fill="black"/>
        <text x="125" y="140" text-anchor="middle" font-size="12" fill="white">CONTACT</text>
      </svg>
    `;

    res.json({
      employeeId,
      name: card.name,
      qrData,
      qrSvg: qrSvg.trim(),
      dataUrl: `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`,
      instructions: 'Scan to add contact to phone'
    });

  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

/**
 * @route GET /api/businesscard/:employeeId
 * @desc Get business card by employee ID
 * @access Private
 */
router.get('/:employeeId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId } = req.params;
    
    // Access control - employees can only see their own unless HR/Admin
    if (req.user?.role === 'employee' && req.user.employeeId !== employeeId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    let card = businessCards.get(employeeId);
    
    if (!card) {
      const entity = db.getEntityByCode(employee.entityCode);
      const settings = entitySettings.get(employee.entityCode);
      
      card = {
        employeeId: employee.id,
        entityCode: employee.entityCode,
        name: `${employee.firstName} ${employee.lastName}`,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        entityName: entity?.name || employee.entityCode,
        department: employee.department,
        email: employee.email,
        phone: employee.phone,
        visibility: settings?.defaultVisibility || DEFAULT_VISIBILITY,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      businessCards.set(employeeId, card);
    }

    res.json({
      card,
      qrData: generateContactQRData(card),
      vcardUrl: `/api/businesscard/${employeeId}/vcard`
    });

  } catch (error) {
    console.error('Get business card error:', error);
    res.status(500).json({ error: 'Failed to get business card' });
  }
});

/**
 * @route GET /api/businesscard/:employeeId/vcard
 * @desc Download vCard for employee
 * @access Private
 */
router.get('/:employeeId/vcard', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId } = req.params;
    
    const card = businessCards.get(employeeId);
    if (!card) {
      return res.status(404).json({ error: 'Business card not found' });
    }

    const vcard = generateVCard(card);
    const filename = `${card.firstName}_${card.lastName}.vcf`.replace(/\s+/g, '_');

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(vcard);

  } catch (error) {
    console.error('Download vCard error:', error);
    res.status(500).json({ error: 'Failed to generate vCard' });
  }
});

/**
 * @route PATCH /api/businesscard/:employeeId/visibility
 * @desc Update business card visibility settings
 * @access Private (Admin, HR, or self if allowed)
 */
router.patch('/:employeeId/visibility', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { visibility } = req.body;

    // Access control
    const isAdmin = ['admin', 'hr_manager'].includes(req.user?.role || '');
    const isSelf = req.user?.employeeId === employeeId;
    
    if (!isAdmin) {
      // Check if self-customization is allowed
      const employee = db.getEmployeeById(employeeId);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      const settings = entitySettings.get(employee.entityCode);
      if (!settings?.allowEmployeeCustomization && isSelf) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'Business card customization is managed by HR'
        });
      }
      
      if (!isSelf) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const card = businessCards.get(employeeId);
    if (!card) {
      return res.status(404).json({ error: 'Business card not found' });
    }

    // Update visibility
    card.visibility = {
      ...card.visibility,
      ...visibility
    };
    card.updatedAt = new Date().toISOString();
    businessCards.set(employeeId, card);

    res.json({
      message: 'Visibility settings updated',
      visibility: card.visibility
    });

  } catch (error) {
    console.error('Update visibility error:', error);
    res.status(500).json({ error: 'Failed to update visibility' });
  }
});

/**
 * @route PATCH /api/businesscard/:employeeId
 * @desc Update business card content
 * @access Private (Admin, HR only)
 */
router.patch('/:employeeId', authenticate, authorize('admin', 'hr_manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId } = req.params;
    const updates = req.body;

    const existingCard = businessCards.get(employeeId);
    if (!existingCard) {
      return res.status(404).json({ error: 'Business card not found' });
    }

    // Don't allow changing certain fields
    const { visibility, createdAt, employeeId: _, entityCode, ...allowedUpdates } = updates;

    const updatedCard: BusinessCard = {
      ...existingCard,
      ...allowedUpdates,
      updatedAt: new Date().toISOString()
    };
    businessCards.set(employeeId, updatedCard);

    res.json({
      message: 'Business card updated',
      card: updatedCard
    });

  } catch (error) {
    console.error('Update business card error:', error);
    res.status(500).json({ error: 'Failed to update business card' });
  }
});

/**
 * @route GET /api/businesscard/settings/:entityCode
 * @desc Get entity business card settings
 * @access Private (Admin, HR)
 */
router.get('/settings/:entityCode', authenticate, authorize('admin', 'hr_manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { entityCode } = req.params;
    
    const settings = entitySettings.get(entityCode);
    if (!settings) {
      return res.status(404).json({ error: 'Entity settings not found' });
    }

    res.json({ settings });

  } catch (error) {
    console.error('Get entity settings error:', error);
    res.status(500).json({ error: 'Failed to get entity settings' });
  }
});

/**
 * @route PATCH /api/businesscard/settings/:entityCode
 * @desc Update entity business card settings
 * @access Private (Admin only)
 */
router.patch('/settings/:entityCode', authenticate, authorize('admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { entityCode } = req.params;
    const updates = req.body;

    let existingSettings = entitySettings.get(entityCode);
    if (!existingSettings) {
      const entity = db.getEntityByCode(entityCode);
      if (!entity) {
        return res.status(404).json({ error: 'Entity not found' });
      }
      existingSettings = {
        ...DEFAULT_ENTITY_SETTINGS,
        entityCode,
        entityName: entity.name
      };
    }

    const updatedSettings: EntityBusinessCardSettings = {
      ...existingSettings,
      ...updates,
      entityCode, // Don't allow changing
      updatedAt: new Date().toISOString()
    };
    entitySettings.set(entityCode, updatedSettings);

    res.json({
      message: 'Entity settings updated',
      settings: updatedSettings
    });

  } catch (error) {
    console.error('Update entity settings error:', error);
    res.status(500).json({ error: 'Failed to update entity settings' });
  }
});

export default router;
