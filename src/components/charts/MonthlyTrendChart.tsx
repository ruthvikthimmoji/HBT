import React, { useState } from 'react';
import { MonthlySpend } from '../../types/v2';
import { formatCurrency } from '../../utils/format';
import { TrendingUp, Calendar } from 'lucide-react';

interface MonthlyTrendChartProps {
  data: MonthlySpend[];
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
  const [hoveredMonth, setHoveredMonth] = useState<MonthlySpend | null>(null);

  const maxAmount = Math.max(...data.map((d) => d.amount), 50000);
  const totalSpend = data.reduce((acc, d) => acc + d.amount, 0);

  // SVG dimensions
  const height = 160;
  const paddingBottom = 28;
  const chartHeight = height - paddingBottom;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Calendar size={15} className="text-terracotta" />
          <h3 className="text-sm font-bold text-charcoal">
            12-Month Spend Timeline (Cash Flow)
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-stone block">Total Period</span>
          <span className="text-xs font-bold text-charcoal tabular-num">
            {formatCurrency(totalSpend)}
          </span>
        </div>
      </div>

      {/* Hover Info Tooltip Bar */}
      <div className="h-5 flex items-center justify-between text-xs px-2 py-0.5 rounded bg-sand/30 text-stone">
        {hoveredMonth ? (
          <>
            <span className="font-semibold text-charcoal">{hoveredMonth.month}</span>
            <span className="font-bold text-terracotta tabular-num">
              {formatCurrency(hoveredMonth.amount)}
            </span>
          </>
        ) : (
          <>
            <span className="text-[11px]">Tap or hover any month bar to inspect cash flow</span>
            <span className="text-[11px] font-medium text-stone">12 Months (Oct '26 - Sep '27)</span>
          </>
        )}
      </div>

      {/* Responsive Bar Chart */}
      <div className="relative pt-3 pb-1">
        <div className="grid grid-cols-12 gap-1.5 items-end h-[120px] px-1 border-b border-sand">
          {data.map((item, idx) => {
            const heightPercent = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
            const isHovered = hoveredMonth?.key === item.key;
            const hasSpend = item.amount > 0;

            return (
              <div
                key={item.key}
                onMouseEnter={() => setHoveredMonth(item)}
                onMouseLeave={() => setHoveredMonth(null)}
                onClick={() => setHoveredMonth(item)}
                className="group relative flex flex-col items-center justify-end h-full cursor-pointer select-none"
              >
                {/* Bar */}
                <div
                  className={`w-full rounded-t-md transition-all duration-300 relative ${
                    isHovered
                      ? 'bg-terracotta shadow-md scale-105'
                      : hasSpend
                      ? 'bg-[#11363E] hover:bg-terracotta'
                      : 'bg-sand/40 hover:bg-sand'
                  }`}
                  style={{
                    height: `${Math.max(6, heightPercent)}%`,
                    minHeight: hasSpend ? '12px' : '4px',
                  }}
                >
                  {hasSpend && (
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-terracotta" />
                  )}
                </div>

                {/* X-Axis Month Label */}
                <span
                  className={`text-[9px] mt-1.5 font-medium transition-colors ${
                    isHovered
                      ? 'text-terracotta font-bold'
                      : hasSpend
                      ? 'text-charcoal font-semibold'
                      : 'text-stone/70'
                  }`}
                >
                  {item.month.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
