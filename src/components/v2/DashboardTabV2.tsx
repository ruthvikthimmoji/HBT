import React from 'react';
import {
  Agreement,
  PaymentRecord,
  ScheduledPayment,
  MaterialEntry,
  SiteDailyLog,
  BudgetCategory,
  DashboardKPIs,
  MonthlySpend,
} from '../../types/v2';
import { formatCurrency } from '../../utils/format';
import { MonthlyTrendChart } from '../charts/MonthlyTrendChart';
import { PaidAheadGauge } from '../charts/PaidAheadGauge';
import { CategoryBudgetProgress } from '../charts/CategoryBudgetProgress';
import {
  AlertCircle,
  FileSpreadsheet,
  Clock,
  Receipt,
  Users,
  CreditCard,
  Truck,
  Building2,
  Calendar,
  ChevronRight,
  TrendingUp,
  FileWarning,
  CheckCircle2,
} from 'lucide-react';

interface DashboardTabV2Props {
  kpis: DashboardKPIs;
  monthlyTrends: MonthlySpend[];
  budget: BudgetCategory[];
  agreements: Agreement[];
  payments: PaymentRecord[];
  schedule: ScheduledPayment[];
  materials: MaterialEntry[];
  siteLogs: SiteDailyLog[];
  onNavigateTab: (tab: 'dashboard' | 'agreements' | 'payments' | 'sitelog' | 'materials') => void;
  onOpenVendors: () => void;
  onOpenBudget: () => void;
  onOpenQuickAction: () => void;
}

