import React, { useState, useMemo } from 'react';
import { Worker, DailyLog, AttendanceStatus } from '../types';
import { formatCurrency, getTodayDateString } from '../utils/format';
import { computeWorkerStats } from '../utils/calculations';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Check,
  Clock,
  UserCheck,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';

interface AttendanceTabProps {
  workers: Worker[];
  logs: DailyLog[];
  onMarkAttendance: (log: Omit<DailyLog, 'id'>) => void;
  onAddWorker: (worker: Omit<Worker, 'id'>) => void;
  onEditWorker: (worker: Worker) => void;
  onDeleteWorker: (id: string) => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  workers,
  logs,
  onMarkAttendance,
  onAddWorker,
  onEditWorker,
  onDeleteWorker,
}) => {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // New worker form state
  const [workerName, setWorkerName] = useState('');
  const [workerRole, setWorkerRole] = useState('Mason');
  const [workerRate, setWorkerRate] = useState('900');
  const [workerPhone, setWorkerPhone] = useState('');

  // Custom wage input toggles
  const [customWageWorkerId, setCustomWageWorkerId] = useState<string | null>(null);
  const [customWageValue, setCustomWageValue] = useState('');

  const activeWorkers = useMemo(() => {
    return workers.filter((w) => w.active !== false);
  }, [workers]);

  // Daily logs for the currently selected date
  const logsForDate = useMemo(() => {
    const map = new Map<string, DailyLog>();
    logs.filter((l) => l.date === selectedDate).forEach((l) => map.set(l.workerId, l));
    return map;
  }, [logs, selectedDate]);

  // Compute daily summary stats
  const dateSummary = useMemo(() => {
    let presentCount = 0;
    let halfCount = 0;
    let absentCount = 0;
    let totalDailyWages = 0;

    activeWorkers.forEach((w) => {
      const log = logsForDate.get(w.id);
      if (log) {
        if (log.status === 'full') presentCount++;
        else if (log.status === 'half') halfCount++;
        else if (log.status === 'absent') absentCount++;
        totalDailyWages += Number(log.wage) || 0;
      }
    });

    return { presentCount, halfCount, absentCount, totalDailyWages };
  }, [activeWorkers, logsForDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSetStatus = (worker: Worker, status: AttendanceStatus) => {
    let wage = 0;
    if (status === 'full') wage = worker.rate;
    else if (status === 'half') wage = Math.round(worker.rate * 0.5);
    else wage = 0;

    onMarkAttendance({
      date: selectedDate,
      workerId: worker.id,
      workerName: worker.name,
      status,
      wage,
      note: logsForDate.get(worker.id)?.note,
    });
  };

  const handleSaveCustomWage = (worker: Worker) => {
    const customNum = parseFloat(customWageValue);
    if (isNaN(customNum) || customNum < 0) return;

    onMarkAttendance({
      date: selectedDate,
      workerId: worker.id,
      workerName: worker.name,
      status: 'full', // treat as present with custom wage/overtime
      wage: customNum,
      customWage: customNum,
      note: logsForDate.get(worker.id)?.note || 'Custom wage/OT',
    });
    setCustomWageWorkerId(null);
    setCustomWageValue('');
  };

  const handleWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = parseFloat(workerRate);
    if (!workerName.trim() || isNaN(rateNum) || rateNum <= 0) {
      alert('Please enter worker name and a valid daily rate.');
      return;
    }

    if (editingWorker) {
      onEditWorker({
        ...editingWorker,
        name: workerName.trim(),
        role: workerRole.trim(),
        rate: rateNum,
        phone: workerPhone.trim() || undefined,
      });
      setEditingWorker(null);
    } else {
      onAddWorker({
        name: workerName.trim(),
        role: workerRole.trim(),
        rate: rateNum,
        active: true,
        phone: workerPhone.trim() || undefined,
      });
    }

    setWorkerName('');
    setWorkerRole('Mason');
    setWorkerRate('900');
    setWorkerPhone('');
    setIsWorkerModalOpen(false);
  };

  const openEditWorker = (w: Worker) => {
    setEditingWorker(w);
    setWorkerName(w.name);
    setWorkerRole(w.role);
    setWorkerRate(String(w.rate));
    setWorkerPhone(w.phone || '');
    setIsWorkerModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* 1. Date Navigation & Today's Attendance Overview */}
      <div className="hbt-card">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-md hover:bg-sand/30 text-stone dark:text-stone-dark"
              title="Previous day"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-bold text-[16px] bg-transparent text-charcoal dark:text-text-dark cursor-pointer outline-none border-b border-dashed border-sand pb-0.5"
              />
            </div>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-md hover:bg-sand/30 text-stone dark:text-stone-dark"
              title="Next day"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingWorker(null);
              setWorkerName('');
              setWorkerRate('900');
              setWorkerPhone('');
              setIsWorkerModalOpen(true);
            }}
            className="hbt-btn-secondary text-xs flex items-center gap-1.5"
          >
            <UserPlus size={14} />
            <span>Manage Workers</span>
          </button>
        </div>

        {/* Daily Wage Stat Banner */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FBEEE5]/60 dark:bg-[#33241A]/60 border border-sand/40 dark:border-sand-dark/40 text-xs">
          <div className="text-stone dark:text-stone-dark space-x-1.5">
            <span className="font-semibold text-charcoal dark:text-text-dark">
              {dateSummary.presentCount} Full
            </span>
            <span>•</span>
            <span>{dateSummary.halfCount} Half</span>
            <span>•</span>
            <span>{dateSummary.absentCount} Absent</span>
          </div>
          <div className="text-right">
            <span className="text-stone dark:text-stone-dark mr-1">Day Wage:</span>
            <span className="font-bold text-sm text-charcoal dark:text-text-dark tabular-num">
              {formatCurrency(dateSummary.totalDailyWages)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Worker Attendance Cards */}
      <div className="space-y-2.5">
        {activeWorkers.length === 0 ? (
          <div className="hbt-card py-10 text-center text-sm text-stone dark:text-stone-dark">
            <p className="mb-3">No active workers found.</p>
            <button
              onClick={() => setIsWorkerModalOpen(true)}
              className="hbt-btn-primary text-xs inline-flex"
            >
              Add First Worker
            </button>
          </div>
        ) : (
          activeWorkers.map((worker) => {
            const currentLog = logsForDate.get(worker.id);
            const currentStatus = currentLog?.status;
            const wage = currentLog ? currentLog.wage : 0;
            const isEditingCustomWage = customWageWorkerId === worker.id;

            return (
              <div key={worker.id} className="hbt-card space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[15px] text-charcoal dark:text-text-dark">
                        {worker.name}
                      </span>
                      <span className="text-[11px] px-2 py-0.2 rounded-full font-medium bg-sand/30 dark:bg-sand-dark/30 text-stone dark:text-stone-dark">
                        {worker.role}
                      </span>
                    </div>
                    <div className="text-xs text-stone dark:text-stone-dark mt-0.5 tabular-num">
                      Daily rate: {formatCurrency(worker.rate)}
                      {currentLog && (
                        <span className="ml-2 font-semibold text-charcoal dark:text-text-dark">
                          (Earned today: {formatCurrency(wage)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Overtime / Custom wage action */}
                  <button
                    onClick={() => {
                      if (isEditingCustomWage) {
                        setCustomWageWorkerId(null);
                      } else {
                        setCustomWageWorkerId(worker.id);
                        setCustomWageValue(currentLog ? String(currentLog.wage) : String(worker.rate));
                      }
                    }}
                    className="text-xs text-stone dark:text-stone-dark hover:text-terracotta dark:hover:text-terracotta-dark flex items-center gap-1 font-medium"
                    title="Add overtime or custom daily wage"
                  >
                    <Clock size={13} />
                    <span>{isEditingCustomWage ? 'Cancel' : 'OT / Custom'}</span>
                  </button>
                </div>

                {/* PRD Component: Attendance control (Three buttons: Full, Half, Absent. Selected is Terracotta) */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetStatus(worker, 'full')}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all select-none flex items-center justify-center gap-1 ${
                      currentStatus === 'full' && !currentLog?.customWage
                        ? 'bg-terracotta dark:bg-terracotta-dark text-white dark:text-[#17150F] shadow-sm'
                        : 'bg-white dark:bg-surface-dark text-charcoal dark:text-text-dark border border-sand dark:border-sand-dark hover:border-terracotta/40'
                    }`}
                  >
                    <span>Full (100%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus(worker, 'half')}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all select-none flex items-center justify-center gap-1 ${
                      currentStatus === 'half'
                        ? 'bg-terracotta dark:bg-terracotta-dark text-white dark:text-[#17150F] shadow-sm'
                        : 'bg-white dark:bg-surface-dark text-charcoal dark:text-text-dark border border-sand dark:border-sand-dark hover:border-terracotta/40'
                    }`}
                  >
                    <span>Half (50%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus(worker, 'absent')}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all select-none flex items-center justify-center gap-1 ${
                      currentStatus === 'absent'
                        ? 'bg-terracotta dark:bg-terracotta-dark text-white dark:text-[#17150F] shadow-sm'
                        : 'bg-white dark:bg-surface-dark text-charcoal dark:text-text-dark border border-sand dark:border-sand-dark hover:border-terracotta/40'
                    }`}
                  >
                    <span>Absent (0)</span>
                  </button>
                </div>

                {/* Custom Wage / Overtime Inline Editor */}
                {isEditingCustomWage && (
                  <div className="p-2.5 rounded-lg bg-sand/20 dark:bg-sand-dark/20 flex items-center gap-2">
                    <span className="text-xs text-stone dark:text-stone-dark font-medium">
                      Exact Wage (₹):
                    </span>
                    <input
                      type="number"
                      value={customWageValue}
                      onChange={(e) => setCustomWageValue(e.target.value)}
                      placeholder="e.g. 1300"
                      className="hbt-input w-28 py-1 h-8 text-sm font-bold tabular-num"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveCustomWage(worker)}
                      className="hbt-btn-primary py-1 px-3 text-xs min-h-[32px]"
                    >
                      Save Wage
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3. Wages & Days Worked Summary Card */}
      <div className="hbt-card">
        <h3 className="text-[15px] font-bold text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif] mb-3">
          Wages & Days Worked Summary
        </h3>

        <div className="divide-y divide-sand/50 dark:divide-sand-dark/50">
          {workers.map((w) => {
            const stats = computeWorkerStats(w.id, logs);

            return (
              <div
                key={w.id}
                className="py-2.5 flex items-center justify-between text-sm first:pt-1 last:pb-1"
              >
                <div>
                  <div className="font-semibold text-charcoal dark:text-text-dark flex items-center gap-1.5">
                    <span>{w.name}</span>
                    <span className="text-[11px] font-normal text-stone dark:text-stone-dark">
                      ({w.role})
                    </span>
                    {!w.active && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-sand text-stone">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone dark:text-stone-dark mt-0.5">
                    {stats.daysWorked} days worked • Rate: {formatCurrency(w.rate)}/day
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-charcoal dark:text-text-dark tabular-num">
                    {formatCurrency(stats.totalEarned)}
                  </div>
                  <button
                    onClick={() => openEditWorker(w)}
                    className="text-[11px] text-terracotta dark:text-terracotta-dark hover:underline"
                  >
                    Edit rate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manage Workers Modal */}
      {isWorkerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark border border-sand dark:border-sand-dark rounded-xl max-w-md w-full p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif]">
                {editingWorker ? 'Edit Worker' : 'Add New Worker'}
              </h3>
              <button
                onClick={() => setIsWorkerModalOpen(false)}
                className="text-stone hover:text-charcoal dark:hover:text-text-dark"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWorkerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                  Worker Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="hbt-input w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                    Role / Trade
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mason, Helper, Carpenter"
                    value={workerRole}
                    onChange={(e) => setWorkerRole(e.target.value)}
                    className="hbt-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                    Daily Wage Rate (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="900"
                    value={workerRate}
                    onChange={(e) => setWorkerRate(e.target.value)}
                    className="hbt-input w-full font-bold tabular-num"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={workerPhone}
                  onChange={(e) => setWorkerPhone(e.target.value)}
                  className="hbt-input w-full"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWorkerModalOpen(false)}
                  className="hbt-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="hbt-btn-primary text-xs">
                  {editingWorker ? 'Save Changes' : 'Add Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
