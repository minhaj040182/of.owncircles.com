import React, { useRef, useEffect } from 'react';
import { 
  Zap, 
  Flame,
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  Layers, 
  Heart, 
  Home, 
  Headphones,
  Laptop,
  Utensils,
  Dumbbell,
  HeartHandshake,
  Baby,
  Dog,
  Briefcase,
  Compass,
  BookOpen
} from 'lucide-react';
import { VideoItem } from '../types';
import { VideoCard } from './VideoCard';
import { RegionCode } from '../utils/localization';
import { CurrencyCode } from '../utils/currency';
import { isCategoryMatch } from '../utils/categoryMatcher';

interface PartitionedVideoSectionsProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onSelectCategory: (category: string) => void;
  region: RegionCode;
  savedVideoIds?: string[];
  onToggleBookmark?: (videoId: string) => void;
  selectedCurrency?: CurrencyCode;
}

export const PartitionedVideoSections: React.FC<PartitionedVideoSectionsProps> = ({
  videos,
  onSelectVideo,
  onSelectCategory,
  region,
  savedVideoIds = [],
  onToggleBookmark,
  selectedCurrency = 'USD'
}) => {
  const mobilesLaptopRef = useRef<HTMLDivElement>(null);
  const todayTrendingRef = useRef<HTMLDivElement>(null);
  const hotDealsRef = useRef<HTMLDivElement>(null);
  const topRatedRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Auto slide for Trending Mobiles & Laptop, Today Trending, Hot Deals, and Top Rated horizontal rails
  useEffect(() => {
    const interval = setInterval(() => {
      if (mobilesLaptopRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = mobilesLaptopRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          mobilesLaptopRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          mobilesLaptopRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        }
      }

      if (todayTrendingRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = todayTrendingRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          todayTrendingRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          todayTrendingRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        }
      }

      if (hotDealsRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = hotDealsRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          hotDealsRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          hotDealsRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        }
      }

      if (topRatedRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = topRatedRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          topRatedRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          topRatedRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!videos || videos.length === 0) {
    return null;
  }

  // Partition logic
  // 0. Trending Mobiles & Laptop reviews (Strictly filtering ONLY mobile and laptop tech reviews)
  const mobileAndLaptopKeywords = [
    'phone', 'mobile', 'smartphone', 'laptop', 'macbook', 'iphone', 
    'samsung galaxy', 'pixel', 'intel ai', 'snapdragon', 'xps', 'thinkpad',
    'pro max', 'notebook', 'macbook air', 'macbook pro', 'gaming laptop'
  ];

  // Specific exclusion list for non-mobile/non-laptop items (refrigerators, washing machines, kitchen, vacuums, etc.)
  const excludeKeywords = [
    'refrigerator', 'fridge', 'washing machine', 'cleaning', 'vacuum', 
    'mop', 'kitchen', 'cooking', 'treadmill', 'walking pad', 'cooler', 
    'dumbbells', 'carseat', 'stroller', 'litter-robot', 'cat litter', 
    'chair', 'aeron', 'airwrap', 'hair', 'power station', 'power bank'
  ];

  const strictlyMobilesAndLaptops = [...videos]
    .filter(v => {
      const text = `${v.title} ${v.rephrasedTitle || ''} ${v.pulse?.summary || ''}`.toLowerCase();
      
      const isExcluded = excludeKeywords.some(kw => text.includes(kw));
      if (isExcluded) return false;

      const hasMobileOrLaptopKeyword = mobileAndLaptopKeywords.some(kw => text.includes(kw));
      return hasMobileOrLaptopKeyword;
    })
    .sort((a, b) => (b.pulse?.viralPotentialScore || 0) - (a.pulse?.viralPotentialScore || 0));

  // 1. Today's Trending (sorted by viral potential score)
  const todayTrending = [...videos]
    .sort((a, b) => b.pulse.viralPotentialScore - a.pulse.viralPotentialScore)
    .slice(0, 6);

  // 2. Today's Hot Viral Deals & Editor's Picks (sorted by product conversion potential & engagement)
  const hotDeals = [...videos]
    .filter(v => v.products && v.products.length > 0)
    .sort((a, b) => {
      const viewsA = parseFloat(a.viewCount) || 0;
      const viewsB = parseFloat(b.viewCount) || 0;
      return (b.pulse.viralPotentialScore * 10 + viewsB) - (a.pulse.viralPotentialScore * 10 + viewsA);
    })
    .slice(0, 6);

  // 3. Most Popular / Highest Positive Sentiment
  const topRated = [...videos]
    .sort((a, b) => b.pulse.overallSentimentRatio.positive - a.pulse.overallSentimentRatio.positive)
    .slice(0, 6);

  // 4. Complete Category Groupings
  const categoriesList = [
    { id: 'electronics', name: 'Electronics', icon: Laptop, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { id: 'household', name: 'Household & Living', icon: Home, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 'kitchen', name: 'Kitchen & Cooking', icon: Utensils, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { id: 'fitness', name: 'Fitness & Health', icon: Dumbbell, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 'gadgets', name: 'Home Gadgets & Smart Tech', icon: Sparkles, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { id: 'personal_care', name: 'Personal Care & Grooming', icon: HeartHandshake, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'baby_parenting', name: 'Baby & Parenting', icon: Baby, color: 'text-pink-600 bg-pink-50 border-pink-200' },
    { id: 'pet_supplies', name: 'Pet Supplies', icon: Dog, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { id: 'home_office', name: 'Home Office & Desk Setup', icon: Briefcase, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { id: 'travel_outdoor', name: 'Travel & Outdoor Gear', icon: Compass, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { id: 'books_stationery', name: 'Books & E-Readers', icon: BookOpen, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  ];

  return (
    <div className="space-y-12 py-2">
      {/* SECTION 0: TRENDING MOBILES & LAPTOP (Just above Today's Viral Trending - strictly mobile and laptop reviews) */}
      {strictlyMobilesAndLaptops.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 border border-blue-600/20 flex items-center justify-center font-black">
                <div className="flex items-center -space-x-1">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <Laptop className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>Trending Mobiles &amp; Laptop</span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-blue-200">
                    📱 Mobiles &amp; Laptops Only
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Curated smartphone flagship camera tests, Apple Silicon/Intel laptops, and mobile benchmarks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => onSelectCategory('electronics')}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-extrabold text-blue-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-102"
              >
                <span>View All Electronics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => scrollContainer(mobilesLaptopRef, 'left')}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(mobilesLaptopRef, 'right')}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Rail */}
          <div 
            ref={mobilesLaptopRef}
            className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {strictlyMobilesAndLaptops.map((video) => (
              <div key={`mobile-laptop-${video.id}`} className="w-[300px] sm:w-[340px] shrink-0 snap-start flex flex-col">
                <VideoCard 
                  video={video} 
                  onSelect={onSelectVideo} 
                  region={region} 
                  isBookmarked={savedVideoIds.includes(video.id)}
                  onToggleBookmark={onToggleBookmark}
                  selectedCurrency={selectedCurrency}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 1: TODAY'S VIRAL TRENDING */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center font-black">
              <Zap className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Today's Viral Trending</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-amber-200">
                  Live Hits
                </span>
              </h2>
              <p className="text-xs text-slate-500">Fastest growing product reviews and active discussion threads</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onSelectCategory('viral')}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-extrabold text-amber-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-102"
            >
              <span>View All Viral Hits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollContainer(todayTrendingRef, 'left')}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollContainer(todayTrendingRef, 'right')}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Rail */}
        <div 
          ref={todayTrendingRef}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {todayTrending.map((video) => (
            <div key={`trending-${video.id}`} className="w-[300px] sm:w-[340px] shrink-0 snap-start flex flex-col">
              <VideoCard 
                video={video} 
                onSelect={onSelectVideo} 
                region={region} 
                isBookmarked={savedVideoIds.includes(video.id)}
                onToggleBookmark={onToggleBookmark}
                selectedCurrency={selectedCurrency}
              />
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: TODAY'S HOT DEALS & VIRAL PICKS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center font-black">
              <Flame className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Today's Hot Deals &amp; Viral Picks</span>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-rose-200">
                  🔥 Hot Deals
                </span>
              </h2>
              <p className="text-xs text-slate-500">High-velocity price drops, trending buyer discoveries and converted Amazon deals</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onSelectCategory('flash_deals')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-extrabold text-rose-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-102"
            >
              <span>View All Hot Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollContainer(hotDealsRef, 'left')}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollContainer(hotDealsRef, 'right')}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Rail */}
        <div 
          ref={hotDealsRef}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {hotDeals.map((video) => (
            <div key={`hotdeal-${video.id}`} className="w-[300px] sm:w-[340px] shrink-0 snap-start flex flex-col">
              <VideoCard 
                video={video} 
                onSelect={onSelectVideo} 
                region={region} 
                isBookmarked={savedVideoIds.includes(video.id)}
                onToggleBookmark={onToggleBookmark}
                selectedCurrency={selectedCurrency}
              />
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: MOST POPULAR & HIGHEST SENTIMENT */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center font-black">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Most Popular & Top Rated</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-200">
                  High Praise
                </span>
              </h2>
              <p className="text-xs text-slate-500">Products with top verified positive viewer approval ratings</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onSelectCategory('top_rated')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-extrabold text-emerald-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-102"
            >
              <span>View All Top Rated</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollContainer(topRatedRef, 'left')}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollContainer(topRatedRef, 'right')}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Rail */}
        <div 
          ref={topRatedRef}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {topRated.map((video) => (
            <div key={`top-${video.id}`} className="w-[300px] sm:w-[340px] shrink-0 snap-start flex flex-col">
              <VideoCard 
                video={video} 
                onSelect={onSelectVideo} 
                region={region} 
                isBookmarked={savedVideoIds.includes(video.id)}
                onToggleBookmark={onToggleBookmark}
                selectedCurrency={selectedCurrency}
              />
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: PARTITIONED CATEGORY HUBS */}
      <div className="space-y-10">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center font-black">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Partitioned Category Hubs</h2>
              <p className="text-xs text-slate-500">Explore product reviews and converted affiliate deals by category</p>
            </div>
          </div>
        </div>

        {categoriesList.map(cat => {
          const catVideos = videos.filter(v => isCategoryMatch(v.category, cat.id));
          if (catVideos.length === 0) return null;

          const IconComponent = cat.icon;

          return (
            <div key={cat.id} className="space-y-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-2xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${cat.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{cat.name}</h3>
                    <span className="text-[11px] text-slate-500 font-medium">{catVideos.length} review video{catVideos.length > 1 ? 's' : ''} available</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectCategory(cat.id)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-extrabold text-blue-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-102"
                >
                  <span>View All {cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
                {catVideos.slice(0, 3).map(video => (
                  <VideoCard 
                    key={`cat-${cat.id}-${video.id}`} 
                    video={video} 
                    onSelect={onSelectVideo} 
                    region={region} 
                    isBookmarked={savedVideoIds.includes(video.id)}
                    onToggleBookmark={onToggleBookmark}
                    selectedCurrency={selectedCurrency}
                  />
                ))}
              </div>

              {/* Bottom "View All Category" Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs font-semibold text-slate-500">
                  Showing {Math.min(3, catVideos.length)} of {catVideos.length} analyzed video reviews
                </span>
                <button
                  onClick={() => onSelectCategory(cat.id)}
                  className="text-xs font-black text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>View All in {cat.name} ({catVideos.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

