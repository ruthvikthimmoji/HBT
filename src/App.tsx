import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Settings,
  Expense,
  DailyLog,
  Worker,
  Payment,
  PersonBalance,
} from './types';
import {
  getInitialData,
  saveSettings,
  saveExpenses,
  saveLogs,
  saveWorkers,
  savePayments,
} from './utils/storage';
import { computeFinancialSummary } from './utils/calculations';
import { exportToExcel } from './utils/excelExport';
import { syncAllToGoogleSheets, fetchFromGoogleSheets } from './services/googleSheets';

import { Header } from './components/Header';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { SummaryTab } from './components/SummaryTab';
import { ExpensesTab } from './components/ExpensesTab';
import { AttendanceTab } from './components/AttendanceTab';
import { PaymentsTab } from './components/PaymentsTab';
import { SettingsModal } from './components/SettingsModal';
import { EditModal } from './components/EditModal';
import { PhotoModal } from './components/PhotoModal';

export const App: React.FC = () => {
  // Initialize state from storage / seed defaults
  const initial = useMemo(() => getInitialData(), []);

  const [settings, setSettings] = useState<Settings>(initial.settings);
  const [expenses, setExpenses] = useState<Expense[]>(initial.expenses);
  const [logs, setLogs] = useState<DailyLog[]>(initial.logs);
  const [workers, setWorkers] = useState<Worker[]>(initial.workers);
  const [payments, setPayments] = useState<Payment[]>(initial.payments);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  // Quick Pay bridge (when user taps "Record payment" in Summary dues list)
  const [prefilledPayee, setPrefilledPayee] = useState<PersonBalance | null>(null);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [photoModalState, setPhotoModalState] = useState<{ url: string; caption: string } | null>(null);
  const [editModalState, setEditModalState] = useState<{
    type: 'expense' | 'payment' | null;
    item: Expense | Payment | null;
  }>({ type: null, item: null });

  // Dark mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('hbt_dark');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hbt_dark', String(isDark));
  }, [isDark]);

  // Persist state updates to localStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveWorkers(workers);
  }, [workers]);

  useEffect(() => {
    savePayments(payments);
  }, [payments]);

  // Financial summary computation
  const summary = useMemo(() => {
    return computeFinancialSummary(settings, expenses, logs, workers, payments);
  }, [settings, expenses, logs, workers, payments]);

  // Count of pending dues for badge in payments tab
  const pendingDueCount = useMemo(() => {
    return summary.personBalances.filter((p) => p.status === 'Due').length;
  }, [summary]);

  // Google Sheets Auto/Manual Sync Handler
  const handleSyncToCloud = useCallback(async () => {
    if (!settings.gasWebAppUrl || !settings.gasWebAppUrl.trim()) return;

    try {
      await syncAllToGoogleSheets(settings.gasWebAppUrl, {
        settings,
        expenses,
        workers,
        logs,
        payments,
      });

      const updatedSettings = {
        ...settings,
        lastSyncedAt: new Date().toISOString(),
      };
      setSettings(updatedSettings);
    } catch (err) {
      console.error('Auto sync to Google Sheets failed:', err);
      throw err;
    }
  }, [settings, expenses, workers, logs, payments]);

  // Expense Handlers
  const handleAddExpense = (newExp: Omit<Expense, 'id' | 'createdAt'>) => {
    const created: Expense = {
      ...newExp,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [created, ...prev]);

    // Optional background sync if connected
    if (settings.gasWebAppUrl) {
      handleSyncToCloud().catch(() => {});
    }
  };

  const handleEditExpense = (exp: Expense) => {
    setEditModalState({ type: 'expense', item: exp });
  };

  const handleSaveEditedExpense = (updated: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (settings.gasWebAppUrl) {
      handleSyncToCloud().catch(() => {});
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (settings.gasWebAppUrl) {
      handleSyncToCloud().catch(() => {});
    }
  };

  // Daily Log Attendance Handlers
  const handleMarkAttendance = (logEntry: Omit<DailyLog, 'id'>) => {
    const id = `${logEntry.date}_${logEntry.workerId}`;
    setLogs((prev) => {
      const filtered = prev.filter((l) => l.id !== id);
      return [...filtered, { ...logEntry, id }];
    });

    if (settings.gasWebAppUrl) {
      handleSyncToCloud().catch(() => {});
    }
  };

  // Worker Handlers
  const handleAddWorker = (newWorker: Omit<Worker, 'id'>) => {
    const created: Worker = {
      ...newWorker,
      id: `w_${Date.now()}`,
    };
    setWorkers((prev) => [...prev, created]);
    if (settings.gasWebAppUrl) {
      handleSyncToCloud().catch(() => {});
    }
  };

  const handleEditWorker = (updatedWorker: Worker) => {
    setWorkers((prev) => prev.map((w) => (w.id === updatedWorker.id ? updatedWorker : w)));
    if (settings.gasWebAppUrl) {
      handleSyncToCloud().catch(() => {});
    }
  };

  const handleDeleteWorker = (id: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== id));
  };

  // Payment Handlers
  const handleAddPayment = (newPay: Omit<Payment, 'id' | 'createdAt'>) => {
    const created: Payment = {
      ...newPay,
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [created, ...prev]);

    if (settings.gasWebAppUrl) {
      handleSyncToCloud().catch(() => {});
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setEditModalState({ type: 'payment', item: payment });
  };

  const handleSaveEditedPayment = (updated: Payment) => {
    setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (settings.gasWebAppUrl) {
      handleSyncToCloud().catch(() => {});
    }
  };

  const handleDeletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
    if (settings.gasWebAppUrl) {
      handleSyncToCloud().catch(() => {});
    }
  };

  // Quick Pay Bridge from Summary
  const handleQuickPayFromSummary = (person: PersonBalance) => {
    setPrefilledPayee(person);
    setActiveTab('payments');
  };

  // Excel Export
  const handleExportExcel = () => {
    exportToExcel(settings, expenses, logs, workers, payments);
  };

  // Reset to sample data or clear all
  const handleResetSampleData = () => {
    localStorage.clear();
    const fresh = getInitialData();
    setSettings(fresh.settings);
    setExpenses(fresh.expenses);
    setLogs(fresh.logs);
    setWorkers(fresh.workers);
    setPayments(fresh.payments);
  };

  const handleClearAllData = () => {
    setExpenses([]);
    setLogs([]);
    setPayments([]);
    setSettings((prev) => ({ ...prev, budget: 0, categoryBudgets: {} }));
    localStorage.clear();
  };

  return (
    <div className="min-h-screen bg-plaster dark:bg-[#17150F] flex flex-col transition-colors selection:bg-[#FBEEE5] selection:text-terracotta">
      {/* Header with Sync Status and Navigation */}
      <Header
        projectName={settings.projectName}
        isSynced={Boolean(settings.gasWebAppUrl && settings.lastSyncedAt)}
        lastSyncedAt={settings.lastSyncedAt}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportExcel={handleExportExcel}
      />

      {/* Main Tabs Navigation */}
      <NavigationTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingDueCount={pendingDueCount}
      />

      {/* Main Responsive Content Container (Max 900px centered as per PRD Section 17) */}
      <main className="flex-1 max-w-[900px] w-full mx-auto p-4 sm:p-5">
        {activeTab === 'summary' && (
          <SummaryTab
            summary={summary}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onQuickPay={handleQuickPayFromSummary}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onViewPhoto={(url, caption) => setPhotoModalState({ url, caption })}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceTab
            workers={workers}
            logs={logs}
            onMarkAttendance={handleMarkAttendance}
            onAddWorker={handleAddWorker}
            onEditWorker={handleEditWorker}
            onDeleteWorker={handleDeleteWorker}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsTab
            payments={payments}
            workers={workers}
            expenses={expenses}
            prefilledPayee={prefilledPayee}
            onClearPrefilledPayee={() => setPrefilledPayee(null)}
            onAddPayment={handleAddPayment}
            onEditPayment={handleEditPayment}
            onDeletePayment={handleDeletePayment}
            onViewPhoto={(url, caption) => setPhotoModalState({ url, caption })}
          />
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        settings={settings}
        summary={summary}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSettings={setSettings}
        onSyncNow={handleSyncToCloud}
        onExportExcel={handleExportExcel}
        onResetSampleData={handleResetSampleData}
        onClearAllData={handleClearAllData}
      />

      <EditModal
        type={editModalState.type}
        item={editModalState.item}
        onClose={() => setEditModalState({ type: null, item: null })}
        onSaveExpense={handleSaveEditedExpense}
        onSavePayment={handleSaveEditedPayment}
      />

      <PhotoModal
        photoUrl={photoModalState ? photoModalState.url : null}
        caption={photoModalState ? photoModalState.caption : undefined}
        onClose={() => setPhotoModalState(null)}
      />
    </div>
  );
};

export default App;
