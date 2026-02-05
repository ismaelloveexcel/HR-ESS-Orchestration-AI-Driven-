/**
 * Universal Pass Data Models
 * 
 * Unified pass structure for Candidate, Manager, and Employee modes.
 * One layout, three modes - only content changes.
 */

// Pass types
export type PassType = 'candidate' | 'manager' | 'employee';

// Status types for visual indicators
export type StatusType = 'info' | 'warning' | 'action_required' | 'success';

// Menu options available per pass type
export type MenuOption = 
  // Candidate options
  | 'timeline' 
  | 'evaluation' 
  | 'inbox' 
  | 'save_wallet' 
  | 'interview_tips' 
  | 'calendar'
  | 'documents'
  // Manager options
  | 'candidate_timeline' 
  | 'evaluation_panel' 
  | 'interview_questions' 
  | 'approvals' 
  | 'hr_notes'
  | 'team_overview'
  // Employee options
  | 'profile' 
  | 'payslips' 
  | 'leave_balance' 
  | 'requests' 
  | 'policies'
  | 'attendance';

// Personal information block
export interface PassPersonal {
  name: string;
  position: string;
  email: string;
  phone?: string;
  photo?: string;
  location?: string;
  
  // Candidate-specific
  visa?: string;
  expectedSalary?: number;
  noticePeriod?: number;
  relocationPreference?: boolean;
  
  // Employee-specific
  department?: string;
  joinDate?: string;
  employeeNumber?: string;
}

// Stage/Timeline configuration
export interface PassStage {
  current: number;
  labels: string[];
  status: string;
  statusType: StatusType;
  lastUpdated?: string;
}

// Evaluation scores (Candidate/Manager)
export interface PassEvaluation {
  profileFit?: number;
  softSkills?: number;
  technicalSkills?: number;
  interviewScore?: number;
  overallScore?: number;
  remarks?: EvaluationRemark[];
}

export interface EvaluationRemark {
  author: string;
  role: string;
  content: string;
  date: string;
}

// Menu configuration
export interface PassMenu {
  options: MenuOption[];
}

// Support contacts
export interface PassSupport {
  whatsapp?: string;
  email: string;
  emergency?: string;
}

// Main Universal Pass interface
export interface UniversalPass {
  id: string;
  type: PassType;
  entityCode: string;
  
  personal: PassPersonal;
  stage: PassStage;
  evaluation?: PassEvaluation;
  menu: PassMenu;
  support: PassSupport;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  
  // Generated URLs
  qrCodeUrl?: string;
  walletUrl?: string;
  profileUrl?: string;
}

// Stage configurations per pass type
export const STAGE_CONFIGS: Record<PassType, { labels: string[]; defaultStatus: string }> = {
  candidate: {
    labels: ['Application', 'Screening', 'Assessment', 'Interview', 'Offer', 'Onboarding'],
    defaultStatus: 'Application received'
  },
  manager: {
    labels: ['RRF Review', 'Shortlist', 'Interview', 'Evaluation', 'Offer Approval', 'Onboarding'],
    defaultStatus: 'Review pending'
  },
  employee: {
    labels: ['Probation', 'Confirmed', '1 Year', '3 Years', '5 Years', '10+ Years'],
    defaultStatus: 'Active employee'
  }
};

// Default menu options per pass type
export const DEFAULT_MENU_OPTIONS: Record<PassType, MenuOption[]> = {
  candidate: ['timeline', 'evaluation', 'inbox', 'documents', 'save_wallet', 'calendar'],
  manager: ['candidate_timeline', 'evaluation_panel', 'interview_questions', 'approvals', 'hr_notes', 'save_wallet'],
  employee: ['profile', 'attendance', 'leave_balance', 'requests', 'payslips', 'policies', 'save_wallet']
};

// ID prefix per pass type
export const ID_PREFIX: Record<PassType, string> = {
  candidate: 'CAND',
  manager: 'MAN',
  employee: 'EMP'
};

// Generate pass ID
export function generatePassId(type: PassType, entityCode: string, sequence: number): string {
  const year = new Date().getFullYear();
  const prefix = ID_PREFIX[type];
  const seq = sequence.toString().padStart(3, '0');
  return `${prefix}-${entityCode.substring(0, 3).toUpperCase()}-${year}-${seq}`;
}

// Calculate employee stage based on join date
export function calculateEmployeeStage(joinDate: string): number {
  const join = new Date(joinDate);
  const now = new Date();
  const years = (now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  if (years < 0.5) return 1;  // Probation
  if (years < 1) return 2;    // Confirmed
  if (years < 3) return 3;    // 1 Year
  if (years < 5) return 4;    // 3 Years
  if (years < 10) return 5;   // 5 Years
  return 6;                    // 10+ Years
}

// Create pass from employee data
export function createEmployeePass(employee: {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  joinDate: string;
  entityCode: string;
}, support: PassSupport): UniversalPass {
  const stage = calculateEmployeeStage(employee.joinDate);
  const stageConfig = STAGE_CONFIGS.employee;
  
  return {
    id: `EMP-${employee.entityCode.substring(0, 3)}-${new Date().getFullYear()}-${employee.employeeNumber}`,
    type: 'employee',
    entityCode: employee.entityCode,
    personal: {
      name: `${employee.firstName} ${employee.lastName}`,
      position: employee.position,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      joinDate: employee.joinDate,
      employeeNumber: employee.employeeNumber
    },
    stage: {
      current: stage,
      labels: stageConfig.labels,
      status: stageConfig.defaultStatus,
      statusType: 'info'
    },
    menu: {
      options: DEFAULT_MENU_OPTIONS.employee
    },
    support,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Pass display helpers
export interface PassDisplayData {
  title: string;
  subtitle: string;
  primaryColor: string;
  secondaryColor: string;
  icon: string;
}

export const PASS_DISPLAY: Record<PassType, PassDisplayData> = {
  candidate: {
    title: 'CANDIDATE PASS',
    subtitle: 'Recruitment Journey',
    primaryColor: '#005293',
    secondaryColor: '#00A0DC',
    icon: '👤'
  },
  manager: {
    title: 'MANAGER PASS',
    subtitle: 'Hiring Dashboard',
    primaryColor: '#2E7D32',
    secondaryColor: '#4CAF50',
    icon: '👔'
  },
  employee: {
    title: 'EMPLOYEE PASS',
    subtitle: 'Self-Service Portal',
    primaryColor: '#1565C0',
    secondaryColor: '#42A5F5',
    icon: '🎫'
  }
};
