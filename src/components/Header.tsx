import React from 'react';
import { Settings, Cloud, HardDrive, Download, Moon, Sun, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface HeaderProps {
  projectName: string;
  isSynced: boolean;
  sheetUrl?: string;
  lastSyncedAt?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onExportExcel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  isSynced,
  sheetUrl,
  lastSyncedAt,
  isDark,
  onToggleTheme,
  onOpenSettings,
  onExportExcel,
}) => {
  const targetSheetUrl =
    sheetUrl || 'https://docs.google.com/spreadsheets/d/1L6LaIz140FAXVm6Up-lSQ6RygOuHZtYuEd12kuqjMfk/edit';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#17150F]/95 backdrop-blur-md border-b border-sand dark:border-sand-dark transition-colors">
      <div className="max-w-[900px] mx-auto px-4 py-2.5">
        {/* Top Sync / Storage Notification Banner */}
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-2">
            {isSynced ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF0EB] dark:bg-[#3D160A] text-terracotta dark:text-terracotta-dark font-medium">
                <Cloud size={13} className="text-terracotta dark:text-terracotta-dark" />
                <span>Synced with Google Sheet</span>
                {lastSyncedAt && (
                  <span className="text-stone dark:text-stone-dark opacity-80">
                    • {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sand/40 dark:bg-sand-dark/40 text-stone dark:text-stone-dark font-medium">
                <HardDrive size={13} />
                <span>Device Storage (Offline)</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Direct Google Sheet Button */}
            <a
              href={targetSheetUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-stone dark:text-stone-dark hover:text-money-green hover:bg-sand/30 dark:hover:bg-sand-dark/30 transition-colors flex items-center gap-1"
              title="Open Tracker in Google Sheets"
            >
              <FileSpreadsheet size={15} className="text-money-green" />
              <span className="hidden sm:inline text-xs font-semibold">Sheet</span>
            </a>

            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg text-stone dark:text-stone-dark hover:text-charcoal dark:hover:text-text-dark hover:bg-sand/30 dark:hover:bg-sand-dark/30 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              onClick={onExportExcel}
              className="p-1.5 rounded-lg text-stone dark:text-stone-dark hover:text-charcoal dark:hover:text-text-dark hover:bg-sand/30 dark:hover:bg-sand-dark/30 transition-colors hidden sm:flex items-center gap-1"
              title="Download Excel spreadsheet"
              aria-label="Download Excel"
            >
              <Download size={15} />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-stone dark:text-stone-dark hover:text-charcoal dark:hover:text-text-dark hover:bg-sand/30 dark:hover:bg-sand-dark/30 transition-colors"
              title="Settings & Cloud Sync"
              aria-label="Open settings"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* Main Branding Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#221F17] border border-sand/70 dark:border-sand-dark flex items-center justify-center p-1 shadow-sm flex-shrink-0">
              <img src="/logo.png" alt="HB Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold leading-tight tracking-tight text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif]">
                {projectName || 'My House Construction'}
              </h1>
              <p className="text-[11px] text-stone dark:text-stone-dark font-normal">
                Every rupee and workday in one place
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
