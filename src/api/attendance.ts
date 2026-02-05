/**
 * Attendance Management API Routes
 * 
 * Clock in/out with GPS geolocation, overtime tracking,
 * and UAE labor law compliant reporting.
 */

import { Router, Response } from 'express';
import { db, GeolocationData } from '../database';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// UAE standard working hours
const STANDARD_HOURS = 8;
const OVERTIME_MULTIPLIER_NORMAL = 1.25;
const OVERTIME_MULTIPLIER_FRIDAY = 1.5;
const GRACE_PERIOD_MINUTES = 15;

/**
 * Calculate distance between two GPS coordinates (in meters)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

/**
 * Check if location is within office premises
 */
function isWithinOffice(location: GeolocationData, officeLocations: GeolocationData[]): boolean {
  const MAX_DISTANCE = 100; // 100 meters tolerance
  return officeLocations.some(office => 
    calculateDistance(location.latitude, location.longitude, office.latitude, office.longitude) <= MAX_DISTANCE
  );
}

// Office locations for each entity (would be configurable)
const OFFICE_LOCATIONS: { [key: string]: GeolocationData[] } = {
  'BAYNUNAH': [
    { latitude: 24.4539, longitude: 54.3773, address: 'Abu Dhabi HQ' },
    { latitude: 25.2048, longitude: 55.2708, address: 'Dubai Branch' }
  ],
  'ENTITY_B': [
    { latitude: 25.2048, longitude: 55.2708, address: 'Dubai Office' }
  ],
  'ENTITY_C': [
    { latitude: 25.3463, longitude: 55.4209, address: 'Sharjah Office' }
  ]
};

/**
 * @route POST /api/attendance/quick
 * @desc ONE-TAP clock in/out - Auto-detects what's needed
 * @access Private
 * 
 * This is the simplified endpoint for employees.
 * Just tap once - the system figures out the rest.
 */
router.post('/quick', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { location } = req.body;

    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'No employee profile linked' 
      });
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const existingRecord = db.getAttendanceByDate(employeeId, today);

    // Prepare GPS data
    let gpsLocation: GeolocationData | undefined;
    if (location?.latitude && location?.longitude) {
      gpsLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address
      };
    }

    // AUTO-DETECT: Clock in or Clock out?
    if (!existingRecord) {
      // ===== CLOCK IN =====
      const shiftStart = new Date(now);
      shiftStart.setHours(9, 0, 0, 0);
      const graceEnd = new Date(shiftStart.getTime() + GRACE_PERIOD_MINUTES * 60000);
      const isLate = now > graceEnd;

      const record = db.createAttendance({
        employeeId,
        entityCode: employee.entityCode,
        date: today,
        clockIn: now.toISOString(),
        clockInLocation: gpsLocation,
        workLocation: 'office',
        status: isLate ? 'late' : 'present'
      });

      return res.status(201).json({
        action: 'CLOCK_IN',
        success: true,
        message: isLate ? `Clocked in (${Math.round((now.getTime() - graceEnd.getTime()) / 60000)} min late)` : 'Clocked in successfully! ✅',
        time: now.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' }),
        isLate,
        record: {
          id: record.id,
          clockIn: record.clockIn,
          status: record.status
        }
      });

    } else if (!existingRecord.clockOut) {
      // ===== CLOCK OUT =====
      const clockInTime = new Date(existingRecord.clockIn!);
      const totalHours = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
      const regularHours = Math.min(totalHours, STANDARD_HOURS);
      const overtimeHours = Math.max(0, totalHours - STANDARD_HOURS);

      db.updateAttendance(existingRecord.id, {
        clockOut: now.toISOString(),
        clockOutLocation: gpsLocation,
        totalHours: Math.round(totalHours * 100) / 100,
        regularHours: Math.round(regularHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        overtimeType: overtimeHours > 0 ? 'offset' : undefined
      });

      // Format hours nicely
      const hours = Math.floor(totalHours);
      const minutes = Math.round((totalHours - hours) * 60);

      return res.json({
        action: 'CLOCK_OUT',
        success: true,
        message: `Clocked out! Worked ${hours}h ${minutes}m today 🎉`,
        time: now.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' }),
        summary: {
          clockIn: existingRecord.clockIn,
          clockOut: now.toISOString(),
          totalHours: `${hours}h ${minutes}m`,
          overtime: overtimeHours > 0 ? `${Math.round(overtimeHours * 60)}m overtime` : null
        }
      });

    } else {
      // ===== ALREADY DONE FOR TODAY =====
      const clockIn = new Date(existingRecord.clockIn!);
      const clockOut = new Date(existingRecord.clockOut!);
      
      return res.json({
        action: 'ALREADY_COMPLETE',
        success: true,
        message: 'Already clocked in and out today! 👍',
        summary: {
          clockIn: clockIn.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' }),
          clockOut: clockOut.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' }),
          totalHours: existingRecord.totalHours
        }
      });
    }

  } catch (error) {
    console.error('Quick clock error:', error);
    res.status(500).json({ error: 'Failed to process clock action' });
  }
});

