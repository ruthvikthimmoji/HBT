import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Agreement,
  Vendor,
  PaymentRecord,
  ScheduledPayment,
  MaterialEntry,
  SiteDailyLog,
  BudgetCategory,
  AppSettingsV2,
} from './types/v2';
import {
  loadSettingsV2,
  saveSettingsV2,
  loadAgreements,
  saveAgreements,
  loadVendors,
  saveVendors,
  loadPayments,
  savePayments,
  loadMaterials,
  saveMaterials,
  loadSiteLogs,
  saveSiteLogs,
  loadSchedule,
  saveSchedule,
  loadBudget,
  saveBudget,
  calculateAggregates,
  INITIAL_AGREEMENTS,
  INITIAL_VENDORS,
  INITIAL_PAYMENTS,
  INITIAL_MATERIALS,
  INITIAL_SITE_LOGS,
  INITIAL_SCHEDULE,
  INITIAL_BUDGET,
  DEFAULT_SETTINGS_V2,
} from './utils/storageV2';
import { exportToExcelV2, syncWithGAS } from './utils/gasSyncV2';

import { HeaderV2 } from './components/v2/HeaderV2';
import { BottomNavV2, MainTabV2 } from './components/v2/BottomNavV2';
import { DashboardTabV2 } from './components/v2/DashboardTabV2';
import { AgreementsTabV2 } from './components/v2/AgreementsTabV2';
import { PaymentsTabV2 } from './components/v2/PaymentsTabV2';
import { SiteDailyLogTabV2 } from './components/v2/SiteDailyLogTabV2';
import { MaterialsTabV2 } from './components/v2/MaterialsTabV2';
import { QuickActionDrawerV2, QuickActionType } from './components/v2/QuickActionDrawerV2';
import { VendorsDrawer } from './components/v2/VendorsDrawer';
import { BudgetDrawer } from './components/v2/BudgetDrawer';
import { PaymentEntryModal } from './components/v2/PaymentEntryModal';
import { AgreementEntryModal } from './components/v2/AgreementEntryModal';
import { MaterialEntryModal } from './components/v2/MaterialEntryModal';
import { SiteLogEntryModal } from './components/v2/SiteLogEntryModal';
import { ScheduleEntryModal } from './components/v2/ScheduleEntryModal';
import { AgreementDetailDrawer } from './components/v2/AgreementDetailDrawer';
import { PaymentDetailDrawer } from './components/v2/PaymentDetailDrawer';
import { SettingsModalV2 } from './components/v2/SettingsModalV2';
import { PhotoModal } from './components/PhotoModal';

