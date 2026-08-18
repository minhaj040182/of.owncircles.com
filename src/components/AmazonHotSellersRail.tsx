import React, { useRef, useState } from 'react';
import { 
  Flame, 
  TrendingUp, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Sparkles,
  Zap,
  Play,
  Star
} from 'lucide-react';
import { VideoItem } from '../types';
import { RegionCode, getLocalizedAffiliateUrl } from '../utils/localization';
import { AMAZON_HOT_SELLERS_DATA, hotSellerToVideoItem } from '../utils/amazonHotSellers';

interface AmazonHotSellersRailProps {
  region: RegionCode;
  onSelectVideo: (video: VideoItem) => void;
  selectedCurrency: string;
}

export const AmazonHotSellersRail: React.FC<AmazonHotSellersRailProps> = ({
  region,
  onSelectVideo,
  selectedCurrency: _selectedCurrency
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = AMAZON_HOT_SELLERS_DATA[region] || AMAZON_HOT_SELLERS_DATA['US'] || [];
  const [activeTab, setActiveTab] = useState<'all' | 'electronics' | 'kitchen' | 'household' | 'fitness'>('all');

  const filteredItems = activeTab === 'all' 
    ? items 
    : items.filter(item => item.category === activeTab);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header with Badges & Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 border-b border-slate-800/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-slate-950" />
              <span>Real-Time Amazon Best Sellers</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              <Sparkles className="w-3 h-3" />
              <span>Auto-Matched with YouTube Reviews</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>🔥 Hot-Selling Amazon Products &amp; Verified Reviews</span>
          </h2>
          <p className="text-xs text-slate-300">
            Top #1 sales rank movers on Amazon paired with top-rated creator video reviews and affiliate discount tracking.
          </p>
        </div>

        {/* Category Filters & Scroll Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {(['all', 'electronics', 'kitchen', 'fitness'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  activeTab === cat 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat === 'all' ? '🔥 All Hot Items' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
              aria-label="Previous Products"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
              aria-label="Next Products"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Rail */}
      <div 
        ref={scrollRef}
        className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none scroll-smooth relative z-10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filteredItems.map((item) => {
          const videoItem = hotSellerToVideoItem(item, region);
          const affUrl = getLocalizedAffiliateUrl(item.amazonUrl, item.productName, region);

          return (
            <div 
              key={item.id}
              className="w-[300px] sm:w-[350px] shrink-0 snap-start bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
            >
              <div className="space-y-3">
                {/* Sales Rank Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 truncate flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{item.salesRankBadge}</span>
                  </span>

                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30 shrink-0">
                    <TrendingUp className="w-3 h-3" />
                    <span>{item.discountPercent}% OFF</span>
                  </span>
                </div>

                {/* Product Thumbnail with Watch Review Hover */}
                <div 
                  onClick={() => onSelectVideo(videoItem)}
                  className="relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-slate-950 border border-slate-800"
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.productName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-2.5">
                    <span className="self-end px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>{item.monthlySalesVelocity}</span>
                    </span>

                    <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                      <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                        <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-white truncate">
                          Watch YouTube Review
                        </p>
                        <p className="text-[9px] text-slate-400 truncate">
                          By {item.bestReviewVideo.channelTitle} • {item.bestReviewVideo.views}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                    {item.productName}
                  </h3>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center text-amber-400 font-bold gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                    </div>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 text-[11px]">{item.reviewsCount} ratings</span>
                  </div>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="pt-3 border-t border-slate-800/80 mt-3 space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-base sm:text-lg font-black text-white">
                      {item.price}
                    </span>
                    <span className="text-xs text-slate-500 line-through ml-2">
                      {item.originalPrice}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    ASIN: {item.asin}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectVideo(videoItem)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                    <span>Review Video</span>
                  </button>

                  <a
                    href={affUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Amazon Deal</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
