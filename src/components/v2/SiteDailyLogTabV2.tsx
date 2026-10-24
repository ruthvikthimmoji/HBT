import React, { useState } from 'react';
import { SiteDailyLog, WeatherType } from '../../types/v2';
import {
  Calendar,
  Plus,
  Sun,
  CloudRain,
  Cloud,
  Thermometer,
  Users,
  AlertTriangle,
  FileCheck2,
  Camera,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface SiteDailyLogTabV2Props {
  logs: SiteDailyLog[];
  onOpenNewSiteLog: () => void;
  onSelectSiteLog: (log: SiteDailyLog) => void;
  onViewPhoto: (photoUrl: string, caption?: string) => void;
}

export const SiteDailyLogTabV2: React.FC<SiteDailyLogTabV2Props> = ({
  logs,
  onOpenNewSiteLog,
  onSelectSiteLog,
  onViewPhoto,
}) => {
  const [stageFilter, setStageFilter] = useState('all');

  const stages = Array.from(new Set(logs.map((l) => l.stage)));

  const filtered = logs.filter((l) => {
    if (stageFilter !== 'all' && l.stage !== stageFilter) return false;
    return true;
  });

  const totalLabourManDays = logs.reduce((acc, l) => acc + (l.labourCount || 0), 0);

  const renderWeatherIcon = (weather: WeatherType) => {
    switch (weather) {
      case 'Rainy':
        return <CloudRain size={14} className="text-blue-500" />;
      case 'Cloudy':
        return <Cloud size={14} className="text-gray-500" />;
      case 'Hot':
        return <Thermometer size={14} className="text-red-500" />;
      case 'Sunny':
      default:
        return <Sun size={14} className="text-amber-500" />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header Summary Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="hbt-card p-3">
          <div className="text-[11px] text-stone font-medium">Site Visits Recorded</div>
          <div className="text-lg font-bold text-charcoal tabular-num mt-0.5">
            {logs.length} Diary Entries
          </div>
          <div className="text-[10px] text-stone">Documented progress</div>
        </div>

        <div className="hbt-card p-3">
          <div className="text-[11px] text-stone font-medium">Cumulative Labour Headcount</div>
          <div className="text-lg font-bold text-terracotta tabular-num mt-0.5">
            {totalLabourManDays} Man-Days
          </div>
          <div className="text-[10px] text-stone">Recorded on site</div>
        </div>
      </div>

      {/* 2. Top Action & Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setStageFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              stageFilter === 'all'
                ? 'bg-terracotta text-white'
                : 'bg-white text-stone border border-sand hover:text-charcoal'
            }`}
          >
            All Stages
          </button>
          {stages.map((stg) => (
            <button
              key={stg}
              onClick={() => setStageFilter(stg)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                stageFilter === stg
                  ? 'bg-terracotta text-white'
                  : 'bg-white text-stone border border-sand hover:text-charcoal'
              }`}
            >
              {stg}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenNewSiteLog}
          className="hbt-btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus size={15} />
          <span>Log Site Visit</span>
        </button>
      </div>

      {/* 3. Site Diary Entries Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="hbt-card py-12 text-center text-stone text-xs space-y-2">
            <p>No site visit diary logs found.</p>
            <button
              onClick={onOpenNewSiteLog}
              className="hbt-btn-primary text-xs px-3 py-1.5"
            >
              Add First Site Visit
            </button>
          </div>
        ) : (
          filtered.map((log) => (
            <div
              key={log.id}
              onClick={() => onSelectSiteLog(log)}
              className="hbt-card p-4 space-y-3 hover:border-terracotta/50 cursor-pointer transition-all group"
            >
              {/* Card Header: Date, Stage, Weather, Labour */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-2.5 py-1 rounded-lg bg-sand/40 text-charcoal font-bold text-xs flex items-center gap-1.5">
                    <Calendar size={13} className="text-terracotta" />
                    <span>{log.date}</span>
                    <span className="text-stone">({log.day})</span>
                  </div>

                  <span className="text-[11px] font-semibold text-[#11363E] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {log.stage}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] text-stone bg-white px-2 py-0.5 rounded border border-sand">
                    {renderWeatherIcon(log.weather)}
                    <span>{log.weather}</span>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-charcoal bg-[#EBECDC] px-2.5 py-1 rounded-lg">
                  <Users size={13} className="text-terracotta" />
                  <span>{log.labourCount} Workers</span>
                </div>
              </div>

              {/* Work Done Today */}
              <div>
                <h5 className="text-[11px] font-bold text-stone uppercase tracking-wider mb-0.5">
                  Work Done Today
                </h5>
                <p className="text-sm font-medium text-charcoal leading-relaxed">
                  {log.workDone}
                </p>
              </div>

              {/* Who was on site */}
              {log.whoWasOnSite && (
                <div className="text-xs text-stone">
                  <span className="font-semibold text-charcoal">On Site: </span>
                  <span>{log.whoWasOnSite}</span>
                </div>
              )}

              {/* Issues / Delays or Decisions Given */}
              {(log.issuesDelays || log.decisionsGiven) && (
                <div className="space-y-1.5 pt-1 text-xs">
                  {log.issuesDelays && (
                    <div className="p-2 rounded-lg bg-red-50 border border-red-100 flex items-start gap-1.5 text-money-red">
                      <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Issue / Delay:</strong> {log.issuesDelays}
                      </div>
                    </div>
                  )}

                  {log.decisionsGiven && (
                    <div className="p-2 rounded-lg bg-[#EBECDC]/60 border border-sand flex items-start gap-1.5 text-stone">
                      <FileCheck2 size={13} className="flex-shrink-0 mt-0.5 text-[#11363E]" />
                      <div>
                        <strong className="text-charcoal">Decision Given:</strong> {log.decisionsGiven}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Attached Photos / Next Steps */}
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-sand/40">
                {log.photoRef ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewPhoto(log.photoRef!, `Site Visit - ${log.date}`);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-terracotta font-semibold hover:underline"
                  >
                    <Camera size={13} />
                    <span>View Site Photos</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-stone">No photos attached</span>
                )}

                {log.nextSteps && (
                  <span className="text-[11px] text-stone truncate max-w-[200px]">
                    <strong>Next:</strong> {log.nextSteps}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
