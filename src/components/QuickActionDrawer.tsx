import React from 'react';
import { X, Receipt, Users, CreditCard, ChevronRight } from 'lucide-react';

interface QuickActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'expense' | 'attendance' | 'payment') => void;
}

export const QuickActionDrawer: React.FC<QuickActionDrawerProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white dark:bg-[#1E1B15] border-t sm:border border-sand dark:border-sand-dark rounded-t-[24px] sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-200 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-sand dark:bg-sand-dark rounded-full mx-auto sm:hidden" />

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif]">
              Quick Action
            </h3>
            <p className="text-xs text-stone dark:text-stone-dark">Choose what you want to record</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone hover:bg-sand/30 dark:hover:bg-sand-dark/30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2.5 pt-1">
          {/* Action 1: Log Expense */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction('expense');
            }}
            className="w-full p-3.5 rounded-xl border border-sand dark:border-sand-dark bg-[#FBEEE5]/40 dark:bg-[#33241A]/40 hover:bg-[#FBEEE5]/70 flex items-center justify-between text-left transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta dark:bg-terracotta-dark text-white dark:text-[#17150F] flex items-center justify-center font-bold">
                <Receipt size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal dark:text-text-dark">
                  Log Expense
                </div>
                <div className="text-xs text-stone dark:text-stone-dark">
                  Material purchase, transport, permits &amp; bills
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone" />
          </button>

          {/* Action 2: Mark Attendance */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction('attendance');
            }}
            className="w-full p-3.5 rounded-xl border border-sand dark:border-sand-dark bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50/80 flex items-center justify-between text-left transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Users size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal dark:text-text-dark">
                  Mark Attendance
                </div>
                <div className="text-xs text-stone dark:text-stone-dark">
                  Full day, half day, wages &amp; overtime
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone" />
          </button>

          {/* Action 3: Record Payment */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction('payment');
            }}
            className="w-full p-3.5 rounded-xl border border-sand dark:border-sand-dark bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50/80 flex items-center justify-between text-left transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-money-green text-white flex items-center justify-center font-bold">
                <CreditCard size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal dark:text-text-dark">
                  Record Payment
                </div>
                <div className="text-xs text-stone dark:text-stone-dark">
                  Cash or UPI disbursement to worker or vendor
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone" />
          </button>
        </div>
      </div>
    </div>
  );
};
