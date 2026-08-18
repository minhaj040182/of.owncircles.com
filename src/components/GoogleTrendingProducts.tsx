import React, { useRef } from 'react';
import { TrendingUp, Flame, ChevronLeft, ChevronRight, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { RegionCode, REGION_CONFIGS } from '../utils/localization';

interface TrendingProductItem {
  rank: number;
  name: string;
  category: string;
  categoryLabel: string;
  badge?: string;
}

const REGIONAL_TRENDING_PRODUCTS: Record<string, TrendingProductItem[]> = {
  IN: [
    { rank: 1, name: 'Smart Double Door Refrigerator', category: 'kitchen', categoryLabel: 'Kitchen', badge: '#1 Trending' },
    { rank: 2, name: 'Flagship 5G Smartphone', category: 'electronics', categoryLabel: 'Mobiles & Tech', badge: 'Top Seller' },
    { rank: 3, name: 'Noise Cancelling Wireless Earbuds', category: 'electronics', categoryLabel: 'Audio', badge: 'High Demand' },
    { rank: 4, name: 'Automatic Front Load Washing Machine', category: 'household', categoryLabel: 'Home Appliances' },
    { rank: 5, name: 'Digital Air Fryer & Multi Oven', category: 'kitchen', categoryLabel: 'Kitchen Gadgets' },
    { rank: 6, name: '4K Ultra HD Smart LED TV 55 Inch', category: 'electronics', categoryLabel: 'Electronics' },
    { rank: 7, name: 'Compact Under Desk Walking Pad Treadmill', category: 'fitness', categoryLabel: 'Fitness' },
    { rank: 8, name: 'Ergonomic High-Back Office Mesh Chair', category: 'home_office', categoryLabel: 'Home Office' },
    { rank: 9, name: 'Smart Robot Vacuum Cleaner & Mop', category: 'gadgets', categoryLabel: 'Smart Home' },
    { rank: 10, name: 'High Speed Blender & Spice Grinder', category: 'kitchen', categoryLabel: 'Kitchen' },
  ],
  US: [
    { rank: 1, name: 'Wireless Over-Ear Noise Cancelling Headphones', category: 'electronics', categoryLabel: 'Audio', badge: '#1 Popular' },
    { rank: 2, name: 'Smart Robot Vacuum with Auto-Empty Dock', category: 'gadgets', categoryLabel: 'Smart Home', badge: 'Top Search' },
    { rank: 3, name: 'Air Fryer Toaster Oven Combo', category: 'kitchen', categoryLabel: 'Kitchen' },
    { rank: 4, name: '4K OLED Ultra HD Smart TV', category: 'electronics', categoryLabel: 'Electronics' },
    { rank: 5, name: 'Under Desk Portable Walking Pad', category: 'fitness', categoryLabel: 'Fitness' },
    { rank: 6, name: 'Ergonomic Mesh Office Executive Chair', category: 'home_office', categoryLabel: 'Home Office' },
    { rank: 7, name: 'GPS Smart Fitness & Outdoor Watch', category: 'fitness', categoryLabel: 'Wearables' },
    { rank: 8, name: 'Automatic Espresso & Coffee Machine', category: 'kitchen', categoryLabel: 'Kitchen' },
    { rank: 9, name: 'Waterproof Portable Bluetooth Speaker', category: 'electronics', categoryLabel: 'Audio' },
    { rank: 10, name: 'Insulated Stainless Steel Water Bottle', category: 'travel_outdoor', categoryLabel: 'Outdoors' },
  ]
};

interface GoogleTrendingProductsProps {
  region: RegionCode;
  onSelectTrendingProduct: (productName: string, category: string) => void;
  activeSearchQuery?: string;
  onClearFilter?: () => void;
}

export const GoogleTrendingProducts: React.FC<GoogleTrendingProductsProps> = ({
  region,
  onSelectTrendingProduct,
  activeSearchQuery,
  onClearFilter
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const regionCfg = REGION_CONFIGS[region] || REGION_CONFIGS.IN;
  const products = REGIONAL_TRENDING_PRODUCTS[region] || REGIONAL_TRENDING_PRODUCTS.IN;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-700/80 space-y-3.5">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2 text-white">
              <span>Top 10 Google Trending Products</span>
              <span className="bg-orange-500/20 text-orange-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-orange-500/30 uppercase">
                {regionCfg.flag} {regionCfg.name}
              </span>
            </h2>
            <p className="text-[11px] text-slate-300">
              Real-time viral consumer shopping products • Click to view video reviews & deals
            </p>
          </div>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {activeSearchQuery && (
            <button
              onClick={onClearFilter}
              className="text-xs text-amber-300 hover:text-amber-200 font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
            >
              Reset Filter
            </button>
          )}
          <button
            onClick={() => handleScroll('left')}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 flex items-center justify-center transition-all cursor-pointer"
            title="Scroll left"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 flex items-center justify-center transition-all cursor-pointer"
            title="Scroll right"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Carousel */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth"
      >
        {products.map((item) => {
          const isSelected = activeSearchQuery?.toLowerCase() === item.name.toLowerCase();

          return (
            <button
              key={item.rank}
              onClick={() => onSelectTrendingProduct(item.name, item.category)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border transition-all text-left shrink-0 cursor-pointer group ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-white text-white shadow-md scale-102 ring-2 ring-blue-400'
                  : 'bg-slate-800/80 hover:bg-slate-700/90 border-slate-700/80 hover:border-slate-500 text-slate-200'
              }`}
            >
              {/* Rank Badge */}
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                item.rank <= 3
                  ? 'bg-amber-400 text-slate-950 shadow-inner'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                #{item.rank}
              </div>

              {/* Product Info */}
              <div className="max-w-[170px] sm:max-w-[200px]">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-1.5 py-0.2 rounded border border-blue-500/30 truncate">
                    {item.categoryLabel}
                  </span>
                  {item.badge && (
                    <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/30 truncate">
                      {item.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors">
                  {item.name}
                </h3>
              </div>

              <div className="text-slate-400 group-hover:text-white transition-colors pl-1">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
