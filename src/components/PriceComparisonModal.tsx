import React, { useEffect } from 'react';
import { 
  X, 
  Building2, 
  Sparkles, 
  Search, 
  Globe, 
  TrendingDown, 
  ExternalLink 
} from 'lucide-react';
import { RegionCode, REGION_CONFIGS } from '../utils/localization';
import { PriceComparisonCard } from './PriceComparisonCard';

interface PriceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  initialPrice?: string | number;
  region?: RegionCode;
}

export const PriceComparisonModal: React.FC<PriceComparisonModalProps> = ({
  isOpen,
  onClose,
  productName,
  initialPrice,
  region = 'IN'
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-5 sm:px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-inner">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Multi-Store Geo Price Comparison</span>
                <span className="bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-white/20 uppercase tracking-wider">
                  Live Deals
                </span>
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                Verified regional prices, stock availability &amp; direct buy links
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <PriceComparisonCard
            productName={productName}
            initialPrice={initialPrice}
            initialRegion={region}
            compact={false}
            showCustomSearch={true}
          />
        </div>
      </div>
    </div>
  );
};
