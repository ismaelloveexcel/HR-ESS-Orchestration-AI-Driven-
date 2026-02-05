export interface LeaveRequest {
  id: string;
  referenceNumber: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'offset' | 'unpaid' | 'maternity' | 'paternity' | 'emergency';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  offsetDaysUsed?: number; // For offset days from overtime
  documents?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  employeeId: string;
  year: number;
  annualLeave: {
    entitled: number; // UAE: 30 days per year
    used: number;
    remaining: number;
  };
  sickLeave: {
    entitled: number;
    used: number;
    remaining: number;
  };
  offsetDays: {
    earned: number; // From overtime
    used: number;
    remaining: number;
  };
  unpaidLeave: number;
}
