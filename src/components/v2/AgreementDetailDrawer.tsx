import React from 'react';
import { Agreement, PaymentRecord } from '../../types/v2';
import { formatCurrency } from '../../utils/format';
import {
  X,
  Building2,
  Calendar,
  CreditCard,
  ShieldAlert,
  Trash2,
  Edit2,
  ExternalLink,
  Camera,
} from 'lucide-react';

interface AgreementDetailDrawerProps {
  agreement: Agreement | null;
  onClose: () => void;
  payments: PaymentRecord[];
  onEdit: (agreement: Agreement) => void;
  onDelete: (id: string) => void;
  onViewPhoto: (photoUrl: string, caption?: string) => void;
}

export const AgreementDetailDrawer: React.FC<AgreementDetailDrawerProps> = ({
  agreement,
  onClose,
  payments,
  onEdit,
  onDelete,
  onViewPhoto,
}) => {
  if (!agreement) return null;

  const agreementPayments = payments.filter((p) => p.agreementRef === agreement.id);
  const isAhead = agreement.paidAheadOfWork > 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-sand w-full sm:max-w-md rounded-t-[24px] sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-sand rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="p-4 border-b border-sand/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-orange-100 text-terracotta">
              Agreement {agreement.id}
            </span>
            <span className="text-xs text-stone font-medium">{agreement.status}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone hover:bg-sand/30"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Hero */}
          <div className="text-center py-1">
            <div className="text-xs font-semibold text-stone uppercase tracking-wider mb-1">
              {agreement.category}
            </div>
            <div className="text-3xl font-extrabold text-charcoal tabular-num">
              {formatCurrency(agreement.agreedAmount)}
            </div>
            <h3 className="text-base font-bold text-charcoal mt-1">
              {agreement.vendor}
            </h3>
            <p className="text-stone mt-1 leading-relaxed">{agreement.workScope}</p>
          </div>

          {/* Key Attributes */}
          <div className="bg-sand/20 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-stone">Date Agreed:</span>
              <strong className="text-charcoal tabular-num">{agreement.dateAgreed}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone">Agreement Type:</span>
              <span className="font-semibold text-charcoal">{agreement.agreementType}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone">Timeline:</span>
              <span className="font-semibold text-charcoal">
                {agreement.startDate || 'Started'} ➔ {agreement.expectedEndDate || 'Open'}
              </span>
            </div>

            {agreement.paymentTerms && (
              <div className="pt-1 border-t border-sand/40">
                <span className="text-stone block mb-0.5">Payment Terms:</span>
                <p className="text-charcoal font-medium italic">"{agreement.paymentTerms}"</p>
              </div>
            )}
          </div>

          {/* Progress & Financial Standing */}
          <div className="p-3.5 rounded-xl border border-sand bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-stone">Physical Work Completed:</span>
              <strong className="text-terracotta text-sm tabular-num">
                {agreement.workCompletedPercent}%
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone">Value of Work Executed:</span>
              <strong className="text-charcoal tabular-num">
                {formatCurrency(agreement.workValueDone)}
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone">Total Money Paid:</span>
              <strong className="text-charcoal tabular-num">
                {formatCurrency(agreement.totalPaid)} ({agreement.percentPaid.toFixed(1)}%)
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone">Remaining Balance To Pay:</span>
              <strong className="text-[#11363E] tabular-num">
                {formatCurrency(agreement.balanceToPay)}
              </strong>
            </div>

            {isAhead && (
              <div className="p-2 rounded-lg bg-orange-50 border border-orange-200 text-stone flex items-start gap-1.5 mt-2">
                <ShieldAlert size={14} className="text-terracotta flex-shrink-0 mt-0.5" />
                <span>
                  Paid ahead of verified work by <strong className="text-terracotta">{formatCurrency(agreement.paidAheadOfWork)}</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Attached Document Proof */}
          {agreement.docUrl && (
            <div className="p-3 rounded-xl border border-sand bg-white space-y-2">
              <span className="font-bold text-charcoal block">Attached Quote / Contract</span>
              <div
                onClick={() => onViewPhoto(agreement.docUrl!, `Contract ${agreement.id}`)}
                className="cursor-pointer border border-sand rounded-lg overflow-hidden max-h-36 bg-black/5 flex items-center justify-center"
              >
                <img
                  src={agreement.docUrl}
                  alt={agreement.id}
                  className="max-h-36 object-contain"
                />
              </div>
            </div>
          )}

          {/* Payments linked to this agreement */}
          <div className="space-y-2">
            <span className="font-bold text-charcoal block">
              Payments Against This Agreement ({agreementPayments.length})
            </span>
            {agreementPayments.length === 0 ? (
              <p className="text-stone italic text-[11px]">No disbursements logged yet.</p>
            ) : (
              <div className="space-y-1.5">
                {agreementPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 rounded-lg border border-sand bg-sand/15 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-charcoal text-[11px]">{p.description}</div>
                      <div className="text-[10px] text-stone">
                        {p.date} • {p.paymentType} • {p.mode}
                      </div>
                    </div>
                    <strong className="text-charcoal font-bold tabular-num">
                      {formatCurrency(p.amount)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-sand bg-sand/10 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete agreement ${agreement.id}?`)) {
                onDelete(agreement.id);
                onClose();
              }
            }}
            className="p-2 text-money-red hover:bg-money-red/10 rounded-lg flex items-center gap-1 font-semibold text-xs"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(agreement);
              }}
              className="hbt-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 font-semibold h-auto min-h-0"
            >
              <Edit2 size={13} />
              <span>Edit Agreement</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="hbt-btn-primary text-xs px-4 py-1.5 h-auto min-h-0"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
