export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum ThemeType {
  TERRA_COTTA = 'TERRA_COTTA',
  FOREST_GREEN = 'FOREST_GREEN',
  AUTUMN_LEAVES = 'AUTUMN_LEAVES',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CORRECTED = 'CORRECTED',
}

export enum TransitoriaCategory {
  PREPAID = 'Vooruitbetaalde kosten',
  ACCRUED = 'Nog te ontvangen/betalen',
  STANDARD = 'Regulier',
  CORRECTION = 'Correctie',
  UNKNOWN = 'Onbekend',
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; 
  type: 'DEBIT' | 'CREDIT';
  relation?: string;
  projectCode?: string;
  glAccount?: string;
  
  // AI Analysis fields
  aiAnalysis?: string;
  riskLevel: RiskLevel;
  allocatedPeriod?: string; // e.g. "2024-01", "2024-Q1", "2024-YEAR"
  category?: TransitoriaCategory;
  
  // Workflow fields
  status: TransactionStatus;
  managerComment?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  transactionId: string;
  action: 'APPROVE' | 'CORRECT';
  user: string;
  details: string;
}

export interface AppSettings {
  appName: string;
  theme: ThemeType;
  showDemo: boolean;
  showUploadTemplate: boolean;
  showPeriodSelector: boolean;
  showAiAnalysis: boolean;
  showMachineLearning: boolean;
  showUserComments: boolean;
  showExportButtons: boolean;
  showUserName: boolean;
  currencyInThousands: boolean;
  language: 'nl' | 'en';
}

export interface ThemeColors {
  primary: string;
  text: string;
  riskHigh: string;
  riskMedium: string;
  riskLow: string;
}

export interface CompletenessIssue {
  description: string;
  expectedPeriod: string;
  confidence: number;
}