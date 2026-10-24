import React from 'react';
import { LayoutDashboard, Receipt, Users, CreditCard } from 'lucide-react';

export type TabType = 'summary' | 'expenses' | 'attendance' | 'payments';

interface NavigationTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  pendingDueCount?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  pendingDueCount = 0,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'summary', label: 'Summary', icon: <LayoutDashboard size={16} /> },
    { id: 'expenses', label: 'Expenses', icon: <Receipt size={16} /> },
    { id: 'attendance', label: 'Daily Log', icon: <Users size={16} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={16} />, badge: pendingDueCount > 0 ? pendingDueCount : undefined },
  ];

  return (
    <div className="sticky top-[73px] z-30 bg-plaster/90 backdrop-blur-md pt-2 pb-3 px-4 border-b border-sand/50">
      <div className="max-w-[900px] mx-auto overflow-x-auto no-scrollbar flex items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all select-none ${
                isActive
                  ? 'bg-terracotta text-white shadow-sm'
                  : 'bg-white text-charcoal border border-sand hover:border-terracotta/40'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-money-red/10 text-money-red'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
