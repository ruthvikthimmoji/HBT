import * as XLSX from 'xlsx';
import { Settings, Expense, DailyLog, Worker, Payment } from '../types';
import { computeFinancialSummary, computeWorkerStats } from './calculations';
import { getTodayDateString } from './format';

export function exportToExcel(
  settings: Settings,
  expenses: Expense[],
  logs: DailyLog[],
  workers: Worker[],
  payments: Payment[]
) {
  const summary = computeFinancialSummary(settings, expenses, logs, workers, payments);
  const workbook = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryData: (string | number)[][] = [
    ['House Build Tracker - Project Financial Summary'],
    ['Exported on', getTodayDateString()],
    ['Project Name', settings.projectName || 'My House Build'],
    [''],
    ['Overall Financial Overview'],
    ['Metric', 'Amount (INR)'],
    ['Total Budget', summary.budget],
    ['Total Cost (Expenses + Wages)', summary.totalCost],
    ['Total Paid', summary.totalPaid],
    ['Pending Overall', summary.pendingOverall],
    ['Budget Remaining', summary.budgetLeft],
    [''],
    ['Category Spending Breakdown'],
    ['Category', 'Amount (INR)', 'Percentage (%)', 'Category Budget', 'Status'],
    ...summary.categorySpendings.map((c) => [
      c.category,
      c.amount,
      `${c.percentage.toFixed(1)}%`,
      c.budget || '-',
      c.overBudget ? 'OVER BUDGET' : 'On Track',
    ]),
    [''],
    ['Pending Dues by Person / Vendor'],
    ['Name', 'Type', 'Total Owed', 'Total Paid', 'Balance', 'Status'],
    ...summary.personBalances.map((p) => [
      p.name,
      p.type,
      p.owed,
      p.paid,
      p.balance,
      p.status,
    ]),
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // 2. Expenses Sheet
  const expensesData = expenses
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((e) => ({
      Date: e.date,
      Category: e.category,
      Item: e.item,
      Vendor: e.vendor || '-',
      Amount: e.amount,
      Note: e.note || '',
    }));
  const expensesSheet = XLSX.utils.json_to_sheet(expensesData);
  XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');

  // 3. Daily Log Sheet
  const logsData = logs
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((l) => ({
      Date: l.date,
      'Worker Name': l.workerName,
      Status: l.status.toUpperCase(),
      'Daily Wage': l.wage,
      Note: l.note || '',
    }));
  const logsSheet = XLSX.utils.json_to_sheet(logsData);
  XLSX.utils.book_append_sheet(workbook, logsSheet, 'Daily log');

  // 4. Workers Sheet
  const workersData = workers.map((w) => {
    const stats = computeWorkerStats(w.id, logs);
    return {
      'Worker ID': w.id,
      Name: w.name,
      Role: w.role,
      'Daily Rate': w.rate,
      'Days Worked': stats.daysWorked,
      'Total Earned': stats.totalEarned,
      'Active Status': w.active ? 'Active' : 'Inactive',
      Phone: w.phone || '-',
    };
  });
  const workersSheet = XLSX.utils.json_to_sheet(workersData);
  XLSX.utils.book_append_sheet(workbook, workersSheet, 'Workers');

  // 5. Payments Sheet
  const paymentsData = payments
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => ({
      Date: p.date,
      'Paid To': p.payee,
      Amount: p.amount,
      Mode: p.mode,
      Type: p.payeeType || 'other',
      Note: p.note || '',
    }));
  const paymentsSheet = XLSX.utils.json_to_sheet(paymentsData);
  XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Payments');

  // Trigger download in browser
  const filename = `House_Build_Tracker_${getTodayDateString()}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
