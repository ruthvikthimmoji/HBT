import React, { useState } from 'react';
import { Settings, FinancialSummary } from '../types';
import { DEFAULT_CATEGORIES, LABOUR_CATEGORY } from '../utils/calculations';
import { pingGoogleSheets, triggerSetupGoogleSheet } from '../services/googleSheets';
import { APPS_SCRIPT_SOURCE } from '../services/appsScriptSource';
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
  FileSpreadsheet,
  QrCode,
  Sparkles,
  Check,
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
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [sheetName, setSheetName] = useState<string | null>(null);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://192.168.1.4:5174';
  const phoneUrl = currentOrigin.includes('localhost') ? 'http://192.168.1.4:5174' : currentOrigin;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(phoneUrl)}`;

  const handleTestConnection = async () => {
    if (!gasUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter the Web App URL first.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await pingGoogleSheets(gasUrl);
      setSheetName(res.sheetName || 'Google Sheet');
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

  const handleAutoSetupSheet = async () => {
    if (!gasUrl.trim()) {
      setTestResult({ success: false, message: 'Please paste your Web App URL first.' });
      return;
    }
    setIsSettingUp(true);
    setTestResult(null);
    try {
      await triggerSetupGoogleSheet(gasUrl);
      setTestResult({
        success: true,
        message: '🚀 Full spreadsheet structure created with Summary, Expenses, Workers & Formulas!',
      });
      await onSyncNow();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Could not auto-setup. Check script deployment permissions.',
      });
    } finally {
      setIsSettingUp(false);
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

  const handleCopyCodeGS = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_SOURCE);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    } catch (e) {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-surface-dark border border-sand dark:border-sand-dark rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sand/50 dark:border-sand-dark/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-terracotta/15 dark:bg-terracotta-dark/20 text-terracotta dark:text-terracotta-dark flex items-center justify-center">
              <FileSpreadsheet size={16} />
            </div>
            <h2 className="text-[17px] font-bold text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif]">
              Google Sheets &amp; Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone hover:text-charcoal dark:hover:text-text-dark"
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. Open Google Sheet Quick Card */}
        <a
          href="https://sheets.new"
          target="_blank"
          rel="noreferrer"
          className="border border-sand dark:border-sand-dark rounded-xl p-3 flex items-center justify-between hover:bg-sand/20 dark:hover:bg-sand-dark/20 transition-all bg-[#FBEEE5]/30 dark:bg-[#33241A]/30"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-money-green/15 text-money-green dark:text-money-green-dark flex items-center justify-center">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-charcoal dark:text-text-dark flex items-center gap-1.5">
                <span>{sheetName ? `Open ${sheetName}` : 'Open Google Sheets'}</span>
                <ExternalLink size={13} className="text-stone" />
              </div>
              <div className="text-xs text-stone dark:text-stone-dark">
                Click to open your connected Google Sheet or create a new one
              </div>
            </div>
          </div>
        </a>

        <form onSubmit={handleSave} className="space-y-4">
          {/* 2. Google Sheets Live Sync Setup */}
          <div className="space-y-3 border border-sand dark:border-sand-dark rounded-xl p-3.5 bg-white dark:bg-surface-dark">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cloud size={16} className="text-terracotta dark:text-terracotta-dark" />
                <h3 className="text-sm font-bold text-charcoal dark:text-text-dark">
                  Google Sheets Sync Setup
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs text-terracotta dark:text-terracotta-dark font-medium hover:underline"
              >
                {showGuide ? 'Hide Guide' : 'Setup Guide'}
              </button>
            </div>

            {/* Quick 1-Click Copy Script Button */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-sand/25 dark:bg-sand-dark/30">
              <span className="text-xs text-charcoal dark:text-text-dark font-medium">
                Backend Script (<code className="text-terracotta">Code.gs</code>)
              </span>
              <button
                type="button"
                onClick={handleCopyCodeGS}
                className="hbt-btn-primary py-1 px-2.5 text-xs h-auto min-h-0 flex items-center gap-1"
              >
                {copiedScript ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Script Code'}</span>
              </button>
            </div>

            {showGuide && (
              <div className="p-3 rounded-lg bg-[#FBEEE5]/60 dark:bg-[#33241A]/60 border border-sand dark:border-sand-dark text-xs space-y-2">
                <p className="font-bold text-charcoal dark:text-text-dark">
                  2-Minute Connection Instructions:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-stone dark:text-stone-dark">
                  <li>Click <strong>Open Google Sheets</strong> above (or visit <code className="bg-sand/40 px-1 py-0.5 rounded">sheets.new</code>).</li>
                  <li>Click <strong>Extensions &gt; Apps Script</strong>.</li>
                  <li>Click <strong>Copy Script Code</strong> button above and paste it over everything in <code className="bg-sand/40 px-1 py-0.5 rounded">Code.gs</code>.</li>
                  <li>Click <strong>Save (💾)</strong> ➔ <strong>Deploy &gt; New deployment</strong>.</li>
                  <li>Select <strong>Web app</strong> ➔ Execute as: <strong>Me</strong> ➔ Who has access: <strong>Anyone</strong>.</li>
                  <li>Copy the Web App URL and paste below.</li>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !gasUrl.trim()}
                className="hbt-btn-secondary text-xs flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleAutoSetupSheet}
                disabled={isSettingUp || !gasUrl.trim()}
                className="hbt-btn-secondary text-xs flex items-center justify-center gap-1.5 border-terracotta/40 text-terracotta dark:text-terracotta-dark font-semibold"
                title="Automatically creates Summary, Expenses, Workers and Formulas in your blank Sheet"
              >
                <Sparkles size={13} />
                <span>{isSettingUp ? 'Creating...' : 'Auto-Setup Sheet'}</span>
              </button>

              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing || !gasUrl.trim()}
                className="hbt-btn-primary text-xs flex items-center justify-center gap-1.5 min-h-0 py-2"
              >
                <Cloud size={13} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-money-green/10 text-money-green dark:text-money-green-dark border border-money-green/20'
                    : 'bg-money-red/10 text-money-red dark:text-money-red-dark border border-money-red/20'
                }`}
              >
                {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* 3. Project & Total Budget */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-charcoal dark:text-text-dark">
              Project Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                    placeholder="e.g. 4500000"
                    className="hbt-input w-full pl-8 font-bold text-charcoal dark:text-text-dark tabular-num"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Category Budgets */}
          <div className="space-y-2 border-t border-sand/50 dark:border-sand-dark/50 pt-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-charcoal dark:text-text-dark">
                Category Budgets (v2)
              </h3>
              <span className="text-[11px] text-stone dark:text-stone-dark">Optional limits</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-40 overflow-y-auto pr-1">
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

          {/* 5. Mobile Wi-Fi Testing QR Code */}
          <div className="border-t border-sand/50 dark:border-sand-dark/50 pt-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-sand/15 dark:bg-sand-dark/20 border border-sand/40">
              <img
                src={qrImageUrl}
                alt="Scan to open on phone"
                className="w-20 h-20 rounded-lg bg-white p-1 border border-sand flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal dark:text-text-dark">
                  <QrCode size={14} className="text-terracotta" />
                  <span>Open on Mobile Camera</span>
                </div>
                <p className="text-[11px] text-stone dark:text-stone-dark mt-0.5 leading-snug">
                  Connect phone to same Wi-Fi, open Camera, and point here to test on-site entry!
                </p>
                <code className="text-[10px] text-terracotta mt-1 block truncate">
                  {phoneUrl}
                </code>
              </div>
            </div>
          </div>

          {/* 6. Data Management & Excel Export */}
          <div className="space-y-2 border-t border-sand/50 dark:border-sand-dark/50 pt-3">
            <h3 className="text-sm font-bold text-charcoal dark:text-text-dark">
              Data Backup &amp; Reset
            </h3>

            <div className="grid grid-cols-2 gap-2">
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
              className="w-full text-xs text-money-red dark:text-money-red-dark hover:underline py-1 text-center font-medium"
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
