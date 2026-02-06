/**
 * Database Abstraction Layer
 * 
 * This provides a simple in-memory database that can be replaced
 * with PostgreSQL, MongoDB, or any other database.
 * 
 * All data operations go through this layer for easy migration.
 */

import { v4 as uuidv4 } from 'uuid';

// Type definitions for all entities
export interface Entity {
  id: string;
  entityCode: string; // Multi-entity support (e.g., 'ENTITY_A', 'ENTITY_B')
}

export interface User extends Entity {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'hr_manager' | 'manager' | 'employee';
  employeeId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee extends Entity {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  managerId?: string;
  joinDate: string;
  contractType: 'permanent' | 'temporary' | 'contract';
  workSchedule: '5_day' | '6_day';
  nationality?: string;
  emiratesId?: string;
  passportNumber?: string;
  visaStatus?: string;
  visaExpiry?: string;
  bankName?: string;
  bankAccount?: string;
  salary?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord extends Entity {
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  clockInLocation?: GeolocationData;
  clockOutLocation?: GeolocationData;
  workLocation: 'office' | 'remote' | 'site';
  siteLocation?: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  totalHours?: number;
  regularHours?: number;
  overtimeHours?: number;
  overtimeType?: 'paid' | 'offset';
  notes?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

export interface LeaveRequest extends Entity {
  referenceNumber: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'bereavement' | 'hajj' | 'offset';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  documents?: string[];
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance extends Entity {
  employeeId: string;
  year: number;
  annualLeave: { entitled: number; used: number; remaining: number; carriedOver: number };
  sickLeave: { entitled: number; used: number; remaining: number };
  offsetDays: { earned: number; used: number; remaining: number };
  unpaidLeave: number;
  updatedAt: string;
}

export interface EmployeeRequest extends Entity {
  referenceNumber: string;
  employeeId: string;
  type: 'salary_certificate' | 'employment_letter' | 'noc' | 'experience_letter' | 'bank_letter' | 'other';
  purpose?: string;
  urgency: 'normal' | 'urgent';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  notes?: string;
  completedDocument?: string;
  processedBy?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Policy extends Entity {
  code: string;
  title: string;
  category: 'leave' | 'attendance' | 'conduct' | 'benefits' | 'compliance' | 'safety';
  content: string;
  version: string;
  effectiveDate: string;
  isActive: boolean;
  requiresAcknowledgment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyAcknowledgment extends Entity {
  policyId: string;
  employeeId: string;
  acknowledgedAt: string;
  ipAddress?: string;
}

export interface CalendarEvent extends Entity {
  title: string;
  description?: string;
  type: 'holiday' | 'training' | 'meeting' | 'deadline' | 'announcement' | 'birthday' | 'work_anniversary';
  startDate: string;
  endDate?: string;
  allDay: boolean;
  location?: string;
  isRecurring: boolean;
  recurringPattern?: string;
  targetAudience: 'all' | 'department' | 'specific';
  targetDepartments?: string[];
  targetEmployees?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement extends Entity {
  title: string;
  content: string;
  type: 'general' | 'birthday' | 'new_joiner' | 'promotion' | 'farewell' | 'achievement';
  priority: 'low' | 'medium' | 'high';
  targetAudience: 'all' | 'department' | 'specific';
  targetDepartments?: string[];
  publishDate: string;
  expiryDate?: string;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Entity configurations (UAE multi-entity support)
export interface EntityConfig {
  code: string;
  name: string;
  legalName: string;
  country: string;
  currency: string;
  workWeek: '5_day' | '6_day';
  annualLeaveEntitlement: number;
  sickLeaveEntitlement: number;
  timezone: string;
  isActive: boolean;
}

// In-memory database storage
class Database {
  private users = new Map<string, User>();
  private employees = new Map<string, Employee>();
  private attendance = new Map<string, AttendanceRecord>();
  private leaveRequests = new Map<string, LeaveRequest>();
  private leaveBalances = new Map<string, LeaveBalance>();
  private employeeRequests = new Map<string, EmployeeRequest>();
  private policies = new Map<string, Policy>();
  private policyAcknowledgments = new Map<string, PolicyAcknowledgment>();
  private calendarEvents = new Map<string, CalendarEvent>();
  private announcements = new Map<string, Announcement>();
  private entities = new Map<string, EntityConfig>();

  constructor() {
    this.seedData();
  }

  // Generate unique ID
  generateId(): string {
    return uuidv4();
  }

  // Generate reference number
  generateReferenceNumber(prefix: string): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  // Seed initial data
  private seedData(): void {
    // Seed entity configurations (UAE multi-entity)
    const entities: EntityConfig[] = [
      {
        code: 'BAYNUNAH',
        name: 'Baynunah',
        legalName: 'Baynunah Steel LLC',
        country: 'UAE',
        currency: 'AED',
        workWeek: '6_day',
        annualLeaveEntitlement: 30,
        sickLeaveEntitlement: 90,
        timezone: 'Asia/Dubai',
        isActive: true
      },
      {
        code: 'ENTITY_B',
        name: 'Entity B',
        legalName: 'Entity B Trading LLC',
        country: 'UAE',
        currency: 'AED',
        workWeek: '5_day',
        annualLeaveEntitlement: 30,
        sickLeaveEntitlement: 90,
        timezone: 'Asia/Dubai',
        isActive: true
      },
      {
        code: 'ENTITY_C',
        name: 'Entity C',
        legalName: 'Entity C Services LLC',
        country: 'UAE',
        currency: 'AED',
        workWeek: '5_day',
        annualLeaveEntitlement: 30,
        sickLeaveEntitlement: 90,
        timezone: 'Asia/Dubai',
        isActive: true
      }
    ];

    entities.forEach(e => this.entities.set(e.code, e));

    // Seed sample employees
    const sampleEmployees: Employee[] = [
      {
        id: this.generateId(),
        entityCode: 'BAYNUNAH',
        employeeNumber: 'EMP001',
        firstName: 'Ahmed',
        lastName: 'Al-Mansoori',
        email: 'ahmed@baynunah.ae',
        phone: '+971501234567',
        position: 'Software Engineer',
        department: 'IT',
        joinDate: '2023-01-15',
        contractType: 'permanent',
        workSchedule: '5_day',
        nationality: 'UAE',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: this.generateId(),
        entityCode: 'BAYNUNAH',
        employeeNumber: 'EMP002',
        firstName: 'Fatima',
        lastName: 'Al-Hashimi',
        email: 'fatima@baynunah.ae',
        phone: '+971507654321',
        position: 'HR Manager',
        department: 'Human Resources',
        joinDate: '2022-06-01',
        contractType: 'permanent',
        workSchedule: '5_day',
        nationality: 'UAE',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    sampleEmployees.forEach(e => this.employees.set(e.id, e));

    // Seed UAE policies
    const uaePolicies: Policy[] = [
      {
        id: this.generateId(),
        entityCode: 'ALL',
        code: 'POL-LEAVE-001',
        title: 'Annual Leave Policy',
        category: 'leave',
        content: `# Annual Leave Policy (UAE Labor Law Compliant)

## Entitlement
- All employees are entitled to 30 calendar days of annual leave per year after completing one year of service.
- Employees who have completed 6 months but less than one year are entitled to 2 days per month.

## Accumulation
- Unused leave can be carried forward to the next year (max 30 days).
- Leave must be taken within 2 years of accrual.

## Salary During Leave
- Employees receive full basic salary plus housing allowance during annual leave.
- End of service ticket allowance applies once every 2 years.

## Public Holidays
- If a public holiday falls during annual leave, it is not counted as leave.

## Procedure
1. Submit leave request at least 2 weeks in advance
2. Manager approval required
3. HR will update attendance records`,
        version: '1.0',
        effectiveDate: '2024-01-01',
        isActive: true,
        requiresAcknowledgment: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: this.generateId(),
        entityCode: 'ALL',
        code: 'POL-SICK-001',
        title: 'Sick Leave Policy',
        category: 'leave',
        content: `# Sick Leave Policy (UAE Labor Law Compliant)

## Entitlement
After 3 months of continuous service:
- First 15 days: Full pay
- Next 30 days: Half pay
- Following 45 days: No pay

Total: 90 days per year

## Requirements
- Medical certificate required for absences exceeding 2 consecutive days
- Medical certificate must be from UAE-licensed medical facility
- Notify manager within 2 hours of shift start

## Chronic Illness
- Special provisions apply for documented chronic conditions
- Contact HR for accommodation requests`,
        version: '1.0',
        effectiveDate: '2024-01-01',
        isActive: true,
        requiresAcknowledgment: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: this.generateId(),
        entityCode: 'ALL',
        code: 'POL-ATT-001',
        title: 'Attendance & Overtime Policy',
        category: 'attendance',
        content: `# Attendance & Overtime Policy

## Working Hours
- Standard work week: 48 hours (8 hours/day, 6 days/week) OR 40 hours (8 hours/day, 5 days/week)
- During Ramadan: Reduced by 2 hours per day

## Clock In/Out
- All employees must clock in/out using the ESS system
- GPS location is recorded for verification
- Grace period: 15 minutes after shift start

## Overtime
- Overtime requires prior manager approval
- Rate: 125% of hourly rate (normal days)
- Rate: 150% of hourly rate (Fridays/holidays)
- Maximum: 2 hours per day, 144 hours per year

## Offset Days
- Employees may choose offset days instead of overtime pay
- 1 overtime hour = 1.25 or 1.5 offset hours (depending on day)
- Offset days must be used within 3 months`,
        version: '1.0',
        effectiveDate: '2024-01-01',
        isActive: true,
        requiresAcknowledgment: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    uaePolicies.forEach(p => this.policies.set(p.id, p));

    // Seed UAE public holidays for 2024-2026
    const holidays: CalendarEvent[] = [
      { id: this.generateId(), entityCode: 'ALL', title: 'New Year\'s Day', type: 'holiday', startDate: '2025-01-01', allDay: true, isRecurring: true, recurringPattern: 'yearly', targetAudience: 'all', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: this.generateId(), entityCode: 'ALL', title: 'Eid Al Fitr', type: 'holiday', startDate: '2025-03-30', endDate: '2025-04-02', allDay: true, isRecurring: false, targetAudience: 'all', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: this.generateId(), entityCode: 'ALL', title: 'Eid Al Adha', type: 'holiday', startDate: '2025-06-06', endDate: '2025-06-09', allDay: true, isRecurring: false, targetAudience: 'all', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: this.generateId(), entityCode: 'ALL', title: 'Islamic New Year', type: 'holiday', startDate: '2025-06-26', allDay: true, isRecurring: false, targetAudience: 'all', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: this.generateId(), entityCode: 'ALL', title: 'Prophet\'s Birthday', type: 'holiday', startDate: '2025-09-04', allDay: true, isRecurring: false, targetAudience: 'all', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: this.generateId(), entityCode: 'ALL', title: 'Commemoration Day', type: 'holiday', startDate: '2025-12-01', allDay: true, isRecurring: true, recurringPattern: 'yearly', targetAudience: 'all', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: this.generateId(), entityCode: 'ALL', title: 'UAE National Day', type: 'holiday', startDate: '2025-12-02', endDate: '2025-12-03', allDay: true, isRecurring: true, recurringPattern: 'yearly', targetAudience: 'all', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    holidays.forEach(h => this.calendarEvents.set(h.id, h));
  }

  // CRUD Operations for each entity type
  // Users
  getUsers(entityCode?: string): User[] {
    const all = Array.from(this.users.values());
    return entityCode ? all.filter(u => u.entityCode === entityCode) : all;
  }
  
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }
  
  getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.username === username);
  }
  
  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }
  
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...user,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }
  
  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates, id, updatedAt: new Date().toISOString() };
    this.users.set(id, updated);
    return updated;
  }
  
  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  // Employees
  getEmployees(entityCode?: string): Employee[] {
    const all = Array.from(this.employees.values());
    return entityCode ? all.filter(e => e.entityCode === entityCode) : all;
  }
  
  getEmployeeById(id: string): Employee | undefined {
    return this.employees.get(id);
  }
  
  getEmployeeByNumber(employeeNumber: string): Employee | undefined {
    return Array.from(this.employees.values()).find(e => e.employeeNumber === employeeNumber);
  }
  
  getEmployeeByEmail(email: string): Employee | undefined {
    return Array.from(this.employees.values()).find(e => e.email === email);
  }
  
  createEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee {
    const newEmployee: Employee = {
      ...employee,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.employees.set(newEmployee.id, newEmployee);
    return newEmployee;
  }
  
  updateEmployee(id: string, updates: Partial<Employee>): Employee | undefined {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    const updated = { ...employee, ...updates, id, updatedAt: new Date().toISOString() };
    this.employees.set(id, updated);
    return updated;
  }
  
  deleteEmployee(id: string): boolean {
    return this.employees.delete(id);
  }

  // Attendance
  getAttendanceRecords(employeeId?: string, startDate?: string, endDate?: string): AttendanceRecord[] {
    let records = Array.from(this.attendance.values());
    if (employeeId) records = records.filter(r => r.employeeId === employeeId);
    if (startDate) records = records.filter(r => r.date >= startDate);
    if (endDate) records = records.filter(r => r.date <= endDate);
    return records;
  }
  
  getAttendanceByDate(employeeId: string, date: string): AttendanceRecord | undefined {
    return Array.from(this.attendance.values()).find(r => r.employeeId === employeeId && r.date === date);
  }
  
  createAttendance(record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): AttendanceRecord {
    const newRecord: AttendanceRecord = {
      ...record,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.attendance.set(newRecord.id, newRecord);
    return newRecord;
  }
  
  updateAttendance(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | undefined {
    const record = this.attendance.get(id);
    if (!record) return undefined;
    const updated = { ...record, ...updates, id, updatedAt: new Date().toISOString() };
    this.attendance.set(id, updated);
    return updated;
  }

  // Leave Requests
  getLeaveRequests(employeeId?: string, status?: string): LeaveRequest[] {
    let requests = Array.from(this.leaveRequests.values());
    if (employeeId) requests = requests.filter(r => r.employeeId === employeeId);
    if (status) requests = requests.filter(r => r.status === status);
    return requests;
  }
  
  getLeaveRequestById(id: string): LeaveRequest | undefined {
    return this.leaveRequests.get(id);
  }
  
  getLeaveRequestByReference(refNumber: string): LeaveRequest | undefined {
    return Array.from(this.leaveRequests.values()).find(r => r.referenceNumber === refNumber);
  }
  
  createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt'>): LeaveRequest {
    const newRequest: LeaveRequest = {
      ...request,
      id: this.generateId(),
      referenceNumber: this.generateReferenceNumber('LV'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.leaveRequests.set(newRequest.id, newRequest);
    return newRequest;
  }
  
  updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): LeaveRequest | undefined {
    const request = this.leaveRequests.get(id);
    if (!request) return undefined;
    const updated = { ...request, ...updates, id, updatedAt: new Date().toISOString() };
    this.leaveRequests.set(id, updated);
    return updated;
  }

  // Leave Balances
  getLeaveBalance(employeeId: string, year: number): LeaveBalance | undefined {
    const key = `${employeeId}-${year}`;
    return this.leaveBalances.get(key);
  }
  
  initializeLeaveBalance(employeeId: string, year: number, entityCode: string): LeaveBalance {
    const entity = this.entities.get(entityCode);
    const balance: LeaveBalance = {
      id: this.generateId(),
      entityCode,
      employeeId,
      year,
      annualLeave: {
        entitled: entity?.annualLeaveEntitlement || 30,
        used: 0,
        remaining: entity?.annualLeaveEntitlement || 30,
        carriedOver: 0
      },
      sickLeave: {
        entitled: entity?.sickLeaveEntitlement || 90,
        used: 0,
        remaining: entity?.sickLeaveEntitlement || 90
      },
      offsetDays: {
        earned: 0,
        used: 0,
        remaining: 0
      },
      unpaidLeave: 0,
      updatedAt: new Date().toISOString()
    };
    const key = `${employeeId}-${year}`;
    this.leaveBalances.set(key, balance);
    return balance;
  }
  
  updateLeaveBalance(employeeId: string, year: number, updates: Partial<LeaveBalance>): LeaveBalance | undefined {
    const key = `${employeeId}-${year}`;
    const balance = this.leaveBalances.get(key);
    if (!balance) return undefined;
    const updated = { ...balance, ...updates, updatedAt: new Date().toISOString() };
    this.leaveBalances.set(key, updated);
    return updated;
  }

  // Employee Requests
  getEmployeeRequests(employeeId?: string, status?: string): EmployeeRequest[] {
    let requests = Array.from(this.employeeRequests.values());
    if (employeeId) requests = requests.filter(r => r.employeeId === employeeId);
    if (status) requests = requests.filter(r => r.status === status);
    return requests;
  }
  
  createEmployeeRequest(request: Omit<EmployeeRequest, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt'>): EmployeeRequest {
    const newRequest: EmployeeRequest = {
      ...request,
      id: this.generateId(),
      referenceNumber: this.generateReferenceNumber('REQ'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.employeeRequests.set(newRequest.id, newRequest);
    return newRequest;
  }
  
  updateEmployeeRequest(id: string, updates: Partial<EmployeeRequest>): EmployeeRequest | undefined {
    const request = this.employeeRequests.get(id);
    if (!request) return undefined;
    const updated = { ...request, ...updates, id, updatedAt: new Date().toISOString() };
    this.employeeRequests.set(id, updated);
    return updated;
  }

  // Policies
  getPolicies(category?: string, activeOnly = true): Policy[] {
    let policies = Array.from(this.policies.values());
    if (activeOnly) policies = policies.filter(p => p.isActive);
    if (category) policies = policies.filter(p => p.category === category);
    return policies;
  }
  
  getPolicyById(id: string): Policy | undefined {
    return this.policies.get(id);
  }
  
  getPolicyByCode(code: string): Policy | undefined {
    return Array.from(this.policies.values()).find(p => p.code === code);
  }

  // Policy Acknowledgments
  getPolicyAcknowledgments(employeeId?: string, policyId?: string): PolicyAcknowledgment[] {
    let acks = Array.from(this.policyAcknowledgments.values());
    if (employeeId) acks = acks.filter(a => a.employeeId === employeeId);
    if (policyId) acks = acks.filter(a => a.policyId === policyId);
    return acks;
  }
  
  createPolicyAcknowledgment(ack: Omit<PolicyAcknowledgment, 'id'>): PolicyAcknowledgment {
    const newAck: PolicyAcknowledgment = {
      ...ack,
      id: this.generateId()
    };
    this.policyAcknowledgments.set(newAck.id, newAck);
    return newAck;
  }
  
  hasAcknowledgedPolicy(employeeId: string, policyId: string): boolean {
    return Array.from(this.policyAcknowledgments.values())
      .some(a => a.employeeId === employeeId && a.policyId === policyId);
  }

  // Calendar Events
  getCalendarEvents(entityCode?: string, startDate?: string, endDate?: string, type?: string): CalendarEvent[] {
    let events = Array.from(this.calendarEvents.values());
    if (entityCode) events = events.filter(e => e.entityCode === entityCode || e.entityCode === 'ALL');
    if (startDate) events = events.filter(e => e.startDate >= startDate);
    if (endDate) events = events.filter(e => e.startDate <= endDate);
    if (type) events = events.filter(e => e.type === type);
    return events;
  }
  
  createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): CalendarEvent {
    const newEvent: CalendarEvent = {
      ...event,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.calendarEvents.set(newEvent.id, newEvent);
    return newEvent;
  }

  // Announcements
  getAnnouncements(entityCode?: string, type?: string, publishedOnly = true): Announcement[] {
    let announcements = Array.from(this.announcements.values());
    if (publishedOnly) announcements = announcements.filter(a => a.isPublished);
    if (entityCode) announcements = announcements.filter(a => a.entityCode === entityCode || a.entityCode === 'ALL');
    if (type) announcements = announcements.filter(a => a.type === type);
    return announcements;
  }
  
  createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Announcement {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.announcements.set(newAnnouncement.id, newAnnouncement);
    return newAnnouncement;
  }

  // Entity Configurations
  getEntities(): EntityConfig[] {
    return Array.from(this.entities.values());
  }
  
  getEntityByCode(code: string): EntityConfig | undefined {
    return this.entities.get(code);
  }
}

// Export singleton instance
export const db = new Database();
export default db;
