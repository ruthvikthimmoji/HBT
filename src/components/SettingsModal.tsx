import React, { useState } from 'react';
import { Settings, FinancialSummary } from '../types';
import { DEFAULT_CATEGORIES, LABOUR_CATEGORY } from '../utils/calculations';
import { pingGoogleSheets, syncAllToGoogleSheets } from '../services/googleSheets';
import { formatCurrency } from '../utils/format';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Download,
  RotateCcw,
  Trash2,
} from 'lucide-react';

interface SettingsModalProps {
  settings: Settings;
  summary: FinancialSummary;
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (settings: Settings) => void;
  onSyncNow: () => Promise<void>;
  onExportExcel: () => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  summary,
  isOpen,
  onClose,
  onSaveSettings,
  onSyncNow,
  onExportExcel,
  onResetSampleData,
  onClearAllData,
}) => {
  if (!isOpen) return null;

  const [projectName, setProjectName] = useState(settings.projectName || '');
  const [budget, setBudget] = useState(String(settings.budget || ''));
  const [gasUrl, setGasUrl] = useState(settings.gasWebAppUrl || '');
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(
    settings.categoryBudgets || {}
  );

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleTestConnection = async () => {
    if (!gasUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter the Web App URL first.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await pingGoogleSheets(gasUrl);
      setTestResult({
        success: true,
        message: `Connected to "${res.sheetName || 'Google Sheet'}"!`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Could not connect. Check your Web App URL and permissions.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncNow();
      setTestResult({ success: true, message: 'Synced all data to Google Sheet successfully!' });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Could not sync. Try again.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(budget);

    onSaveSettings({
      ...settings,
      projectName: projectName.trim() || 'My House Build',
      budget: isNaN(budgetNum) ? 0 : budgetNum,
      gasWebAppUrl: gasUrl.trim(),
      categoryBudgets,
    });
    onClose();
  };

  const handleCategoryBudgetChange = (cat: string, val: string) => {
    const num = parseFloat(val);
    setCategoryBudgets((prev) => {
      const next = { ...prev };
      if (isNaN(num) || num <= 0) {
        delete next[cat];
      } else {
        next[cat] = num;
      }
      return next;
    });
  };

  const allBudgetCategories = [LABOUR_CATEGORY, ...DEFAULT_CATEGORIES];

  const handleCopyCodeGS = () => {
    // Read or reference Code.gs instructions
    const instructions = `/** House Build Tracker Google Apps Script Code **/
// Open Code.gs in your project root or copy the code from the google-apps-script/Code.gs file.`;
    navigator.clipboard.writeText(instructions);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-surface-dark border border-sand dark:border-sand-dark rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 space-y-5">
        <div className="flex items-center justify-between border-b border-sand/50 dark:border-sand-dark/50 pb-3">
          <h2 className="text-[18px] font-bold text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif]">
            Settings & Cloud Sync
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone hover:text-charcoal dark:hover:text-text-dark"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* 1. Project & Total Budget */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-charcoal dark:text-text-dark">
              Project Details
            </h3>

            <div>
              <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. My Dream Home"
                className="hbt-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                Total Budget (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone font-bold">₹</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 5000000"
                  className="hbt-input w-full pl-8 font-bold text-charcoal dark:text-text-dark tabular-num"
                  required
                />
              </div>
              <p className="text-[11px] text-stone dark:text-stone-dark mt-1">
                Spent: {formatCurrency(summary.totalCost)} • Remaining:{' '}
                {formatCurrency((parseFloat(budget) || 0) - summary.totalCost)}
              </p>
            </div>
          </div>

          {/* 2. Category Budgets (v2 Planned Feature) */}
          <div className="space-y-2 border-t border-sand/50 dark:border-sand-dark/50 pt-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-charcoal dark:text-text-dark">
                Category Budgets (v2)
              </h3>
              <span className="text-[11px] text-stone dark:text-stone-dark">Optional limits</span>
            </div>
            <p className="text-xs text-stone dark:text-stone-dark">
              Set budgets per category to receive warnings on the summary dashboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
              {allBudgetCategories.map((cat) => (
                <div key={cat} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-charcoal dark:text-text-dark font-medium flex-1">
                    {cat}
                  </span>
                  <input
                    type="number"
                    placeholder="None"
                    value={categoryBudgets[cat] || ''}
                    onChange={(e) => handleCategoryBudgetChange(cat, e.target.value)}
                    className="hbt-input py-1 px-2 h-8 w-24 text-right font-semibold tabular-num text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3. Google Sheets Live Sync */}
          <div className="space-y-3 border-t border-sand/50 dark:border-sand-dark/50 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cloud size={16} className="text-terracotta dark:text-terracotta-dark" />
                <h3 className="text-sm font-bold text-charcoal dark:text-text-dark">
                  Google Sheets Sync
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs text-terracotta dark:text-terracotta-dark hover:underline"
              >
                {showGuide ? 'Hide Setup Guide' : 'Setup Guide'}
              </button>
            </div>

            {showGuide && (
              <div className="p-3 rounded-lg bg-[#FBEEE5]/60 dark:bg-[#33241A]/60 border border-sand dark:border-sand-dark text-xs space-y-2">
                <p className="font-semibold text-charcoal dark:text-text-dark">
                  How to link your own Google Sheet:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-stone dark:text-stone-dark">
                  <li>Create a new spreadsheet at sheets.new</li>
                  <li>Click Extensions &gt; Apps Script</li>
                  <li>
                    Paste the script from{' '}
                    <code className="px-1 py-0.5 rounded bg-sand/40">google-apps-script/Code.gs</code>
                  </li>
                  <li>
                    Click Deploy &gt; New deployment &gt; Select "Web app" &gt; Who has access:{' '}
                    <strong>"Anyone"</strong>
                  </li>
                  <li>Copy the Web App URL and paste below!</li>
                </ol>
              </div>
            )}

            <div>
              <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                Google Apps Script Web App URL
              </label>
              <input
                type="url"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="hbt-input w-full font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !gasUrl.trim()}
                className="hbt-btn-secondary text-xs flex-1 flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing || !gasUrl.trim()}
                className="hbt-btn-secondary text-xs flex-1 flex items-center justify-center gap-1.5"
              >
                <Cloud size={14} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-money-green/10 text-money-green dark:text-money-green-dark'
                    : 'bg-money-red/10 text-money-red dark:text-money-red-dark'
                }`}
              >
                {testResult.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* 4. Data Management & Excel Export */}
          <div className="space-y-2 border-t border-sand/50 dark:border-sand-dark/50 pt-3">
            <h3 className="text-sm font-bold text-charcoal dark:text-text-dark">
              Data Backup & Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportExcel}
                className="hbt-btn-secondary text-xs flex items-center justify-center gap-1.5"
              >
                <Download size={14} />
                <span>Export 5-Sheet Excel</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Load sample construction demo data?')) {
                    onResetSampleData();
                    onClose();
                  }
                }}
                className="hbt-btn-secondary text-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Load Sample Data</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                  onClearAllData();
                  onClose();
                }
              }}
              className="w-full text-xs text-money-red dark:text-money-red-dark hover:underline py-1.5 text-center font-medium"
            >
              Clear All Data &amp; Reset
            </button>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-sand/50 dark:border-sand-dark/50">
            <button type="button" onClick={onClose} className="hbt-btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="hbt-btn-primary text-xs">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
