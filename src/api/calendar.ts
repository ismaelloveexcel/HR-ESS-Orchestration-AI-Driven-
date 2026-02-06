/**
 * Calendar & Announcements API Routes
 * 
 * Handles company calendar events, holidays, training,
 * and announcements including birthdays and work anniversaries.
 */

import { Router, Response } from 'express';
import { db } from '../database';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/calendar/events
 * @desc Get calendar events
 * @access Private
 */
router.get('/events', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { month, year, type } = req.query;
    
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (month && year) {
      const m = parseInt(month as string);
      const y = parseInt(year as string);
      startDate = `${y}-${m.toString().padStart(2, '0')}-01`;
      endDate = `${y}-${m.toString().padStart(2, '0')}-31`;
    }

    const entityCode = req.user?.role !== 'admin' ? req.user?.entityCode : undefined;
    let events = db.getCalendarEvents(entityCode, startDate, endDate, type as string);

    // Sort by date
    events.sort((a, b) => a.startDate.localeCompare(b.startDate));

    // Group by type for easier frontend rendering
    const grouped = events.reduce((acc, event) => {
      const key = event.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {} as Record<string, typeof events>);

    res.json({
      period: startDate && endDate ? { startDate, endDate } : 'all',
      count: events.length,
      events,
      grouped
    });

  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

/**
 * @route GET /api/calendar/holidays
 * @desc Get public holidays
 * @access Private
 */
router.get('/holidays', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { year } = req.query;
    
    const y = parseInt(year as string) || new Date().getFullYear();
    const startDate = `${y}-01-01`;
    const endDate = `${y}-12-31`;

    const entityCode = req.user?.role !== 'admin' ? req.user?.entityCode : undefined;
    const holidays = db.getCalendarEvents(entityCode, startDate, endDate, 'holiday');

    // Sort by date
    holidays.sort((a, b) => a.startDate.localeCompare(b.startDate));

    res.json({
      year: y,
      count: holidays.length,
      holidays: holidays.map(h => ({
        id: h.id,
        title: h.title,
        startDate: h.startDate,
        endDate: h.endDate || h.startDate,
        days: h.endDate 
          ? Math.ceil((new Date(h.endDate).getTime() - new Date(h.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
          : 1
      }))
    });

  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({ error: 'Failed to get holidays' });
  }
});

/**
 * @route GET /api/calendar/upcoming
 * @desc Get upcoming events (next 30 days)
 * @access Private
 */
router.get('/upcoming', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const startDate = today.toISOString().split('T')[0];
    const endDate = futureDate.toISOString().split('T')[0];

    const entityCode = req.user?.role !== 'admin' ? req.user?.entityCode : undefined;
    const events = db.getCalendarEvents(entityCode, startDate, endDate);

    // Also get birthdays and work anniversaries from employees
    const employees = db.getEmployees(entityCode).filter(e => e.isActive);
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // Find birthdays this month (would need birthDate field in employee)
    // For now, use joinDate for work anniversaries
    const workAnniversaries = employees
      .filter(e => {
        const joinDate = new Date(e.joinDate);
        return joinDate.getMonth() + 1 === currentMonth;
      })
      .map(e => ({
        id: `anniversary-${e.id}`,
        title: `${e.firstName} ${e.lastName} - Work Anniversary`,
        type: 'work_anniversary',
        startDate: e.joinDate,
        employeeId: e.id,
        yearsOfService: today.getFullYear() - new Date(e.joinDate).getFullYear()
      }));

    // Sort all events by date
    const allEvents = [...events, ...workAnniversaries]
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    res.json({
      period: { startDate, endDate },
      count: allEvents.length,
      events: allEvents
    });

  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ error: 'Failed to get upcoming events' });
  }
});

/**
 * @route POST /api/calendar/events
 * @desc Create a calendar event
 * @access Private (HR, Admin)
 */
router.post('/events', authenticate, authorize('admin', 'hr_manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      allDay = true,
      location,
      isRecurring = false,
      recurringPattern,
      targetAudience = 'all',
      targetDepartments,
      targetEmployees
    } = req.body;

    // Validation
    if (!title || !type || !startDate) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title, type, and start date are required'
      });
    }

    const entityCode = req.user?.role === 'admin' && req.body.entityCode 
      ? req.body.entityCode 
      : req.user?.entityCode || 'ALL';

    const event = db.createCalendarEvent({
      entityCode,
      title,
      description,
      type,
      startDate,
      endDate,
      allDay,
      location,
      isRecurring,
      recurringPattern,
      targetAudience,
      targetDepartments,
      targetEmployees,
      createdBy: req.user?.userId || 'system'
    });

    res.status(201).json({
      message: 'Event created successfully',
      event
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * @route GET /api/calendar/announcements
 * @desc Get announcements
 * @access Private
 */
router.get('/announcements', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, limit } = req.query;
    
    const entityCode = req.user?.role !== 'admin' ? req.user?.entityCode : undefined;
    let announcements = db.getAnnouncements(entityCode, type as string, true);

    // Filter out expired announcements
    const today = new Date().toISOString().split('T')[0];
    announcements = announcements.filter(a => !a.expiryDate || a.expiryDate >= today);

    // Sort by priority and date
    announcements.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });

    // Apply limit
    if (limit) {
      announcements = announcements.slice(0, parseInt(limit as string));
    }

    res.json({
      count: announcements.length,
      announcements
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to get announcements' });
  }
});

/**
 * @route POST /api/calendar/announcements
 * @desc Create an announcement
 * @access Private (HR, Admin)
 */
router.post('/announcements', authenticate, authorize('admin', 'hr_manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      content,
      type = 'general',
      priority = 'medium',
      targetAudience = 'all',
      targetDepartments,
      publishDate,
      expiryDate
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title and content are required'
      });
    }

    const entityCode = req.user?.role === 'admin' && req.body.entityCode 
      ? req.body.entityCode 
      : req.user?.entityCode || 'ALL';

    const announcement = db.createAnnouncement({
      entityCode,
      title,
      content,
      type,
      priority,
      targetAudience,
      targetDepartments,
      publishDate: publishDate || new Date().toISOString().split('T')[0],
      expiryDate,
      isPublished: true,
      createdBy: req.user?.userId || 'system'
    });

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

/**
 * @route GET /api/calendar/today
 * @desc Get today's events and announcements summary
 * @access Private
 */
router.get('/today', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const entityCode = req.user?.role !== 'admin' ? req.user?.entityCode : undefined;

    // Get today's events
    const events = db.getCalendarEvents(entityCode, today, today);

    // Get active announcements
    let announcements = db.getAnnouncements(entityCode, undefined, true);
    announcements = announcements.filter(a => 
      a.publishDate <= today && (!a.expiryDate || a.expiryDate >= today)
    );

    // High priority items
    const highPriorityAnnouncements = announcements.filter(a => a.priority === 'high');

    res.json({
      date: today,
      events: {
        count: events.length,
        items: events
      },
      announcements: {
        count: announcements.length,
        highPriority: highPriorityAnnouncements.length,
        items: announcements.slice(0, 5) // Top 5
      }
    });

  } catch (error) {
    console.error('Get today summary error:', error);
    res.status(500).json({ error: 'Failed to get today summary' });
  }
});

export default router;
