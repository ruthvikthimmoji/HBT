// V2 Data Types matching Google Sheet: 1QOEMad73BhJAYoqVusVGxkx_rBzhScpvWd3t3Qjxhfw

export type AgreementType = 'Verbal / Phone' | 'Written Quote' | 'Stamp Paper / Contract';
export type AgreementStatus = 'In Progress' | 'Completed' | 'On Hold' | 'Draft';

export interface Agreement {
  id: string; // e.g. A-001
  dateAgreed: string; // YYYY-MM-DD
  vendor: string;
  workScope: string;
  category: string;
  agreedAmount: number;
  agreementType: AgreementType;
  startDate: string;
  expectedEndDate: string;
  paymentTerms: string;
  advanceAgreed: number;
  advancePaid: number;
  totalPaid: number;
  balanceToPay: number;
  percentPaid: number;
  workCompletedPercent: number; // 0 - 100
  workValueDone: number; // agreedAmount * (workCompletedPercent / 100)
  paidAheadOfWork: number; // Math.max(0, totalPaid - workValueDone)
  status: AgreementStatus;
  docUrl?: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  role: string;
  phone: string;
  totalAgreed: number;
  advanceGiven: number;
  totalPaid: number;
  balanceDue: number;
  percentPaid: number;
  workValueDone: number;
  paidAheadOfWork: number;
  notes?: string;
}

export type PaymentType =
  | 'Advance'
  | 'Milestone / Progress'
  | 'Final Settlement'
  | 'Material Bill'
  | 'Refund Received';

export type PaymentMode = 'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque';

export interface PaymentRecord {
  id: string; // P-001
  date: string; // YYYY-MM-DD
  paidTo: string; // Vendor name
  agreementRef?: string; // e.g. A-001
  agreedWork?: string;
  category: string;
  description: string;
  amount: number;
  paymentType: PaymentType;
  mode: PaymentMode;
  txnRef?: string;
  receiptReceived: boolean; // Yes / No (Turns red if missing!)
  receiptNo?: string;
  receiptLocation?: string; // Folder, Drive link, or photo data url
  remarks?: string;
}

export type ScheduleStatus = 'Pending' | 'Upcoming' | 'Paid' | 'Overdue';

export interface ScheduledPayment {
  id: string; // SCH-001
  dueDate: string; // YYYY-MM-DD
  vendor: string;
  agreementRef?: string;
  milestone: string;
  amountDue: number;
  status: ScheduleStatus;
  daysLeft: number; // Computed
  paidOn?: string | null;
  notes?: string;
}

export type MaterialUnit =
  | 'Bags'
  | 'Tons'
  | 'Brass'
  | 'Sq.ft'
  | 'Loads'
  | 'Nos'
  | 'Trips'
  | 'Kg'
  | 'Ltr';

export interface MaterialEntry {
  id: string; // M-001
  date: string; // YYYY-MM-DD
  material: string;
  supplier: string;
  qty: number;
  unit: MaterialUnit;
  rate: number;
  amount: number; // qty * rate
  billNo?: string;
  delivered: 'Yes' | 'No' | 'Partial';
  paymentStatus: 'Paid' | 'Pending';
  billLink?: string;
  remarks?: string;
}

export type WeatherType = 'Sunny' | 'Rainy' | 'Cloudy' | 'Hot';

export interface SiteDailyLog {
  id: string; // S-001
  date: string; // YYYY-MM-DD
  day: string; // Mon, Tue, etc.
  stage: string; // Structure, Brickwork, Plastering, etc.
  weather: WeatherType;
  workDone: string;
  labourCount: number;
  whoWasOnSite: string;
  issuesDelays?: string;
  decisionsGiven?: string;
  photoRef?: string;
  nextSteps?: string;
}

export interface BudgetCategory {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: 'On Track' | 'Warning' | 'Over Budget';
}

export interface MonthlySpend {
  month: string; // "Oct 2026"
  key: string; // "2026-10"
  amount: number;
}

export interface DashboardKPIs {
  totalAgreedWithVendors: number;
  balanceStillToPay: number;
  advancesGiven: number;
  paidAheadOfWorkDone: number;
  next7DaysAmountDue: number;
  materialBillsPending: number;
  siteLogEntriesCount: number;
  totalBudget: number;
  totalSpent: number;
  totalBudgetRemaining: number;
  missingReceiptsCount: number;
  overduePaymentsCount: number;
}

export interface AppSettingsV2 {
  projectName: string;
  sheetUrl: string;
  gasWebAppUrl: string;
  startMonth: string; // e.g. "2026-10"
  lastSyncedAt?: string;
  currencySymbol: string;
}

export const STANDARD_CATEGORIES: string[] = [
  'Land & Registration',
  'Approvals & Plan Sanction',
  'Architect / Design / Engineer',
  'Excavation & Foundation',
  'RCC / Structure (Steel, Cement, Shuttering)',
  'Brickwork / Masonry',
  'Plastering',
  'Waterproofing',
  'Flooring & Tiles',
  'Electrical',
  'Plumbing & Sanitary',
  'Doors & Windows',
  'Carpentry & Woodwork',
  'Painting',
  'Kitchen',
  'Compound Wall & Gate',
  'Borewell / Sump / Septic',
  'Utility Connections (BESCOM / Water)',
  'Interior & Furnishing',
  'Labour (General)',
  'Transport & Misc',
  'Contingency',
];

export const CONSTRUCTION_STAGES: string[] = [
  'Planning & Approvals',
  'Excavation & Foundation',
  'Plinth Beam & Filling',
  'Ground Floor Columns',
  'First Floor Slab Casting',
  'Upper Floor Columns & Slabs',
  'Brickwork & Partitions',
  'Internal & External Plastering',
  'Electrical & Plumbing Concealed',
  'Flooring & Tile Fixing',
  'Doors, Windows & Grills',
  'Painting & Finishing',
  'Exterior Compound & Sump',
  'Final Handover & Griha Pravesh',
];
