import React, { useState } from 'react';
import {
  Agreement,
  AgreementType,
  AgreementStatus,
  STANDARD_CATEGORIES,
} from '../../types/v2';
import { X, Building2, Upload, Camera } from 'lucide-react';

interface AgreementEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agreement: Agreement) => void;
  existingAgreement?: Agreement | null;
  existingCount: number;
}

export const AgreementEntryModal: React.FC<AgreementEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingAgreement,
  existingCount,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const defaultId = existingAgreement?.id || `A-${String(existingCount + 1).padStart(3, '0')}`;

  const [id, setId] = useState(defaultId);
  const [dateAgreed, setDateAgreed] = useState(existingAgreement?.dateAgreed || todayStr);
  const [vendor, setVendor] = useState(existingAgreement?.vendor || '');
  const [workScope, setWorkScope] = useState(existingAgreement?.workScope || '');
  const [category, setCategory] = useState(
    existingAgreement?.category || 'Brickwork / Masonry'
  );
  const [agreedAmount, setAgreedAmount] = useState(
    existingAgreement ? String(existingAgreement.agreedAmount) : ''
  );
  const [agreementType, setAgreementType] = useState<AgreementType>(
    existingAgreement?.agreementType || 'Verbal / Phone'
  );
  const [startDate, setStartDate] = useState(existingAgreement?.startDate || todayStr);
  const [expectedEndDate, setExpectedEndDate] = useState(
    existingAgreement?.expectedEndDate || ''
  );
  const [paymentTerms, setPaymentTerms] = useState(
    existingAgreement?.paymentTerms || ''
  );
  const [advanceAgreed, setAdvanceAgreed] = useState(
    existingAgreement ? String(existingAgreement.advanceAgreed) : '0'
  );
  const [workCompletedPercent, setWorkCompletedPercent] = useState<number>(
    existingAgreement?.workCompletedPercent || 0
  );
  const [status, setStatus] = useState<AgreementStatus>(
    existingAgreement?.status || 'In Progress'
  );
  const [notes, setNotes] = useState(existingAgreement?.notes || '');
  const [docUrl, setDocUrl] = useState(existingAgreement?.docUrl || '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAgreed = parseFloat(agreedAmount);
    if (isNaN(numAgreed) || numAgreed <= 0) {
      alert('Please enter a valid agreed amount');
      return;
    }
    if (!vendor.trim()) {
      alert('Please enter a contractor or vendor name');
      return;
    }

    const numAdvance = parseFloat(advanceAgreed) || 0;
    const workValueDone = (numAgreed * workCompletedPercent) / 100;
    const totalPaid = existingAgreement?.totalPaid || 0;
    const balanceToPay = Math.max(0, numAgreed - totalPaid);
    const percentPaid = numAgreed > 0 ? (totalPaid / numAgreed) * 100 : 0;
    const paidAheadOfWork = Math.max(0, totalPaid - workValueDone);

    const record: Agreement = {
      id: id.trim(),
      dateAgreed,
      vendor: vendor.trim(),
      workScope: workScope.trim(),
      category,
      agreedAmount: numAgreed,
      agreementType,
      startDate,
      expectedEndDate,
      paymentTerms: paymentTerms.trim(),
      advanceAgreed: numAdvance,
      advancePaid: existingAgreement?.advancePaid || 0,
      totalPaid,
      balanceToPay,
      percentPaid,
      workCompletedPercent,
      workValueDone,
      paidAheadOfWork,
      status,
      docUrl: docUrl.trim() || undefined,
      notes: notes.trim() || undefined,
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
              {existingAgreement ? 'Edit Agreement / Work Order' : 'New Agreement / Contract'}
            </h3>
            <p className="text-xs text-stone">What was agreed with the contractor</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone hover:bg-sand/30"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3.5 py-3 flex-1 pr-1">
          {/* Agreement ID & Agreed Date */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Agreement ID *
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
                className="hbt-input w-full font-bold text-charcoal text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Date Agreed *
              </label>
              <input
                type="date"
                value={dateAgreed}
                onChange={(e) => setDateAgreed(e.target.value)}
                required
                className="hbt-input w-full text-xs"
              />
            </div>
          </div>

          {/* Vendor Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Contractor / Vendor *
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

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="hbt-input w-full text-xs"
              >
                {STANDARD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Work Scope Agreed */}
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Work / Scope Agreed *
            </label>
            <textarea
              rows={2}
              value={workScope}
              onChange={(e) => setWorkScope(e.target.value)}
              placeholder="e.g. Brickwork & plastering labour for whole house (labour only, material by owner)"
              required
              className="hbt-input w-full text-xs resize-none"
            />
          </div>

          {/* Agreed Amount, Advance Agreed & Type */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Total Agreed (₹) *
              </label>
              <input
                type="number"
                step="any"
                value={agreedAmount}
                onChange={(e) => setAgreedAmount(e.target.value)}
                placeholder="400000"
                required
                className="hbt-input w-full font-bold text-sm tabular-num"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Advance (₹)
              </label>
              <input
                type="number"
                step="any"
                value={advanceAgreed}
                onChange={(e) => setAdvanceAgreed(e.target.value)}
                placeholder="50000"
                className="hbt-input w-full text-xs tabular-num"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Agreement Type
              </label>
              <select
                value={agreementType}
                onChange={(e) => setAgreementType(e.target.value as AgreementType)}
                className="hbt-input w-full text-xs"
              >
                <option value="Verbal / Phone">Verbal / Phone</option>
                <option value="Written Quote">Written Quote</option>
                <option value="Stamp Paper / Contract">Stamp Paper</option>
              </select>
            </div>
          </div>

          {/* Start Date & Expected End Date */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs text-stone mb-1 font-medium">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="hbt-input w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-stone mb-1 font-medium">
                Expected Completion Date
              </label>
              <input
                type="date"
                value={expectedEndDate}
                onChange={(e) => setExpectedEndDate(e.target.value)}
                className="hbt-input w-full text-xs"
              />
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <label className="block text-xs text-stone mb-1 font-medium">
              Payment Terms (as discussed)
            </label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="e.g. ₹50k advance, then ₹75k per milestone, balance on completion"
              className="hbt-input w-full text-xs"
            />
          </div>

          {/* Work Completed % & Status */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-sand/20">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">
                Work Completed %: {workCompletedPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={workCompletedPercent}
                onChange={(e) => setWorkCompletedPercent(Number(e.target.value))}
                className="w-full accent-[#FF6038]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AgreementStatus)}
                className="hbt-input w-full text-xs"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Attached Document or Photo Quote */}
          <div>
            <label className="block text-xs text-stone mb-1 font-medium">
              Attach Contract / Quote Photo or Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="Google Drive link or paste image URL"
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

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-sand">
            <button
              type="button"
              onClick={onClose}
              className="hbt-btn-secondary text-xs px-4"
            >
              Cancel
            </button>
            <button type="submit" className="hbt-btn-primary text-xs px-5">
              {existingAgreement ? 'Update Agreement' : 'Save Agreement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
