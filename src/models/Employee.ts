export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  entity: string; // For multi-entity support (UAE requirement)
  joinDate: string;
  workingDays: 5 | 6; // UAE: 5 or 6 day work week
  workLocation: 'office' | 'site' | 'remote';
  siteLocation?: string;
  nationality?: string;
  visaStatus?: string;
  status: 'active' | 'probation' | 'notice' | 'terminated';
  manager?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface EmployeeProfile extends Employee {
  personalInfo?: {
    dateOfBirth?: string;
    maritalStatus?: string;
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  documents?: EmployeeDocument[];
  leaveBalance?: {
    annual: number;
    sick: number;
    offsetDays: number;
  };
}
