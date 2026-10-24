import React, { useState } from 'react';
import { Vendor } from '../../types/v2';
import { formatCurrency } from '../../utils/format';
import {
  X,
  Users,
  Plus,
  Phone,
  ShieldAlert,
  CreditCard,
  Building2,
  ChevronRight,
  Store,
} from 'lucide-react';

interface VendorsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vendors: Vendor[];
  onAddVendor: (vendor: Vendor) => void;
  onPayVendor: (vendorName: string) => void;
}

export const VendorsDrawer: React.FC<VendorsDrawerProps> = ({
  isOpen,
  onClose,
  vendors,
  onAddVendor,
  onPayVendor,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Mason / Labour contractor');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newVendor: Vendor = {
      id: `V-${String(Date.now()).slice(-4)}`,
      name: name.trim(),
      role: role.trim(),
      phone: phone.trim(),
      totalAgreed: 0,
      advanceGiven: 0,
      totalPaid: 0,
      balanceDue: 0,
      percentPaid: 0,
      workValueDone: 0,
      paidAheadOfWork: 0,
      notes: notes.trim() || undefined,
    };

    onAddVendor(newVendor);
    setName('');
    setPhone('');
    setNotes('');
    setIsAdding(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col p-5 overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-sand">
          <div>
            <h3 className="text-base font-bold text-charcoal">
              Vendors &amp; Contractors Directory
            </h3>
            <p className="text-xs text-stone">All contractors, trade specialists and suppliers</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone hover:bg-sand/30"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="py-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-stone">
            {vendors.length} Contractors / Shops
          </span>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="hbt-btn-primary py-1 px-3 text-xs h-auto min-h-0 flex items-center gap-1"
          >
            <Plus size={13} />
            <span>{isAdding ? 'Cancel' : 'Add Person / Shop'}</span>
          </button>
        </div>

        {/* Quick Add Form if opened */}
        {isAdding && (
          <form
            onSubmit={handleSaveVendor}
            className="p-3.5 rounded-xl border border-sand bg-sand/20 space-y-2.5 text-xs mb-3"
          >
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Name / Contractor *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anand (Electrician)"
                required
                className="hbt-input w-full text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone mb-1 font-medium">Trade / Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Electrical contractor"
                  className="hbt-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-stone mb-1 font-medium">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98450 00000"
                  className="hbt-input w-full text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="hbt-btn-secondary text-xs py-1 px-3 h-auto min-h-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="hbt-btn-primary text-xs py-1 px-3.5 h-auto min-h-0"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Vendor List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {vendors.map((v) => {
            const isAhead = v.paidAheadOfWork > 0;

            return (
              <div
                key={v.id}
                className="hbt-card p-3.5 space-y-2.5 hover:border-terracotta/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-charcoal">{v.name}</h4>
                    <span className="text-[11px] font-medium text-stone bg-[#EBECDC] px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {v.role}
                    </span>
                  </div>

                  {v.phone && (
                    <a
                      href={`tel:${v.phone.replace(/\s+/g, '')}`}
                      className="p-1.5 rounded-lg border border-sand bg-white text-stone hover:text-charcoal flex items-center gap-1 text-[11px]"
                      title="Call vendor"
                    >
                      <Phone size={12} className="text-terracotta" />
                      <span>{v.phone}</span>
                    </a>
                  )}
                </div>

                {/* Financial Ledger Snapshot */}
                <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-sand/40">
                  <div>
                    <span className="text-stone text-[10px] block">Total Agreed</span>
                    <strong className="text-charcoal tabular-num">
                      {formatCurrency(v.totalAgreed)}
                    </strong>
                  </div>

                  <div>
                    <span className="text-stone text-[10px] block">Total Paid</span>
                    <strong className="text-terracotta tabular-num">
                      {formatCurrency(v.totalPaid)}
                    </strong>
                  </div>

                  <div>
                    <span className="text-stone text-[10px] block">Balance Due</span>
                    <strong className="text-[#11363E] tabular-num">
                      {formatCurrency(v.balanceDue)}
                    </strong>
                  </div>
                </div>

                {/* Warning if paid ahead */}
                {isAhead && (
                  <div className="flex items-center gap-1 text-[11px] text-terracotta font-medium bg-orange-50 p-1.5 rounded border border-orange-200">
                    <ShieldAlert size={12} className="flex-shrink-0" />
                    <span>Paid ahead of work: {formatCurrency(v.paidAheadOfWork)}</span>
                  </div>
                )}

                {/* 1-Tap Pay Action */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone">
                    Work done: {formatCurrency(v.workValueDone)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onPayVendor(v.name);
                    }}
                    className="text-terracotta font-semibold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <CreditCard size={12} />
                    <span>Record Payment</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
