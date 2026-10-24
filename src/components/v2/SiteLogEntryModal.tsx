import React, { useState } from 'react';
import { SiteDailyLog, WeatherType, CONSTRUCTION_STAGES } from '../../types/v2';
import { X, Calendar, Camera } from 'lucide-react';

interface SiteLogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: SiteDailyLog) => void;
  existingLog?: SiteDailyLog | null;
}

export const SiteLogEntryModal: React.FC<SiteLogEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingLog,
}) => {
  if (!isOpen) return null;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });

  const [date, setDate] = useState(existingLog?.date || todayStr);
  const [day, setDay] = useState(existingLog?.day || dayName);
  const [stage, setStage] = useState(
    existingLog?.stage || 'First Floor Slab Casting'
  );
  const [weather, setWeather] = useState<WeatherType>(
    existingLog?.weather || 'Sunny'
  );
  const [workDone, setWorkDone] = useState(existingLog?.workDone || '');
  const [labourCount, setLabourCount] = useState<string>(
    existingLog ? String(existingLog.labourCount) : '6'
  );
  const [whoWasOnSite, setWhoWasOnSite] = useState(
    existingLog?.whoWasOnSite || 'Ramesh, site engineer, masons'
  );
  const [issuesDelays, setIssuesDelays] = useState(
    existingLog?.issuesDelays || ''
  );
  const [decisionsGiven, setDecisionsGiven] = useState(
    existingLog?.decisionsGiven || ''
  );
  const [photoRef, setPhotoRef] = useState(existingLog?.photoRef || '');
  const [nextSteps, setNextSteps] = useState(existingLog?.nextSteps || '');

  const handleDateChange = (val: string) => {
    setDate(val);
    if (val) {
      const d = new Date(val);
      setDay(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoRef(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDone.trim()) {
      alert('Please describe work done today');
      return;
    }
    const numLabour = parseInt(labourCount) || 0;

    const record: SiteDailyLog = {
      id: existingLog?.id || `S-${String(Date.now()).slice(-4)}`,
      date,
      day,
      stage,
      weather,
      workDone: workDone.trim(),
      labourCount: numLabour,
      whoWasOnSite: whoWasOnSite.trim(),
      issuesDelays: issuesDelays.trim() || undefined,
      decisionsGiven: decisionsGiven.trim() || undefined,
      photoRef: photoRef.trim() || undefined,
      nextSteps: nextSteps.trim() || undefined,
    };

    onSave(record);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white border-t sm:border border-sand rounded-t-[24px] sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-sand">
          <div>
            <h3 className="text-base font-bold text-charcoal">
              {existingLog ? 'Edit Site Diary Log' : 'Log Site Visit (Daily Diary)'}
            </h3>
            <p className="text-xs text-stone">Record construction progress, labour headcount &amp; instructions</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone hover:bg-sand/30"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3.5 py-3 flex-1 pr-1">
          {/* Date & Weather */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                required
                className="hbt-input w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Weather
              </label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value as WeatherType)}
                className="hbt-input w-full text-xs"
              >
                <option value="Sunny">Sunny ☀️</option>
                <option value="Cloudy">Cloudy ☁️</option>
                <option value="Rainy">Rainy 🌧️</option>
                <option value="Hot">Hot 🔥</option>
              </select>
            </div>
          </div>

          {/* Construction Stage & Labour Count */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Construction Phase / Stage *
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="hbt-input w-full text-xs"
              >
                {CONSTRUCTION_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Labour Count *
              </label>
              <input
                type="number"
                value={labourCount}
                onChange={(e) => setLabourCount(e.target.value)}
                placeholder="8"
                required
                className="hbt-input w-full font-bold text-charcoal text-xs tabular-num"
              />
            </div>
          </div>

          {/* Work Done Today */}
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Work Done Today *
            </label>
            <textarea
              rows={3}
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              placeholder="e.g. Shuttering for 1st floor slab started. Cement delivered. 8 masons working on rebar."
              required
              className="hbt-input w-full text-xs resize-none"
            />
          </div>

          {/* Who Was On Site */}
          <div>
            <label className="block text-xs text-stone mb-1 font-medium">
              Who Was On Site (Supervisors / Engineers / Contractors)
            </label>
            <input
              type="text"
              value={whoWasOnSite}
              onChange={(e) => setWhoWasOnSite(e.target.value)}
              placeholder="e.g. Ramesh, site engineer, 6 masons/helpers"
              className="hbt-input w-full text-xs"
            />
          </div>

          {/* Issues / Delays & Decisions Given */}
          <div className="space-y-2 p-3 rounded-xl bg-sand/20">
            <div>
              <label className="block text-xs text-stone mb-1 font-medium">
                Issues / Delays (optional)
              </label>
              <input
                type="text"
                value={issuesDelays}
                onChange={(e) => setIssuesDelays(e.target.value)}
                placeholder="e.g. Sand delivery 1 day late due to rain"
                className="hbt-input w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-stone mb-1 font-medium">
                Decisions / Instructions Given (useful for dispute prevention)
              </label>
              <input
                type="text"
                value={decisionsGiven}
                onChange={(e) => setDecisionsGiven(e.target.value)}
                placeholder="e.g. Told Ramesh to finish shuttering by 10th and order extra binding wire"
                className="hbt-input w-full text-xs"
              />
            </div>
          </div>

          {/* Site Photos Upload / Link */}
          <div>
            <label className="block text-xs text-stone mb-1 font-medium">
              Site Photos (Progress proof)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={photoRef}
                onChange={(e) => setPhotoRef(e.target.value)}
                placeholder="Google Drive link or upload photo"
                className="hbt-input flex-1 text-xs"
              />
              <label className="cursor-pointer p-2 rounded-lg border border-sand bg-white text-xs text-charcoal hover:bg-sand/30 flex items-center gap-1">
                <Camera size={14} className="text-terracotta" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <label className="block text-xs text-stone mb-1 font-medium">
              Next Steps Planned
            </label>
            <input
              type="text"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="e.g. Steel bar bending next, electrical conduits"
              className="hbt-input w-full text-xs"
            />
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
              {existingLog ? 'Update Site Log' : 'Save Site Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
