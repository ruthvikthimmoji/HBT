import React from 'react';
import { Settings, Cloud, HardDrive, Download, Moon, Sun, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface HeaderProps {
  projectName: string;
  isSynced: boolean;
  lastSyncedAt?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onExportExcel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  isSynced,
  lastSyncedAt,
  isDark,
  onToggleTheme,
  onOpenSettings,
  onExportExcel,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#17150F]/95 backdrop-blur-md border-b border-sand dark:border-sand-dark transition-colors">
      <div className="max-w-[900px] mx-auto px-4 py-3">
        {/* Top Sync / Storage Notification Banner */}
        <div className="flex items-center justify-between text-xs mb-2">
          {isSynced ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FBEEE5] dark:bg-[#33241A] text-terracotta dark:text-terracotta-dark font-medium">
              <Cloud size={13} className="text-terracotta dark:text-terracotta-dark" />
              <span>Synced with Google Sheet</span>
              {lastSyncedAt && (
                <span className="text-stone dark:text-stone-dark opacity-80">
                  • {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sand/40 dark:bg-sand-dark/40 text-stone dark:text-stone-dark font-medium">
              <HardDrive size={13} />
              <span>Saved on this device only</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-md text-stone dark:text-stone-dark hover:text-charcoal dark:hover:text-text-dark hover:bg-sand/30 dark:hover:bg-sand-dark/30 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={onExportExcel}
              className="p-1.5 rounded-md text-stone dark:text-stone-dark hover:text-charcoal dark:hover:text-text-dark hover:bg-sand/30 dark:hover:bg-sand-dark/30 transition-colors flex items-center gap-1"
              title="Download Excel spreadsheet"
              aria-label="Download Excel"
            >
              <Download size={16} />
              <span className="hidden sm:inline text-xs font-medium">Excel</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-md text-stone dark:text-stone-dark hover:text-charcoal dark:hover:text-text-dark hover:bg-sand/30 dark:hover:bg-sand-dark/30 transition-colors"
              title="Settings & Cloud Sync"
              aria-label="Open settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Main Branding Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-terracotta dark:bg-terracotta-dark text-white dark:text-[#17150F] flex items-center justify-center font-bold text-lg shadow-sm">
              🏠
            </div>
            <div>
              <h1 className="text-[19px] font-bold leading-tight tracking-tight text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif]">
                {projectName || 'House Build Tracker'}
              </h1>
              <p className="text-[12px] text-stone dark:text-stone-dark font-normal">
                Every rupee and workday in one place
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