export const App: React.FC = () => {
  // Load State from LocalStorage
  const [settings, setSettings] = useState<AppSettingsV2>(() => loadSettingsV2());
  const [agreements, setAgreements] = useState<Agreement[]>(() => loadAgreements());
  const [vendors, setVendors] = useState<Vendor[]>(() => loadVendors());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => loadPayments());
  const [materials, setMaterials] = useState<MaterialEntry[]>(() => loadMaterials());
  const [siteLogs, setSiteLogs] = useState<SiteDailyLog[]>(() => loadSiteLogs());
  const [schedule, setSchedule] = useState<ScheduledPayment[]>(() => loadSchedule());
  const [budget, setBudget] = useState<BudgetCategory[]>(() => loadBudget());

  // Active Tab
  const [activeTab, setActiveTab] = useState<MainTabV2>('dashboard');

  // Modals & Drawers
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isVendorsOpen, setIsVendorsOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Entry Modals
  const [isPaymentEntryOpen, setIsPaymentEntryOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<PaymentRecord | null>(null);
  const [paymentPrefill, setPaymentPrefill] = useState<Partial<PaymentRecord> | undefined>(undefined);

  const [isAgreementEntryOpen, setIsAgreementEntryOpen] = useState(false);
  const [agreementToEdit, setAgreementToEdit] = useState<Agreement | null>(null);

  const [isMaterialEntryOpen, setIsMaterialEntryOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<MaterialEntry | null>(null);

  const [isSiteLogEntryOpen, setIsSiteLogEntryOpen] = useState(false);
  const [siteLogToEdit, setSiteLogToEdit] = useState<SiteDailyLog | null>(null);

  const [isScheduleEntryOpen, setIsScheduleEntryOpen] = useState(false);

  // Inspection Drawers
  const [selectedAgreementForDetail, setSelectedAgreementForDetail] = useState<Agreement | null>(null);
  const [selectedPaymentForDetail, setSelectedPaymentForDetail] = useState<PaymentRecord | null>(null);

  // Photo Preview Modal
  const [photoModalState, setPhotoModalState] = useState<{ url: string; caption?: string } | null>(null);

  // Enforce single default brand theme (Snow background)
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('hbt_dark');
  }, []);

  // Persist Updates to Storage
  useEffect(() => {
    saveSettingsV2(settings);
  }, [settings]);

  useEffect(() => {
    saveAgreements(agreements);
  }, [agreements]);

  useEffect(() => {
    saveVendors(vendors);
  }, [vendors]);

  useEffect(() => {
    savePayments(payments);
  }, [payments]);

  useEffect(() => {
    saveMaterials(materials);
  }, [materials]);

  useEffect(() => {
    saveSiteLogs(siteLogs);
  }, [siteLogs]);

  useEffect(() => {
    saveSchedule(schedule);
  }, [schedule]);

  useEffect(() => {
    saveBudget(budget);
  }, [budget]);

  // Recalculate Business Aggregates & KPIs
  const computed = useMemo(() => {
    return calculateAggregates(agreements, payments, materials, siteLogs, schedule, budget);
  }, [agreements, payments, materials, siteLogs, schedule, budget]);

  // Handlers for Payments
  const handleSavePayment = useCallback((record: PaymentRecord) => {
    setPayments((prev) => {
      const idx = prev.findIndex((p) => p.id === record.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });
  }, []);

  const handleDeletePayment = useCallback((id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Handlers for Agreements
  const handleSaveAgreement = useCallback((record: Agreement) => {
    setAgreements((prev) => {
      const idx = prev.findIndex((a) => a.id === record.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });
  }, []);

  const handleUpdateAgreementProgress = useCallback((id: string, newPercent: number) => {
    setAgreements((prev) =>
      prev.map((agr) => {
        if (agr.id === id) {
          const workValueDone = (agr.agreedAmount * newPercent) / 100;
          const paidAheadOfWork = Math.max(0, agr.totalPaid - workValueDone);
          return {
            ...agr,
            workCompletedPercent: newPercent,
            workValueDone,
            paidAheadOfWork,
            status: newPercent >= 100 && agr.balanceToPay <= 0 ? 'Completed' : agr.status,
          };
        }
        return agr;
      })
    );
  }, []);

  const handleDeleteAgreement = useCallback((id: string) => {
    setAgreements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Handlers for Materials
  const handleSaveMaterial = useCallback((record: MaterialEntry) => {
    setMaterials((prev) => {
      const idx = prev.findIndex((m) => m.id === record.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });
  }, []);

  const handleToggleMaterialPayment = useCallback((id: string) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            paymentStatus: m.paymentStatus === 'Paid' ? 'Pending' : 'Paid',
          };
        }
        return m;
      })
    );
  }, []);

  // Handlers for Site Logs
  const handleSaveSiteLog = useCallback((record: SiteDailyLog) => {
    setSiteLogs((prev) => {
      const idx = prev.findIndex((s) => s.id === record.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });
  }, []);

  // Handlers for Schedule
  const handleSaveSchedule = useCallback((item: ScheduledPayment) => {
    setSchedule((prev) => [item, ...prev]);
  }, []);

  const handleMarkSchedulePaid = useCallback((item: ScheduledPayment) => {
    // Open payment modal prefilled with milestone information
    setPaymentPrefill({
      paidTo: item.vendor,
      agreementRef: item.agreementRef,
      amount: item.amountDue,
      description: `Settlement for milestone: ${item.milestone}`,
      paymentType: 'Milestone / Progress',
    });
    setPaymentToEdit(null);
    setIsPaymentEntryOpen(true);

    // Update schedule item to Paid
    setSchedule((prev) =>
      prev.map((s) => {
        if (s.id === item.id) {
          return {
            ...s,
            status: 'Paid',
            paidOn: new Date().toISOString().split('T')[0],
          };
        }
        return s;
      })
    );
  }, []);

  // Quick Action Selection Router
  const handleSelectQuickAction = (action: QuickActionType) => {
    switch (action) {
      case 'payment':
        setPaymentToEdit(null);
        setPaymentPrefill(undefined);
        setIsPaymentEntryOpen(true);
        break;
      case 'agreement':
        setAgreementToEdit(null);
        setIsAgreementEntryOpen(true);
        break;
      case 'sitelog':
        setSiteLogToEdit(null);
        setIsSiteLogEntryOpen(true);
        break;
      case 'material':
        setMaterialToEdit(null);
        setIsMaterialEntryOpen(true);
        break;
      case 'schedule':
        setIsScheduleEntryOpen(true);
        break;
      case 'vendors':
        setIsVendorsOpen(true);
        break;
      case 'budget':
        setIsBudgetOpen(true);
        break;
    }
  };

  // Google Sheets Cloud Sync
  const handleSyncGAS = async () => {
    if (!settings.gasWebAppUrl) {
      throw new Error('Please configure Google Apps Script Web App URL in settings');
    }
    const data = await syncWithGAS(settings.gasWebAppUrl);
    setSettings((prev) => ({
      ...prev,
      lastSyncedAt: new Date().toISOString(),
    }));
  };

  // Excel Workbook Export (.xlsx with all 8 sheets)
  const handleExportExcel = () => {
    exportToExcelV2(
      computed.agreements,
      payments,
      materials,
      siteLogs,
      computed.schedule,
      computed.vendors,
      computed.budget,
      settings.projectName
    );
  };

  // Reset to Sample Template Data
  const handleResetSampleData = () => {
    setAgreements(INITIAL_AGREEMENTS);
    setVendors(INITIAL_VENDORS);
    setPayments(INITIAL_PAYMENTS);
    setMaterials(INITIAL_MATERIALS);
    setSiteLogs(INITIAL_SITE_LOGS);
    setSchedule(INITIAL_SCHEDULE);
    setBudget(INITIAL_BUDGET);
    setSettings(DEFAULT_SETTINGS_V2);
  };

  return (
    <div className="min-h-screen bg-[#F6F5ED] flex flex-col selection:bg-[#EBECDC] selection:text-[#FF6038]">
      {/* 1. Top Header */}
      <HeaderV2
        projectName={settings.projectName}
        isSynced={Boolean(settings.gasWebAppUrl && settings.lastSyncedAt)}
        sheetUrl={settings.sheetUrl}
        lastSyncedAt={settings.lastSyncedAt}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportExcel={handleExportExcel}
        onOpenVendors={() => setIsVendorsOpen(true)}
        onOpenBudget={() => setIsBudgetOpen(true)}
      />

      {/* 2. Main Responsive View Container */}
      <main className="flex-1 max-w-[900px] w-full mx-auto p-3.5 sm:p-5">
        {activeTab === 'dashboard' && (
          <DashboardTabV2
            kpis={computed.kpis}
            monthlyTrends={computed.monthlyTrends}
            budget={computed.budget}
            agreements={computed.agreements}
            payments={payments}
            schedule={computed.schedule}
            materials={materials}
            siteLogs={siteLogs}
            onNavigateTab={setActiveTab}
            onOpenVendors={() => setIsVendorsOpen(true)}
            onOpenBudget={() => setIsBudgetOpen(true)}
            onOpenQuickAction={() => setIsQuickActionOpen(true)}
          />
        )}

        {activeTab === 'agreements' && (
          <AgreementsTabV2
            agreements={computed.agreements}
            onOpenNewAgreement={() => {
              setAgreementToEdit(null);
              setIsAgreementEntryOpen(true);
            }}
            onUpdateAgreementProgress={handleUpdateAgreementProgress}
            onSelectAgreement={setSelectedAgreementForDetail}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsTabV2
            payments={payments}
            schedule={computed.schedule}
            agreements={computed.agreements}
            onOpenNewPayment={(prefill) => {
              setPaymentToEdit(null);
              setPaymentPrefill(prefill);
              setIsPaymentEntryOpen(true);
            }}
            onOpenNewSchedule={() => setIsScheduleEntryOpen(true)}
            onSelectPayment={setSelectedPaymentForDetail}
            onMarkSchedulePaid={handleMarkSchedulePaid}
            onAttachReceipt={(paymentId) => {
              const p = payments.find((item) => item.id === paymentId);
              if (p) {
                setPaymentToEdit(p);
                setPaymentPrefill(undefined);
                setIsPaymentEntryOpen(true);
              }
            }}
          />
        )}

        {activeTab === 'sitelog' && (
          <SiteDailyLogTabV2
            logs={siteLogs}
            onOpenNewSiteLog={() => {
              setSiteLogToEdit(null);
              setIsSiteLogEntryOpen(true);
            }}
            onSelectSiteLog={(log) => {
              setSiteLogToEdit(log);
              setIsSiteLogEntryOpen(true);
            }}
            onViewPhoto={(url, caption) => setPhotoModalState({ url, caption })}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsTabV2
            materials={materials}
            onOpenNewMaterial={() => {
              setMaterialToEdit(null);
              setIsMaterialEntryOpen(true);
            }}
            onTogglePaymentStatus={handleToggleMaterialPayment}
            onSelectMaterial={(mat) => {
              setMaterialToEdit(mat);
              setIsMaterialEntryOpen(true);
            }}
            onViewPhoto={(url, caption) => setPhotoModalState({ url, caption })}
          />
        )}
      </main>

      {/* 3. Bottom Navigation Bar with Floating (+) Action */}
      <BottomNavV2
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
        overdueScheduleCount={computed.kpis.overduePaymentsCount}
        missingReceiptsCount={computed.kpis.missingReceiptsCount}
      />

      {/* 4. Quick Action (+) Drawer */}
      <QuickActionDrawerV2
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectAction={handleSelectQuickAction}
      />

      {/* 5. Drawers: Vendors & Budget */}
      <VendorsDrawer
        isOpen={isVendorsOpen}
        onClose={() => setIsVendorsOpen(false)}
        vendors={computed.vendors}
        onAddVendor={(newV) => setVendors((prev) => [newV, ...prev])}
        onPayVendor={(vName) => {
          setPaymentPrefill({ paidTo: vName });
          setPaymentToEdit(null);
          setIsPaymentEntryOpen(true);
        }}
      />

      <BudgetDrawer
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        categories={computed.budget}
        onSaveBudget={(updated) => setBudget(updated)}
      />

      {/* 6. Entry Modals */}
      <PaymentEntryModal
        isOpen={isPaymentEntryOpen}
        onClose={() => {
          setIsPaymentEntryOpen(false);
          setPaymentToEdit(null);
          setPaymentPrefill(undefined);
        }}
        onSave={handleSavePayment}
        agreements={computed.agreements}
        existingPayment={paymentToEdit}
        prefill={paymentPrefill}
      />

      <AgreementEntryModal
        isOpen={isAgreementEntryOpen}
        onClose={() => {
          setIsAgreementEntryOpen(false);
          setAgreementToEdit(null);
        }}
        onSave={handleSaveAgreement}
        existingAgreement={agreementToEdit}
        existingCount={agreements.length}
      />

      <MaterialEntryModal
        isOpen={isMaterialEntryOpen}
        onClose={() => {
          setIsMaterialEntryOpen(false);
          setMaterialToEdit(null);
        }}
        onSave={handleSaveMaterial}
        existingMaterial={materialToEdit}
      />

      <SiteLogEntryModal
        isOpen={isSiteLogEntryOpen}
        onClose={() => {
          setIsSiteLogEntryOpen(false);
          setSiteLogToEdit(null);
        }}
        onSave={handleSaveSiteLog}
        existingLog={siteLogToEdit}
      />

      <ScheduleEntryModal
        isOpen={isScheduleEntryOpen}
        onClose={() => setIsScheduleEntryOpen(false)}
        onSave={handleSaveSchedule}
        agreements={computed.agreements}
      />

      {/* 7. Detail Inspector Drawers */}
      <AgreementDetailDrawer
        agreement={selectedAgreementForDetail}
        onClose={() => setSelectedAgreementForDetail(null)}
        payments={payments}
        onEdit={(agr) => {
          setAgreementToEdit(agr);
          setIsAgreementEntryOpen(true);
        }}
        onDelete={handleDeleteAgreement}
        onViewPhoto={(url, caption) => setPhotoModalState({ url, caption })}
      />

      <PaymentDetailDrawer
        payment={selectedPaymentForDetail}
        onClose={() => setSelectedPaymentForDetail(null)}
        onEdit={(pay) => {
          setPaymentToEdit(pay);
          setPaymentPrefill(undefined);
          setIsPaymentEntryOpen(true);
        }}
        onDelete={handleDeletePayment}
        onViewPhoto={(url, caption) => setPhotoModalState({ url, caption })}
      />

      {/* 8. Settings Modal */}
      <SettingsModalV2
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onExportExcel={handleExportExcel}
        onSyncGAS={handleSyncGAS}
        onResetSampleData={handleResetSampleData}
      />

      {/* 9. Zoom Photo / Receipt Modal */}
      <PhotoModal
        photoUrl={photoModalState?.url || null}
        caption={photoModalState?.caption}
        onClose={() => setPhotoModalState(null)}
      />
    </div>
  );
};

export default App;
