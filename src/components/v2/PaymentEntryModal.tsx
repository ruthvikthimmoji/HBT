import React, { useState } from 'react';
import {
  PaymentRecord,
  PaymentType,
  PaymentMode,
  Agreement,
  STANDARD_CATEGORIES,
} from '../../types/v2';
import { X, Camera, Link, Upload, Check } from 'lucide-react';

interface PaymentEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: PaymentRecord) => void;
  agreements: Agreement[];
  existingPayment?: PaymentRecord | null;
  prefill?: Partial<PaymentRecord>;
}

export const PaymentEntryModal: React.FC<PaymentEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  agreements,
  existingPayment,
  prefill,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(
    existingPayment?.date || prefill?.date || todayStr
  );
  const [paidTo, setPaidTo] = useState(
    existingPayment?.paidTo || prefill?.paidTo || ''
  );
  const [agreementRef, setAgreementRef] = useState(
    existingPayment?.agreementRef || prefill?.agreementRef || ''
  );
  const [category, setCategory] = useState(
    existingPayment?.category || prefill?.category || 'Brickwork / Masonry'
  );
  const [description, setDescription] = useState(
    existingPayment?.description || prefill?.description || ''
  );
  const [amount, setAmount] = useState<string>(
    existingPayment ? String(existingPayment.amount) : prefill?.amount ? String(prefill.amount) : ''
  );
  const [paymentType, setPaymentType] = useState<PaymentType>(
    existingPayment?.paymentType || prefill?.paymentType || 'Milestone / Progress'
  );
  const [mode, setMode] = useState<PaymentMode>(
    existingPayment?.mode || prefill?.mode || 'UPI'
  );
  const [txnRef, setTxnRef] = useState(existingPayment?.txnRef || '');
  const [receiptReceived, setReceiptReceived] = useState<boolean>(
    existingPayment ? existingPayment.receiptReceived : true
  );
  const [receiptNo, setReceiptNo] = useState(existingPayment?.receiptNo || '');
  const [receiptLocation, setReceiptLocation] = useState(
    existingPayment?.receiptLocation || ''
  );
  const [photoPreview, setPhotoPreview] = useState<string>(
    existingPayment?.receiptLocation && existingPayment.receiptLocation.startsWith('data:image')
      ? existingPayment.receiptLocation
      : ''
  );

  const handleAgreementChange = (agrId: string) => {
    setAgreementRef(agrId);
    if (agrId) {
      const selected = agreements.find((a) => a.id === agrId);
      if (selected) {
        setPaidTo(selected.vendor);
        setCategory(selected.category);
        if (!description) {
          setDescription(`Payment for ${selected.workScope}`);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setReceiptLocation(base64);
        setReceiptReceived(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    if (!paidTo.trim()) {
      alert('Please specify who this was paid to');
      return;
    }

    const agr = agreements.find((a) => a.id === agreementRef);

    const record: PaymentRecord = {
      id: existingPayment?.id || `P-${String(Date.now()).slice(-4)}`,
      date,
      paidTo: paidTo.trim(),
      agreementRef: agreementRef || undefined,
      agreedWork: agr?.workScope,
      category,
      description: description.trim() || `${paymentType} payment to ${paidTo}`,
      amount: numAmount,
      paymentType,
      mode,
      txnRef: txnRef.trim() || undefined,
      receiptReceived,
      receiptNo: receiptNo.trim() || undefined,
      receiptLocation: receiptLocation.trim() || undefined,
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
              {existingPayment ? 'Edit Payment Record' : 'Record Payment (Disbursement)'}
            </h3>
            <p className="text-xs text-stone">Logs directly into the Payments Ledger</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone hover:bg-sand/30"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3.5 py-3 flex-1 pr-1">
          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Amount Paid (₹) *
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                required
                className="hbt-input w-full text-lg font-bold text-charcoal tabular-num"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="hbt-input w-full text-xs"
              />
            </div>
          </div>

          {/* Paid To & Agreement Link */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Paid To (Vendor / Contractor / Shop) *
              </label>
              <input
                type="text"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="e.g. Ramesh (Mason Contractor)"
                required
                className="hbt-input w-full text-sm"
              />
            </div>

            {agreements.length > 0 && (
              <div>
                <label className="block text-xs text-stone mb-1 font-medium">
                  Link to Agreement / Contract (optional)
                </label>
                <select
                  value={agreementRef}
                  onChange={(e) => handleAgreementChange(e.target.value)}
                  className="hbt-input w-full text-xs"
                >
                  <option value="">-- No Agreement (Standalone Expense) --</option>
                  {agreements.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id}: {a.vendor} ({a.category} - ₹{a.agreedAmount.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Payment Type & Mode */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Payment Type
              </label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                className="hbt-input w-full text-xs"
              >
                <option value="Advance">Advance (Pre-payment)</option>
                <option value="Milestone / Progress">Milestone / Progress</option>
                <option value="Final Settlement">Final Settlement</option>
                <option value="Material Bill">Material Bill</option>
                <option value="Refund Received">Refund Received</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Payment Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as PaymentMode)}
                className="hbt-input w-full text-xs"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          {/* Work Category */}
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

          {/* Description & Txn Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs text-stone mb-1 font-medium">
                Work Description / Note
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 1st floor brickwork advance"
                className="hbt-input w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-stone mb-1 font-medium">
                Transaction / UPI / Cheque Ref
              </label>
              <input
                type="text"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                placeholder="e.g. UPI 4128xxxx91"
                className="hbt-input w-full text-xs"
              />
            </div>
          </div>

          {/* Receipt Tracking Audit (CRITICAL) */}
          <div className="p-3.5 rounded-xl border border-sand bg-sand/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal">
                Receipt / Voucher Attached?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReceiptReceived(true)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    receiptReceived
                      ? 'bg-money-green text-white shadow-sm'
                      : 'bg-white text-stone border border-sand'
                  }`}
                >
                  Yes (Received)
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptReceived(false)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    !receiptReceived
                      ? 'bg-money-red text-white shadow-sm'
                      : 'bg-white text-stone border border-sand'
                  }`}
                >
                  No (Missing!)
                </button>
              </div>
            </div>

            {receiptReceived && (
              <div className="space-y-2 pt-1 border-t border-sand/40">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    placeholder="Receipt No. (e.g. R-001)"
                    className="hbt-input text-xs"
                  />
                  <input
                    type="text"
                    value={receiptLocation}
                    onChange={(e) => setReceiptLocation(e.target.value)}
                    placeholder="Folder / Drive link"
                    className="hbt-input text-xs"
                  />
                </div>

                {/* Direct Photo Picker */}
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sand bg-white text-xs font-semibold text-charcoal hover:bg-sand/30 transition-colors">
                    <Camera size={14} className="text-terracotta" />
                    <span>Upload Bill / Take Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {photoPreview && (
                  <div className="relative rounded-lg overflow-hidden border border-sand max-h-32 bg-black/5 flex items-center justify-center">
                    <img
                      src={photoPreview}
                      alt="Receipt preview"
                      className="max-h-32 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview('');
                        setReceiptLocation('');
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}
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
              {existingPayment ? 'Update Payment' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
