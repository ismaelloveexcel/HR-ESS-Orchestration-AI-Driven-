export interface CalendarEvent {
  id: string;
  title: string;
  type: 'deadline' | 'training' | 'webinar' | 'meeting' | 'holiday' | 'event' | 'birthday' | 'announcement';
  description?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  targetAudience: 'all' | 'entity' | 'department' | 'specific';
  entities?: string[];
  departments?: string[];
  specificEmployees?: string[];
  registrationRequired: boolean;
  registrationLink?: string;
  maxParticipants?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  type: 'birthday' | 'new-joiner' | 'leaver' | 'promotion' | 'achievement' | 'general';
  title: string;
  content: string;
  employeeId?: string; // For employee-specific announcements
  entity?: string;
  department?: string;
  priority: 'low' | 'normal' | 'high';
  publishDate: string;
  expiryDate?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}
