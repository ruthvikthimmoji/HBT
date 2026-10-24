import React from 'react';
import {
  Settings,
  Cloud,
  HardDrive,
  Download,
  FileSpreadsheet,
  Users,
  PieChart,
} from 'lucide-react';

interface HeaderV2Props {
  projectName: string;
  isSynced: boolean;
  sheetUrl: string;
  lastSyncedAt?: string;
  onOpenSettings: () => void;
  onExportExcel: () => void;
  onOpenVendors: () => void;
  onOpenBudget: () => void;
}

export const HeaderV2: React.FC<HeaderV2Props> = ({
  projectName,
  isSynced,
  sheetUrl,
  lastSyncedAt,
  onOpenSettings,
  onExportExcel,
  onOpenVendors,
  onOpenBudget,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sand transition-colors">
      <div className="max-w-[900px] mx-auto px-4 py-2.5">
        {/* Top Sync & Utility Bar */}
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-2">
            {isSynced ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBECDC] text-terracotta font-medium">
                <Cloud size={13} className="text-terracotta" />
                <span>Synced with Google Sheet v2</span>
                {lastSyncedAt && (
                  <span className="text-stone opacity-80">
                    • {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sand/40 text-stone font-medium">
                <HardDrive size={13} />
                <span>Device Storage (Offline)</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Vendors Directory Quick Pill */}
            <button
              type="button"
              onClick={onOpenVendors}
              className="p-1.5 rounded-lg text-stone hover:text-charcoal hover:bg-sand/30 transition-colors hidden sm:flex items-center gap-1"
              title="Open Vendors Directory"
            >
              <Users size={14} className="text-[#11363E]" />
              <span className="text-xs font-semibold">Vendors</span>
            </button>

            {/* Budget Quick Pill */}
            <button
              type="button"
              onClick={onOpenBudget}
              className="p-1.5 rounded-lg text-stone hover:text-charcoal hover:bg-sand/30 transition-colors hidden sm:flex items-center gap-1"
              title="Open Budget Planner"
            >
              <PieChart size={14} className="text-terracotta" />
              <span className="text-xs font-semibold">Budget</span>
            </button>

            {/* Direct Google Sheet Button */}
            <a
              href={sheetUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-stone hover:text-[#11363E] hover:bg-sand/30 transition-colors flex items-center gap-1"
              title="Open Tracker in Google Sheets"
            >
              <FileSpreadsheet size={15} className="text-[#11363E]" />
              <span className="hidden sm:inline text-xs font-semibold">Sheet v2</span>
            </a>

            <button
              type="button"
              onClick={onExportExcel}
              className="p-1.5 rounded-lg text-stone hover:text-charcoal hover:bg-sand/30 transition-colors hidden sm:flex items-center gap-1"
              title="Download Excel spreadsheet"
              aria-label="Download Excel"
            >
              <Download size={15} />
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-stone hover:text-charcoal hover:bg-sand/30 transition-colors"
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
            <div className="w-10 h-10 rounded-xl bg-white border border-sand/70 flex items-center justify-center p-1 shadow-sm flex-shrink-0">
              <img src="/logo.png" alt="HB Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold leading-tight tracking-tight text-charcoal font-['Nunito_Sans',sans-serif]">
                {projectName || 'My House Construction'}
              </h1>
              <p className="text-[11px] text-stone font-normal">
                Every rupee, agreement, delivery &amp; site visit in one place
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
