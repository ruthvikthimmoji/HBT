import React, { useState } from 'react';
import { UnifiedLog, Expense, DailyLog, Payment } from '../types';
import { formatCurrency } from '../utils/format';
import {
  X,
  Calendar,
  Tag,
  Store,
  User,
  CreditCard,
  FileText,
  Clock,
  Camera,
  Edit3,
  Trash2,
  Copy,
  Check,
  Download,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface LogDetailDrawerProps {
  log: UnifiedLog | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (log: UnifiedLog) => void;
  onDelete: (log: UnifiedLog) => void;
  onViewPhoto: (photoUrl: string, caption: string) => void;
}

export const LogDetailDrawer: React.FC<LogDetailDrawerProps> = ({
  log,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onViewPhoto,
}) => {
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!isOpen || !log) return null;

  const formatDateFull = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleCopySummary = () => {
    let summaryText = `[House Build Tracker]\nDate: ${log.date}\nType: ${log.type.toUpperCase()}\n`;
    summaryText += `Details: ${log.title}\nAmount: ${formatCurrency(log.amount)}\n`;
    if (log.category) summaryText += `Category: ${log.category}\n`;
    if (log.vendorOrWorker) summaryText += `Person/Vendor: ${log.vendorOrWorker}\n`;
    if (log.paymentMode) summaryText += `Mode: ${log.paymentMode}\n`;
    if (log.note) summaryText += `Note: ${log.note}\n`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      onDelete(log);
      setDeleteConfirm(false);
      onClose();
    } else {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white border border-sand w-full sm:max-w-md rounded-t-[24px] sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-transform animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator */}
        <div className="w-12 h-1.5 bg-sand rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="p-4 border-b border-sand/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                log.type === 'expense'
                  ? 'bg-[#EBECDC] text-terracotta'
                  : log.type === 'attendance'
                  ? 'bg-[#A0C9CB]/40 text-[#11363E]'
                  : 'bg-[#EBECDC] text-[#733635]'
              }`}
            >
              {log.type === 'expense'
                ? 'Expense Voucher'
                : log.type === 'attendance'
                ? 'Attendance Log'
                : 'Payment Disbursement'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopySummary}
              className="p-1.5 rounded-lg text-stone hover:bg-sand/30 transition-colors"
              title="Copy entry details for WhatsApp"
            >
              {copied ? <Check size={16} className="text-money-green" /> : <Copy size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone hover:bg-sand/30 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Hero Amount & Title */}
          <div className="text-center py-2">
            <div className="text-xs font-semibold text-stone uppercase tracking-wider mb-1">
              {formatDateFull(log.date)}
            </div>
            <div
              className={`text-3xl font-extrabold tabular-num ${
                log.type === 'payment'
                  ? 'text-money-green'
                  : 'text-charcoal'
              }`}
            >
              {formatCurrency(log.amount)}
            </div>
            <h3 className="text-base font-bold text-charcoal mt-1 font-['Nunito_Sans',sans-serif]">
              {log.title}
            </h3>
            {log.subtitle && (
              <p className="text-xs text-stone mt-0.5">{log.subtitle}</p>
            )}
          </div>

          {/* Key Attributes Grid */}
          <div className="bg-sand/20 rounded-xl p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone flex items-center gap-1.5">
                <Calendar size={13} />
                <span>Entry Date</span>
              </span>
              <span className="font-semibold text-charcoal tabular-num">
                {log.date}
              </span>
            </div>

            {log.category && (
              <div className="flex items-center justify-between">
                <span className="text-stone flex items-center gap-1.5">
                  <Tag size={13} />
                  <span>Category</span>
                </span>
                <span className="font-semibold px-2 py-0.5 rounded-md bg-[#EBECDC] text-terracotta">
                  {log.category}
                </span>
              </div>
            )}

            {log.vendorOrWorker && (
              <div className="flex items-center justify-between">
                <span className="text-stone flex items-center gap-1.5">
                  {log.type === 'attendance' ? <User size={13} /> : <Store size={13} />}
                  <span>{log.type === 'attendance' ? 'Worker' : 'Vendor / Payee'}</span>
                </span>
                <span className="font-bold text-charcoal">
                  {log.vendorOrWorker}
                </span>
              </div>
            )}

            {log.paymentMode && (
              <div className="flex items-center justify-between">
                <span className="text-stone flex items-center gap-1.5">
                  <CreditCard size={13} />
                  <span>Payment Mode</span>
                </span>
                <span className="font-semibold text-charcoal">
                  {log.paymentMode}
                </span>
              </div>
            )}

            {log.statusBadge && (
              <div className="flex items-center justify-between">
                <span className="text-stone flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>Status</span>
                </span>
                <span className="font-semibold text-charcoal capitalize">
                  {log.statusBadge}
                </span>
              </div>
            )}
          </div>

          {/* Notes Card if present */}
          {log.note && (
            <div className="border border-sand rounded-xl p-3 bg-white">
              <div className="text-[11px] font-bold text-stone uppercase tracking-wider mb-1 flex items-center gap-1">
                <FileText size={12} />
                <span>Note / Remark</span>
              </div>
              <p className="text-sm text-charcoal italic">"{log.note}"</p>
            </div>
          )}

          {/* Photo Receipt / Proof if attached */}
          {log.photoUrl && (
            <div className="border border-sand rounded-xl p-3 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone uppercase tracking-wider flex items-center gap-1">
                  <Camera size={13} />
                  <span>Attached Bill / Voucher</span>
                </span>
                <span className="text-[11px] text-terracotta font-medium">Tap image to zoom</span>
              </div>

              <div
                onClick={() => onViewPhoto(log.photoUrl!, log.title)}
                className="relative rounded-lg overflow-hidden border border-sand cursor-pointer group max-h-48 bg-black/5 flex items-center justify-center"
              >
                <img
                  src={log.photoUrl}
                  alt={log.title}
                  className="max-h-48 w-full object-cover group-hover:scale-102 transition-transform"
                />
              </div>
            </div>
          )}

          {/* Ledger Accounting Impact */}
          <div className="p-3 rounded-xl bg-[#EBECDC]/60 border border-sand/40 text-xs space-y-1">
            <span className="font-bold text-charcoal block mb-1">
              Project Ledger Impact
            </span>
            {log.type === 'expense' && (
              <p className="text-stone">
                Added {formatCurrency(log.amount)} to total project cost and recorded liability for {log.vendorOrWorker || 'Vendor'}.
              </p>
            )}
            {log.type === 'attendance' && (
              <p className="text-stone">
                Accrued {formatCurrency(log.amount)} in daily wages owed to {log.vendorOrWorker}.
              </p>
            )}
            {log.type === 'payment' && (
              <p className="text-stone">
                Reduced pending dues by {formatCurrency(log.amount)} paid to {log.vendorOrWorker}.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-sand/60 bg-sand/10 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              deleteConfirm
                ? 'bg-money-red text-white'
                : 'text-money-red hover:bg-money-red/10'
            }`}
          >
            <Trash2 size={14} />
            <span>{deleteConfirm ? 'Tap again to delete' : 'Delete'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="hbt-btn-secondary text-xs px-3 py-2 h-auto min-h-0"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(log);
              }}
              className="hbt-btn-primary text-xs px-4 py-2 h-auto min-h-0 flex items-center gap-1.5"
            >
              <Edit3 size={14} />
              <span>Edit Entry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
