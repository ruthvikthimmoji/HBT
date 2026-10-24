import React from 'react';
import { LayoutDashboard, Receipt, Plus, Users, ClipboardList } from 'lucide-react';

export type MainTabType = 'summary' | 'expenses' | 'attendance' | 'payments' | 'fulllogs';

interface BottomNavProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  onOpenQuickAction: () => void;
  pendingDueCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenQuickAction,
  pendingDueCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#17150F]/95 backdrop-blur-md border-t border-sand dark:border-sand-dark pb-[env(safe-area-inset-bottom)] transition-colors">
      <div className="grid grid-cols-5 items-center max-w-[900px] mx-auto h-[60px] px-1">
        {/* Col 1: Overview */}
        <button
          type="button"
          onClick={() => onChangeTab('summary')}
          className="relative h-full flex flex-col items-center justify-center transition-all group select-none"
        >
          {activeTab === 'summary' && (
            <div className="absolute top-0 w-8 h-[2.5px] bg-terracotta dark:bg-terracotta-dark rounded-full" />
          )}
          <LayoutDashboard
            className={`w-5 h-5 transition-colors ${
              activeTab === 'summary'
                ? 'text-terracotta dark:text-terracotta-dark'
                : 'text-stone dark:text-stone-dark group-hover:text-charcoal'
            }`}
          />
          <span
            className={`text-[11px] mt-1 transition-colors ${
              activeTab === 'summary'
                ? 'text-terracotta dark:text-terracotta-dark font-bold'
                : 'text-stone dark:text-stone-dark font-medium'
            }`}
          >
            Overview
          </span>
        </button>

        {/* Col 2: Expenses */}
        <button
          type="button"
          onClick={() => onChangeTab('expenses')}
          className="relative h-full flex flex-col items-center justify-center transition-all group select-none"
        >
          {activeTab === 'expenses' && (
            <div className="absolute top-0 w-8 h-[2.5px] bg-terracotta dark:bg-terracotta-dark rounded-full" />
          )}
          <Receipt
            className={`w-5 h-5 transition-colors ${
              activeTab === 'expenses'
                ? 'text-terracotta dark:text-terracotta-dark'
                : 'text-stone dark:text-stone-dark group-hover:text-charcoal'
            }`}
          />
          <span
            className={`text-[11px] mt-1 transition-colors ${
              activeTab === 'expenses'
                ? 'text-terracotta dark:text-terracotta-dark font-bold'
                : 'text-stone dark:text-stone-dark font-medium'
            }`}
          >
            Expenses
          </span>
        </button>

        {/* Col 3: Center-Raised Quick Action Button (+) */}
        <div className="flex items-center justify-center h-full relative">
          <button
            type="button"
            onClick={onOpenQuickAction}
            className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-[#FF460E] to-[#FF6B3D] text-white flex items-center justify-center shadow-lg shadow-[#FF460E]/25 active:scale-95 transition-all focus:outline-none border-2 border-white dark:border-[#17150F]"
            title="Quick Action (+ Expense, Attendance, Payment)"
            aria-label="Add new entry"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Col 4: Daily Log (Attendance) */}
        <button
          type="button"
          onClick={() => onChangeTab('attendance')}
          className="relative h-full flex flex-col items-center justify-center transition-all group select-none"
        >
          {activeTab === 'attendance' && (
            <div className="absolute top-0 w-8 h-[2.5px] bg-terracotta dark:bg-terracotta-dark rounded-full" />
          )}
          <Users
            className={`w-5 h-5 transition-colors ${
              activeTab === 'attendance'
                ? 'text-terracotta dark:text-terracotta-dark'
                : 'text-stone dark:text-stone-dark group-hover:text-charcoal'
            }`}
          />
          <span
            className={`text-[11px] mt-1 transition-colors ${
              activeTab === 'attendance'
                ? 'text-terracotta dark:text-terracotta-dark font-bold'
                : 'text-stone dark:text-stone-dark font-medium'
            }`}
          >
            Attendance
          </span>
        </button>

        {/* Col 5: Full Logs (Detail Inspector) */}
        <button
          type="button"
          onClick={() => onChangeTab('fulllogs')}
          className="relative h-full flex flex-col items-center justify-center transition-all group select-none"
        >
          {activeTab === 'fulllogs' && (
            <div className="absolute top-0 w-8 h-[2.5px] bg-terracotta dark:bg-terracotta-dark rounded-full" />
          )}
          <div className="relative">
            <ClipboardList
              className={`w-5 h-5 transition-colors ${
                activeTab === 'fulllogs'
                  ? 'text-terracotta dark:text-terracotta-dark'
                  : 'text-stone dark:text-stone-dark group-hover:text-charcoal'
              }`}
            />
            {pendingDueCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-money-red text-white text-[9px] font-bold flex items-center justify-center">
                {pendingDueCount}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] mt-1 transition-colors ${
              activeTab === 'fulllogs'
                ? 'text-terracotta dark:text-terracotta-dark font-bold'
                : 'text-stone dark:text-stone-dark font-medium'
            }`}
          >
            Full Logs
          </span>
        </button>
      </div>
    </nav>
  );
};
