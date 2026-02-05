export interface Policy {
  id: string;
  title: string;
  category: 'hr-policy' | 'labor-law' | 'company-policy' | 'procedure' | 'guideline';
  country: 'UAE' | 'Global'; // UAE labor law specific
  version: string;
  content: string;
  summary: string;
  effectiveDate: string;
  lastUpdated: string;
  requiresAcknowledgment: boolean;
  targetAudience: 'all' | 'entity' | 'department' | 'role';
  entities?: string[];
  departments?: string[];
  roles?: string[];
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface PolicyAcknowledgment {
  id: string;
  policyId: string;
  policyVersion: string;
  employeeId: string;
  acknowledgedAt: string;
  ipAddress?: string;
  signature?: string;
  notes?: string;
}

export interface LaborLawEducation {
  id: string;
  title: string;
  topic: string;
  lawReference: string; // UAE labor law article/section
  explanation: string;
  examples?: string[];
  quizQuestions?: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  relatedPolicies?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