/**
 * @route GET /api/attendance/status
 * @desc Get current clock status for the button
 * @access Private
 */
router.get('/status', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile linked' });
    }

    const today = new Date().toISOString().split('T')[0];
    const record = db.getAttendanceByDate(employeeId, today);
    const now = new Date();

    if (!record) {
      return res.json({
        status: 'NOT_CLOCKED_IN',
        buttonText: '🕐 Clock In',
        buttonColor: 'green',
        canTap: true,
        message: 'Tap to start your day'
      });
    }

    if (!record.clockOut) {
      const clockIn = new Date(record.clockIn!);
      const hoursWorked = (now.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
      const hours = Math.floor(hoursWorked);
      const minutes = Math.round((hoursWorked - hours) * 60);

      return res.json({
        status: 'CLOCKED_IN',
        buttonText: '🏠 Clock Out',
        buttonColor: 'blue',
        canTap: true,
        message: `Working for ${hours}h ${minutes}m`,
        clockInTime: clockIn.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' })
      });
    }

    return res.json({
      status: 'COMPLETE',
      buttonText: '✅ Done for Today',
      buttonColor: 'gray',
      canTap: false,
      message: `Worked ${record.totalHours?.toFixed(1) || '8'}h today`,
      clockInTime: new Date(record.clockIn!).toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' }),
      clockOutTime: new Date(record.clockOut!).toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' })
    });

  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Failed to get clock status' });
  }
});

/**
 * @route POST /api/attendance/clock-in
 * @desc Clock in for the day
 * @access Private
 */
router.post('/clock-in', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      location,
      workLocation = 'office',
      siteLocation,
      notes 
    } = req.body;

    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'No employee profile linked to this user' 
      });
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Check if already clocked in
    const existingRecord = db.getAttendanceByDate(employeeId, today);
    if (existingRecord) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Already clocked in today',
        record: existingRecord
      });
    }

    // Validate GPS location if provided
    let gpsLocation: GeolocationData | undefined;
    let locationVerified = false;
    
    if (location && location.latitude && location.longitude) {
      gpsLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address
      };

      // Verify location if working from office
      if (workLocation === 'office') {
        const officeLocations = OFFICE_LOCATIONS[employee.entityCode] || [];
        locationVerified = isWithinOffice(gpsLocation, officeLocations);
      } else {
        locationVerified = true; // Remote/site work doesn't need office verification
      }
    }

    // Determine if late (after 9:00 AM + grace period)
    const now = new Date();
    const shiftStart = new Date(now);
    shiftStart.setHours(9, 0, 0, 0); // 9:00 AM
    const graceEnd = new Date(shiftStart.getTime() + GRACE_PERIOD_MINUTES * 60000);
    
    const isLate = now > graceEnd;
    const status = isLate ? 'late' : 'present';

    const record = db.createAttendance({
      employeeId,
      entityCode: employee.entityCode,
      date: today,
      clockIn: now.toISOString(),
      clockInLocation: gpsLocation,
      workLocation,
      siteLocation,
      status,
      notes
    });

    res.status(201).json({
      message: 'Clock in successful',
      record: {
        id: record.id,
        date: record.date,
        clockIn: record.clockIn,
        status: record.status,
        workLocation: record.workLocation,
        locationVerified,
        isLate,
        lateBy: isLate ? Math.round((now.getTime() - graceEnd.getTime()) / 60000) : 0
      }
    });

  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ error: 'Failed to clock in' });
  }
});

/**
 * @route POST /api/attendance/clock-out
 * @desc Clock out for the day
 * @access Private
 */
