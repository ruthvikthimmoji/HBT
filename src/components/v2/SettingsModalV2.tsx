import React, { useState } from 'react';
import { AppSettingsV2 } from '../../types/v2';
import { GAS_V2_SCRIPT_TEMPLATE } from '../../utils/gasSyncV2';
import {
  X,
  Cloud,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Trash2,
} from 'lucide-react';

interface SettingsModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettingsV2;
  onSaveSettings: (settings: AppSettingsV2) => void;
  onExportExcel: () => void;
  onSyncGAS: () => Promise<void>;
  onPushAllToGoogleSheet: () => Promise<void>;
  onResetSampleData: () => void;
}

export const SettingsModalV2: React.FC<SettingsModalV2Props> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExportExcel,
  onSyncGAS,
  onPushAllToGoogleSheet,
  onResetSampleData,
}) => {
  const [projectName, setProjectName] = useState(settings.projectName);
  const [sheetUrl, setSheetUrl] = useState(settings.sheetUrl);
  const [gasWebAppUrl, setGasWebAppUrl] = useState(settings.gasWebAppUrl);
  const [startMonth, setStartMonth] = useState(settings.startMonth);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(!settings.gasWebAppUrl);

  if (!isOpen) return null;

  const handleCopyCodeGS = () => {
    navigator.clipboard.writeText(GAS_V2_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handlePushAll = async () => {
    if (!gasWebAppUrl) {
      alert('Please paste your Google Apps Script Web App URL first!');
      return;
    }
    setIsPushing(true);
    setSyncStatus(null);
    try {
      await onPushAllToGoogleSheet();
      setSyncStatus('success_push');
    } catch (err: any) {
      setSyncStatus(err.message || 'Push failed');
    } finally {
      setIsPushing(false);
    }
  };

  const handleTriggerSync = async () => {
    if (!gasWebAppUrl) {
      alert('Please enter your deployed Google Apps Script Web App URL below first');
      return;
    }
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      await onSyncGAS();
      setSyncStatus('success');
    } catch (err: any) {
      setSyncStatus(err.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      projectName: projectName.trim(),
      sheetUrl: sheetUrl.trim(),
      gasWebAppUrl: gasWebAppUrl.trim(),
      startMonth,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white border-t sm:border border-sand rounded-t-[24px] sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-sand">
          <div>
            <h3 className="text-base font-bold text-charcoal">
              Settings &amp; Google Sheet Sync (v2)
            </h3>
            <p className="text-xs text-stone">Cloud connection, Google Apps Script &amp; Excel backup</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone hover:bg-sand/30"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 py-3 flex-1 pr-1 text-xs">
          {/* 1. Open Google Sheet Direct Button */}
          <a
            href={sheetUrl}
            target="_blank"
            rel="noreferrer"
            className="border border-sand rounded-xl p-3 flex items-center justify-between hover:bg-sand/20 transition-all bg-[#EBECDC]/40 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-[#11363E] flex items-center justify-center">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal flex items-center gap-1.5">
                  <span>Open Connected Google Sheet (v2)</span>
                  <ExternalLink size={13} className="text-stone group-hover:text-terracotta transition-colors" />
                </div>
                <div className="text-[11px] text-stone">
                  1QOEMad... (8 Sheets: Agreements, Ledger, Materials, Site Log, Schedule)
                </div>
              </div>
            </div>
          </a>

          {/* 2. Project Name & Start Month */}
          <div className="space-y-2.5 p-3 rounded-xl border border-sand bg-white">
            <h4 className="font-bold text-charcoal text-xs">Project Information</h4>
            <div>
              <label className="block text-stone mb-1 font-medium">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My House Construction"
                className="hbt-input w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-stone mb-1 font-medium">Start Month (for timeline charts)</label>
              <input
                type="month"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                className="hbt-input w-full text-xs"
              />
            </div>
          </div>

          {/* 3. Google Apps Script Live Sync */}
          <div className="space-y-3 p-3.5 rounded-xl border border-sand bg-sand/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cloud size={16} className="text-terracotta" />
                <h4 className="font-bold text-charcoal text-xs">Google Sheets Sync Setup</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] text-terracotta font-medium hover:underline"
              >
                {showGuide ? 'Hide Guide' : 'Setup Guide'}
              </button>
            </div>

            {/* Quick 1-Click Copy Script Button */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-sand">
              <span className="text-xs text-charcoal font-medium">
                Backend Script (<code className="text-terracotta font-mono text-[11px]">Code.gs</code>)
              </span>
              <button
                type="button"
                onClick={handleCopyCodeGS}
                className="hbt-btn-primary py-1 px-2.5 text-xs h-auto min-h-0 flex items-center gap-1 font-semibold"
              >
                {copiedScript ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedScript ? 'Copied!' : 'Copy Code.gs'}</span>
              </button>
            </div>

            {showGuide && (
              <div className="p-3.5 rounded-lg bg-[#EBECDC]/90 border border-sand text-xs space-y-2 text-stone">
                <p className="font-bold text-charcoal">
                  Connect in 4 Simple Steps to see live updates in your Google Sheet:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                  <li>
                    Click <strong className="text-charcoal">Open Connected Google Sheet</strong> above.
                  </li>
                  <li>
                    In the sheet menu bar, click <strong className="text-charcoal">Extensions ➔ Apps Script</strong>.
                  </li>
                  <li>
                    Click the <strong className="text-terracotta">Copy Code.gs</strong> button above and paste it over everything in the editor, then click <strong className="text-charcoal">Save (💾)</strong>.
                  </li>
                  <li>
                    Click the blue <strong className="text-charcoal">Deploy ➔ New deployment</strong> button (top right), choose type: <strong className="text-charcoal">Web app</strong>, set <em>Who has access</em> to <strong className="text-terracotta">Anyone</strong>, then click Deploy and copy the Web App URL.
                  </li>
                </ol>
              </div>
            )}

            <div>
              <label className="block text-stone mb-1 font-medium">
                Paste Apps Script Web App URL below:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={gasWebAppUrl}
                  onChange={(e) => setGasWebAppUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="hbt-input flex-1 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handlePushAll}
                  disabled={isPushing || !gasWebAppUrl}
                  className="hbt-btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5 font-bold"
                >
                  <RefreshCw size={13} className={isPushing ? 'animate-spin' : ''} />
                  <span>{isPushing ? 'Pushing Data...' : 'Push All Data to Google Sheet Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerSync}
                  disabled={isSyncing || !gasWebAppUrl}
                  className="hbt-btn-secondary px-3 py-2 text-xs flex items-center gap-1 font-semibold whitespace-nowrap"
                >
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                  <span>Pull</span>
                </button>
              </div>

              {syncStatus && (
                <div
                  className={`mt-2.5 p-2 rounded text-[11px] font-bold ${
                    syncStatus.startsWith('success')
                      ? 'bg-green-100 text-money-green'
                      : 'bg-red-100 text-money-red'
                  }`}
                >
                  {syncStatus === 'success_push'
                    ? '✓ All local records successfully pushed to your Google Sheet!'
                    : syncStatus === 'success'
                    ? '✓ Synced with Google Sheet!'
                    : `Sync Error: ${syncStatus}`}
                </div>
              )}
            </div>
          </div>

          {/* 4. Excel Export & Backup */}
          <div className="p-3 rounded-xl border border-sand flex items-center justify-between bg-white">
            <div>
              <div className="font-bold text-charcoal text-xs">Download Full Excel Workbook</div>
              <div className="text-[11px] text-stone">8 sheets formatted with all data</div>
            </div>
            <button
              type="button"
              onClick={onExportExcel}
              className="hbt-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 font-semibold"
            >
              <Download size={13} />
              <span>Export .xlsx</span>
            </button>
          </div>

          {/* 5. Reset to Template Sample Data */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <span className="text-stone">Restore initial template data:</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset all records to default sample template data from Google Sheet v2?')) {
                  onResetSampleData();
                  onClose();
                }
              }}
              className="text-stone hover:text-money-red text-[11px] font-medium underline flex items-center gap-1"
            >
              <Trash2 size={12} />
              <span>Reset to Sample Data</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-sand">
            <button
              type="button"
              onClick={onClose}
              className="hbt-btn-secondary text-xs px-4"
            >
              Cancel
            </button>
            <button type="submit" className="hbt-btn-primary text-xs px-5">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
