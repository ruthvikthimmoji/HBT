import React, { useState, useMemo, useRef } from 'react';
import { Expense } from '../types';
import { formatCurrency, getTodayDateString, compressImageFile } from '../utils/format';
import { DEFAULT_CATEGORIES } from '../utils/calculations';
import { Camera, Image as ImageIcon, Search, X, Edit3, Trash2, Filter } from 'lucide-react';

interface ExpensesTabProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onViewPhoto: (photoUrl: string, caption: string) => void;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onViewPhoto,
}) => {
  const [date, setDate] = useState(getTodayDateString());
  const [category, setCategory] = useState('Cement & Steel');
  const [item, setItem] = useState('');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [photoReceipt, setPhotoReceipt] = useState<string | undefined>(undefined);
  const [isCompressing, setIsCompressing] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Two-tap delete state tracker
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic categories list = standard + any custom categories used
  const availableCategories = useMemo(() => {
    const custom = new Set<string>(DEFAULT_CATEGORIES);
    expenses.forEach((e) => {
      if (e.category && e.category.trim()) custom.add(e.category.trim());
    });
    return Array.from(custom);
  }, [expenses]);

  // Unique vendors for autocomplete suggestions
  const vendorSuggestions = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.vendor && e.vendor.trim()) set.add(e.vendor.trim());
    });
    return Array.from(set);
  }, [expenses]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressing(true);
      const compressedData = await compressImageFile(file);
      setPhotoReceipt(compressedData);
    } catch (err) {
      console.error('Failed to compress image', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!item.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter an item name and valid amount.');
      return;
    }

    onAddExpense({
      date: date || getTodayDateString(),
      category: category.trim() || 'Other',
      item: item.trim(),
      vendor: vendor.trim() || undefined,
      amount: numAmount,
      note: note.trim() || undefined,
      photoReceipt,
    });

    // Reset fast form, keep date
    setItem('');
    setAmount('');
    setNote('');
    setPhotoReceipt(undefined);
  };

  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId === id) {
      // Second tap -> perform delete
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      setDeleteConfirmId(null);
      onDeleteExpense(id);
    } else {
      // First tap -> switch to "Tap again" and auto-reset after 3 seconds
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      setDeleteConfirmId(id);
      deleteTimerRef.current = setTimeout(() => {
        setDeleteConfirmId(null);
      }, 3000);
    }
  };

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
      .filter((e) => {
        if (selectedCategoryFilter !== 'all' && e.category !== selectedCategoryFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchItem = e.item.toLowerCase().includes(q);
          const matchVendor = (e.vendor || '').toLowerCase().includes(q);
          const matchCategory = e.category.toLowerCase().includes(q);
          const matchNote = (e.note || '').toLowerCase().includes(q);
          return matchItem || matchVendor || matchCategory || matchNote;
        }
        return true;
      });
  }, [expenses, selectedCategoryFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* 1. Quick Expense Entry Form */}
      <div className="hbt-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-bold text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif]">
            Add Expense
          </h2>
          <span className="text-xs text-stone dark:text-stone-dark">Fast entry</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Date */}
            <div>
              <label className="block text-[12px] text-stone dark:text-stone-dark mb-1 font-medium">
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

            {/* Amount */}
            <div>
              <label className="block text-[12px] text-stone dark:text-stone-dark mb-1 font-medium">
                Amount (₹)
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

          {/* Item Description */}
          <div>
            <label className="block text-[12px] text-stone dark:text-stone-dark mb-1 font-medium">
              Item or Work
            </label>
            <input
              type="text"
              placeholder="e.g. 50 Bags Cement, Sand tractor, Electric pipes"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="hbt-input w-full"
              required
            />
          </div>

          {/* Vendor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[12px] text-stone dark:text-stone-dark font-medium">
                Vendor / Supplier (optional)
              </label>
              {vendorSuggestions.length > 0 && (
                <span className="text-[11px] text-stone dark:text-stone-dark">Auto-linked</span>
              )}
            </div>
            <input
              type="text"
              list="vendor-suggestions"
              placeholder="e.g. Sri Lakshmi Hardware, Shiva Transports"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="hbt-input w-full"
            />
            <datalist id="vendor-suggestions">
              {vendorSuggestions.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </div>

          {/* Category with Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[12px] text-stone dark:text-stone-dark font-medium">
                Category
              </label>
              <span className="text-[11px] text-stone dark:text-stone-dark">Tap to choose</span>
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Select or type new category"
              className="hbt-input w-full mb-2"
              required
            />
            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar py-0.5">
              {availableCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-[12px] px-2.5 py-1 rounded-full font-medium transition-all ${
                    category === cat
                      ? 'bg-terracotta dark:bg-terracotta-dark text-white dark:text-[#17150F] font-semibold'
                      : 'bg-sand/35 dark:bg-sand-dark/40 text-charcoal dark:text-text-dark hover:bg-sand/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note & Bill Photo Attachment */}
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
              <span>{photoReceipt ? 'Change Bill Photo' : 'Attach Bill Photo'}</span>
            </button>

            {photoReceipt && (
              <div className="flex items-center gap-1.5">
                <img
                  src={photoReceipt}
                  alt="Bill preview"
                  onClick={() => onViewPhoto(photoReceipt, item || 'Receipt')}
                  className="w-9 h-9 object-cover rounded-md border border-sand cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setPhotoReceipt(undefined)}
                  className="text-stone dark:text-stone-dark hover:text-money-red p-1"
                  title="Remove photo"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button type="submit" className="hbt-btn-primary w-full text-[15px]">
              Add Expense
            </button>
          </div>
        </form>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-stone dark:text-stone-dark" />
          <input
            type="text"
            placeholder="Search items, vendors, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="hbt-input w-full pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-stone hover:text-charcoal"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="hbt-input w-full text-sm font-medium"
          >
            <option value="all">All Categories ({expenses.length})</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Expenses List */}
      <div className="hbt-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] font-bold text-charcoal dark:text-text-dark font-['Nunito_Sans',sans-serif]">
            Expense History
          </h3>
          <span className="text-xs text-stone dark:text-stone-dark">
            {filteredExpenses.length} entries
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="py-8 text-center text-sm text-stone dark:text-stone-dark">
            {searchQuery || selectedCategoryFilter !== 'all'
              ? 'No matching expenses found.'
              : 'No expenses yet.'}
          </div>
        ) : (
          <div className="divide-y divide-sand/50 dark:divide-sand-dark/50">
            {filteredExpenses.map((exp) => {
              const isConfirmingDelete = deleteConfirmId === exp.id;

              return (
                <div
                  key={exp.id}
                  className="py-3 flex items-start justify-between gap-3 first:pt-1 last:pb-1"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[15px] text-charcoal dark:text-text-dark">
                        {exp.item}
                      </span>
                      <span className="text-[11px] px-2 py-0.2 rounded-full font-medium bg-[#FBEEE5] dark:bg-[#33241A] text-terracotta dark:text-terracotta-dark">
                        {exp.category}
                      </span>
                    </div>

                    <div className="text-xs text-stone dark:text-stone-dark mt-1 flex items-center gap-2 flex-wrap">
                      <span className="tabular-num">{exp.date}</span>
                      {exp.vendor && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-charcoal dark:text-text-dark">
                            {exp.vendor}
                          </span>
                        </>
                      )}
                      {exp.note && (
                        <>
                          <span>•</span>
                          <span className="italic">{exp.note}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right side: Amount + Photo thumbnail + Actions */}
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                    <div className="text-[16px] font-bold text-charcoal dark:text-text-dark tabular-num whitespace-nowrap">
                      {formatCurrency(exp.amount)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {exp.photoReceipt && (
                        <button
                          type="button"
                          onClick={() => onViewPhoto(exp.photoReceipt!, exp.item)}
                          className="w-7 h-7 rounded border border-sand overflow-hidden"
                          title="View receipt photo"
                        >
                          <img
                            src={exp.photoReceipt}
                            alt="Receipt thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )}

                      <button
                        onClick={() => onEditExpense(exp)}
                        className="p-1 rounded text-stone hover:text-charcoal dark:text-stone-dark dark:hover:text-text-dark"
                        title="Edit expense"
                      >
                        <Edit3 size={15} />
                      </button>

                      {/* PRD Two-tap delete button */}
                      <button
                        onClick={() => handleDeleteClick(exp.id)}
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
