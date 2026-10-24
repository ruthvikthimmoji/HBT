import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Payment, PaymentMode, Worker, Expense, PersonBalance } from '../types';
import { formatCurrency, getTodayDateString, compressImageFile } from '../utils/format';
import { Camera, CreditCard, Edit3, Trash2, X, Check, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentsTabProps {
  payments: Payment[];
  workers: Worker[];
  expenses: Expense[];
  prefilledPayee?: PersonBalance | null;
  onClearPrefilledPayee: () => void;
  onAddPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (id: string) => void;
  onViewPhoto: (photoUrl: string, caption: string) => void;
  onSelectPayment?: (payment: Payment) => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  payments,
  workers,
  expenses,
  prefilledPayee,
  onClearPrefilledPayee,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  onViewPhoto,
  onSelectPayment,
}) => {
  const [date, setDate] = useState(getTodayDateString());
  const [payee, setPayee] = useState('');
  const [payeeType, setPayeeType] = useState<'worker' | 'vendor' | 'other'>('worker');
  const [payeeId, setPayeeId] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<PaymentMode>('UPI');
  const [note, setNote] = useState('');
  const [photoProof, setPhotoProof] = useState<string | undefined>(undefined);
  const [isCompressing, setIsCompressing] = useState(false);

  // Two-tap delete state tracker
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle prefilled payee from SummaryTab Quick Pay
  useEffect(() => {
    if (prefilledPayee) {
      setPayee(prefilledPayee.name);
      setPayeeType(prefilledPayee.type);
      setPayeeId(prefilledPayee.entityId);
      if (prefilledPayee.balance > 0) {
        setAmount(String(prefilledPayee.balance));
      }
      onClearPrefilledPayee();
    }
  }, [prefilledPayee, onClearPrefilledPayee]);

  // Combined payees list (Workers + Vendors)
  const payeeOptions = useMemo(() => {
    const list: { name: string; type: 'worker' | 'vendor'; id?: string; detail: string }[] = [];
    workers.forEach((w) => {
      list.push({ name: w.name, type: 'worker', id: w.id, detail: `Worker (${w.role})` });
    });
    const vendorSet = new Set<string>();
    expenses.forEach((e) => {
      if (e.vendor && e.vendor.trim() && !vendorSet.has(e.vendor.trim())) {
        vendorSet.add(e.vendor.trim());
        list.push({ name: e.vendor.trim(), type: 'vendor', detail: 'Vendor' });
      }
    });
    return list;
  }, [workers, expenses]);

  const handleSelectPayee = (opt: (typeof payeeOptions)[0]) => {
    setPayee(opt.name);
    setPayeeType(opt.type);
    setPayeeId(opt.id);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressing(true);
      const compressedData = await compressImageFile(file);
      setPhotoProof(compressedData);
    } catch (err) {
      console.error('Failed to compress payment screenshot', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!payee.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a recipient name and valid payment amount.');
      return;
    }

    onAddPayment({
      date: date || getTodayDateString(),
      payee: payee.trim(),
      payeeType,
      payeeId,
      amount: numAmount,
      mode,
      note: note.trim() || undefined,
      photoProof,
    });

    // Delightful settled feedback
    try {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    // Reset form
    setPayee('');
    setPayeeId(undefined);
    setAmount('');
    setNote('');
    setPhotoProof(undefined);
  };

  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId === id) {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      setDeleteConfirmId(null);
      onDeletePayment(id);
    } else {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      setDeleteConfirmId(id);
      deleteTimerRef.current = setTimeout(() => {
        setDeleteConfirmId(null);
      }, 3000);
    }
  };

  const sortedPayments = useMemo(() => {
    return payments
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [payments]);

  const paymentModes: PaymentMode[] = ['Cash', 'UPI', 'Bank', 'Cheque'];

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Quick Payment Entry Form */}
      <div className="hbt-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-bold text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif]">
            Record Payment
          </h2>
          <span className="text-xs text-stone dark:text-stone-dark">Disbursement</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Date */}
            <div>
              <label className="block text-[12px] text-stone dark:text-stone-dark mb-1 font-medium">
                Payment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="hbt-input w-full"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[12px] text-stone dark:text-stone-dark mb-1 font-medium">
                Amount Paid (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone dark:text-stone-dark font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="hbt-input w-full pl-8 font-bold text-charcoal dark:text-text-dark tabular-num text-base"
                  required
                />
              </div>
            </div>
          </div>

          {/* Paid To (Worker / Vendor) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[12px] text-stone dark:text-stone-dark font-medium">
                Paid To (Worker or Vendor)
              </label>
              <span className="text-[11px] text-stone dark:text-stone-dark">Autocomplete</span>
            </div>
            <input
              type="text"
              list="payee-list"
              placeholder="e.g. Ramesh Kumar or Sri Lakshmi Hardware"
              value={payee}
              onChange={(e) => {
                const val = e.target.value;
                setPayee(val);
                // Check if matches an existing payee option
                const match = payeeOptions.find(
                  (p) => p.name.toLowerCase() === val.trim().toLowerCase()
                );
                if (match) {
                  setPayeeType(match.type);
                  setPayeeId(match.id);
                } else {
                  setPayeeType('other');
                  setPayeeId(undefined);
                }
              }}
              className="hbt-input w-full"
              required
            />
            <datalist id="payee-list">
              {payeeOptions.map((p) => (
                <option key={`${p.type}_${p.name}`} value={p.name}>
                  {p.detail}
                </option>
              ))}
            </datalist>

            {/* Fast selection chips */}
            {payeeOptions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-h-20 overflow-y-auto no-scrollbar">
                {payeeOptions.slice(0, 8).map((p) => (
                  <button
                    type="button"
                    key={`${p.type}_${p.name}`}
                    onClick={() => handleSelectPayee(p)}
                    className={`text-[12px] px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                      payee === p.name
                        ? 'bg-terracotta dark:bg-terracotta-dark text-white dark:text-[#F6F5ED] font-semibold'
                        : 'bg-sand/30 dark:bg-sand-dark/30 text-stone dark:text-stone-dark hover:text-charcoal'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Mode Selection */}
          <div>
            <label className="block text-[12px] text-stone dark:text-stone-dark mb-1 font-medium">
              Payment Mode
            </label>
            <div className="grid grid-cols-4 gap-2">
              {paymentModes.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-1.5 px-2 rounded-lg text-sm font-semibold transition-all select-none text-center ${
                    mode === m
                      ? 'bg-terracotta dark:bg-terracotta-dark text-white dark:text-[#F6F5ED] shadow-sm'
                      : 'bg-white dark:bg-surface-dark text-charcoal dark:text-text-dark border border-sand dark:border-sand-dark'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Note & Photo Proof Attachment */}
          <div>
            <label className="block text-[12px] text-stone dark:text-stone-dark mb-1 font-medium">
              Note (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. UPI ref #1234, cash given to site head, cheque #901"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="hbt-input w-full"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompressing}
              className="hbt-btn-secondary text-xs flex items-center gap-1.5"
            >
              <Camera size={15} />
              <span>{photoProof ? 'Change Screenshot' : 'Attach UPI / Receipt Screenshot'}</span>
            </button>

            {photoProof && (
              <div className="flex items-center gap-1.5">
                <img
                  src={photoProof}
                  alt="Proof preview"
                  onClick={() => onViewPhoto(photoProof, `Payment to ${payee}`)}
                  className="w-9 h-9 object-cover rounded-md border border-sand cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setPhotoProof(undefined)}
                  className="text-stone dark:text-stone-dark hover:text-money-red p-1"
                  title="Remove screenshot"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button type="submit" className="hbt-btn-primary w-full text-[15px]">
              Record Payment
            </button>
          </div>
        </form>
      </div>

      {/* 2. Payment Records List */}
      <div className="hbt-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif]">
            Payment Log
          </h3>
          <span className="text-xs text-stone dark:text-stone-dark">
            {sortedPayments.length} payments
          </span>
        </div>

        {sortedPayments.length === 0 ? (
          <div className="py-8 text-center text-sm text-stone dark:text-stone-dark">
            No payments recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-sand/50 dark:divide-sand-dark/50">
            {sortedPayments.map((p) => {
              const isConfirmingDelete = deleteConfirmId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPayment && onSelectPayment(p)}
                  className="py-3 flex items-start justify-between gap-3 first:pt-1 last:pb-1 cursor-pointer hover:bg-sand/15 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[15px] text-charcoal dark:text-text-dark">
                        {p.payee}
                      </span>
                      <span className="text-[11px] px-2 py-0.2 rounded-full font-medium bg-sand/35 dark:bg-sand-dark/40 text-stone dark:text-stone-dark">
                        {p.mode}
                      </span>
                    </div>

                    <div className="text-xs text-stone dark:text-stone-dark mt-1 flex items-center gap-2 flex-wrap">
                      <span className="tabular-num">{p.date}</span>
                      {p.note && (
                        <>
                          <span>•</span>
                          <span className="italic">{p.note}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right side: Amount + Screenshot + Actions */}
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                    <div className="text-[16px] font-bold text-money-green dark:text-money-green-dark tabular-num whitespace-nowrap">
                      {formatCurrency(p.amount)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p.photoProof && (
                        <button
                          type="button"
                          onClick={() => onViewPhoto(p.photoProof!, `Payment to ${p.payee}`)}
                          className="w-7 h-7 rounded border border-sand overflow-hidden"
                          title="View proof screenshot"
                        >
                          <img
                            src={p.photoProof}
                            alt="Proof thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )}

                      <button
                        onClick={() => onEditPayment(p)}
                        className="p-1 rounded text-stone hover:text-charcoal dark:text-stone-dark dark:hover:text-text-dark"
                        title="Edit payment"
                      >
                        <Edit3 size={15} />
                      </button>

                      {/* PRD Two-tap delete */}
                      <button
                        onClick={() => handleDeleteClick(p.id)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          isConfirmingDelete
                            ? 'bg-money-red text-white font-bold'
                            : 'hbt-btn-secondary py-1 px-2 text-xs h-auto min-h-0'
                        }`}
                      >
                        {isConfirmingDelete ? 'Tap again' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
