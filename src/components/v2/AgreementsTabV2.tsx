import React, { useState } from 'react';
import { Agreement, AgreementStatus } from '../../types/v2';
import { formatCurrency } from '../../utils/format';
import {
  Building2,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface AgreementsTabV2Props {
  agreements: Agreement[];
  onOpenNewAgreement: () => void;
  onUpdateAgreementProgress: (id: string, newPercent: number) => void;
  onSelectAgreement: (agreement: Agreement) => void;
}

export const AgreementsTabV2: React.FC<AgreementsTabV2Props> = ({
  agreements,
  onOpenNewAgreement,
  onUpdateAgreementProgress,
  onSelectAgreement,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = agreements.filter((agr) => {
    if (filterStatus !== 'all' && agr.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        agr.vendor.toLowerCase().includes(q) ||
        agr.workScope.toLowerCase().includes(q) ||
        agr.id.toLowerCase().includes(q) ||
        agr.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalAgreed = agreements.reduce((acc, a) => acc + a.agreedAmount, 0);
  const totalPaid = agreements.reduce((acc, a) => acc + a.totalPaid, 0);
  const totalBalance = Math.max(0, totalAgreed - totalPaid);

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="hbt-card p-3">
          <div className="text-[11px] text-stone font-medium">Total Agreed</div>
          <div className="text-base font-bold text-charcoal tabular-num mt-0.5">
            {formatCurrency(totalAgreed)}
          </div>
          <div className="text-[10px] text-stone">{agreements.length} Work Orders</div>
        </div>

        <div className="hbt-card p-3">
          <div className="text-[11px] text-stone font-medium">Total Paid</div>
          <div className="text-base font-bold text-terracotta tabular-num mt-0.5">
            {formatCurrency(totalPaid)}
          </div>
          <div className="text-[10px] text-stone">
            {totalAgreed > 0 ? ((totalPaid / totalAgreed) * 100).toFixed(1) : 0}% settled
          </div>
        </div>

        <div className="hbt-card p-3">
          <div className="text-[11px] text-stone font-medium">Balance Due</div>
          <div className="text-base font-bold text-[#11363E] tabular-num mt-0.5">
            {formatCurrency(totalBalance)}
          </div>
          <div className="text-[10px] text-stone">To complete</div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vendor, scope or agreement..."
          className="hbt-input flex-1 text-xs py-2 h-10"
        />

        <button
          type="button"
          onClick={onOpenNewAgreement}
          className="hbt-btn-primary text-xs px-3.5 py-2 h-10 flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus size={15} />
          <span>New Agreement</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'All Agreements' },
          { id: 'in progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' },
          { id: 'on hold', label: 'On Hold' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterStatus(t.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === t.id
                ? 'bg-terracotta text-white'
                : 'bg-white text-stone border border-sand hover:text-charcoal'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 3. Agreements List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="hbt-card py-12 text-center text-stone text-xs space-y-2">
            <p>No agreements found.</p>
            <button
              onClick={onOpenNewAgreement}
              className="hbt-btn-primary text-xs px-3 py-1.5"
            >
              Add First Agreement
            </button>
          </div>
        ) : (
          filtered.map((agr) => {
            const isAhead = agr.paidAheadOfWork > 0;

            return (
              <div
                key={agr.id}
                className="hbt-card p-4 space-y-3 hover:border-terracotta/50 transition-all cursor-pointer group"
                onClick={() => onSelectAgreement(agr)}
              >
                {/* Header: ID, Category, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-sand/40 text-charcoal">
                        {agr.id}
                      </span>
                      <span className="text-[11px] font-semibold text-stone bg-[#EBECDC] px-2 py-0.5 rounded-full">
                        {agr.category}
                      </span>
                      <span className="text-[10px] text-stone bg-white px-1.5 py-0.5 rounded border border-sand">
                        {agr.agreementType}
                      </span>
                    </div>

                    <h4 className="text-[15px] font-bold text-charcoal mt-1.5">
                      {agr.vendor}
                    </h4>
                    <p className="text-xs text-stone line-clamp-2 mt-0.5">
                      {agr.workScope}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-stone block">Agreed</span>
                    <span className="text-base font-bold text-charcoal tabular-num">
                      {formatCurrency(agr.agreedAmount)}
                    </span>
                  </div>
                </div>

                {/* Progress Slider (Interactive live update) */}
                <div
                  className="p-2.5 rounded-xl bg-sand/20 space-y-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone font-medium">Work Completed:</span>
                    <span className="font-bold text-charcoal tabular-num">
                      {agr.workCompletedPercent}% (Value: {formatCurrency(agr.workValueDone)})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={agr.workCompletedPercent}
                      onChange={(e) =>
                        onUpdateAgreementProgress(agr.id, Number(e.target.value))
                      }
                      className="w-full accent-[#FF6038] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-terracotta tabular-num min-w-[36px] text-right">
                      {agr.workCompletedPercent}%
                    </span>
                  </div>
                </div>

                {/* Financial Position Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-sand/40">
                  <div>
                    <span className="text-stone text-[11px] block">Total Paid</span>
                    <strong className="text-charcoal font-bold tabular-num">
                      {formatCurrency(agr.totalPaid)}
                    </strong>
                    <span className="text-[10px] text-stone block">
                      ({agr.percentPaid.toFixed(0)}%)
                    </span>
                  </div>

                  <div>
                    <span className="text-stone text-[11px] block">Advance Paid</span>
                    <strong className="text-terracotta font-bold tabular-num">
                      {formatCurrency(agr.advancePaid)}
                    </strong>
                    <span className="text-[10px] text-stone block">
                      / {formatCurrency(agr.advanceAgreed)}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone text-[11px] block">Balance Due</span>
                    <strong className="text-[#11363E] font-bold tabular-num">
                      {formatCurrency(agr.balanceToPay)}
                    </strong>
                  </div>
                </div>

                {/* Warning Alert if Paid Ahead of Work */}
                {isAhead && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-orange-50 border border-orange-200 text-xs text-stone">
                    <ShieldAlert size={14} className="text-terracotta flex-shrink-0" />
                    <span>
                      Paid ahead by <strong className="text-terracotta">{formatCurrency(agr.paidAheadOfWork)}</strong> relative to verified work value.
                    </span>
                  </div>
                )}

                {/* Payment Terms snippet */}
                {agr.paymentTerms && (
                  <div className="text-[11px] text-stone bg-[#EBECDC]/40 p-2 rounded-lg flex items-center justify-between">
                    <span className="truncate">
                      <strong>Terms:</strong> {agr.paymentTerms}
                    </span>
                    <ChevronRight size={14} className="text-stone group-hover:text-terracotta flex-shrink-0" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
