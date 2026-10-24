import React, { useState } from 'react';
import { PaymentRecord } from '../../types/v2';
import { formatCurrency } from '../../utils/format';
import {
  X,
  CreditCard,
  Calendar,
  Camera,
  Trash2,
  Edit2,
  Copy,
  Check,
  FileWarning,
  CheckCircle2,
} from 'lucide-react';

interface PaymentDetailDrawerProps {
  payment: PaymentRecord | null;
  onClose: () => void;
  onEdit: (payment: PaymentRecord) => void;
  onDelete: (id: string) => void;
  onViewPhoto: (photoUrl: string, caption?: string) => void;
}

export const PaymentDetailDrawer: React.FC<PaymentDetailDrawerProps> = ({
  payment,
  onClose,
  onEdit,
  onDelete,
  onViewPhoto,
}) => {
  const [copied, setCopied] = useState(false);

  if (!payment) return null;

  const handleCopy = () => {
    const text = `💸 *Payment Voucher: ${payment.id}*\n📅 Date: ${payment.date}\n👤 Paid To: ${payment.paidTo}\n💰 Amount: ₹${payment.amount.toLocaleString('en-IN')}\n🏷️ Category: ${payment.category}\n📝 Note: ${payment.description}\n💳 Mode: ${payment.mode} ${payment.txnRef ? `(${payment.txnRef})` : ''}\n🧾 Receipt: ${payment.receiptReceived ? (payment.receiptNo ? `#${payment.receiptNo}` : 'Verified') : 'Missing'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              Payment Voucher {payment.id}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-stone hover:bg-sand/30"
              title="Copy WhatsApp summary"
            >
              {copied ? <Check size={16} className="text-money-green" /> : <Copy size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone hover:bg-sand/30"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="text-center py-1">
            <div className="text-xs font-semibold text-stone uppercase tracking-wider mb-1">
              {payment.date}
            </div>
            <div className="text-3xl font-extrabold text-charcoal tabular-num">
              {formatCurrency(payment.amount)}
            </div>
            <h3 className="text-base font-bold text-charcoal mt-1">
              {payment.paidTo}
            </h3>
            <p className="text-stone mt-1">{payment.description}</p>
          </div>

          {/* Key Attributes */}
          <div className="bg-sand/20 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-stone">Category:</span>
              <span className="font-semibold text-charcoal">{payment.category}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone">Payment Type:</span>
              <span className="font-semibold text-terracotta">{payment.paymentType}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone">Payment Mode:</span>
              <span className="font-semibold text-charcoal">{payment.mode}</span>
            </div>

            {payment.txnRef && (
              <div className="flex items-center justify-between">
                <span className="text-stone">Transaction / Ref:</span>
                <span className="font-mono text-charcoal font-medium">{payment.txnRef}</span>
              </div>
            )}

            {payment.agreementRef && (
              <div className="flex items-center justify-between pt-1 border-t border-sand/40">
                <span className="text-stone">Agreement Ref:</span>
                <span className="font-bold text-[#11363E]">{payment.agreementRef}</span>
              </div>
            )}
          </div>

          {/* Receipt Tracking Audit */}
          <div className="p-3.5 rounded-xl border border-sand bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-charcoal">Receipt Audit</span>
              {payment.receiptReceived ? (
                <span className="inline-flex items-center gap-1 text-money-green font-bold text-[11px] bg-green-50 px-2 py-0.5 rounded">
                  <CheckCircle2 size={12} /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-money-red font-bold text-[11px] bg-red-50 px-2 py-0.5 rounded">
                  <FileWarning size={12} /> Missing Receipt!
                </span>
              )}
            </div>

            {payment.receiptNo && (
              <div className="text-stone">
                Receipt Number: <strong className="text-charcoal font-mono">{payment.receiptNo}</strong>
              </div>
            )}

            {payment.receiptLocation && (
              <div>
                {payment.receiptLocation.startsWith('data:image') || payment.receiptLocation.startsWith('http') ? (
                  <div
                    onClick={() => onViewPhoto(payment.receiptLocation!, `Receipt - ${payment.id}`)}
                    className="cursor-pointer border border-sand rounded-lg overflow-hidden max-h-40 bg-black/5 flex items-center justify-center mt-2 group"
                  >
                    <img
                      src={payment.receiptLocation}
                      alt="Receipt"
                      className="max-h-40 object-contain group-hover:scale-102 transition-transform"
                    />
                  </div>
                ) : (
                  <p className="text-stone text-[11px] bg-sand/20 p-2 rounded">
                    <strong>Filed at:</strong> {payment.receiptLocation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-sand bg-sand/10 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete payment ${payment.id}?`)) {
                onDelete(payment.id);
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
                onEdit(payment);
              }}
              className="hbt-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 font-semibold h-auto min-h-0"
            >
              <Edit2 size={13} />
              <span>Edit</span>
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
