import React, { useState, useMemo } from 'react';
import { UnifiedLog, Expense, DailyLog, Payment } from '../types';
import { formatCurrency } from '../utils/format';
import {
  Search,
  Filter,
  Receipt,
  UserCheck,
  CreditCard,
  ArrowUpRight,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface FullLogsViewProps {
  expenses: Expense[];
  logs: DailyLog[];
  payments: Payment[];
  onSelectLog: (log: UnifiedLog) => void;
  onOpenSheet: () => void;
}

export const FullLogsView: React.FC<FullLogsViewProps> = ({
  expenses,
  logs,
  payments,
  onSelectLog,
  onOpenSheet,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'attendance' | 'payment'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'today'>('all');

  // Convert all items into a unified log list
  const unifiedLogs: UnifiedLog[] = useMemo(() => {
    const list: UnifiedLog[] = [];

    // 1. Expenses
    expenses.forEach((e) => {
      list.push({
        id: e.id,
        type: 'expense',
        date: e.date,
        title: e.item,
        subtitle: e.vendor ? `Vendor: ${e.vendor}` : e.category,
        amount: Number(e.amount) || 0,
        category: e.category,
        vendorOrWorker: e.vendor,
        note: e.note,
        photoUrl: e.photoReceipt,
        rawItem: e,
      });
    });

    // 2. Attendance / Wages
    logs.forEach((l) => {
      const statusLabel =
        l.status === 'full' ? 'Full Day' : l.status === 'half' ? 'Half Day' : 'Absent';
      list.push({
        id: l.id,
        type: 'attendance',
        date: l.date,
        title: `${l.workerName} (${statusLabel})`,
        subtitle: `Wage credited for ${l.date}`,
        amount: Number(l.wage) || 0,
        category: 'Labour (daily wages)',
        statusBadge: statusLabel,
        vendorOrWorker: l.workerName,
        note: l.note,
        rawItem: l,
      });
    });

    // 3. Payments
    payments.forEach((p) => {
      list.push({
        id: p.id,
        type: 'payment',
        date: p.date,
        title: `Payment to ${p.payee}`,
        subtitle: `Paid via ${p.mode}${p.note ? ` • ${p.note}` : ''}`,
        amount: Number(p.amount) || 0,
        paymentMode: p.mode,
        statusBadge: 'Settled',
        vendorOrWorker: p.payee,
        note: p.note,
        photoUrl: p.photoProof,
        rawItem: p,
      });
    });

    // Sort newest first
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, logs, payments]);

  // Apply filters
  const filteredLogs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    return unifiedLogs.filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;

      if (dateFilter === 'today' && item.date !== today) return false;
      if (dateFilter === 'month' && !item.date.startsWith(currentMonth)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSub = item.subtitle.toLowerCase().includes(q);
        const matchCat = (item.category || '').toLowerCase().includes(q);
        const matchPerson = (item.vendorOrWorker || '').toLowerCase().includes(q);
        const matchNote = (item.note || '').toLowerCase().includes(q);
        return matchTitle || matchSub || matchCat || matchPerson || matchNote;
      }

      return true;
    });
  }, [unifiedLogs, filterType, dateFilter, searchQuery]);

  // Aggregate stats for filtered view
  const totalFilteredAmount = useMemo(() => {
    return filteredLogs.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredLogs]);

  return (
    <div className="space-y-3.5 pb-20">
      {/* Search & Top Action */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-3 text-stone dark:text-stone-dark" />
          <input
            type="text"
            placeholder="Search all entered logs, bills, names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="hbt-input w-full pl-9 pr-8 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-stone hover:text-charcoal"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          onClick={onOpenSheet}
          className="hbt-btn-secondary px-3 py-2 text-xs flex items-center gap-1.5 h-[42px] whitespace-nowrap"
          title="Open connected Google Sheet"
        >
          <FileSpreadsheet size={15} className="text-money-green" />
          <span className="hidden sm:inline">Google Sheet</span>
        </button>
      </div>

      {/* Filter Tabs Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', label: 'All Logs' },
          { id: 'expense', label: 'Expenses' },
          { id: 'attendance', label: 'Attendance & Wages' },
          { id: 'payment', label: 'Payments' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === f.id
                ? 'bg-terracotta dark:bg-terracotta-dark text-white dark:text-[#17150F]'
                : 'bg-white dark:bg-surface-dark text-stone dark:text-stone-dark border border-sand dark:border-sand-dark'
            }`}
          >
            {f.label}
          </button>
        ))}

        <div className="h-4 w-[1px] bg-sand mx-1 flex-shrink-0" />

        {[
          { id: 'all', label: 'All Time' },
          { id: 'month', label: 'This Month' },
          { id: 'today', label: 'Today' },
        ].map((d) => (
          <button
            key={d.id}
            onClick={() => setDateFilter(d.id as any)}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
              dateFilter === d.id
                ? 'bg-sand/60 dark:bg-sand-dark/60 text-charcoal dark:text-text-dark font-bold'
                : 'text-stone dark:text-stone-dark hover:bg-sand/20'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Filter Count & Total Bar */}
      <div className="flex items-center justify-between text-xs text-stone dark:text-stone-dark px-1">
        <span>Showing {filteredLogs.length} logs</span>
        <span>
          Total Value:{' '}
          <strong className="text-charcoal dark:text-text-dark font-bold tabular-num">
            {formatCurrency(totalFilteredAmount)}
          </strong>
        </span>
      </div>

      {/* Unified Log Records List */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="hbt-card py-12 text-center text-sm text-stone dark:text-stone-dark">
            <p>No matching logs found.</p>
            <p className="text-xs text-stone/80 mt-1">Tap + below to add an expense or attendance.</p>
          </div>
        ) : (
          filteredLogs.map((item) => (
            <div
              key={`${item.type}_${item.id}`}
              onClick={() => onSelectLog(item)}
              className="hbt-card p-3.5 hover:border-terracotta/40 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Type Icon Avatar */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.type === 'expense'
                      ? 'bg-[#FBEEE5] text-terracotta dark:bg-[#33241A] dark:text-terracotta-dark'
                      : item.type === 'attendance'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'bg-money-green/10 text-money-green dark:text-money-green-dark'
                  }`}
                >
                  {item.type === 'expense' && <Receipt size={18} />}
                  {item.type === 'attendance' && <UserCheck size={18} />}
                  {item.type === 'payment' && <CreditCard size={18} />}
                </div>

                {/* Info Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-[14px] text-charcoal dark:text-text-dark truncate">
                      {item.title}
                    </span>
                    {item.category && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-sand/30 dark:bg-sand-dark/30 text-stone dark:text-stone-dark">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone dark:text-stone-dark mt-0.5 flex items-center gap-1.5 truncate">
                    <span className="tabular-num">{item.date}</span>
                    <span>•</span>
                    <span className="truncate">{item.subtitle}</span>
                  </div>
                </div>
              </div>

              {/* Amount & Arrow */}
              <div className="text-right flex-shrink-0 flex items-center gap-2">
                <div>
                  <div
                    className={`font-bold text-[15px] tabular-num ${
                      item.type === 'payment'
                        ? 'text-money-green dark:text-money-green-dark'
                        : 'text-charcoal dark:text-text-dark'
                    }`}
                  >
                    {formatCurrency(item.amount)}
                  </div>
                  {item.photoUrl && (
                    <span className="text-[10px] text-terracotta dark:text-terracotta-dark font-medium block">
                      📷 Receipt
                    </span>
                  )}
                </div>
                <ArrowUpRight
                  size={15}
                  className="text-stone dark:text-stone-dark group-hover:text-terracotta transition-colors"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
