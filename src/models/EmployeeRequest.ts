export interface EmployeeRequest {
  id: string;
  referenceNumber: string; // Auto-generated for tracking
  employeeId: string;
  type: 'leave' | 'document' | 'certificate' | 'loan' | 'advance' | 'complaint' | 'it-support' | 'facility' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'in-progress' | 'completed' | 'rejected' | 'cancelled';
  assignedTo?: string;
  department?: string;
  attachments?: string[];
  statusHistory: {
    status: string;
    timestamp: string;
    updatedBy: string;
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
