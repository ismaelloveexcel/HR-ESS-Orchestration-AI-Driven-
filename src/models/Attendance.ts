export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  location?: {
    lat: number;
    lon: number;
    address?: string;
  };
  workLocation: 'office' | 'site' | 'remote' | 'outside';
  siteLocation?: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'leave';
  totalHours?: number;
  overtimeHours?: number;
  overtimeType?: 'paid' | 'offset';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyAttendanceReport {
  employeeId: string;
  month: string;
  year: number;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalHours: number;
  regularHours: number;
  overtimeHoursPaid: number;
  overtimeHoursOffset: number;
  records: AttendanceRecord[];
}
