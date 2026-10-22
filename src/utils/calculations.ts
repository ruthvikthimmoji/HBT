import {
  Settings,
  Expense,
  DailyLog,
  Worker,
  Payment,
  FinancialSummary,
  CategorySpending,
  PersonBalance,
  MonthlyTrendItem,
} from '../types';

export const LABOUR_CATEGORY = 'Labour (daily wages)';

export const DEFAULT_CATEGORIES = [
  'Foundation',
  'Cement & Steel',
  'Bricks & Sand',
  'Plumbing',
  'Electrical',
  'Painting',
  'Tiles & Flooring',
  'Carpentry & Doors',
  'Transport',
  'Permits & Fees',
  'Other',
];

export function computeFinancialSummary(
  settings: Settings,
  expenses: Expense[],
  logs: DailyLog[],
  workers: Worker[],
  payments: Payment[]
): FinancialSummary {
  // 1. Calculate Expenses Total
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 2. Calculate Total Wages from logs
  const totalWages = logs.reduce((sum, log) => sum + (Number(log.wage) || 0), 0);

  // 3. Total Cost
  const totalCost = totalExpenses + totalWages;

  // 4. Paid Total
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // 5. Pending Overall
  const pendingOverall = totalCost - totalPaid;

  // 6. Budget Left
  const budgetLeft = (Number(settings.budget) || 4500000) - totalCost;

  // 7. Spending by Category
  const catMap = new Map<string, number>();

  for (const exp of expenses) {
    const cat = exp.category?.trim() || 'Other';
    catMap.set(cat, (catMap.get(cat) || 0) + (Number(exp.amount) || 0));
  }

  // Add Labour wages as its own category if > 0 or if there are logs
  if (totalWages > 0 || logs.length > 0) {
    catMap.set(LABOUR_CATEGORY, (catMap.get(LABOUR_CATEGORY) || 0) + totalWages);
  }

  const categorySpendings: CategorySpending[] = Array.from(catMap.entries())
    .map(([category, amount]) => {
      const percentage = totalCost > 0 ? (amount / totalCost) * 100 : 0;
      const budget = settings.categoryBudgets?.[category];
      const overBudget = budget !== undefined && budget > 0 ? amount > budget : false;
      return {
        category,
        amount,
        percentage,
        budget,
        overBudget,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // 8. Pending by Person / Vendor
  interface PersonAgg {
    name: string;
    type: 'worker' | 'vendor' | 'other';
    entityId?: string;
    role?: string;
    owed: number;
    paid: number;
  }

  const personMap = new Map<string, PersonAgg>();
  const normKey = (str: string) => str.trim().toLowerCase();

  // Add all registered workers
  for (const w of workers) {
    const key = normKey(w.name);
    if (!personMap.has(key)) {
      personMap.set(key, {
        name: w.name,
        type: 'worker',
        entityId: w.id,
        role: w.role,
        owed: 0,
        paid: 0,
      });
    }
  }

  // Accumulate worker wages from logs
  for (const log of logs) {
    const name = log.workerName || 'Unknown Worker';
    const key = normKey(name);
    if (!personMap.has(key)) {
      personMap.set(key, {
        name: name,
        type: 'worker',
        entityId: log.workerId,
        owed: 0,
        paid: 0,
      });
    }
    const agg = personMap.get(key)!;
    agg.owed += Number(log.wage) || 0;
  }

  // Accumulate expenses vendor owed
  for (const exp of expenses) {
    if (exp.vendor && exp.vendor.trim()) {
      const key = normKey(exp.vendor);
      if (!personMap.has(key)) {
        personMap.set(key, {
          name: exp.vendor.trim(),
          type: 'vendor',
          entityId: exp.vendorId,
          owed: 0,
          paid: 0,
        });
      }
      const agg = personMap.get(key)!;
      agg.owed += Number(exp.amount) || 0;
    }
  }

  // Subtract payments to payee
  for (const p of payments) {
    if (p.payee && p.payee.trim()) {
      const key = normKey(p.payee);
      if (!personMap.has(key)) {
        personMap.set(key, {
          name: p.payee.trim(),
          type: p.payeeType || 'other',
          entityId: p.payeeId,
          owed: 0,
          paid: 0,
        });
      }
      const agg = personMap.get(key)!;
      agg.paid += Number(p.amount) || 0;
    }
  }

  const personBalances: PersonBalance[] = Array.from(personMap.values())
    .map((p) => {
      const balance = p.owed - p.paid;
      let status: 'Due' | 'Advance' | 'Settled' = 'Settled';
      if (balance > 0) status = 'Due';
      else if (balance < 0) status = 'Advance';

      return {
        name: p.name,
        type: p.type,
        entityId: p.entityId,
        role: p.role,
        owed: p.owed,
        paid: p.paid,
        balance,
        status,
      };
    })
    .sort((a, b) => {
      if (a.status === 'Due' && b.status !== 'Due') return -1;
      if (b.status === 'Due' && a.status !== 'Due') return 1;
      return b.balance - a.balance;
    });

  // 9. Monthly Trends (matching the user's MonthlyTrend tab)
  const monthMap = new Map<string, { expenses: number; wages: number; paid: number }>();

  // Helper to extract "YYYY-MM"
  const getMonthKey = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 7); // "2026-10"
  };

  expenses.forEach((e) => {
    const m = getMonthKey(e.date);
    if (!m) return;
    if (!monthMap.has(m)) monthMap.set(m, { expenses: 0, wages: 0, paid: 0 });
    monthMap.get(m)!.expenses += Number(e.amount) || 0;
  });

  logs.forEach((l) => {
    const m = getMonthKey(l.date);
    if (!m) return;
    if (!monthMap.has(m)) monthMap.set(m, { expenses: 0, wages: 0, paid: 0 });
    monthMap.get(m)!.wages += Number(l.wage) || 0;
  });

  payments.forEach((p) => {
    const m = getMonthKey(p.date);
    if (!m) return;
    if (!monthMap.has(m)) monthMap.set(m, { expenses: 0, wages: 0, paid: 0 });
    monthMap.get(m)!.paid += Number(p.amount) || 0;
  });

  const sortedMonths = Array.from(monthMap.keys()).sort();
  let cumulativeCost = 0;
  let cumulativePaid = 0;

  const monthlyTrends: MonthlyTrendItem[] = sortedMonths.map((m) => {
    const data = monthMap.get(m)!;
    const totalMonthCost = data.expenses + data.wages;
    cumulativeCost += totalMonthCost;
    cumulativePaid += data.paid;
    const pending = cumulativeCost - cumulativePaid;

    // Format "2026-10" as "Oct 2026"
    const [y, mon] = m.split('-');
    const dateObj = new Date(parseInt(y), parseInt(mon) - 1, 1);
    const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return {
      month: monthLabel,
      expenses: data.expenses,
      wages: data.wages,
      totalCost: totalMonthCost,
      paid: data.paid,
      cumulativeCost,
      cumulativePaid,
      pending,
    };
  });

  return {
    budget: Number(settings.budget) || 4500000,
    totalCost,
    totalExpenses,
    totalWages,
    totalPaid,
    pendingOverall,
    budgetLeft,
    categorySpendings,
    personBalances,
    monthlyTrends,
  };
}

export function computeWorkerStats(workerId: string, logs: DailyLog[]) {
  const workerLogs = logs.filter((l) => l.workerId === workerId);
  const fullDays = workerLogs.filter((l) => l.status === 'full').length;
  const halfDays = workerLogs.filter((l) => l.status === 'half').length;
  const daysWorked = fullDays + halfDays * 0.5;
  const totalEarned = workerLogs.reduce((sum, l) => sum + (Number(l.wage) || 0), 0);

  return {
    daysWorked,
    totalEarned,
    entriesCount: workerLogs.length,
  };
}