export const DashboardTabV2: React.FC<DashboardTabV2Props> = ({
  kpis,
  monthlyTrends,
  budget,
  agreements,
  payments,
  schedule,
  materials,
  siteLogs,
  onNavigateTab,
  onOpenVendors,
  onOpenBudget,
  onOpenQuickAction,
}) => {
  return (
    <div className="space-y-4 pb-20">
      {/* 1. Critical Operational Action Alerts (if any) */}
      {(kpis.missingReceiptsCount > 0 || kpis.overduePaymentsCount > 0 || kpis.paidAheadOfWorkDone > 0) && (
        <div className="space-y-2">
          {/* Missing Receipts Alert */}
          {kpis.missingReceiptsCount > 0 && (
            <div
              onClick={() => onNavigateTab('payments')}
              className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between cursor-pointer hover:bg-red-100/70 transition-all select-none"
            >
              <div className="flex items-center gap-2.5">
                <FileWarning size={18} className="text-money-red flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-money-red">
                    {kpis.missingReceiptsCount} Payment{kpis.missingReceiptsCount > 1 ? 's' : ''} Missing Receipts
                  </div>
                  <div className="text-[11px] text-stone">
                    Tap to review and attach invoice or WhatsApp vouchers
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-money-red" />
            </div>
          )}

          {/* Overdue Payments Alert */}
          {kpis.overduePaymentsCount > 0 && (
            <div
              onClick={() => onNavigateTab('payments')}
              className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between cursor-pointer hover:bg-orange-100/70 transition-all select-none"
            >
              <div className="flex items-center gap-2.5">
                <Clock size={18} className="text-terracotta flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-terracotta">
                    {kpis.overduePaymentsCount} Milestone Payment Overdue
                  </div>
                  <div className="text-[11px] text-stone">
                    Upcoming scheduled vendor payments needing clearance
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-terracotta" />
            </div>
          )}
        </div>
      )}

      {/* 2. Primary Financial Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Project Budget */}
        <div className="hbt-card">
          <div className="flex items-center justify-between text-xs text-stone mb-1 font-medium">
            <span>Project Budget</span>
            <button
              type="button"
              onClick={onOpenBudget}
              className="text-[11px] text-terracotta font-semibold hover:underline"
            >
              Plan
            </button>
          </div>
          <div className="text-[19px] font-bold text-charcoal tabular-num">
            {formatCurrency(kpis.totalBudget)}
          </div>
          <div className="text-[11px] text-stone mt-0.5">22 Categories</div>
        </div>

        {/* Total Spent So Far */}
        <div className="hbt-card">
          <div className="text-xs text-stone mb-1 font-medium">Total Spent</div>
          <div className="text-[19px] font-bold text-charcoal tabular-num">
            {formatCurrency(kpis.totalSpent)}
          </div>
          <div className="text-[11px] text-stone mt-0.5">Disbursed</div>
        </div>

        {/* Total Agreed with Contractors */}
        <div className="hbt-card">
          <div className="flex items-center justify-between text-xs text-stone mb-1 font-medium">
            <span>Agreed Work</span>
            <button
              type="button"
              onClick={onOpenVendors}
              className="text-[11px] text-terracotta font-semibold hover:underline"
            >
              Vendors
            </button>
          </div>
          <div className="text-[19px] font-bold text-[#11363E] tabular-num">
            {formatCurrency(kpis.totalAgreedWithVendors)}
          </div>
          <div className="text-[11px] text-stone mt-0.5">
            Bal: {formatCurrency(kpis.balanceStillToPay)}
          </div>
        </div>

        {/* Advances Given */}
        <div className="hbt-card">
          <div className="text-xs text-stone mb-1 font-medium">Advances Given</div>
          <div className="text-[19px] font-bold text-terracotta tabular-num">
            {formatCurrency(kpis.advancesGiven)}
          </div>
          <div className="text-[11px] text-stone mt-0.5">
            Ahead: {formatCurrency(kpis.paidAheadOfWorkDone)}
          </div>
        </div>
      </div>

      {/* 3. Secondary Operational Status Pills */}
      <div className="grid grid-cols-3 gap-2">
        <div
          onClick={() => onNavigateTab('payments')}
          className="hbt-card p-2.5 text-center cursor-pointer hover:border-terracotta/50 transition-all select-none"
        >
          <div className="text-[11px] text-stone font-medium">Next 7 Days Due</div>
          <div className="text-sm font-bold text-charcoal tabular-num mt-0.5">
            {formatCurrency(kpis.next7DaysAmountDue)}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('materials')}
          className="hbt-card p-2.5 text-center cursor-pointer hover:border-terracotta/50 transition-all select-none"
        >
          <div className="text-[11px] text-stone font-medium">Pending Material Bills</div>
          <div className="text-sm font-bold text-money-red tabular-num mt-0.5">
            {formatCurrency(kpis.materialBillsPending)}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('sitelog')}
          className="hbt-card p-2.5 text-center cursor-pointer hover:border-terracotta/50 transition-all select-none"
        >
          <div className="text-[11px] text-stone font-medium">Site Log Entries</div>
          <div className="text-sm font-bold text-[#11363E] tabular-num mt-0.5">
            {kpis.siteLogEntriesCount} Visits
          </div>
        </div>
      </div>

      {/* 4. Safety Gauge: Paid Ahead of Work */}
      <PaidAheadGauge
        advancesGiven={kpis.advancesGiven}
        paidAheadOfWork={kpis.paidAheadOfWorkDone}
        totalAgreed={kpis.totalAgreedWithVendors}
        totalPaid={kpis.totalSpent}
      />

      {/* 5. 12-Month Cash Flow Spend Chart */}
      <div className="hbt-card p-4">
        <MonthlyTrendChart data={monthlyTrends} />
      </div>

      {/* 6. Category Performance Budget vs Actual */}
      <div className="hbt-card p-4">
        <CategoryBudgetProgress
          categories={budget}
          onOpenBudgetModal={onOpenBudget}
        />
      </div>

      {/* 7. Quick Jump Cards (Agreements, Ledger, Materials, Site Log) */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-charcoal px-1">Quick Modules</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Contracts */}
          <div
            onClick={() => onNavigateTab('agreements')}
            className="hbt-card p-3 hover:border-terracotta/60 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-terracotta flex items-center justify-center font-bold">
                <Building2 size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-charcoal">Agreements</div>
                <div className="text-[11px] text-stone">{agreements.length} Work Orders</div>
              </div>
            </div>
            <ChevronRight size={14} className="text-stone group-hover:text-terracotta" />
          </div>

          {/* Payments */}
          <div
            onClick={() => onNavigateTab('payments')}
            className="hbt-card p-3 hover:border-terracotta/60 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#11363E] flex items-center justify-center font-bold">
                <CreditCard size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-charcoal">Payments Ledger</div>
                <div className="text-[11px] text-stone">{payments.length} Records</div>
              </div>
            </div>
            <ChevronRight size={14} className="text-stone group-hover:text-terracotta" />
          </div>

          {/* Materials */}
          <div
            onClick={() => onNavigateTab('materials')}
            className="hbt-card p-3 hover:border-terracotta/60 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone flex items-center justify-center font-bold">
                <Truck size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-charcoal">Materials Log</div>
                <div className="text-[11px] text-stone">{materials.length} Deliveries</div>
              </div>
            </div>
            <ChevronRight size={14} className="text-stone group-hover:text-terracotta" />
          </div>

          {/* Site Log */}
          <div
            onClick={() => onNavigateTab('sitelog')}
            className="hbt-card p-3 hover:border-terracotta/60 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Calendar size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-charcoal">Site Diary</div>
                <div className="text-[11px] text-stone">{siteLogs.length} Entries</div>
              </div>
            </div>
            <ChevronRight size={14} className="text-stone group-hover:text-terracotta" />
          </div>
        </div>
      </div>
    </div>
  );
};
