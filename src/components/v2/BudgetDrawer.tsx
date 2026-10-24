import React, { useState } from 'react';
import { BudgetCategory } from '../../types/v2';
import { formatCurrency } from '../../utils/format';
import { X, PieChart, Check, AlertTriangle } from 'lucide-react';

interface BudgetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BudgetCategory[];
  onSaveBudget: (updated: BudgetCategory[]) => void;
}

export const BudgetDrawer: React.FC<BudgetDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveBudget,
}) => {
  const [budgetMap, setBudgetMap] = useState<{ [cat: string]: string }>(() => {
    const map: { [cat: string]: string } = {};
    categories.forEach((c) => {
      map[c.category] = String(c.budget || 0);
    });
    return map;
  });

  if (!isOpen) return null;

  const handleBudgetChange = (cat: string, val: string) => {
    setBudgetMap((prev) => ({ ...prev, [cat]: val }));
  };

  const handleSaveAll = () => {
    const updated = categories.map((c) => {
      const budgetVal = parseFloat(budgetMap[c.category]) || 0;
      const remaining = budgetVal - c.spent;
      const percentUsed = budgetVal > 0 ? (c.spent / budgetVal) * 100 : c.spent > 0 ? 100 : 0;
      let status: 'On Track' | 'Warning' | 'Over Budget' = 'On Track';
      if (c.spent > budgetVal && budgetVal > 0) {
        status = 'Over Budget';
      } else if (percentUsed >= 85) {
        status = 'Warning';
      }

      return {
        ...c,
        budget: budgetVal,
        remaining,
        percentUsed,
        status,
      };
    });

    onSaveBudget(updated);
    onClose();
  };

  const totalPlanned = Object.values(budgetMap).reduce(
    (acc, val) => acc + (parseFloat(val) || 0),
    0
  );
  const totalSpent = categories.reduce((acc, c) => acc + c.spent, 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white h-full shadow-2xl flex flex-col p-5 overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-sand">
          <div>
            <h3 className="text-base font-bold text-charcoal">
              Category Budget Planning
            </h3>
            <p className="text-xs text-stone">Set planned allocation across 22 construction categories</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone hover:bg-sand/30"
          >
            <X size={18} />
          </button>
        </div>

        {/* Total Budget Summary Header */}
        <div className="p-3 my-3 rounded-xl bg-sand/25 border border-sand grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-stone text-[11px] block">Planned Budget</span>
            <strong className="text-sm font-bold text-charcoal tabular-num">
              {formatCurrency(totalPlanned)}
            </strong>
          </div>
          <div>
            <span className="text-stone text-[11px] block">Spent So Far</span>
            <strong className="text-sm font-bold text-terracotta tabular-num">
              {formatCurrency(totalSpent)}
            </strong>
          </div>
          <div>
            <span className="text-stone text-[11px] block">Remaining</span>
            <strong className="text-sm font-bold text-[#11363E] tabular-num">
              {formatCurrency(totalPlanned - totalSpent)}
            </strong>
          </div>
        </div>

        {/* 22 Categories List with editable inputs */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          {categories.map((c) => {
            const isOver = c.spent > (parseFloat(budgetMap[c.category]) || 0);

            return (
              <div
                key={c.category}
                className="p-2.5 rounded-xl border border-sand bg-white space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal truncate max-w-[240px]">
                    {c.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone text-[11px]">Spent:</span>
                    <strong className="text-charcoal tabular-num">
                      {formatCurrency(c.spent)}
                    </strong>
                    {isOver && (
                      <span className="text-[10px] font-bold text-money-red flex items-center gap-0.5">
                        <AlertTriangle size={11} /> Over
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-stone text-[11px] whitespace-nowrap">Budget (₹):</span>
                  <input
                    type="number"
                    step="any"
                    value={budgetMap[c.category] || ''}
                    onChange={(e) => handleBudgetChange(c.category, e.target.value)}
                    placeholder="0"
                    className="hbt-input flex-1 py-1 px-2.5 text-xs font-bold tabular-num h-8"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-sand flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="hbt-btn-secondary text-xs px-4"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="hbt-btn-primary text-xs px-5"
          >
            Save All Budgets
          </button>
        </div>
      </div>
    </div>
  );
};
