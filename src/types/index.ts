export type AttendanceStatus = 'full' | 'half' | 'absent';

export type PaymentMode = 'Cash' | 'UPI' | 'Bank' | 'Cheque';

export type LogType = 'expense' | 'attendance' | 'payment';

export interface Settings {
  budget: number;
  projectName: string;
  projectStartDate?: string;
  nearLimitWarningPct?: number;
  gasWebAppUrl?: string;
  sheetUrl?: string;
  lastSyncedAt?: string;
  categoryBudgets: Record<string, number>;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  rate: number;
  active: boolean;
  phone?: string;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  item: string;
  vendor?: string;
  vendorId?: string;
  amount: number;
  photoReceipt?: string; // base64 or url
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DailyLog {
  id: string; // date_workerId
  date: string; // YYYY-MM-DD
  workerId: string;
  workerName: string;
  status: AttendanceStatus;
  wage: number;
  customWage?: number; // v2 overtime / custom wage
  note?: string;
}

export interface Payment {
  id: string;
  date: string; // YYYY-MM-DD
  payee: string;
  payeeType: 'worker' | 'vendor' | 'other';
  payeeId?: string;
  amount: number;
  mode: PaymentMode;
  note?: string;
  photoProof?: string;
  createdAt: string;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  budget?: number;
  overBudget?: boolean;
}

export interface PersonBalance {
  name: string;
  type: 'worker' | 'vendor' | 'other';
  entityId?: string;
  role?: string;
  owed: number;
  paid: number;
  balance: number; // positive = Due, negative = Advance, 0 = Settled
  status: 'Due' | 'Advance' | 'Settled';
}

export interface MonthlyTrendItem {
  month: string;
  expenses: number;
  wages: number;
  totalCost: number;
  paid: number;
  cumulativeCost: number;
  cumulativePaid: number;
  pending: number;
}

export interface FinancialSummary {
  budget: number;
  totalCost: number;
  totalExpenses: number;
  totalWages: number;
  totalPaid: number;
  pendingOverall: number;
  budgetLeft: number;
  categorySpendings: CategorySpending[];
  personBalances: PersonBalance[];
  monthlyTrends: MonthlyTrendItem[];
}

export interface UnifiedLog {
  id: string;
  type: LogType;
  date: string;
  title: string;
  subtitle: string;
  amount: number;
  category?: string;
  statusBadge?: string;
  vendorOrWorker?: string;
  paymentMode?: PaymentMode;
  note?: string;
  photoUrl?: string;
  rawItem: Expense | DailyLog | Payment;
}
