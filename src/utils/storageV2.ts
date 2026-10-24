import {
  Agreement,
  Vendor,
  PaymentRecord,
  ScheduledPayment,
  MaterialEntry,
  SiteDailyLog,
  BudgetCategory,
  DashboardKPIs,
  MonthlySpend,
  AppSettingsV2,
  STANDARD_CATEGORIES,
} from '../types/v2';

const STORAGE_KEYS = {
  AGREEMENTS: 'hbt_v2_agreements',
  VENDORS: 'hbt_v2_vendors',
  PAYMENTS: 'hbt_v2_payments',
  SCHEDULE: 'hbt_v2_schedule',
  MATERIALS: 'hbt_v2_materials',
  SITE_LOGS: 'hbt_v2_site_logs',
  BUDGET: 'hbt_v2_budget',
  SETTINGS: 'hbt_v2_settings',
};

export const DEFAULT_SETTINGS_V2: AppSettingsV2 = {
  projectName: 'My House Construction',
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1QOEMad73BhJAYoqVusVGxkx_rBzhScpvWd3t3Qjxhfw/edit?gid=456381890#gid=456381890',
  gasWebAppUrl: '',
  startMonth: '2026-10',
  currencySymbol: '₹',
};

// Seed initial data directly from the user's template rows
export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'V-001',
    name: 'Ramesh (Mason Contractor)',
    role: 'Mason / Labour contractor',
    phone: '98450 00000',
    totalAgreed: 400000,
    advanceGiven: 50000,
    totalPaid: 50000,
    balanceDue: 350000,
    percentPaid: 12.5,
    workValueDone: 40000,
    paidAheadOfWork: 10000,
    notes: 'Masonry & plastering work for full house',
  },
  {
    id: 'V-002',
    name: 'Sri Lakshmi Traders',
    role: 'Cement & Steel Supplier',
    phone: '98451 11222',
    totalAgreed: 0,
    advanceGiven: 0,
    totalPaid: 42000,
    balanceDue: 0,
    percentPaid: 100,
    workValueDone: 42000,
    paidAheadOfWork: 0,
    notes: 'Primary material supplier near site',
  },
];

export const INITIAL_AGREEMENTS: Agreement[] = [
  {
    id: 'A-001',
    dateAgreed: '2026-10-01',
    vendor: 'Ramesh (Mason Contractor)',
    workScope: 'Brickwork & plastering labour for whole house (labour only, material by me)',
    category: 'Brickwork / Masonry',
    agreedAmount: 400000,
    agreementType: 'Verbal / Phone',
    startDate: '2026-10-02',
    expectedEndDate: '2027-01-28',
    paymentTerms: '₹50,000 advance, then ₹75,000 per milestone, balance on completion',
    advanceAgreed: 50000,
    advancePaid: 50000,
    totalPaid: 50000,
    balanceToPay: 350000,
    percentPaid: 12.5,
    workCompletedPercent: 10,
    workValueDone: 40000,
    paidAheadOfWork: 10000,
    status: 'In Progress',
    notes: 'Active contract for ground floor & first floor brickwork',
  },
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'P-001',
    date: '2026-10-02',
    paidTo: 'Ramesh (Mason Contractor)',
    agreementRef: 'A-001',
    agreedWork: 'Brickwork & plastering labour for whole house (labour only, material by me)',
    category: 'Brickwork / Masonry',
    description: 'Advance for 1st floor wall labour',
    amount: 50000,
    paymentType: 'Advance',
    mode: 'UPI',
    txnRef: 'UPI 4128xxxx91',
    receiptReceived: true,
    receiptNo: 'R-001',
    receiptLocation: 'Folder A / Page 1',
    remarks: 'Advance paid before work start',
  },
];