router.post('/clock-out', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { location, overtimeType = 'paid', notes } = req.body;

    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'No employee profile linked to this user' 
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const record = db.getAttendanceByDate(employeeId, today);
    
    if (!record) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'No clock-in record found for today' 
      });
    }

    if (record.clockOut) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Already clocked out today',
        record
      });
    }

    const clockOutTime = new Date();
    const clockInTime = new Date(record.clockIn!);
    
    // Calculate hours worked
    const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
    
    // Determine standard hours (check for Ramadan - would need proper date logic)
    const standardHours = STANDARD_HOURS; // TODO: Check for Ramadan
    
    // Calculate overtime
    const regularHours = Math.min(totalHours, standardHours);
    const overtimeHours = Math.max(0, totalHours - standardHours);

    // Calculate overtime value based on day
    const dayOfWeek = clockOutTime.getDay();
    const isFriday = dayOfWeek === 5;
    const overtimeMultiplier = isFriday ? OVERTIME_MULTIPLIER_FRIDAY : OVERTIME_MULTIPLIER_NORMAL;

    // GPS location for clock out
    let gpsLocation: GeolocationData | undefined;
    if (location && location.latitude && location.longitude) {
      gpsLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address
      };
    }

    const updated = db.updateAttendance(record.id, {
      clockOut: clockOutTime.toISOString(),
      clockOutLocation: gpsLocation,
      totalHours: Math.round(totalHours * 100) / 100,
      regularHours: Math.round(regularHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      overtimeType: overtimeHours > 0 ? overtimeType : undefined,
      notes: notes || record.notes
    });

    // Update offset days if overtime is offset type
    if (overtimeHours > 0 && overtimeType === 'offset') {
      const currentYear = new Date().getFullYear();
      const employee = db.getEmployeeById(employeeId);
      let leaveBalance = db.getLeaveBalance(employeeId, currentYear);
      
      if (!leaveBalance && employee) {
        leaveBalance = db.initializeLeaveBalance(employeeId, currentYear, employee.entityCode);
      }
      
      if (leaveBalance) {
        const offsetHoursEarned = overtimeHours * overtimeMultiplier;
        const offsetDaysEarned = offsetHoursEarned / 8; // Convert to days
        
        db.updateLeaveBalance(employeeId, currentYear, {
          offsetDays: {
            earned: leaveBalance.offsetDays.earned + offsetDaysEarned,
            used: leaveBalance.offsetDays.used,
            remaining: leaveBalance.offsetDays.remaining + offsetDaysEarned
          }
        });
      }
    }

    res.json({
      message: 'Clock out successful',
      record: {
        id: updated?.id,
        date: updated?.date,
        clockIn: updated?.clockIn,
        clockOut: updated?.clockOut,
        totalHours: updated?.totalHours,
        regularHours: updated?.regularHours,
        overtimeHours: updated?.overtimeHours,
        overtimeType: updated?.overtimeType,
        status: updated?.status
      },
      summary: {
        workedHours: Math.round(totalHours * 100) / 100,
        standardHours,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        overtimeMultiplier,
        offsetDaysEarned: overtimeType === 'offset' ? Math.round((overtimeHours * overtimeMultiplier / 8) * 100) / 100 : 0
      }
    });

  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ error: 'Failed to clock out' });
  }
});

/**
 * @route GET /api/attendance/today
 * @desc Get today's attendance record
 * @access Private
 */
router.get('/today', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile linked' });
    }

    const today = new Date().toISOString().split('T')[0];
    const record = db.getAttendanceByDate(employeeId, today);

    res.json({
      date: today,
      hasRecord: !!record,
      record: record || null,
      canClockIn: !record,
      canClockOut: record && !record.clockOut
    });

  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ error: 'Failed to get attendance' });
  }
});

/**
 * @route GET /api/attendance/employee/:employeeId
 * @desc Get attendance records for an employee
 * @access Private
 */
router.get('/employee/:employeeId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, month, year } = req.query;

    // Access control
    if (req.user?.role === 'employee' && req.user.employeeId !== employeeId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let start: string | undefined;
    let end: string | undefined;

    if (month && year) {
      const m = parseInt(month as string);
      const y = parseInt(year as string);
      start = `${y}-${m.toString().padStart(2, '0')}-01`;
      end = `${y}-${m.toString().padStart(2, '0')}-31`;
    } else {
      start = startDate as string;
      end = endDate as string;
    }

    const records = db.getAttendanceRecords(employeeId, start, end)
      .sort((a, b) => b.date.localeCompare(a.date));

    // Calculate summary
    const totalHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const overtimeHours = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
    const presentDays = records.filter(r => r.status === 'present').length;
    const lateDays = records.filter(r => r.status === 'late').length;

    res.json({
      employeeId,
      period: { start, end },
      count: records.length,
      records,
      summary: {
        totalHours: Math.round(totalHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        presentDays,
        lateDays,
        absentDays: records.filter(r => r.status === 'absent').length
      }
    });

  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ error: 'Failed to get attendance records' });
  }
});

/**
 * @route GET /api/attendance/report/:year/:month
 * @desc Get monthly attendance report
 * @access Private (Manager, HR, Admin)
 */
