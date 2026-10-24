import React, { useState } from 'react';
import { ScheduledPayment, Agreement } from '../../types/v2';
import { X, Clock, Calendar } from 'lucide-react';

interface ScheduleEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: ScheduledPayment) => void;
  agreements: Agreement[];
}

export const ScheduleEntryModal: React.FC<ScheduleEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  agreements,
}) => {
  if (!isOpen) return null;

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 14);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  const [dueDate, setDueDate] = useState(futureDateStr);
  const [vendor, setVendor] = useState('');
  const [agreementRef, setAgreementRef] = useState('');
  const [milestone, setMilestone] = useState('');
  const [amountDue, setAmountDue] = useState('');
  const [notes, setNotes] = useState('');

  const handleAgreementChange = (agrId: string) => {
    setAgreementRef(agrId);
    if (agrId) {
      const selected = agreements.find((a) => a.id === agrId);
      if (selected) {
        setVendor(selected.vendor);
        if (!milestone) {
          setMilestone(`${selected.category} Milestone`);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amountDue);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount due');
      return;
    }
    if (!vendor.trim()) {
      alert('Please enter a vendor / contractor name');
      return;
    }
    if (!milestone.trim()) {
      alert('Please enter the milestone name');
      return;
    }

    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const item: ScheduledPayment = {
      id: `SCH-${String(Date.now()).slice(-4)}`,
      dueDate,
      vendor: vendor.trim(),
      agreementRef: agreementRef || undefined,
      milestone: milestone.trim(),
      amountDue: numAmount,
      status: daysLeft < 0 ? 'Overdue' : daysLeft <= 7 ? 'Upcoming' : 'Pending',
      daysLeft,
      notes: notes.trim() || undefined,
    };

    onSave(item);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white border-t sm:border border-sand rounded-t-[24px] sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-sand">
          <div>
            <h3 className="text-base font-bold text-charcoal">
              Schedule Milestone Payment
            </h3>
            <p className="text-xs text-stone">Plan upcoming payments so nothing is missed</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone hover:bg-sand/30"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-3">
          {/* Due Date & Amount Due */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="hbt-input w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Amount Due (₹) *
              </label>
              <input
                type="number"
                step="any"
                value={amountDue}
                onChange={(e) => setAmountDue(e.target.value)}
                placeholder="75000"
                required
                className="hbt-input w-full font-bold tabular-num text-sm"
              />
            </div>
          </div>

          {/* Vendor Name */}
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Vendor / Contractor *
            </label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Ramesh (Mason Contractor)"
              required
              className="hbt-input w-full text-sm"
            />
          </div>

          {/* Agreement Link */}
          {agreements.length > 0 && (
            <div>
              <label className="block text-xs text-stone mb-1 font-medium">
                Link to Agreement (optional)
              </label>
              <select
                value={agreementRef}
                onChange={(e) => handleAgreementChange(e.target.value)}
                className="hbt-input w-full text-xs"
              >
                <option value="">-- No Agreement Link --</option>
                {agreements.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id}: {a.vendor} ({a.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Milestone Name */}
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Work / Milestone Name *
            </label>
            <input
              type="text"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              placeholder="e.g. Slab shuttering completion"
              required
              className="hbt-input w-full text-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-stone mb-1 font-medium">
              Notes / Condition (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Release after engineer structural inspection"
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
              Add Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
