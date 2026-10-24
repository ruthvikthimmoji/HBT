import React from 'react';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Calendar,
  Truck,
  Plus,
} from 'lucide-react';

export type MainTabV2 = 'dashboard' | 'agreements' | 'payments' | 'sitelog' | 'materials';

interface BottomNavV2Props {
  activeTab: MainTabV2;
  onChangeTab: (tab: MainTabV2) => void;
  onOpenQuickAction: () => void;
  overdueScheduleCount?: number;
  missingReceiptsCount?: number;
}

export const BottomNavV2: React.FC<BottomNavV2Props> = ({
  activeTab,
  onChangeTab,
  onOpenQuickAction,
  overdueScheduleCount = 0,
  missingReceiptsCount = 0,
}) => {
  return (
    <>
      {/* Floating Quick Action Button (+) - Bottom Right above nav */}
      <button
        type="button"
        onClick={onOpenQuickAction}
        className="fixed bottom-[74px] right-4 z-40 w-13 h-13 rounded-full bg-[#FF6038] text-[#F6F5ED] flex items-center justify-center shadow-xl shadow-[#FF6038]/35 active:scale-95 transition-all border-2 border-white focus:outline-none"
        title="Quick Action (+ Payment, Agreement, Site Log, Material)"
        aria-label="Add new entry"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* 5-Column Primary Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sand pb-[env(safe-area-inset-bottom)] transition-colors">
        <div className="grid grid-cols-5 items-center max-w-[900px] mx-auto h-[62px] px-1">
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => onChangeTab('dashboard')}
            className="relative h-full flex flex-col items-center justify-center transition-all group select-none"
          >
            {activeTab === 'dashboard' && (
              <div className="absolute top-0 w-8 h-[2.5px] bg-terracotta rounded-full" />
            )}
            <LayoutDashboard
              className={`w-5 h-5 transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-terracotta'
                  : 'text-stone group-hover:text-charcoal'
              }`}
            />
            <span
              className={`text-[10px] mt-1 transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-terracotta font-bold'
                  : 'text-stone font-medium'
              }`}
            >
              Dashboard
            </span>
          </button>

          {/* 2. Agreements */}
          <button
            type="button"
            onClick={() => onChangeTab('agreements')}
            className="relative h-full flex flex-col items-center justify-center transition-all group select-none"
          >
            {activeTab === 'agreements' && (
              <div className="absolute top-0 w-8 h-[2.5px] bg-terracotta rounded-full" />
            )}
            <Building2
              className={`w-5 h-5 transition-colors ${
                activeTab === 'agreements'
                  ? 'text-terracotta'
                  : 'text-stone group-hover:text-charcoal'
              }`}
            />
            <span
              className={`text-[10px] mt-1 transition-colors ${
                activeTab === 'agreements'
                  ? 'text-terracotta font-bold'
                  : 'text-stone font-medium'
              }`}
            >
              Agreements
            </span>
          </button>

          {/* 3. Payments Ledger & Schedule */}
          <button
            type="button"
            onClick={() => onChangeTab('payments')}
            className="relative h-full flex flex-col items-center justify-center transition-all group select-none"
          >
            {activeTab === 'payments' && (
              <div className="absolute top-0 w-8 h-[2.5px] bg-terracotta rounded-full" />
            )}
            <div className="relative">
              <CreditCard
                className={`w-5 h-5 transition-colors ${
                  activeTab === 'payments'
                    ? 'text-terracotta'
                    : 'text-stone group-hover:text-charcoal'
                }`}
              />
              {(overdueScheduleCount > 0 || missingReceiptsCount > 0) && (
                <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-money-red text-white text-[9px] font-bold flex items-center justify-center">
                  {overdueScheduleCount + missingReceiptsCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-1 transition-colors ${
                activeTab === 'payments'
                  ? 'text-terracotta font-bold'
                  : 'text-stone font-medium'
              }`}
            >
              Payments
            </span>
          </button>

          {/* 4. Site Log */}
          <button
            type="button"
            onClick={() => onChangeTab('sitelog')}
            className="relative h-full flex flex-col items-center justify-center transition-all group select-none"
          >
            {activeTab === 'sitelog' && (
              <div className="absolute top-0 w-8 h-[2.5px] bg-terracotta rounded-full" />
            )}
            <Calendar
              className={`w-5 h-5 transition-colors ${
                activeTab === 'sitelog'
                  ? 'text-terracotta'
                  : 'text-stone group-hover:text-charcoal'
              }`}
            />
            <span
              className={`text-[10px] mt-1 transition-colors ${
                activeTab === 'sitelog'
                  ? 'text-terracotta font-bold'
                  : 'text-stone font-medium'
              }`}
            >
              Site Diary
            </span>
          </button>

          {/* 5. Materials */}
          <button
            type="button"
            onClick={() => onChangeTab('materials')}
            className="relative h-full flex flex-col items-center justify-center transition-all group select-none"
          >
            {activeTab === 'materials' && (
              <div className="absolute top-0 w-8 h-[2.5px] bg-terracotta rounded-full" />
            )}
            <Truck
              className={`w-5 h-5 transition-colors ${
                activeTab === 'materials'
                  ? 'text-terracotta'
                  : 'text-stone group-hover:text-charcoal'
              }`}
            />
            <span
              className={`text-[10px] mt-1 transition-colors ${
                activeTab === 'materials'
                  ? 'text-terracotta font-bold'
                  : 'text-stone font-medium'
              }`}
            >
              Materials
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
