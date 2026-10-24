import React from 'react';
import { FinancialSummary, PersonBalance, CategorySpending } from '../types';
import { formatCurrency } from '../utils/format';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

interface SummaryTabProps {
  summary: FinancialSummary;
  onOpenSettings: () => void;
  onQuickPay: (person: PersonBalance) => void;
  onViewAllLogs: () => void;
  onOpenSheet: () => void;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  summary,
  onOpenSettings,
  onQuickPay,
  onViewAllLogs,
  onOpenSheet,
}) => {
  const isPendingAboveZero = summary.pendingOverall > 0;
  const isBudgetNegative = summary.budgetLeft < 0;

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Total Budget */}
        <div className="hbt-card">
          <div className="flex items-center justify-between text-xs text-stone font-medium mb-1">
            <span>Project Budget</span>
            <button
              onClick={onOpenSettings}
              className="text-[11px] text-terracotta hover:underline font-semibold"
            >
              Edit
            </button>
          </div>
          <div className="text-[19px] font-bold text-charcoal whitespace-nowrap tabular-num">
            {formatCurrency(summary.budget)}
          </div>
          <div className="text-[11px] text-stone mt-0.5">
            Planned Total
          </div>
        </div>

        {/* Total Cost */}
        <div className="hbt-card">
          <div className="text-xs text-stone font-medium mb-1">
            Total Cost
          </div>
          <div className="text-[19px] font-bold text-charcoal whitespace-nowrap tabular-num">
            {formatCurrency(summary.totalCost)}
          </div>
          <div className="text-[11px] text-stone mt-0.5">
            Expenses + Wages
          </div>
        </div>

        {/* Total Paid */}
        <div className="hbt-card">
          <div className="text-xs text-stone font-medium mb-1">
            Total Paid
          </div>
          <div className="text-[19px] font-bold text-money-green whitespace-nowrap tabular-num">
            {formatCurrency(summary.totalPaid)}
          </div>
          <div className="text-[11px] text-money-green/80 mt-0.5">
            Disbursed
          </div>
        </div>

        {/* Pending Overall */}
        <div className="hbt-card">
          <div className="text-xs text-stone font-medium mb-1">
            Pending Dues
          </div>
          <div
            className={`text-[19px] font-bold whitespace-nowrap tabular-num ${
              isPendingAboveZero
                ? 'text-money-red'
                : 'text-money-green'
            }`}
          >
            {formatCurrency(summary.pendingOverall)}
          </div>
          <div className="text-[11px] text-stone mt-0.5">
            {isPendingAboveZero ? 'To be cleared' : 'All clear'}
          </div>
        </div>

        {/* Budget Left */}
        <div className="hbt-card col-span-2 sm:col-span-2">
          <div className="flex items-center justify-between text-xs text-stone font-medium mb-1">
            <span>Budget Remaining</span>
            {summary.budget > 0 && (
              <span className="text-[11px] font-bold">
                {Math.max(0, Math.round((summary.budgetLeft / summary.budget) * 100))}% left
              </span>
            )}
          </div>
          <div
            className={`text-[21px] font-bold whitespace-nowrap tabular-num ${
              isBudgetNegative
                ? 'text-money-red'
                : 'text-charcoal'
            }`}
          >
            {formatCurrency(summary.budgetLeft)}
          </div>
          {isBudgetNegative ? (
            <div className="flex items-center gap-1 text-[12px] text-money-red font-medium mt-1">
              <AlertCircle size={13} />
              <span>Over budget by {formatCurrency(Math.abs(summary.budgetLeft))}</span>
            </div>
          ) : (
            <div className="text-[11px] text-stone mt-0.5">
              Expenses: {formatCurrency(summary.totalExpenses)} • Wages: {formatCurrency(summary.totalWages)}
            </div>
          )}
        </div>
      </div>

      {/* 2. Spending by Category */}
      <div className="hbt-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[16px] font-bold text-charcoal font-['Nunito_Sans',sans-serif]">
              Category Performance
            </h2>
            <p className="text-xs text-stone">
              Spend compared with planned category budgets
            </p>
          </div>
          <button
            onClick={onViewAllLogs}
            className="text-xs text-terracotta font-bold hover:underline flex items-center gap-0.5"
          >
            <span>See Logs</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {summary.categorySpendings.length === 0 ? (
          <div className="py-6 text-center text-sm text-stone">
            No expenses or wages recorded yet.
          </div>
        ) : (
          <div className="space-y-3.5">
            {summary.categorySpendings.map((cat) => (
              <div key={cat.category} className="group">
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-charcoal">
                      {cat.category}
                    </span>
                    {cat.overBudget && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-money-red/10 text-money-red">
                        Over Budget
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold tabular-num text-charcoal">
                      {formatCurrency(cat.amount)}
                    </span>
                    <span className="text-xs text-stone ml-1.5 tabular-num">
                      ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* 8px high proportion bar (Vert d'eau track, Terracotta/Orange corail fill) */}
                <div className="w-full h-2 rounded-full bg-[#EBECDC] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-terracotta"
                    style={{ width: `${Math.min(100, Math.max(2, cat.percentage))}%` }}
                  />
                </div>

                {cat.budget && (
                  <div className="flex items-center justify-between text-[11px] text-stone mt-0.5">
                    <span>Planned: {formatCurrency(cat.budget)}</span>
                    <span>
                      {cat.amount > cat.budget
                        ? `Exceeded by ${formatCurrency(cat.amount - cat.budget)}`
                        : `${formatCurrency(cat.budget - cat.amount)} remaining`}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Monthly Trend Summary Card (matches MonthlyTrend tab in Sheet) */}
      {summary.monthlyTrends && summary.monthlyTrends.length > 0 && (
        <div className="hbt-card">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[15px] font-bold text-charcoal font-['Nunito_Sans',sans-serif] flex items-center gap-1.5">
              <Calendar size={16} className="text-terracotta" />
              <span>Monthly Trend</span>
            </h2>
            <span className="text-xs text-stone">
              Month-by-month progress
            </span>
          </div>

          <div className="divide-y divide-sand/50">
            {summary.monthlyTrends.map((t) => (
              <div key={t.month} className="py-2.5 flex items-center justify-between text-xs first:pt-1 last:pb-1">
                <div>
                  <span className="font-bold text-charcoal text-sm block">
                    {t.month}
                  </span>
                  <span className="text-stone mt-0.5 block tabular-num">
                    Materials: {formatCurrency(t.expenses)} • Wages: {formatCurrency(t.wages)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-charcoal tabular-num block">
                    {formatCurrency(t.totalCost)}
                  </span>
                  <span className="text-money-green tabular-num block">
                    Paid: {formatCurrency(t.paid)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Pending Dues by Person / Vendor */}
      <div className="hbt-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[16px] font-bold text-charcoal font-['Nunito_Sans',sans-serif]">
              Pending by Person / Vendor
            </h2>
            <p className="text-xs text-stone mt-0.5">
              Live balances calculated from expenses, wages, and payments
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sand/40 text-stone">
            {summary.personBalances.length} accounts
          </span>
        </div>

        {summary.personBalances.length === 0 ? (
          <div className="py-6 text-center text-sm text-stone">
            No workers or vendor accounts recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-sand/50">
            {summary.personBalances.map((person) => {
              const isDue = person.status === 'Due';
              const isSettled = person.status === 'Settled';
              const isAdvance = person.status === 'Advance';

              return (
                <div
                  key={person.name}
                  className="py-3 flex items-center justify-between gap-3 first:pt-1 last:pb-1"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[15px] text-charcoal truncate">
                        {person.name}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded uppercase font-medium bg-sand/40 text-stone flex-shrink-0">
                        {person.type === 'worker' ? (person.role || 'Worker') : 'Vendor'}
                      </span>
                    </div>
                    <div className="text-xs text-stone mt-0.5 space-x-2 tabular-num">
                      <span>Owed: {formatCurrency(person.owed)}</span>
                      <span>•</span>
                      <span>Paid: {formatCurrency(person.paid)}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className={`text-[15px] font-bold tabular-num ${
                        isDue
                          ? 'text-money-red'
                          : isSettled
                          ? 'text-money-green'
                          : 'text-stone'
                      }`}
                    >
                      {isDue && `${formatCurrency(person.balance)} due`}
                      {isSettled && `Settled`}
                      {isAdvance && `${formatCurrency(Math.abs(person.balance))} advance`}
                    </div>

                    {isDue && (
                      <button
                        onClick={() => onQuickPay(person)}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta hover:underline"
                      >
                        <span>Record payment</span>
                        <ArrowUpRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
