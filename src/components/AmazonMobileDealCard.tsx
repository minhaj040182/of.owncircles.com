import React from 'react';
import { ShoppingBag, ExternalLink, Star, Sparkles, ChevronRight } from 'lucide-react';
import { VideoItem } from '../types';
import { RegionCode, REGION_CONFIGS, getLocalizedAffiliateUrl } from '../utils/localization';
import { CurrencyCode, formatPriceInCurrency } from '../utils/currency';

interface AmazonMobileDealCardProps {
  videos?: VideoItem[];
  region: RegionCode;
  selectedCurrency: CurrencyCode;
  className?: string;
}

interface BannerItem {
  id: string;
  name: string;
  originalPriceUsd: string;
  discountPct: number;
  rating: number;
  imageUrl: string;
}

const DEFAULT_FIVE_DEALS: BannerItem[] = [
  {
    id: 'top-1',
    name: 'Anker Magnetic Wireless Power Bank (5000mAh)',
    originalPriceUsd: '$49.99',
    discountPct: 25,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1609592424071-f925761362e5?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'top-2',
    name: 'Ninja Air Fryer Pro 4-in-1 Precision Cooker',
    originalPriceUsd: '$119.99',
    discountPct: 30,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'top-3',
    name: 'Dyson V15 Detect Cordless Vacuum Cleaner',
    originalPriceUsd: '$649.99',
    discountPct: 15,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'top-4',
    name: 'Bose QuietComfort Ultra Wireless Earbuds',
    originalPriceUsd: '$299.00',
    discountPct: 20,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'top-5',
    name: 'Instant Pot Duo 7-in-1 Pressure Cooker (6 Qt)',
    originalPriceUsd: '$99.99',
    discountPct: 35,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=400&q=80',
  }
];

export const AmazonMobileDealCard: React.FC<AmazonMobileDealCardProps> = ({
  videos = [],
  region,
  selectedCurrency,
  className = ''
}) => {
  const regionConfig = REGION_CONFIGS[region] || REGION_CONFIGS.IN;

  // Extract 5 items from videos or fallback to DEFAULT_FIVE_DEALS
  const items: BannerItem[] = React.useMemo(() => {
    const extracted: BannerItem[] = [];

    if (videos && videos.length > 0) {
      videos.forEach((vid) => {
        if (vid.products && vid.products.length > 0) {
          vid.products.forEach((prod) => {
            if (extracted.length < 5) {
              const rawPrice = prod.estimatedPrice || '$49.99';
              const rawNum = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 49.99;
              const discountPct = Math.min(40, Math.max(15, Math.round((vid.pulse?.viralPotentialScore || 90) / 2.5)));

              extracted.push({
                id: prod.id || `prod-${extracted.length}`,
                name: prod.name,
                originalPriceUsd: `$${(rawNum / (1 - discountPct / 100)).toFixed(2)}`,
                discountPct,
                rating: prod.rating || 4.8,
                imageUrl: prod.imageUrl || vid.thumbnailUrl
              });
            }
          });
        }
      });
    }

    if (extracted.length < 5) {
      for (let i = extracted.length; i < 5; i++) {
        extracted.push(DEFAULT_FIVE_DEALS[i % DEFAULT_FIVE_DEALS.length]);
      }
    }

    return extracted.slice(0, 5);
  }, [videos]);

  return (
    <div className={`block lg:hidden my-6 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-4 text-white shadow-xl ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-amber-400 flex items-center gap-1.5">
              <span>Top 5 Amazon Deals</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-[11px] text-slate-400">Handpicked viral review products</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-full border border-white/10 text-xs font-medium text-slate-300">
          <span>{regionConfig.flag}</span>
          <span className="font-bold">{regionConfig.storeName}</span>
        </div>
      </div>

      {/* Products Row - Horizontal Scrollable on Mobile */}
      <div className="flex gap-3 overflow-x-auto py-3 no-scrollbar snap-x">
        {items.map((item, idx) => {
          const affiliateUrl = getLocalizedAffiliateUrl(undefined, item.name, region);
          const rawPriceNum = parseFloat(item.originalPriceUsd.replace(/[^0-9.]/g, '')) || 49.99;
          const discountedUsd = rawPriceNum * (1 - item.discountPct / 100);
          const formattedPrice = formatPriceInCurrency(`$${discountedUsd.toFixed(2)}`, selectedCurrency);

          return (
            <a
              key={`mobile-deal-${item.id}-${idx}`}
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start shrink-0 w-[140px] bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/80 rounded-xl p-2 flex flex-col justify-between transition-all group shadow-sm"
            >
              <div>
                <div className="relative h-24 rounded-lg overflow-hidden bg-slate-950 mb-2">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                    #{idx + 1}
                  </span>
                  <span className="absolute bottom-1 right-1 bg-slate-950/80 text-amber-300 text-[9px] font-bold px-1 rounded border border-amber-400/20">
                    -{item.discountPct}%
                  </span>
                </div>

                <h4 className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-tight group-hover:text-amber-300 mb-1">
                  {item.name}
                </h4>

                <div className="flex items-center gap-1 text-[9px] text-amber-400 font-bold mb-2">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  <span>{item.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/60 mt-auto">
                <span className="text-xs font-black text-amber-400">
                  {formattedPrice}
                </span>
                <span className="bg-amber-400 group-hover:bg-amber-300 text-slate-950 p-1 rounded-md text-[9px] font-bold">
                  <ExternalLink className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {/* Footer Tag */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>Store Tag: <strong className="text-amber-300">{regionConfig.amazonTag}</strong></span>
        <span className="text-slate-500 flex items-center gap-0.5">
          <span>Swipe for more</span>
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
