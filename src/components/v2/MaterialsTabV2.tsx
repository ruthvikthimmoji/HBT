import React, { useState } from 'react';
import { MaterialEntry } from '../../types/v2';
import { formatCurrency } from '../../utils/format';
import {
  Truck,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Search,
  Check,
  Camera,
  ExternalLink,
  Store,
} from 'lucide-react';

interface MaterialsTabV2Props {
  materials: MaterialEntry[];
  onOpenNewMaterial: () => void;
  onTogglePaymentStatus: (id: string) => void;
  onSelectMaterial: (material: MaterialEntry) => void;
  onViewPhoto: (photoUrl: string, caption?: string) => void;
}

export const MaterialsTabV2: React.FC<MaterialsTabV2Props> = ({
  materials,
  onOpenNewMaterial,
  onTogglePaymentStatus,
  onSelectMaterial,
  onViewPhoto,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  const totalValue = materials.reduce((acc, m) => acc + m.amount, 0);
  const totalPending = materials
    .filter((m) => m.paymentStatus === 'Pending')
    .reduce((acc, m) => acc + m.amount, 0);
  const totalPaid = materials
    .filter((m) => m.paymentStatus === 'Paid')
    .reduce((acc, m) => acc + m.amount, 0);

  const filtered = materials.filter((m) => {
    if (filterPayment !== 'all' && m.paymentStatus.toLowerCase() !== filterPayment.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.material.toLowerCase().includes(q) ||
        m.supplier.toLowerCase().includes(q) ||
        (m.billNo && m.billNo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="hbt-card p-3">
          <div className="text-[11px] text-stone font-medium">Total Materials</div>
          <div className="text-base font-bold text-charcoal tabular-num mt-0.5">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-[10px] text-stone">{materials.length} Invoices</div>
        </div>

        <div className="hbt-card p-3">
          <div className="text-[11px] text-stone font-medium">Paid To Suppliers</div>
          <div className="text-base font-bold text-money-green tabular-num mt-0.5">
            {formatCurrency(totalPaid)}
          </div>
          <div className="text-[10px] text-stone">Cleared</div>
        </div>

        <div className="hbt-card p-3">
          <div className="text-[11px] text-stone font-medium">Pending To Shops</div>
          <div className="text-base font-bold text-money-red tabular-num mt-0.5">
            {formatCurrency(totalPending)}
          </div>
          <div className="text-[10px] text-stone">Unpaid dues</div>
        </div>
      </div>

      {/* 2. Search & Action Controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search material, supplier or bill..."
            className="hbt-input w-full pl-8 text-xs py-2 h-10"
          />
        </div>

        <button
          type="button"
          onClick={onOpenNewMaterial}
          className="hbt-btn-primary text-xs px-3.5 py-2 h-10 flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus size={15} />
          <span>Add Delivery</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'All Deliveries' },
          { id: 'pending', label: 'Pending Payment' },
          { id: 'paid', label: 'Paid Bills' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterPayment(t.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filterPayment === t.id
                ? 'bg-terracotta text-white'
                : 'bg-white text-stone border border-sand hover:text-charcoal'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 3. Materials Delivery List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="hbt-card py-12 text-center text-stone text-xs space-y-2">
            <p>No material deliveries recorded.</p>
            <button
              onClick={onOpenNewMaterial}
              className="hbt-btn-primary text-xs px-3 py-1.5"
            >
              Add First Delivery
            </button>
          </div>
        ) : (
          filtered.map((mat) => {
            const isPending = mat.paymentStatus === 'Pending';

            return (
              <div
                key={mat.id}
                onClick={() => onSelectMaterial(mat)}
                className="hbt-card p-3.5 space-y-2.5 hover:border-terracotta/50 cursor-pointer transition-all group"
              >
                {/* Header: Date, Material, Supplier */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-sand/40 text-charcoal">
                        {mat.date}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isPending
                            ? 'bg-red-100 text-money-red'
                            : 'bg-green-100 text-money-green'
                        }`}
                      >
                        {mat.paymentStatus}
                      </span>
                      {mat.billNo && (
                        <span className="text-[10px] text-stone bg-[#EBECDC] px-1.5 py-0.5 rounded">
                          Bill: {mat.billNo}
                        </span>
                      )}
                    </div>

                    <h4 className="text-[15px] font-bold text-charcoal mt-1">
                      {mat.material}
                    </h4>
                    <div className="text-xs text-stone flex items-center gap-1 mt-0.5">
                      <Store size={12} />
                      <span className="truncate">{mat.supplier}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-base font-bold text-charcoal tabular-num block">
                      {formatCurrency(mat.amount)}
                    </span>
                    <span className="text-[11px] text-stone tabular-num">
                      {mat.qty} {mat.unit} @ {formatCurrency(mat.rate)}
                    </span>
                  </div>
                </div>

                {/* Footer Controls: 1-Tap Toggle & Photo Preview */}
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-sand/40">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePaymentStatus(mat.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      isPending
                        ? 'bg-red-50 text-money-red hover:bg-red-100'
                        : 'bg-green-50 text-money-green hover:bg-green-100'
                    }`}
                  >
                    <Check size={12} />
                    <span>{isPending ? 'Mark as Paid' : 'Paid (Tap to mark Pending)'}</span>
                  </button>

                  {mat.billLink ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewPhoto(mat.billLink!, `${mat.material} - ${mat.supplier}`);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-terracotta font-semibold hover:underline"
                    >
                      <Camera size={13} />
                      <span>View Bill Proof</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-stone">No bill attached</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
