import React from 'react';
import { FinancialSummary, PersonBalance, CategorySpending } from '../types';
import { formatCurrency } from '../utils/format';
import { AlertCircle, CheckCircle2, ChevronRight, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';

interface SummaryTabProps {
  summary: FinancialSummary;
  onOpenSettings: () => void;
  onQuickPay: (person: PersonBalance) => void;
  onSelectCategoryFilter?: (cat: string) => void;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  summary,
  onOpenSettings,
  onQuickPay,
  onSelectCategoryFilter,
}) => {
  const isPendingAboveZero = summary.pendingOverall > 0;
  const isBudgetNegative = summary.budgetLeft < 0;

  return (
    <div className="space-y-4">
      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Total Budget */}
        <div className="hbt-card">
          <div className="flex items-center justify-between text-xs text-stone dark:text-stone-dark font-medium mb-1">
            <span>Total Budget</span>
            <button
              onClick={onOpenSettings}
              className="text-[11px] text-terracotta dark:text-terracotta-dark hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="text-[19px] font-bold text-charcoal dark:text-text-dark whitespace-nowrap tabular-num">
            {formatCurrency(summary.budget)}
          </div>
        </div>

        {/* Total Cost */}
        <div className="hbt-card">
          <div className="text-xs text-stone dark:text-stone-dark font-medium mb-1">
            Total Cost
          </div>
          <div className="text-[19px] font-bold text-charcoal dark:text-text-dark whitespace-nowrap tabular-num">
            {formatCurrency(summary.totalCost)}
          </div>
          <div className="text-[11px] text-stone dark:text-stone-dark mt-0.5">
            Expenses + Wages
          </div>
        </div>

        {/* Total Paid */}
        <div className="hbt-card">
          <div className="text-xs text-stone dark:text-stone-dark font-medium mb-1">
            Total Paid
          </div>
          <div className="text-[19px] font-bold text-money-green dark:text-money-green-dark whitespace-nowrap tabular-num">
            {formatCurrency(summary.totalPaid)}
          </div>
          <div className="text-[11px] text-money-green/80 dark:text-money-green-dark/80 mt-0.5">
            Disbursed
          </div>
        </div>

        {/* Pending Overall */}
        <div className="hbt-card">
          <div className="text-xs text-stone dark:text-stone-dark font-medium mb-1">
            Pending Dues
          </div>
          <div
            className={`text-[19px] font-bold whitespace-nowrap tabular-num ${
              isPendingAboveZero
                ? 'text-money-red dark:text-money-red-dark'
                : 'text-money-green dark:text-money-green-dark'
            }`}
          >
            {formatCurrency(summary.pendingOverall)}
          </div>
          <div className="text-[11px] text-stone dark:text-stone-dark mt-0.5">
            {isPendingAboveZero ? 'To be cleared' : 'All clear'}
          </div>
        </div>

        {/* Budget Left */}
        <div className="hbt-card col-span-2 sm:col-span-2">
          <div className="flex items-center justify-between text-xs text-stone dark:text-stone-dark font-medium mb-1">
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
                ? 'text-money-red dark:text-money-red-dark'
                : 'text-charcoal dark:text-text-dark'
            }`}
          >
            {formatCurrency(summary.budgetLeft)}
          </div>
          {isBudgetNegative && (
            <div className="flex items-center gap-1 text-[12px] text-money-red dark:text-money-red-dark font-medium mt-1">
              <AlertCircle size={13} />
              <span>Over budget by {formatCurrency(Math.abs(summary.budgetLeft))}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Spending by Category */}
      <div className="hbt-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-bold text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif]">
            Spending by Category
          </h2>
          <span className="text-xs text-stone dark:text-stone-dark">
            {summary.categorySpendings.length} categories
          </span>
        </div>

        {summary.categorySpendings.length === 0 ? (
          <div className="py-6 text-center text-sm text-stone dark:text-stone-dark">
            No expenses or wages recorded yet.
          </div>
        ) : (
          <div className="space-y-3.5">
            {summary.categorySpendings.map((cat) => (
              <div key={cat.category} className="group">
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-charcoal dark:text-text-dark">
                      {cat.category}
                    </span>
                    {cat.overBudget && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-money-red/10 dark:bg-money-red-dark/20 text-money-red dark:text-money-red-dark">
                        Over Budget
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold tabular-num text-charcoal dark:text-text-dark">
                      {formatCurrency(cat.amount)}
                    </span>
                    <span className="text-xs text-stone dark:text-stone-dark ml-1.5 tabular-num">
                      ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* 8px high proportion bar (Clay tint track, Terracotta fill) */}
                <div className="w-full h-2 rounded-full bg-[#FBEEE5] dark:bg-[#33241A] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-terracotta dark:bg-terracotta-dark"
                    style={{ width: `${Math.min(100, Math.max(2, cat.percentage))}%` }}
                  />
                </div>

                {/* Category Budget Details if set */}
                {cat.budget && (
                  <div className="flex items-center justify-between text-[11px] text-stone dark:text-stone-dark mt-0.5">
                    <span>Budget: {formatCurrency(cat.budget)}</span>
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

      {/* 3. Pending Dues by Person / Vendor */}
      <div className="hbt-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[16px] font-bold text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif]">
              Pending by Person / Vendor
            </h2>
            <p className="text-xs text-stone dark:text-stone-dark mt-0.5">
              Live balances calculated from expenses, wages, and payments
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sand/40 dark:bg-sand-dark/40 text-stone dark:text-stone-dark">
            {summary.personBalances.length} accounts
          </span>
        </div>

        {summary.personBalances.length === 0 ? (
          <div className="py-6 text-center text-sm text-stone dark:text-stone-dark">
            No workers or vendor accounts recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-sand/50 dark:divide-sand-dark/50">
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
                      <span className="font-bold text-[15px] text-charcoal dark:text-text-dark truncate">
                        {person.name}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded uppercase font-medium bg-sand/40 dark:bg-sand-dark/40 text-stone dark:text-stone-dark flex-shrink-0">
                        {person.type === 'worker' ? (person.role || 'Worker') : 'Vendor'}
                      </span>
                    </div>
                    <div className="text-xs text-stone dark:text-stone-dark mt-0.5 space-x-2 tabular-num">
                      <span>Owed: {formatCurrency(person.owed)}</span>
                      <span>•</span>
                      <span>Paid: {formatCurrency(person.paid)}</span>
                    </div>
                  </div>

                  {/* Status & Amount */}
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`text-[15px] font-bold tabular-num ${
                        isDue
                          ? 'text-money-red dark:text-money-red-dark'
                          : isSettled
                          ? 'text-money-green dark:text-money-green-dark'
                          : 'text-stone dark:text-stone-dark'
                      }`}
                    >
                      {isDue && `${formatCurrency(person.balance)} due`}
                      {isSettled && `Settled`}
                      {isAdvance && `${formatCurrency(Math.abs(person.balance))} advance`}
                    </div>

                    {isDue && (
                      <button
                        onClick={() => onQuickPay(person)}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta dark:text-terracotta-dark hover:underline"
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
