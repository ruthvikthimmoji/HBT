import React, { useState, useEffect } from 'react';
import { Expense, Payment, PaymentMode } from '../types';
import { X } from 'lucide-react';

interface EditModalProps {
  type: 'expense' | 'payment' | null;
  item: Expense | Payment | null;
  onClose: () => void;
  onSaveExpense: (expense: Expense) => void;
  onSavePayment: (payment: Payment) => void;
}

export const EditModal: React.FC<EditModalProps> = ({
  type,
  item,
  onClose,
  onSaveExpense,
  onSavePayment,
}) => {
  if (!type || !item) return null;

  // Expense fields
  const [expenseItem, setExpenseItem] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseVendor, setExpenseVendor] = useState('');

  // Payment fields
  const [paymentPayee, setPaymentPayee] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');

  // Common fields
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (type === 'expense') {
      const e = item as Expense;
      setDate(e.date);
      setExpenseItem(e.item);
      setExpenseCategory(e.category);
      setExpenseVendor(e.vendor || '');
      setAmount(String(e.amount));
      setNote(e.note || '');
    } else if (type === 'payment') {
      const p = item as Payment;
      setDate(p.date);
      setPaymentPayee(p.payee);
      setPaymentMode(p.mode);
      setAmount(String(p.amount));
      setNote(p.note || '');
    }
  }, [type, item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (type === 'expense') {
      const original = item as Expense;
      onSaveExpense({
        ...original,
        date,
        item: expenseItem.trim(),
        category: expenseCategory.trim(),
        vendor: expenseVendor.trim() || undefined,
        amount: numAmount,
        note: note.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
    } else if (type === 'payment') {
      const original = item as Payment;
      onSavePayment({
        ...original,
        date,
        payee: paymentPayee.trim(),
        amount: numAmount,
        mode: paymentMode,
        note: note.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-dark border border-sand dark:border-sand-dark rounded-xl max-w-md w-full p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif]">
            {type === 'expense' ? 'Edit Expense' : 'Edit Payment'}
          </h3>
          <button
            onClick={onClose}
            className="text-stone hover:text-charcoal dark:hover:text-text-dark"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="hbt-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="hbt-input w-full font-bold tabular-num"
                required
              />
            </div>
          </div>

          {type === 'expense' ? (
            <>
              <div>
                <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                  Item / Description
                </label>
                <input
                  type="text"
                  value={expenseItem}
                  onChange={(e) => setExpenseItem(e.target.value)}
                  className="hbt-input w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                    Category
                  </label>
                  <input
                    type="text"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="hbt-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                    Vendor (optional)
                  </label>
                  <input
                    type="text"
                    value={expenseVendor}
                    onChange={(e) => setExpenseVendor(e.target.value)}
                    className="hbt-input w-full"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                  Paid To
                </label>
                <input
                  type="text"
                  value={paymentPayee}
                  onChange={(e) => setPaymentPayee(e.target.value)}
                  className="hbt-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
                  Mode
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Cash', 'UPI', 'Bank', 'Cheque'] as PaymentMode[]).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPaymentMode(m)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold select-none text-center ${
                        paymentMode === m
                          ? 'bg-terracotta dark:bg-terracotta-dark text-white dark:text-[#F6F5ED]'
                          : 'border border-sand dark:border-sand-dark text-charcoal dark:text-text-dark'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-stone dark:text-stone-dark mb-1 font-medium">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="hbt-input w-full"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="hbt-btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="hbt-btn-primary text-xs">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
