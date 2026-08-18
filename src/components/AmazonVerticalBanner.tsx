import React from 'react';
import { ShoppingBag, ExternalLink, Star, Sparkles, ShieldCheck, Tag, Globe } from 'lucide-react';
import { VideoItem } from '../types';
import { RegionCode, REGION_CONFIGS, getLocalizedAffiliateUrl } from '../utils/localization';
import { CurrencyCode, formatPriceInCurrency } from '../utils/currency';

interface AmazonVerticalBannerProps {
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
  reviewCount: number;
  imageUrl: string;
  badge: string;
}

const DEFAULT_FIVE_DEALS: BannerItem[] = [
  {
    id: 'top-1',
    name: 'Anker Magnetic Wireless Power Bank (5000mAh)',
    originalPriceUsd: '$49.99',
    discountPct: 25,
    rating: 4.8,
    reviewCount: 3420,
    imageUrl: 'https://images.unsplash.com/photo-1609592424071-f925761362e5?auto=format&fit=crop&w=400&q=80',
    badge: '⚡ Top Seller'
  },
  {
    id: 'top-2',
    name: 'Ninja Air Fryer Pro 4-in-1 Precision Cooker',
    originalPriceUsd: '$119.99',
    discountPct: 30,
    rating: 4.9,
    reviewCount: 8910,
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=400&q=80',
    badge: '🔥 30% OFF'
  },
  {
    id: 'top-3',
    name: 'Dyson V15 Detect Cordless Vacuum Cleaner',
    originalPriceUsd: '$649.99',
    discountPct: 15,
    rating: 4.7,
    reviewCount: 1420,
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=400&q=80',
    badge: '💎 Prime Choice'
  },
  {
    id: 'top-4',
    name: 'Bose QuietComfort Ultra Wireless Earbuds',
    originalPriceUsd: '$299.00',
    discountPct: 20,
    rating: 4.8,
    reviewCount: 2150,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
    badge: '🎧 Limited Offer'
  },
  {
    id: 'top-5',
    name: 'Instant Pot Duo 7-in-1 Pressure Cooker (6 Qt)',
    originalPriceUsd: '$99.99',
    discountPct: 35,
    rating: 4.8,
    reviewCount: 12500,
    imageUrl: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=400&q=80',
    badge: '⚡ Best Deal'
  }
];

export const AmazonVerticalBanner: React.FC<AmazonVerticalBannerProps> = ({
  videos = [],
  region,
  selectedCurrency,
  className = ''
}) => {
  const regionConfig = REGION_CONFIGS[region] || REGION_CONFIGS.IN;

  // Derive 5 items from videos data if available, else use DEFAULT_FIVE_DEALS
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
                reviewCount: 1200 + ((prod.name.length * 137) % 8000),
                imageUrl: prod.imageUrl || vid.thumbnailUrl,
                badge: `🔥 ${discountPct}% OFF`
              });
            }
          });
        }
      });
    }

    // Fill remaining up to 5 if needed
    if (extracted.length < 5) {
      for (let i = extracted.length; i < 5; i++) {
        extracted.push(DEFAULT_FIVE_DEALS[i % DEFAULT_FIVE_DEALS.length]);
      }
    }

    return extracted.slice(0, 5);
  }, [videos]);

  return (
    <aside className={`hidden lg:flex w-[160px] min-w-[160px] max-w-[160px] h-[600px] shrink-0 bg-slate-900 border border-slate-700/80 rounded-2xl p-2 text-white shadow-2xl flex-col justify-between sticky top-20 overflow-hidden ${className}`}>
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="pb-1.5 border-b border-slate-700/80 text-center relative z-10 shrink-0">
        <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-[11px] uppercase tracking-wider">
          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
          <span>Amazon Top 5</span>
        </div>
        <div className="flex items-center justify-center gap-1 mt-0.5 text-[9px] font-bold text-slate-300 bg-slate-800/90 py-0.5 px-1.5 rounded-full border border-white/10">
          <span>{regionConfig.flag}</span>
          <span className="truncate">{regionConfig.storeName}</span>
        </div>
      </div>

      {/* 5 Vertical Items fitted perfectly inside 600px total height */}
      <div className="flex flex-col gap-1.5 my-1.5 flex-1 min-h-0 justify-between relative z-10">
        {items.map((item, idx) => {
          // Construct working localized Amazon affiliate link
          const affiliateUrl = getLocalizedAffiliateUrl(undefined, item.name, region);

          // Format price
          const rawPriceNum = parseFloat(item.originalPriceUsd.replace(/[^0-9.]/g, '')) || 49.99;
          const discountedUsd = rawPriceNum * (1 - item.discountPct / 100);
          const formattedPrice = formatPriceInCurrency(`$${discountedUsd.toFixed(2)}`, selectedCurrency);

          return (
            <a
              key={`${item.id}-${idx}`}
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/80 rounded-xl p-1.5 transition-all flex flex-col justify-between shadow-sm hover:shadow-md cursor-pointer h-[98px] shrink-0"
              title={`Buy ${item.name} on ${regionConfig.storeName}`}
            >
              <div className="flex items-center gap-1.5">
                {/* Image & Rank Badge */}
                <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-slate-950">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-0 left-0 bg-amber-500 text-slate-950 text-[8px] font-black px-1 rounded-br shadow">
                    #{idx + 1}
                  </div>
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-[10px] font-bold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-2 leading-tight">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-0.5 text-[8px] text-amber-400 font-bold mt-0.5">
                    <Star className="w-2 h-2 fill-amber-400" />
                    <span>{item.rating}</span>
                  </div>
                </div>
              </div>

              {/* Price & Buy Button */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 mt-1">
                <span className="text-[10px] font-black text-amber-400">
                  {formattedPrice}
                </span>
                <span className="bg-amber-400 group-hover:bg-amber-300 text-slate-950 px-1.5 py-0.5 rounded text-[9px] font-black flex items-center gap-0.5 shadow">
                  <span>Buy</span>
                  <ExternalLink className="w-2 h-2 stroke-[3]" />
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {/* Footer Tag */}
      <div className="pt-1 border-t border-slate-700/80 text-center text-[8px] text-slate-400 font-mono relative z-10 shrink-0">
        Tag: <span className="text-amber-300 font-bold">{regionConfig.amazonTag}</span>
      </div>
    </aside>
  );
};
