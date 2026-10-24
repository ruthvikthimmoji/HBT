import React from 'react';
import { formatCurrency } from '../../utils/format';
import { ShieldAlert, ShieldCheck, Info } from 'lucide-react';

interface PaidAheadGaugeProps {
  advancesGiven: number;
  paidAheadOfWork: number;
  totalAgreed: number;
  totalPaid: number;
}

export const PaidAheadGauge: React.FC<PaidAheadGaugeProps> = ({
  advancesGiven,
  paidAheadOfWork,
  totalAgreed,
  totalPaid,
}) => {
  const isAhead = paidAheadOfWork > 0;
  const workValueDone = Math.max(0, totalPaid - paidAheadOfWork);

  const percentWorkDone = totalAgreed > 0 ? Math.min(100, (workValueDone / totalAgreed) * 100) : 0;
  const percentPaid = totalAgreed > 0 ? Math.min(100, (totalPaid / totalAgreed) * 100) : 0;

  return (
    <div className="hbt-card p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isAhead ? (
            <ShieldAlert size={16} className="text-terracotta" />
          ) : (
            <ShieldCheck size={16} className="text-money-green" />
          )}
          <h3 className="text-sm font-bold text-charcoal">
            Contractor Advance &amp; Work Safety Gauge
          </h3>
        </div>
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            isAhead
              ? 'bg-orange-100 text-terracotta'
              : 'bg-green-100 text-money-green'
          }`}
        >
          {isAhead ? 'Paid Ahead of Work' : 'Cash Safe'}
        </span>
      </div>

      {/* Visual Stacked Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 rounded-full bg-sand/40 overflow-hidden flex relative">
          {/* Work Value Done (Bleu Canard) */}
          <div
            className="h-full bg-[#11363E] transition-all duration-300"
            style={{ width: `${percentWorkDone}%` }}
            title={`Work Value Done: ${percentWorkDone.toFixed(1)}%`}
          />
          {/* Paid Ahead / Advance Gap (Orange Corail) */}
          {isAhead && (
            <div
              className="h-full bg-terracotta transition-all duration-300 animate-pulse"
              style={{ width: `${Math.max(2, percentPaid - percentWorkDone)}%` }}
              title={`Paid Ahead: ${formatCurrency(paidAheadOfWork)}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-stone">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#11363E]" />
            <span>Work Value Done: <strong>{formatCurrency(workValueDone)}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
            <span>Unadjusted Advance: <strong>{formatCurrency(paidAheadOfWork)}</strong></span>
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div
        className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
          isAhead
            ? 'bg-orange-50/80 border border-orange-200 text-stone'
            : 'bg-[#EBECDC]/60 border border-sand text-stone'
        }`}
      >
        <Info size={14} className="text-stone flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          {isAhead ? (
            <>
              You have disbursed <strong className="text-terracotta">{formatCurrency(paidAheadOfWork)}</strong> more
              than the contractor has physically executed on site. Before releasing milestone payments, inspect completed work.
            </>
          ) : (
            <>
              Contractor payments are balanced with physical work completed. Advances given are fully adjusted against current site progress.
            </>
          )}
        </p>
      </div>
    </div>
  );
};
