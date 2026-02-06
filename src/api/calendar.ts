import { Router, Request, Response } from 'express';
import { CalendarEvent, Announcement } from '../models/Calendar';

const router = Router();

// Mock databases
const calendarEvents = new Map<string, CalendarEvent>();
const announcements = new Map<string, Announcement>();

// Get all calendar events
router.get('/events', (req: Request, res: Response) => {
  const { startDate, endDate, type } = req.query;
  
  let events = Array.from(calendarEvents.values())
    .filter(e => !startDate || e.startDate >= startDate)
    .filter(e => !endDate || e.startDate <= endDate)
    .filter(e => !type || e.type === type)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  res.json({ count: events.length, events });
});

// Create calendar event
router.post('/events', (req: Request, res: Response) => {
  const event: CalendarEvent = {
    id: `EVT${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  calendarEvents.set(event.id, event);
  res.status(201).json(event);
});

// Get upcoming events (next 30 days)
router.get('/events/upcoming', (req: Request, res: Response) => {
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const events = Array.from(calendarEvents.values())
    .filter(e => {
      const eventDate = new Date(e.startDate);
      return eventDate >= today && eventDate <= thirtyDaysLater;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  res.json({ count: events.length, events });
});

// Get all announcements
router.get('/announcements', (req: Request, res: Response) => {
  const { type, entity } = req.query;
  
  const today = new Date().toISOString();
  let activeAnnouncements = Array.from(announcements.values())
    .filter(a => a.isActive)
    .filter(a => !a.expiryDate || a.expiryDate >= today)
    .filter(a => !type || a.type === type)
    .filter(a => !entity || a.entity === entity)
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  
  res.json({ count: activeAnnouncements.length, announcements: activeAnnouncements });
});

// Create announcement
router.post('/announcements', (req: Request, res: Response) => {
  const announcement: Announcement = {
    id: `ANN${Date.now()}`,
    ...req.body,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  announcements.set(announcement.id, announcement);
  res.status(201).json(announcement);
});

// Get birthdays for current month
router.get('/birthdays', (req: Request, res: Response) => {
  // This would normally query employee birthdates
  // For now, returning sample data
  res.json({
    message: 'Birthday announcements for current month',
    birthdays: []
  });
});

export default router;
