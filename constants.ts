import { AppSettings, RiskLevel, ThemeType, ThemeColors, TransactionStatus, TransitoriaCategory } from './types';

export const THEMES: Record<ThemeType, ThemeColors> = {
  [ThemeType.TERRA_COTTA]: {
    primary: '#52939D',
    text: '#242F4D',
    riskHigh: '#D66D6B',
    riskMedium: '#F3B0A9',
    riskLow: '#BDD7C6',
  },
  [ThemeType.FOREST_GREEN]: {
    primary: '#2E7B57',
    text: '#14242E',
    riskHigh: '#9A6C5A',
    riskMedium: '#E4F46A',
    riskLow: '#2E7B57',
  },
  [ThemeType.AUTUMN_LEAVES]: {
    primary: '#B1782F',
    text: '#8B8F92',
    riskHigh: '#2E2421',
    riskMedium: '#B49269',
    riskLow: '#B1782F',
  },
};

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'Transitoria Controle Tool',
  theme: ThemeType.TERRA_COTTA,
  showDemo: true,
  showUploadTemplate: true,
  showPeriodSelector: true,
  showAiAnalysis: true,
  showMachineLearning: true, // Enabled for completeness check visualization
  showUserComments: true,
  showExportButtons: true,
  showUserName: true,
  currencyInThousands: false,
  language: 'nl',
};

export const DEMO_DATA = [
  { 
    id: '1', 
    date: '2024-01-05', 
    description: 'Huur Kantoor Q1 2024', 
    amount: 15000, 
    type: 'DEBIT', 
    relation: 'Vastgoed BV', 
    glAccount: '4000', 
    riskLevel: RiskLevel.LOW, 
    allocatedPeriod: '2024-Q1',
    category: TransitoriaCategory.PREPAID,
    status: TransactionStatus.PENDING 
  },
  { 
    id: '2', 
    date: '2023-12-20', 
    description: 'Software Licenties 2024 (Jaar)', 
    amount: 12000, 
    type: 'DEBIT', 
    relation: 'TechSoft', 
    glAccount: '4500', 
    riskLevel: RiskLevel.MEDIUM, 
    allocatedPeriod: '2024-YEAR',
    category: TransitoriaCategory.PREPAID,
    status: TransactionStatus.PENDING 
  },
  { 
    id: '3', 
    date: '2024-01-15', 
    description: 'Schoonmaak Januari', 
    amount: 500, 
    type: 'DEBIT', 
    relation: 'CleanPro', 
    glAccount: '4100', 
    riskLevel: RiskLevel.LOW, 
    allocatedPeriod: '2024-01',
    category: TransitoriaCategory.STANDARD,
    status: TransactionStatus.APPROVED 
  },
  { 
    id: '4', 
    date: '2024-03-01', 
    description: 'Accountantkosten 2023 nabetaling', 
    amount: 2500, 
    type: 'DEBIT', 
    relation: 'AuditFirm', 
    glAccount: '4800', 
    riskLevel: RiskLevel.HIGH, 
    allocatedPeriod: '2023-YEAR',
    category: TransitoriaCategory.CORRECTION,
    status: TransactionStatus.PENDING 
  },
  { 
    id: '5', 
    date: '2024-02-28', 
    description: 'Nog te ontvangen rente Q1', 
    amount: 450, 
    type: 'CREDIT', 
    relation: 'Bank NL', 
    glAccount: '8000', 
    riskLevel: RiskLevel.LOW, 
    allocatedPeriod: '2024-Q1',
    category: TransitoriaCategory.ACCRUED,
    status: TransactionStatus.PENDING 
  },
  { 
    id: '6', 
    date: '2024-02-15', 
    description: 'Leaseautos Februari', 
    amount: 3200, 
    type: 'DEBIT', 
    relation: 'LeasePlan', 
    glAccount: '4200', 
    riskLevel: RiskLevel.LOW, 
    allocatedPeriod: '2024-02',
    category: TransitoriaCategory.STANDARD,
    status: TransactionStatus.PENDING 
  },
];