export const INITIAL_MATERIALS: MaterialEntry[] = [
  {
    id: 'M-001',
    date: '2026-10-03',
    material: 'Cement (OPC 53)',
    supplier: 'Sri Lakshmi Traders',
    qty: 100,
    unit: 'Bags',
    rate: 420,
    amount: 42000,
    billNo: 'INV-2231',
    delivered: 'Yes',
    paymentStatus: 'Paid',
    billLink: 'Folder B / Page 4',
    remarks: 'Delivered for column and slab works',
  },
];

export const INITIAL_SITE_LOGS: SiteDailyLog[] = [
  {
    id: 'S-001',
    date: '2026-10-03',
    day: 'Tue',
    stage: 'First Floor Slab Casting',
    weather: 'Sunny',
    workDone: 'Shuttering for 1st floor slab started. Cement delivered. Rebar binding in progress.',
    labourCount: 8,
    whoWasOnSite: 'Ramesh, site engineer, 6 masons/helpers',
    issuesDelays: 'Sand delivery 1 day late',
    decisionsGiven: 'Told Ramesh to finish shuttering by 10th',
    photoRef: 'Photos folder / 03-Oct',
    nextSteps: 'Steel bar bending & electrical piping conduits next',
  },
];

export const INITIAL_SCHEDULE: ScheduledPayment[] = [
  {
    id: 'SCH-001',
    dueDate: '2026-10-20',
    vendor: 'Ramesh (Mason Contractor)',
    agreementRef: 'A-001',
    milestone: 'Slab shuttering completion',
    amountDue: 75000,
    status: 'Pending',
    daysLeft: 27,
    notes: 'To be settled upon engineer inspection approval',
  },
];

export const INITIAL_BUDGET: BudgetCategory[] = STANDARD_CATEGORIES.map((cat) => {
  let planned = 0;
  if (cat === 'Brickwork / Masonry') planned = 450000;
  if (cat === 'RCC / Structure (Steel, Cement, Shuttering)') planned = 1200000;
  if (cat === 'Excavation & Foundation') planned = 350000;
  if (cat === 'Plumbing & Sanitary') planned = 250000;
  if (cat === 'Electrical') planned = 250000;
  if (cat === 'Plastering') planned = 200000;
  if (cat === 'Flooring & Tiles') planned = 400000;
  if (cat === 'Painting') planned = 200000;
  if (cat === 'Doors & Windows') planned = 300000;
  if (cat === 'Kitchen') planned = 250000;
  if (cat === 'Contingency') planned = 150000;

  return {
    category: cat,
    budget: planned,
    spent: 0,
    remaining: planned,
    percentUsed: 0,
    status: 'On Track',
  };
});

// Storage Access Functions
export function loadSettingsV2(): AppSettingsV2 {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS_V2;
    return { ...DEFAULT_SETTINGS_V2, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS_V2;
  }
}

export function saveSettingsV2(settings: AppSettingsV2): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings v2:', e);
  }
}

export function loadAgreements(): Agreement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AGREEMENTS);
    if (!raw) return INITIAL_AGREEMENTS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_AGREEMENTS;
  }
}

export function saveAgreements(agreements: Agreement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(agreements));
  } catch (e) {
    console.error('Error saving agreements:', e);
  }
}

export function loadVendors(): Vendor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VENDORS);
    if (!raw) return INITIAL_VENDORS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_VENDORS;
  }
}

export function saveVendors(vendors: Vendor[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
  } catch (e) {
    console.error('Error saving vendors:', e);
  }
}

export function loadPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) return INITIAL_PAYMENTS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENTS;
  }
}

export function savePayments(payments: PaymentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (e) {
    console.error('Error saving payments:', e);
  }
}

export function loadMaterials(): MaterialEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (!raw) return INITIAL_MATERIALS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_MATERIALS;
  }
}

export function saveMaterials(materials: MaterialEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  } catch (e) {
    console.error('Error saving materials:', e);
  }
}

export function loadSiteLogs(): SiteDailyLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_LOGS);
    if (!raw) return INITIAL_SITE_LOGS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_SITE_LOGS;
  }
}

