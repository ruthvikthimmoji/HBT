import React, { useState, useEffect } from 'react';
import { MaterialEntry, MaterialUnit } from '../../types/v2';
import { X, Truck, Camera } from 'lucide-react';

interface MaterialEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: MaterialEntry) => void;
  existingMaterial?: MaterialEntry | null;
}

const MATERIAL_PRESETS = [
  'Cement (OPC 53)',
  'Cement (PPC)',
  'TMT Steel (12mm)',
  'TMT Steel (16mm)',
  'TMT Steel (10mm)',
  'River Sand',
  'M-Sand (Manufactured)',
  'Red Bricks',
  'Solid Concrete Blocks',
  '20mm Aggregates (Jelly)',
  '40mm Aggregates',
  'Vitrified Floor Tiles',
  'Bathroom Wall Tiles',
  'Granite Slabs',
  'Asian Paints Primer',
  'UPVC Plumbing Pipes',
  'PVC Conduit Pipes & Wires',
];

export const MaterialEntryModal: React.FC<MaterialEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingMaterial,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(existingMaterial?.date || todayStr);
  const [material, setMaterial] = useState(existingMaterial?.material || '');
  const [supplier, setSupplier] = useState(existingMaterial?.supplier || '');
  const [qty, setQty] = useState<string>(existingMaterial ? String(existingMaterial.qty) : '');
  const [unit, setUnit] = useState<MaterialUnit>(existingMaterial?.unit || 'Bags');
  const [rate, setRate] = useState<string>(existingMaterial ? String(existingMaterial.rate) : '');
  const [amount, setAmount] = useState<string>(
    existingMaterial ? String(existingMaterial.amount) : ''
  );
  const [billNo, setBillNo] = useState(existingMaterial?.billNo || '');
  const [delivered, setDelivered] = useState<'Yes' | 'No' | 'Partial'>(
    existingMaterial?.delivered || 'Yes'
  );
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending'>(
    existingMaterial?.paymentStatus || 'Paid'
  );
  const [billLink, setBillLink] = useState(existingMaterial?.billLink || '');
  const [remarks, setRemarks] = useState(existingMaterial?.remarks || '');

  // Auto-calculate amount when qty and rate change
  useEffect(() => {
    const q = parseFloat(qty);
    const r = parseFloat(rate);
    if (!isNaN(q) && !isNaN(r) && q > 0 && r > 0) {
      setAmount(String(Math.round(q * r)));
    }
  }, [qty, rate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillLink(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numQty = parseFloat(qty);
    const numRate = parseFloat(rate);
    const numAmount = parseFloat(amount) || numQty * numRate;

    if (!material.trim()) {
      alert('Please specify the material name');
      return;
    }
    if (isNaN(numQty) || numQty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const record: MaterialEntry = {
      id: existingMaterial?.id || `M-${String(Date.now()).slice(-4)}`,
      date,
      material: material.trim(),
      supplier: supplier.trim() || 'Direct Site Purchase',
      qty: numQty,
      unit,
      rate: isNaN(numRate) ? 0 : numRate,
      amount: numAmount,
      billNo: billNo.trim() || undefined,
      delivered,
      paymentStatus,
      billLink: billLink.trim() || undefined,
      remarks: remarks.trim() || undefined,
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
              {existingMaterial ? 'Edit Material Delivery' : 'Log Material Delivery'}
            </h3>
            <p className="text-xs text-stone">Record cement, steel, sand, tiles delivered to site</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone hover:bg-sand/30"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3.5 py-3 flex-1 pr-1">
          {/* Material Name & Preset Suggestions */}
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Material Name *
            </label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="e.g. Cement (OPC 53)"
              required
              className="hbt-input w-full text-sm font-semibold"
            />
            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 mt-2 max-h-16 overflow-y-auto no-scrollbar py-0.5">
              {MATERIAL_PRESETS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMaterial(m)}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-sand bg-sand/20 hover:bg-sand/50 text-stone hover:text-charcoal transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Supplier & Date */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Supplier / Shop *
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Sri Lakshmi Traders"
                required
                className="hbt-input w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Delivery Date *
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

          {/* Quantity, Unit & Rate */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Quantity *
              </label>
              <input
                type="number"
                step="any"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="100"
                required
                className="hbt-input w-full font-bold tabular-num text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as MaterialUnit)}
                className="hbt-input w-full text-xs"
              >
                <option value="Bags">Bags</option>
                <option value="Tons">Tons</option>
                <option value="Brass">Brass</option>
                <option value="Loads">Loads</option>
                <option value="Sq.ft">Sq.ft</option>
                <option value="Nos">Nos</option>
                <option value="Trips">Trips</option>
                <option value="Kg">Kg</option>
                <option value="Ltr">Ltr</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Rate (₹)
              </label>
              <input
                type="number"
                step="any"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="420"
                className="hbt-input w-full tabular-num text-xs"
              />
            </div>
          </div>

          {/* Total Amount & Bill No */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">
                Total Amount (₹) *
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="42000"
                required
                className="hbt-input w-full font-bold text-base text-charcoal tabular-num"
              />
            </div>

            <div>
              <label className="block text-xs text-stone mb-1 font-medium">
                Bill / Invoice No.
              </label>
              <input
                type="text"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                placeholder="e.g. INV-2231"
                className="hbt-input w-full text-xs"
              />
            </div>
          </div>

          {/* Payment Status & Delivery Status */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-sand/20">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Pending')}
                className="hbt-input w-full text-xs"
              >
                <option value="Paid">Paid (Settled)</option>
                <option value="Pending">Pending (Owed to shop)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Delivered to Site?
              </label>
              <select
                value={delivered}
                onChange={(e) => setDelivered(e.target.value as 'Yes' | 'No' | 'Partial')}
                className="hbt-input w-full text-xs"
              >
                <option value="Yes">Yes (Full delivery)</option>
                <option value="Partial">Partial delivery</option>
                <option value="No">No (Ordered/Transit)</option>
              </select>
            </div>
          </div>

          {/* Attach Bill Photo or Link */}
          <div>
            <label className="block text-xs text-stone mb-1 font-medium">
              Bill / Invoice Photo or Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={billLink}
                onChange={(e) => setBillLink(e.target.value)}
                placeholder="Google Drive link or folder ref"
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
              {existingMaterial ? 'Update Delivery' : 'Save Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