router.get('/report/:year/:month', authenticate, authorize('admin', 'hr_manager', 'manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { year, month } = req.params;
    const { department, entityCode } = req.query;

    const y = parseInt(year);
    const m = parseInt(month);
    const startDate = `${y}-${m.toString().padStart(2, '0')}-01`;
    const endDate = `${y}-${m.toString().padStart(2, '0')}-31`;

    // Get employees based on filters
    let employees = db.getEmployees(
      req.user?.role !== 'admin' ? req.user?.entityCode : (entityCode as string)
    ).filter(e => e.isActive);

    if (department) {
      employees = employees.filter(e => e.department === department);
    }

    // Calculate working days in month (excluding Fridays for UAE)
    const workingDays = calculateWorkingDays(y, m);

    // Build report
    const report = employees.map(employee => {
      const records = db.getAttendanceRecords(employee.id, startDate, endDate);
      
      const totalHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
      const overtimeHours = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
      const overtimePaid = records.filter(r => r.overtimeType === 'paid').reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
      const overtimeOffset = records.filter(r => r.overtimeType === 'offset').reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

      return {
        employeeId: employee.id,
        employeeNumber: employee.employeeNumber,
        name: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        workSchedule: employee.workSchedule,
        attendance: {
          presentDays: records.filter(r => ['present', 'late'].includes(r.status)).length,
          lateDays: records.filter(r => r.status === 'late').length,
          absentDays: workingDays - records.filter(r => r.status !== 'absent').length,
          workingDays
        },
        hours: {
          total: Math.round(totalHours * 100) / 100,
          regular: Math.round((totalHours - overtimeHours) * 100) / 100,
          overtime: Math.round(overtimeHours * 100) / 100,
          overtimePaid: Math.round(overtimePaid * 100) / 100,
          overtimeOffset: Math.round(overtimeOffset * 100) / 100
        }
      };
    });

    // Summary statistics
    const totalStats = report.reduce((acc, r) => ({
      totalEmployees: acc.totalEmployees + 1,
      totalHours: acc.totalHours + r.hours.total,
      totalOvertime: acc.totalOvertime + r.hours.overtime,
      avgAttendance: acc.avgAttendance + (r.attendance.presentDays / workingDays)
    }), { totalEmployees: 0, totalHours: 0, totalOvertime: 0, avgAttendance: 0 });

    res.json({
      period: { year: y, month: m },
      workingDays,
      report,
      summary: {
        ...totalStats,
        avgAttendance: Math.round((totalStats.avgAttendance / report.length) * 100)
      }
    });

  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

/**
 * Calculate working days in a month (UAE: Fri off for most, Fri-Sat for some)
 */
function calculateWorkingDays(year: number, month: number): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    // UAE: Friday (5) is typically off, some have Sat (6) off too
    if (dayOfWeek !== 5) { // Excluding Friday
      workingDays++;
    }
  }
  
  return workingDays;
}

/**
 * @route POST /api/attendance/manual
 * @desc Add manual attendance record (HR only)
 * @access Private (Admin, HR Manager)
 */
router.post('/manual', authenticate, authorize('admin', 'hr_manager'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      employeeId,
      date,
      clockIn,
      clockOut,
      status = 'present',
      workLocation = 'office',
      notes,
      reason
    } = req.body;

    if (!employeeId || !date) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Employee ID and date are required'
      });
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check entity access
    if (req.user?.role !== 'admin' && employee.entityCode !== req.user?.entityCode) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check for existing record
    const existing = db.getAttendanceByDate(employeeId, date);
    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Attendance record already exists for this date'
      });
    }

    // Calculate hours if both times provided
    let totalHours: number | undefined;
    let overtimeHours: number | undefined;
    
    if (clockIn && clockOut) {
      const inTime = new Date(`${date}T${clockIn}`);
      const outTime = new Date(`${date}T${clockOut}`);
      totalHours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);
      overtimeHours = Math.max(0, totalHours - STANDARD_HOURS);
    }

    const record = db.createAttendance({
      employeeId,
      entityCode: employee.entityCode,
      date,
      clockIn: clockIn ? `${date}T${clockIn}:00.000Z` : undefined,
      clockOut: clockOut ? `${date}T${clockOut}:00.000Z` : undefined,
      status,
      workLocation,
      totalHours,
      regularHours: totalHours ? Math.min(totalHours, STANDARD_HOURS) : undefined,
      overtimeHours,
      notes: `Manual entry by ${req.user?.username}. ${reason || ''} ${notes || ''}`.trim(),
      approvedBy: req.user?.userId
    });

    res.status(201).json({
      message: 'Manual attendance record created',
      record
    });

  } catch (error) {
    console.error('Create manual attendance error:', error);
    res.status(500).json({ error: 'Failed to create attendance record' });
  }
});

export default router;
