import React from 'react';
import { X, Download } from 'lucide-react';

interface PhotoModalProps {
  photoUrl: string | null;
  caption?: string;
  onClose: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ photoUrl, caption, onClose }) => {
  if (!photoUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full max-h-[90vh] bg-white border border-sand rounded-xl overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between p-3 border-b border-sand bg-[#361E1C] text-[#F6F5ED]">
          <span className="text-sm font-semibold truncate">
            {caption || 'Receipt Preview'}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={photoUrl}
              download="house-build-receipt.jpg"
              className="p-1 rounded text-[#A0C9CB] hover:text-[#F6F5ED] transition-colors"
              title="Download full image"
            >
              <Download size={18} />
            </a>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#A0C9CB] hover:text-[#F6F5ED] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Image content */}
        <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-black/40">
          <img
            src={photoUrl}
            alt={caption || 'Document photo'}
            className="max-w-full max-h-[75vh] object-contain rounded"
          />
        </div>
      </div>
    </div>
  );
};
