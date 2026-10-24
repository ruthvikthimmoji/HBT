import React, { useState } from 'react';
import { BudgetCategory } from '../../types/v2';
import { formatCurrency } from '../../utils/format';
import { PieChart, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface CategoryBudgetProgressProps {
  categories: BudgetCategory[];
  onOpenBudgetModal?: () => void;
}

export const CategoryBudgetProgress: React.FC<CategoryBudgetProgressProps> = ({
  categories,
  onOpenBudgetModal,
}) => {
  const [filterActiveOnly, setFilterActiveOnly] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const displayed = categories
    .filter((c) => (filterActiveOnly ? c.spent > 0 || c.budget > 0 : true))
    .sort((a, b) => b.spent - a.spent);

  const visibleList = isExpanded ? displayed : displayed.slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <PieChart size={15} className="text-terracotta" />
          <h3 className="text-sm font-bold text-charcoal">Category Budget vs Actual</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterActiveOnly(!filterActiveOnly)}
            className="text-[11px] font-medium text-stone hover:text-charcoal underline"
          >
            {filterActiveOnly ? 'Show All 22' : 'Active Only'}
          </button>
          {onOpenBudgetModal && (
            <button
              type="button"
              onClick={onOpenBudgetModal}
              className="text-xs font-semibold text-terracotta hover:underline"
            >
              Edit Budget
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {visibleList.length === 0 ? (
          <div className="py-6 text-center text-xs text-stone">
            No category budgets or spend recorded yet.
          </div>
        ) : (
          visibleList.map((cat) => {
            const isOver = cat.status === 'Over Budget';
            const isWarning = cat.status === 'Warning';

            return (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-charcoal truncate max-w-[200px]">
                    {cat.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal tabular-num">
                      {formatCurrency(cat.spent)}
                    </span>
                    {cat.budget > 0 && (
                      <span className="text-[11px] text-stone tabular-num">
                        / {formatCurrency(cat.budget)}
                      </span>
                    )}
                    {isOver && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-money-red">
                        <AlertTriangle size={10} />
                        Over
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-sand/40 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
                        ? 'bg-money-red'
                        : isWarning
                        ? 'bg-orange-400'
                        : 'bg-terracotta'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(3, cat.percentUsed))}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {displayed.length > 6 && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-1.5 text-center text-xs text-stone hover:text-charcoal flex items-center justify-center gap-1 border-t border-sand/40 mt-1"
        >
          <span>{isExpanded ? 'Show Less' : `View All (${displayed.length} Categories)`}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
    </div>
  );
};
