import React from 'react';
import {
  X,
  CreditCard,
  Building2,
  Calendar,
  Truck,
  Clock,
  Users,
  PieChart,
  ChevronRight,
} from 'lucide-react';

export type QuickActionType =
  | 'payment'
  | 'agreement'
  | 'sitelog'
  | 'material'
  | 'schedule'
  | 'vendors'
  | 'budget';

interface QuickActionDrawerV2Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: QuickActionType) => void;
}

export const QuickActionDrawerV2: React.FC<QuickActionDrawerV2Props> = ({
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
        className="w-full sm:max-w-md bg-white border-t sm:border border-sand rounded-t-[24px] sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-200 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-sand rounded-full mx-auto sm:hidden" />

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-charcoal font-['Nunito_Sans',sans-serif]">
              Quick Action
            </h3>
            <p className="text-xs text-stone">What would you like to record?</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone hover:bg-sand/30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Buttons Grid */}
        <div className="space-y-2 pt-1">
          {/* 1. Record Payment */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction('payment');
            }}
            className="w-full p-3 rounded-xl border border-sand bg-[#EBECDC]/50 hover:bg-[#EBECDC] flex items-center justify-between text-left transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-terracotta text-white flex items-center justify-center font-bold">
                <CreditCard size={17} />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal">Record Payment</div>
                <div className="text-[11px] text-stone">
                  Advance, milestone, final bill &amp; attach receipt
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone" />
          </button>

          {/* 2. New Agreement */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction('agreement');
            }}
            className="w-full p-3 rounded-xl border border-sand bg-sand/20 hover:bg-sand/40 flex items-center justify-between text-left transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#11363E] text-white flex items-center justify-center font-bold">
                <Building2 size={17} />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal">New Agreement</div>
                <div className="text-[11px] text-stone">
                  Contractor work order, agreed amount &amp; terms
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone" />
          </button>

          {/* 3. Log Site Visit */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction('sitelog');
            }}
            className="w-full p-3 rounded-xl border border-sand bg-sand/20 hover:bg-sand/40 flex items-center justify-between text-left transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#733635] text-white flex items-center justify-center font-bold">
                <Calendar size={17} />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal">Log Site Visit</div>
                <div className="text-[11px] text-stone">
                  Daily progress diary, labour count &amp; photos
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone" />
          </button>

          {/* 4. Add Material Delivery */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction('material');
            }}
            className="w-full p-3 rounded-xl border border-sand bg-sand/20 hover:bg-sand/40 flex items-center justify-between text-left transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#A0C9CB] text-charcoal flex items-center justify-center font-bold">
                <Truck size={17} />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal">Add Material Delivery</div>
                <div className="text-[11px] text-stone">
                  Cement, steel, sand loads &amp; shop invoices
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone" />
          </button>

          {/* 5. Schedule Milestone Payment */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction('schedule');
            }}
            className="w-full p-3 rounded-xl border border-sand bg-sand/20 hover:bg-sand/40 flex items-center justify-between text-left transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-terracotta flex items-center justify-center font-bold">
                <Clock size={17} />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal">Schedule Milestone</div>
                <div className="text-[11px] text-stone">
                  Plan upcoming payment dates &amp; reminders
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone" />
          </button>
        </div>

        {/* Quick Directory Drawers Footer */}
        <div className="pt-2 border-t border-sand/50 grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction('vendors');
            }}
            className="p-2.5 rounded-lg border border-sand flex items-center justify-center gap-1.5 font-semibold text-charcoal hover:bg-sand/20 transition-all"
          >
            <Users size={14} className="text-terracotta" />
            <span>Vendors Directory</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectAction('budget');
            }}
            className="p-2.5 rounded-lg border border-sand flex items-center justify-center gap-1.5 font-semibold text-charcoal hover:bg-sand/20 transition-all"
          >
            <PieChart size={14} className="text-[#11363E]" />
            <span>Budget Categories</span>
          </button>
        </div>
      </div>
    </div>
  );
};