export function saveSiteLogs(logs: SiteDailyLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SITE_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving site logs:', e);
  }
}

export function loadSchedule(): ScheduledPayment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (!raw) return INITIAL_SCHEDULE;
    return JSON.parse(raw);
  } catch {
    return INITIAL_SCHEDULE;
  }
}

export function saveSchedule(schedule: ScheduledPayment[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  } catch (e) {
    console.error('Error saving schedule:', e);
  }
}

export function loadBudget(): BudgetCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (!raw) return INITIAL_BUDGET;
    return JSON.parse(raw);
  } catch {
    return INITIAL_BUDGET;
  }
}

export function saveBudget(budget: BudgetCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  } catch (e) {
    console.error('Error saving budget:', e);
  }
}

// -------------------------------------------------------------
// CORE BUSINESS LOGIC & CALCULATION ENGINE
// -------------------------------------------------------------

export function calculateAggregates(
  agreements: Agreement[],
  payments: PaymentRecord[],
  materials: MaterialEntry[],
  siteLogs: SiteDailyLog[],
  schedule: ScheduledPayment[],
  budget: BudgetCategory[]
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Recalculate Agreements based on Payments
  const updatedAgreements = agreements.map((agr) => {
    const agrPayments = payments.filter((p) => p.agreementRef === agr.id);
    const totalPaid = agrPayments.reduce((acc, p) => acc + p.amount, 0);
    const advancePaid = agrPayments
      .filter((p) => p.paymentType === 'Advance')
      .reduce((acc, p) => acc + p.amount, 0);
    const balanceToPay = Math.max(0, agr.agreedAmount - totalPaid);
    const percentPaid = agr.agreedAmount > 0 ? (totalPaid / agr.agreedAmount) * 100 : 0;
    const workValueDone = (agr.agreedAmount * (agr.workCompletedPercent || 0)) / 100;
    const paidAheadOfWork = Math.max(0, totalPaid - workValueDone);

    let status = agr.status;
    if (agr.workCompletedPercent >= 100 && balanceToPay <= 0) {
      status = 'Completed';
    }

    return {
      ...agr,
      advancePaid,
      totalPaid,
      balanceToPay,
      percentPaid,
      workValueDone,
      paidAheadOfWork,
      status,
    };
  });

  // 2. Recalculate Schedule Days Left & Status
  const updatedSchedule = schedule.map((item) => {
    if (item.status === 'Paid') {
      return { ...item, daysLeft: 0 };
    }
    const due = new Date(item.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let status = item.status;
    if (daysLeft < 0) {
      status = 'Overdue';
    } else if (daysLeft <= 7) {
      status = 'Upcoming';
    } else {
      status = 'Pending';
    }
    return { ...item, daysLeft, status };
  });

  // 3. Recalculate Budget Categories
  const updatedBudget = budget.map((b) => {
    const spent = payments
      .filter((p) => p.category === b.category)
      .reduce((acc, p) => acc + p.amount, 0);
    const remaining = b.budget - spent;
    const percentUsed = b.budget > 0 ? (spent / b.budget) * 100 : spent > 0 ? 100 : 0;
    let status: 'On Track' | 'Warning' | 'Over Budget' = 'On Track';
    if (spent > b.budget && b.budget > 0) {
      status = 'Over Budget';
    } else if (percentUsed >= 85) {
      status = 'Warning';
    }
    return {
      ...b,
      spent,
      remaining,
      percentUsed,
      status,
    };
  });

  // 4. Calculate Vendors Roll-up
  const vendorNames = Array.from(
    new Set([
      ...updatedAgreements.map((a) => a.vendor),
      ...payments.map((p) => p.paidTo),
    ])
  );

  const updatedVendors: Vendor[] = vendorNames.map((name, idx) => {
    const agrList = updatedAgreements.filter((a) => a.vendor === name);
    const payList = payments.filter((p) => p.paidTo === name);

    const totalAgreed = agrList.reduce((acc, a) => acc + a.agreedAmount, 0);
    const advanceGiven = payList
      .filter((p) => p.paymentType === 'Advance')
      .reduce((acc, p) => acc + p.amount, 0);
    const totalPaid = payList.reduce((acc, p) => acc + p.amount, 0);
    const balanceDue = Math.max(0, totalAgreed - totalPaid);
    const percentPaid = totalAgreed > 0 ? (totalPaid / totalAgreed) * 100 : 0;
    const workValueDone = agrList.reduce((acc, a) => acc + a.workValueDone, 0);
    const paidAheadOfWork = Math.max(0, totalPaid - workValueDone);

    const existingVendor = INITIAL_VENDORS.find((v) => v.name === name);
    return {
      id: existingVendor?.id || `V-${String(idx + 1).padStart(3, '0')}`,
      name,
      role: existingVendor?.role || agrList[0]?.category || 'Contractor / Supplier',
      phone: existingVendor?.phone || '',
      totalAgreed,
      advanceGiven,
      totalPaid,
      balanceDue,
      percentPaid,
      workValueDone,
      paidAheadOfWork,
      notes: existingVendor?.notes || '',
    };
  });

  // 5. Compute Dashboard KPIs
  const totalAgreedWithVendors = updatedAgreements.reduce((acc, a) => acc + a.agreedAmount, 0);
  const totalPaidAgreements = updatedAgreements.reduce((acc, a) => acc + a.totalPaid, 0);
  const balanceStillToPay = Math.max(0, totalAgreedWithVendors - totalPaidAgreements);
  const advancesGiven = payments
    .filter((p) => p.paymentType === 'Advance')
    .reduce((acc, p) => acc + p.amount, 0);
  const paidAheadOfWorkDone = updatedAgreements.reduce((acc, a) => acc + a.paidAheadOfWork, 0);

  // Next 7 Days Amount Due
  const next7DaysAmountDue = updatedSchedule
    .filter((s) => s.status !== 'Paid' && s.daysLeft >= 0 && s.daysLeft <= 7)
    .reduce((acc, s) => acc + s.amountDue, 0);

  // Pending Material Bills
  const materialBillsPending = materials
    .filter((m) => m.paymentStatus === 'Pending')
    .reduce((acc, m) => acc + m.amount, 0);

  const siteLogEntriesCount = siteLogs.length;

  const totalBudget = updatedBudget.reduce((acc, b) => acc + b.budget, 0);
  const totalSpent = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalBudgetRemaining = totalBudget - totalSpent;

  const missingReceiptsCount = payments.filter((p) => !p.receiptReceived).length;
  const overduePaymentsCount = updatedSchedule.filter((s) => s.status === 'Overdue').length;

  const kpis: DashboardKPIs = {
    totalAgreedWithVendors,
    balanceStillToPay,
    advancesGiven,
    paidAheadOfWorkDone,
    next7DaysAmountDue,
    materialBillsPending,
    siteLogEntriesCount,
    totalBudget,
    totalSpent,
    totalBudgetRemaining,
    missingReceiptsCount,
    overduePaymentsCount,
  };

  // 6. Monthly Spend Trend (12 Months)
  const monthlyTrends = generateMonthlyTrends(payments);

  return {
    agreements: updatedAgreements,
    schedule: updatedSchedule,
    budget: updatedBudget,
    vendors: updatedVendors,
    kpis,
    monthlyTrends,
  };
}

export function generateMonthlyTrends(payments: PaymentRecord[]): MonthlySpend[] {
  const months: MonthlySpend[] = [];
  const start = new Date(2026, 9, 1); // Oct 2026

  for (let i = 0; i < 12; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });

    const totalForMonth = payments
      .filter((p) => {
        if (!p.date) return false;
        return p.date.startsWith(key);
      })
      .reduce((acc, p) => acc + p.amount, 0);

    months.push({
      month: monthName,
      key,
      amount: totalForMonth,
    });
  }

  return months;
}
