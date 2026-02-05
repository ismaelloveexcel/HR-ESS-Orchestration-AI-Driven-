import { Router, Request, Response } from 'express';
import { AttendanceRecord, MonthlyAttendanceReport } from '../models/Attendance';

const router = Router();

// Mock attendance database
const attendanceRecords = new Map<string, AttendanceRecord>();

// Clock in
router.post('/clock-in', (req: Request, res: Response) => {
  const { employeeId, location, workLocation, siteLocation } = req.body;
  
  const today = new Date().toISOString().split('T')[0];
  const recordId = `ATT-${employeeId}-${today}`;
  
  if (attendanceRecords.has(recordId)) {
    return res.status(400).json({ error: 'Already clocked in today' });
  }
  
  const record: AttendanceRecord = {
    id: recordId,
    employeeId,
    date: today,
    clockIn: new Date().toISOString(),
    location,
    workLocation,
    siteLocation,
    status: 'present',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  attendanceRecords.set(recordId, record);
  res.status(201).json(record);
});

// Clock out
router.post('/clock-out', (req: Request, res: Response) => {
  const { employeeId } = req.body;
  
  const today = new Date().toISOString().split('T')[0];
  const recordId = `ATT-${employeeId}-${today}`;
  
  const record = attendanceRecords.get(recordId);
  if (!record) {
    return res.status(404).json({ error: 'No clock-in record found for today' });
  }
  
  if (record.clockOut) {
    return res.status(400).json({ error: 'Already clocked out' });
  }
  
  const clockOut = new Date();
  const clockIn = new Date(record.clockIn!);
  const hoursWorked = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
  const regularHours = 8; // Standard work day
  const overtimeHours = Math.max(0, hoursWorked - regularHours);
  
  record.clockOut = clockOut.toISOString();
  record.totalHours = hoursWorked;
  record.overtimeHours = overtimeHours;
  record.updatedAt = new Date().toISOString();
  
  attendanceRecords.set(recordId, record);
  res.json(record);
});

// Get attendance by employee
router.get('/employee/:employeeId', (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const { startDate, endDate } = req.query;
  
  const records = Array.from(attendanceRecords.values())
    .filter(r => r.employeeId === employeeId);
  
  res.json({ count: records.length, records });
});

// Get monthly report
router.get('/report/:employeeId/:year/:month', (req: Request, res: Response) => {
  const { employeeId, year, month } = req.params;
  
  const records = Array.from(attendanceRecords.values())
    .filter(r => {
      const recordDate = new Date(r.date);
      return r.employeeId === employeeId && 
             recordDate.getFullYear() === parseInt(year) &&
             recordDate.getMonth() + 1 === parseInt(month);
    });
  
  const totalHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
  const overtimePaid = records.reduce((sum, r) => r.overtimeType === 'paid' ? sum + (r.overtimeHours || 0) : sum, 0);
  const overtimeOffset = records.reduce((sum, r) => r.overtimeType === 'offset' ? sum + (r.overtimeHours || 0) : sum, 0);
  
  const report: MonthlyAttendanceReport = {
    employeeId,
    month,
    year: parseInt(year),
    totalWorkingDays: 22, // Approximate
    presentDays: records.filter(r => r.status === 'present').length,
    absentDays: records.filter(r => r.status === 'absent').length,
    lateDays: records.filter(r => r.status === 'late').length,
    totalHours,
    regularHours: records.length * 8,
    overtimeHoursPaid: overtimePaid,
    overtimeHoursOffset: overtimeOffset,
    records
  };
  
  res.json(report);
});

export default router;
