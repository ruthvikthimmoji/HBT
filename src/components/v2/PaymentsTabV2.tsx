import React, { useState } from 'react';
import {
  PaymentRecord,
  ScheduledPayment,
  PaymentType,
  PaymentMode,
  Agreement,
} from '../../types/v2';
import { formatCurrency } from '../../utils/format';
import {
  CreditCard,
  Plus,
  Calendar,
  AlertCircle,
  FileWarning,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Camera,
  Check,
  Search,
} from 'lucide-react';

interface PaymentsTabV2Props {
  payments: PaymentRecord[];
  schedule: ScheduledPayment[];
  agreements: Agreement[];
  onOpenNewPayment: (prefill?: Partial<PaymentRecord>) => void;
  onOpenNewSchedule: () => void;
  onSelectPayment: (payment: PaymentRecord) => void;
  onMarkSchedulePaid: (item: ScheduledPayment) => void;
  onAttachReceipt: (paymentId: string) => void;
}

export const PaymentsTabV2: React.FC<PaymentsTabV2Props> = ({
  payments,
  schedule,
  agreements,
  onOpenNewPayment,
  onOpenNewSchedule,
  onSelectPayment,
  onMarkSchedulePaid,
  onAttachReceipt,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'schedule'>('ledger');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [onlyMissingReceipts, setOnlyMissingReceipts] = useState(false);

  // Stats
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const advancesTotal = payments
    .filter((p) => p.paymentType === 'Advance')
    .reduce((acc, p) => acc + p.amount, 0);
  const missingReceipts = payments.filter((p) => !p.receiptReceived).length;

  const totalScheduledUpcoming = schedule
    .filter((s) => s.status !== 'Paid')
    .reduce((acc, s) => acc + s.amountDue, 0);

  // Filtering Ledger
  const filteredPayments = payments.filter((p) => {
    if (onlyMissingReceipts && p.receiptReceived) return false;
    if (filterType !== 'all' && p.paymentType.toLowerCase() !== filterType.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.paidTo.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.agreementRef && p.agreementRef.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtering Schedule
  const filteredSchedule = schedule.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.vendor.toLowerCase().includes(q) ||
        s.milestone.toLowerCase().includes(q) ||
        (s.agreementRef && s.agreementRef.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header Sub-Tab Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-sand/35 border border-sand">
          <button
            type="button"
            onClick={() => setActiveSubTab('ledger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'ledger'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-stone hover:text-charcoal'
            }`}
          >
            Payments Ledger ({payments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('schedule')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'schedule'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-stone hover:text-charcoal'
            }`}
          >
            <span>Upcoming Schedule</span>
            {schedule.filter((s) => s.status === 'Overdue').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-money-red" />
            )}
          </button>
        </div>

        {activeSubTab === 'ledger' ? (
          <button
            type="button"
            onClick={() => onOpenNewPayment()}
            className="hbt-btn-primary text-xs px-3 py-2 flex items-center gap-1 whitespace-nowrap"
          >
            <Plus size={15} />
            <span>Record Payment</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenNewSchedule}
            className="hbt-btn-primary text-xs px-3 py-2 flex items-center gap-1 whitespace-nowrap"
          >
            <Plus size={15} />
            <span>Add Milestone</span>
          </button>
        )}
      </div>

      {/* 2. Top Summary Metrics */}
      {activeSubTab === 'ledger' ? (
        <div className="grid grid-cols-3 gap-2">
          <div className="hbt-card p-3">
            <div className="text-[11px] text-stone font-medium">Total Paid</div>
            <div className="text-base font-bold text-charcoal tabular-num mt-0.5">
              {formatCurrency(totalPaid)}
            </div>
            <div className="text-[10px] text-stone">{payments.length} Payments</div>
          </div>

          <div className="hbt-card p-3">
            <div className="text-[11px] text-stone font-medium">Advances Given</div>
            <div className="text-base font-bold text-terracotta tabular-num mt-0.5">
              {formatCurrency(advancesTotal)}
            </div>
            <div className="text-[10px] text-stone">Pre-payments</div>
          </div>

          <div
            onClick={() => setOnlyMissingReceipts(!onlyMissingReceipts)}
            className={`hbt-card p-3 cursor-pointer transition-all select-none ${
              onlyMissingReceipts
                ? 'border-money-red bg-red-50/50'
                : missingReceipts > 0
                ? 'hover:border-money-red/60'
                : ''
            }`}
          >
            <div className="text-[11px] text-stone font-medium flex items-center justify-between">
              <span>Missing Receipts</span>
              {onlyMissingReceipts && (
                <span className="text-[9px] font-bold text-money-red">FILTERED</span>
              )}
            </div>
            <div
              className={`text-base font-bold tabular-num mt-0.5 ${
                missingReceipts > 0 ? 'text-money-red' : 'text-money-green'
              }`}
            >
              {missingReceipts}
            </div>
            <div className="text-[10px] text-stone">
              {missingReceipts > 0 ? 'Tap to view missing' : 'All receipts attached'}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div className="hbt-card p-3">
            <div className="text-[11px] text-stone font-medium">Pending Milestone Dues</div>
            <div className="text-base font-bold text-charcoal tabular-num mt-0.5">
              {formatCurrency(totalScheduledUpcoming)}
            </div>
            <div className="text-[10px] text-stone">
              {schedule.filter((s) => s.status !== 'Paid').length} Milestones planned
            </div>
          </div>

          <div className="hbt-card p-3">
            <div className="text-[11px] text-stone font-medium">Overdue Milestones</div>
            <div className="text-base font-bold text-money-red tabular-num mt-0.5">
              {schedule.filter((s) => s.status === 'Overdue').length}
            </div>
            <div className="text-[10px] text-stone">Action required</div>
          </div>
        </div>
      )}

      {/* 3. Search & Filter Controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === 'ledger'
                ? 'Search vendor, note, or ref...'
                : 'Search milestone, vendor...'
            }
            className="hbt-input w-full pl-8 text-xs py-2 h-10"
          />
        </div>
      </div>

      {/* Type Filter Pills for Ledger */}
      {activeSubTab === 'ledger' && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All Payments' },
            { id: 'advance', label: 'Advance' },
            { id: 'milestone / progress', label: 'Milestone' },
            { id: 'material bill', label: 'Material Bills' },
            { id: 'final settlement', label: 'Final Settlement' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === t.id
                  ? 'bg-terracotta text-white'
                  : 'bg-white text-stone border border-sand hover:text-charcoal'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* 4. Content Render: Ledger or Schedule */}
      {activeSubTab === 'ledger' ? (
        <div className="space-y-2.5">
          {filteredPayments.length === 0 ? (
            <div className="hbt-card py-12 text-center text-stone text-xs space-y-2">
              <p>No payment records found.</p>
              <button
                onClick={() => onOpenNewPayment()}
                className="hbt-btn-primary text-xs px-3 py-1.5"
              >
                Record First Payment
              </button>
            </div>
          ) : (
            filteredPayments.map((p) => {
              const hasReceipt = p.receiptReceived;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPayment(p)}
                  className="hbt-card p-3.5 hover:border-terracotta/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs px-2 py-0.5 rounded bg-sand/40 text-charcoal">
                          {p.id}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            p.paymentType === 'Advance'
                              ? 'bg-orange-100 text-terracotta'
                              : p.paymentType === 'Milestone / Progress'
                              ? 'bg-teal-100 text-[#11363E]'
                              : 'bg-stone-100 text-stone'
                          }`}
                        >
                          {p.paymentType}
                        </span>
                        {p.agreementRef && (
                          <span className="text-[10px] font-medium text-stone bg-[#EBECDC] px-1.5 py-0.5 rounded">
                            Ref: {p.agreementRef}
                          </span>
                        )}
                        <span className="text-[10px] text-stone bg-white px-1.5 py-0.5 rounded border border-sand">
                          {p.mode}
                        </span>
                      </div>

                      <h4 className="text-[15px] font-bold text-charcoal mt-1 truncate">
                        {p.paidTo}
                      </h4>
                      <p className="text-xs text-stone truncate mt-0.5">
                        {p.description || p.category}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-bold text-charcoal tabular-num block">
                        {formatCurrency(p.amount)}
                      </span>
                      <span className="text-[11px] text-stone tabular-num">{p.date}</span>
                    </div>
                  </div>

                  {/* Receipt Status Bar */}
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-sand/40">
                    {hasReceipt ? (
                      <div className="flex items-center gap-1.5 text-money-green font-medium text-[11px]">
                        <CheckCircle2 size={13} />
                        <span>
                          Receipt {p.receiptNo ? `#${p.receiptNo}` : 'Verified'}
                        </span>
                        {p.receiptLocation && (
                          <span className="text-stone truncate max-w-[150px]">
                            • {p.receiptLocation}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1 text-money-red font-bold text-[11px]">
                          <FileWarning size={13} />
                          <span>Receipt Missing</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAttachReceipt(p.id);
                          }}
                          className="text-[11px] font-semibold text-terracotta hover:underline flex items-center gap-1"
                        >
                          <Camera size={12} />
                          <span>Attach Receipt / Photo</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Upcoming Schedule List */
        <div className="space-y-2.5">
          {filteredSchedule.length === 0 ? (
            <div className="hbt-card py-12 text-center text-stone text-xs space-y-2">
              <p>No milestone payments scheduled.</p>
              <button
                onClick={onOpenNewSchedule}
                className="hbt-btn-primary text-xs px-3 py-1.5"
              >
                Schedule Milestone
              </button>
            </div>
          ) : (
            filteredSchedule.map((item) => {
              const isOverdue = item.status === 'Overdue';
              const isUpcoming = item.status === 'Upcoming';
              const isPaid = item.status === 'Paid';

              return (
                <div
                  key={item.id}
                  className="hbt-card p-3.5 space-y-2.5 hover:border-terracotta/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-green-100 text-money-green'
                              : isOverdue
                              ? 'bg-red-100 text-money-red'
                              : isUpcoming
                              ? 'bg-orange-100 text-terracotta'
                              : 'bg-sand/40 text-stone'
                          }`}
                        >
                          {isPaid
                            ? 'Settled'
                            : isOverdue
                            ? `Overdue by ${Math.abs(item.daysLeft)} days`
                            : isUpcoming
                            ? `Due in ${item.daysLeft} days`
                            : `${item.daysLeft} days left`}
                        </span>
                        {item.agreementRef && (
                          <span className="text-[10px] text-stone bg-[#EBECDC] px-1.5 py-0.5 rounded font-medium">
                            {item.agreementRef}
                          </span>
                        )}
                      </div>

                      <h4 className="text-[15px] font-bold text-charcoal mt-1">
                        {item.milestone}
                      </h4>
                      <p className="text-xs text-stone">{item.vendor}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-bold text-charcoal tabular-num block">
                        {formatCurrency(item.amountDue)}
                      </span>
                      <span className="text-[11px] text-stone">Due: {item.dueDate}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-sand/40">
                    <span className="text-stone text-[11px]">
                      {item.notes || 'Approval milestone payment'}
                    </span>

                    {!isPaid && (
                      <button
                        type="button"
                        onClick={() => onMarkSchedulePaid(item)}
                        className="hbt-btn-primary py-1 px-3 text-xs h-auto min-h-0 flex items-center gap-1 font-semibold"
                      >
                        <Check size={12} />
                        <span>Mark Paid &amp; Add to Ledger</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
